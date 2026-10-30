import assert from "node:assert/strict";
import { test } from "node:test";
import { KnowledgeIndexCache } from "../src/app/lib/chatbot/knowledge-index.ts";
import { getRetrievalConfig } from "../src/app/lib/chatbot/config.ts";
import { validateEmbedding } from "../src/app/lib/chatbot/embeddings.ts";
import { buildGroundedPrompt, buildRetrievalQuery } from "../src/app/lib/chatbot/prompt.ts";
import { validateChatInput } from "../src/app/lib/chatbot/contracts.ts";

const configuration = { apiKey: "test-key", model: "test-model", minimumScore: 0.35 };
const freshSignal = () => new AbortController().signal;

function createIndexFixture({ beforeEmbedding = async () => {} } = {}) {
  const fixture = { content: "## Experiência\nAlex desenvolveu APIs Python.", builds: 0 };
  const cache = new KnowledgeIndexCache({
    readProfile: async () => fixture.content,
    createEmbeddings: (options) => ({
      async embedDocuments(values) {
        fixture.builds++;
        await beforeEmbedding(options);
        return values.map(() => [1, 0, 0]);
      },
      async embedQuery() { return [1, 0, 0]; },
    }),
  });
  return { fixture, cache };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => { resolve = onResolve; reject = onReject; });
  return { promise, resolve, reject };
}

test("cache acompanha conteúdo, modelo e credencial; limiar não exige reindexação", async () => {
  const { fixture, cache } = createIndexFixture();
  const first = await cache.get(configuration, freshSignal());
  const same = await cache.get({ ...configuration, minimumScore: 0.9 }, freshSignal());
  assert.equal(first.cacheHit, false);
  assert.equal(same.cacheHit, true);
  assert.equal(first.index, same.index);
  fixture.content = "## Formação\nAlex é bacharel em Ciência da Computação.";
  const changed = await cache.get(configuration, freshSignal());
  assert.equal(changed.cacheHit, false);
  assert.match(changed.index.documents[0].pageContent, /Ciência/);
  assert.equal((await cache.get({ ...configuration, model: "new-model" }, freshSignal())).cacheHit, false);
  assert.equal((await cache.get({ ...configuration, apiKey: "new-key" }, freshSignal())).cacheHit, false);
  assert.equal(fixture.builds, 4);
});

test("cancelar um visitante preserva a indexação compartilhada para o outro", async () => {
  const gate = deferred();
  let indexSignal;
  const { cache, fixture } = createIndexFixture({ beforeEmbedding: async ({ signal }) => {
    indexSignal = signal;
    await gate.promise;
  } });
  const visitor = new AbortController();
  const first = cache.get(configuration, visitor.signal);
  const second = cache.get(configuration, freshSignal());
  const cancelled = assert.rejects(first, { name: "AbortError" });
  // Permite que ambos tenham acesso à mesma Promise de construção.
  await new Promise(setImmediate);
  visitor.abort();
  await cancelled;
  assert.equal(indexSignal.aborted, false);
  gate.resolve();
  assert.equal((await second).cacheHit, true);
  assert.equal(fixture.builds, 1);
});

test("falha de construção é descartada e permite nova tentativa", async () => {
  let fail = true;
  const { cache, fixture } = createIndexFixture({ beforeEmbedding: async () => {
    if (fail) throw new Error("Embedding unavailable");
  } });
  await assert.rejects(cache.get(configuration, freshSignal()), /Embedding unavailable/);
  fail = false;
  assert.equal((await cache.get(configuration, freshSignal())).cacheHit, false);
  assert.equal(fixture.builds, 2);
});

test("falha de índice antigo não remove a versão nova do cache", async () => {
  const oldBuild = deferred();
  const { cache } = createIndexFixture({ beforeEmbedding: async ({ model }) => {
    if (model === "old-model") await oldBuild.promise;
  } });
  const old = cache.get({ ...configuration, model: "old-model" }, freshSignal());
  const rejected = assert.rejects(old, /Old build failed/);
  await new Promise(setImmediate);
  const latest = await cache.get(configuration, freshSignal());
  oldBuild.reject(new Error("Old build failed"));
  await rejected;
  const current = await cache.get(configuration, freshSignal());
  assert.equal(current.cacheHit, true);
  assert.equal(current.index, latest.index);
});

test("vetores vazios, nulos, não finitos ou com dimensões incompatíveis são recusados", () => {
  for (const vector of [[], [0, 0], [NaN, 1], [Infinity, 1], [1, 2, 3]]) {
    assert.throws(() => validateEmbedding(vector, 2), (error) => error.code === "invalid_response");
  }
  assert.doesNotThrow(() => validateEmbedding([1, 0], 2));
});

test("configuração inválida possui código próprio; valor vazio usa o padrão", () => {
  const previous = process.env.CHATBOT_RAG_MIN_SCORE;
  try {
    for (const value of ["not-a-number", "1.1", "-2"]) {
      process.env.CHATBOT_RAG_MIN_SCORE = value;
      assert.throws(() => getRetrievalConfig("test-key"), (error) => error.code === "configuration");
    }
    process.env.CHATBOT_RAG_MIN_SCORE = " ";
    assert.equal(getRetrievalConfig("test-key").minimumScore, 0.35);
  } finally {
    if (previous === undefined) delete process.env.CHATBOT_RAG_MIN_SCORE;
    else process.env.CHATBOT_RAG_MIN_SCORE = previous;
  }
});

test("continuações usam a pergunta anterior; prompts preservam dados separados das regras", () => {
  const messages = [
    { role: "user", content: "Quais projetos Alex desenvolveu?" },
    { role: "assistant", content: "Aplicações desktop." },
    { role: "user", content: "E quais tecnologias ele usou?" },
  ];
  assert.equal(buildRetrievalQuery(messages), `${messages[0].content}\n${messages[2].content}`);
  const passages = [{ id: 1, source: "public.md", text: "REFERENCE_ONLY", score: 0.8 }];
  const prompt = buildGroundedPrompt({ instructions: "RULES_ONLY", language: "pt", passages, messages });
  assert.ok(prompt.system.includes("RULES_ONLY"));
  assert.ok(!prompt.system.includes("REFERENCE_ONLY"));
  const envelope = JSON.parse(prompt.messages[0].content);
  assert.equal(prompt.messages.length, 1);
  assert.equal(envelope.reference.passages[0].text, "REFERENCE_ONLY");
  assert.deepEqual(envelope.history, messages.slice(0, -1));
  assert.equal(envelope.question, messages.at(-1).content);
  assert.throws(() => validateChatInput([
    { role: "user", content: "a" }, { role: "user", content: "b" },
  ], "pt"), (error) => error.code === "invalid_input");
});
