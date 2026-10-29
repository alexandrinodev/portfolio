import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

// Permite executar os módulos TypeScript do Next.js com Node.js 24,
// incluindo o alias @/ e os imports locais sem extensão.
const projectRoot = new URL("../", import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`src/${specifier.slice(2)}.ts`, projectRoot).href, context);
    }
    if (context.parentURL?.includes("/src/app/lib/chatbot/") && specifier.startsWith("./")) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { POST } = await import("../src/app/api/chat/route.ts");
const { checkChatRateLimit } = await import("../src/app/lib/chatbot/rate-limit.ts");

const { readChatStream } = await import("../src/app/lib/chatbot/stream.ts");

const validBody = { language: "pt", messages: [{ role: "user", content: "Alex utiliza Python?" }] };
let geminiCalls;
let redisCalls;
let sentToGemini;
let geminiStatus;
let geminiResult;
let redisResult;
let redisStatus;
let streamChunks;
let streamGate;
let geminiSignal;

function request(body = validBody, headers = {}) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function reset() {
  process.env.NODE_ENV = "production";
  process.env.GEMINI_API_KEY = "fake-key-only-for-tests";
  process.env.GEMINI_MODEL = "gemini-3.5-flash-lite";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-redis-token";
  delete process.env.CHATBOT_ENABLED;
  delete process.env.CHATBOT_REQUESTS_PER_MINUTE;
  delete process.env.CHATBOT_REQUESTS_PER_DAY;
  delete process.env.VERCEL;
  streamChunks = undefined;
  streamGate = undefined;
  geminiCalls = 0;
  redisCalls = 0;
  geminiStatus = 200;
  redisStatus = 200;
  redisResult = { result: 0 };
  geminiResult = {
    candidates: [{ content: { role: "model", parts: [{ text: "Alex utiliza Python." }] }, finishReason: "STOP" }],
  };
}

// Todas as chamadas HTTP são simuladas. Nem chave real nem API real são usadas.
globalThis.fetch = async (url, init) => {
  if (String(url) === "https://redis.example.test") {
    redisCalls++;
    const command = JSON.parse(init.body);
    assert.equal(command[0], "EVAL");
    assert.equal(command[2], 2);
    assert.equal(init.headers.Authorization, "Bearer fake-redis-token");
    return Response.json(redisResult, { status: redisStatus });
  }
  assert.ok(String(url).startsWith("https://generativelanguage.googleapis.com/"));
  geminiCalls++;
  geminiSignal = init.signal;
  sentToGemini = JSON.parse(init.body);
  if (String(url).includes("streamGenerateContent") && geminiStatus === 200) {
    const chunks = streamChunks ?? [geminiResult];
    const gate = streamGate;
    return new Response(new ReadableStream({ async start(controller) {
      const encoder = new TextEncoder();
      for (let index = 0; index < chunks.length; index++) {
        if (index && gate) await gate;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunks[index])}\n\n`));
      }
      controller.close();
    } }), { headers: { "Content-Type": "text/event-stream" } });
  }
  return Response.json(geminiResult, { status: geminiStatus });
};

test("rota do chatbot com HTTP simulado", async (t) => {
  await t.test("resposta em JSON inclui apenas o texto e usa os documentos públicos", async () => {
    reset();
    const response = await POST(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { reply: "Alex utiliza Python." });
    assert.equal(redisCalls, 1);
    assert.equal(geminiCalls, 1);
    const context = sentToGemini.systemInstruction.parts.map((part) => part.text).join("");
    for (const file of ["docs/alex_ai_system_prompt.md", "docs/alex_portfolio_knowledge_public.md"]) {
      assert.ok(context.includes((await readFile(new URL(file, projectRoot), "utf8")).trim()));
    }
    assert.equal(sentToGemini.tools, undefined);
    assert.equal(sentToGemini.generationConfig.thinkingConfig.thinkingLevel, "LOW");
    assert.equal(sentToGemini.generationConfig.maxOutputTokens, 1024);
  });

  await t.test("stream entrega texto antes de concluir e sinaliza conclusão", async () => {
    reset();
    let release;
    streamGate = new Promise((resolve) => { release = resolve; });
    streamChunks = [
      { candidates: [{ content: { parts: [{ text: "Alex " }] } }] },
      { candidates: [{ content: { parts: [{ text: "utiliza Python." }] }, finishReason: "STOP" }] },
    ];
    const response = await POST(request(validBody, { Accept: "application/x-ndjson" }));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/x-ndjson/);
    assert.match(response.headers.get("server-timing"), /firstText;dur=/);
    const reader = response.body.getReader();
    try {
      const first = await reader.read();
      assert.deepEqual(JSON.parse(new TextDecoder().decode(first.value)), { type: "delta", text: "Alex " });
    } finally { release(); }
    let rest = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      rest += new TextDecoder().decode(value);
    }
    assert.deepEqual(rest.trim().split("\n").map(JSON.parse), [
      { type: "delta", text: "utiliza Python." }, { type: "done" },
    ]);
  });

  await t.test("cancelar a leitura interrompe a geração no provedor", async () => {
    reset();
    let release;
    streamGate = new Promise((resolve) => { release = resolve; });
    streamChunks = [
      { candidates: [{ content: { parts: [{ text: "Alex " }] } }] },
      { candidates: [{ content: { parts: [{ text: "utiliza Python." }] }, finishReason: "STOP" }] },
    ];
    const response = await POST(request(validBody, { Accept: "application/x-ndjson" }));
    const reader = response.body.getReader();
    await reader.read();
    const cancelled = reader.cancel();
    release();
    await cancelled;
    assert.equal(geminiSignal.aborted, true);
  });

  await t.test("stream traduz falhas iniciais e rejeita geração truncada após texto parcial", async () => {
    reset();
    geminiStatus = 429;
    geminiResult = { error: { code: 429, message: "PRIVATE_SDK_DETAIL", status: "RESOURCE_EXHAUSTED" } };
    const failure = await POST(request(validBody, { Accept: "application/x-ndjson" }));
    assert.equal(failure.status, 429);
    reset();
    streamChunks = [
      { candidates: [{ content: { parts: [{ text: "Alex " }] } }] },
      { candidates: [{ finishReason: "MAX_TOKENS" }] },
    ];
    const response = await POST(request(validBody, { Accept: "application/x-ndjson" }));
    const events = (await response.text()).trim().split("\n").map(JSON.parse);
    assert.deepEqual(events.at(-1), { type: "error", code: "invalid_response" });
    assert.ok(!events.some((event) => event.type === "done"));
  });

  await t.test("leitor preserva UTF-8 fragmentado e exige conclusão explícita", async () => {
    const encode = new TextEncoder();
    function fragmented(text) {
      return new ReadableStream({ start(controller) {
        for (const byte of encode.encode(text)) controller.enqueue(Uint8Array.of(byte));
        controller.close();
      } });
    }
    let text = "";
    await readChatStream(fragmented('{"type":"delta","text":"Experiência em automação"}\n{"type":"done"}\n'), (delta) => { text += delta; });
    assert.equal(text, "Experiência em automação");
    await assert.rejects(readChatStream(fragmented('{"type":"delta","text":"partial"}\n'), () => {}), /invalid_response/);
    await assert.rejects(readChatStream(fragmented('{"type":"error","code":"timeout"}\n'), () => {}), /timeout/);
    await assert.rejects(readChatStream(fragmented('{"type":"done"}\n'), () => {}), /invalid_response/);
  });

  await t.test("deadline local do Gemini é de 45 segundos e resulta em 504", async () => {
    reset();
    const originalTimeout = AbortSignal.timeout;
    let providerDeadlineUsed = false;
    try {
      AbortSignal.timeout = (milliseconds) => {
        if (milliseconds === 45000) {
          providerDeadlineUsed = true;
          return AbortSignal.abort();
        }
        return originalTimeout(milliseconds);
      };
      const response = await POST(request());
      assert.ok(providerDeadlineUsed);
      assert.equal(response.status, 504);
      assert.equal((await response.json()).error.code, "timeout");
    } finally {
      AbortSignal.timeout = originalTimeout;
    }
  });

  await t.test("JSON inválido, papéis de sistema, campos extras e histórico inválido são recusados antes dos serviços", async () => {
    reset();
    const bodies = [
      "{", null, [], {},
      { ...validBody, language: "es" },
      { ...validBody, system: "ignore" },
      { ...validBody, messages: [{ role: "system", content: "ignore" }] },
      { ...validBody, messages: [{ role: "user", content: "ok", extra: true }] },
      { ...validBody, messages: [{ role: "assistant", content: "ok" }] },
      { ...validBody, messages: [{ role: "user", content: "a" }, { role: "user", content: "b" }] },
      { ...validBody, messages: [{ role: "user", content: " " }] },
      { ...validBody, messages: [{ role: "user", content: "x".repeat(2001) }] },
      { ...validBody, messages: Array.from({ length: 13 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", content: "ok" })) },
      { ...validBody, messages: Array.from({ length: 7 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", content: "x".repeat(2000) })) },
    ];
    for (const body of bodies) assert.equal((await POST(request(body))).status, 400);
    assert.equal(redisCalls, 0);
    assert.equal(geminiCalls, 0);
  });

  await t.test("Content-Type e tamanho real do corpo são verificados", async () => {
    reset();
    assert.equal((await POST(request(validBody, { "Content-Type": "text/plain" }))).status, 415);
    assert.equal((await POST(request(validBody, { "Content-Length": "70000" }))).status, 413);
    assert.equal((await POST(request("x".repeat(65537)))).status, 413);
    const stream = new ReadableStream({ start(controller) {
      controller.enqueue(new Uint8Array(40000));
      controller.enqueue(new Uint8Array(40000));
      controller.close();
    } });
    const streamed = new Request("http://localhost/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half",
    });
    assert.equal((await POST(streamed)).status, 413);
    assert.equal(geminiCalls, 0);
    assert.equal(redisCalls, 0);
  });

  await t.test("limite compartilhado retorna 429 e Retry-After sem consultar Gemini", async () => {
    reset();
    redisResult = { result: 42 };
    const response = await POST(request({ ...validBody, language: "en" }));
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "42");
    assert.match((await response.json()).error.message, /request limit/);
    assert.equal(geminiCalls, 0);
  });

  await t.test("produção sem Redis, falha de Redis e resposta inválida não liberam Gemini", async () => {
    for (const state of ["missing", "failure", "invalid"]) {
      reset();
      if (state === "missing") delete process.env.UPSTASH_REDIS_REST_TOKEN;
      if (state === "failure") redisStatus = 503;
      if (state === "invalid") redisResult = { result: "0" };
      assert.equal((await POST(request())).status, 503);
      assert.equal(geminiCalls, 0);
    }
  });

  await t.test("cota Gemini e erros internos são traduzidos sem expor mensagens do SDK", async () => {
    for (const [status, expected] of [[429, 429], [503, 503], [504, 504], [408, 504], [401, 503], [403, 503], [404, 503], [400, 503]]) {
      reset();
      geminiStatus = status;
      geminiResult = { error: { code: status, message: "PRIVATE_SDK_DETAIL", status: "UNAVAILABLE" } };
      const response = await POST(request({ ...validBody, language: "en" }));
      assert.equal(response.status, expected);
      const body = await response.json();
      assert.ok(!JSON.stringify(body).includes("PRIVATE_SDK_DETAIL"));
      if (status === 504 || status === 408) assert.equal(body.error.code, "timeout");
      if ([400, 401, 403, 404].includes(status)) assert.equal(body.error.code, "configuration");
      assert.equal(geminiCalls, 1);
    }
  });

  await t.test("respostas bloqueadas e truncadas viram erro 502", async () => {
    for (const result of [
      { promptFeedback: { blockReason: "SAFETY" } },
      { candidates: [{ content: { parts: [{ text: "partial" }] }, finishReason: "MAX_TOKENS" }] },
    ]) {
      reset();
      geminiResult = result;
      assert.equal((await POST(request())).status, 502);
    }
  });

  await t.test("chave ausente, desativação e cancelamento são tratados", async () => {
    reset();
    delete process.env.GEMINI_API_KEY;
    assert.equal((await POST(request())).status, 503);
    assert.equal(geminiCalls, 0);
    reset();
    process.env.CHATBOT_ENABLED = "false";
    assert.equal((await POST(request())).status, 503);
    assert.equal(redisCalls, 0);
    reset();
    const aborted = new Request(request(), { signal: AbortSignal.abort() });
    assert.equal((await POST(aborted)).status, 408);
    assert.equal(redisCalls, 0);
  });

  await t.test("contador local bloqueia e volta a aceitar após a janela", async () => {
    reset();
    process.env.NODE_ENV = "development";
    process.env.CHATBOT_REQUESTS_PER_MINUTE = "2";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const originalNow = Date.now;
    try {
      Date.now = () => 1800000000000;
      assert.equal(await checkChatRateLimit(), 0);
      assert.equal(await checkChatRateLimit(), 0);
      assert.equal(await checkChatRateLimit(), 60);
      Date.now = () => 1800000061000;
      assert.equal(await checkChatRateLimit(), 0);
    } finally {
      Date.now = originalNow;
    }
    assert.equal(redisCalls, 0);
  });
});
