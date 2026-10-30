import { createUIMessageStreamResponse, type UIMessageChunk } from "ai";
import { generateChatbotReply } from "@/app/lib/chatbot/provider";
import { ChatbotError, type ChatLanguage, type RecordTiming } from "@/app/lib/chatbot/contracts";
import { checkChatRateLimit } from "@/app/lib/chatbot/rate-limit";
import { ChatRequestError, readChatRequest } from "@/app/lib/chatbot/request";

export const runtime = "nodejs";
// Margem para o contador Redis e a consulta Gemini (limitada a 45 segundos).
export const maxDuration = 60;

const errors = {
  invalid_input: [400, "Envie uma conversa válida e curta em português ou inglês.", "Send a valid, short conversation in Portuguese or English."],
  body_too_large: [413, "A conversa excedeu o tamanho permitido.", "The conversation exceeds the allowed size."],
  unsupported_media_type: [415, "Envie o conteúdo como JSON.", "Send the content as JSON."],
  rate_limit: [429, "O limite de consultas foi atingido. Tente novamente mais tarde.", "The request limit has been reached. Please try again later."],
  configuration: [503, "O assistente está indisponível no momento.", "The assistant is currently unavailable."],
  unavailable: [503, "O assistente está indisponível no momento.", "The assistant is currently unavailable."],
  timeout: [504, "A resposta demorou demais. Tente novamente.", "The response took too long. Please try again."],
  aborted: [408, "A solicitação foi cancelada.", "The request was cancelled."],
  invalid_response: [502, "Não foi possível gerar uma resposta. Tente novamente.", "A response could not be generated. Please try again."],
} as const;

function errorResponse(code: keyof typeof errors, language: ChatLanguage, retryAfter?: number) {
  const [status, pt, en] = errors[code];
  return Response.json(
    { error: { code, message: language === "en" ? en : pt } },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    },
  );
}

// O texto já está completo e validado; SSE é apenas o protocolo do useChat.
function validatedReplyResponse(reply: string, timings: Record<string, number>): Response {
  const stream = new ReadableStream<UIMessageChunk>({
    start(output) {
      output.enqueue({ type: "start" });
      output.enqueue({ type: "text-start", id: "reply" });
      output.enqueue({ type: "text-delta", id: "reply", delta: reply });
      output.enqueue({ type: "text-end", id: "reply" });
      output.enqueue({ type: "finish", finishReason: "stop" });
      output.close();
    },
  });
  return createUIMessageStreamResponse({ stream, headers: {
    "Cache-Control": "no-store, no-transform",
    "X-Accel-Buffering": "no",
    "Server-Timing": Object.entries(timings).map(([stage, duration]) => `${stage};dur=${duration}`).join(", "),
  } });
}

export async function POST(request: Request): Promise<Response> {
  let language: ChatLanguage = request.headers.get("accept-language")?.startsWith("en") ? "en" : "pt";

  const startedAt = Date.now();
  const timings: Record<string, number> = {};
  const recordTiming: RecordTiming = (stage, milliseconds) => { timings[stage] = milliseconds; };
  const logTiming = (outcome: string) => {
    console.info("[chatbot] latency", { ...timings, total: Date.now() - startedAt, outcome });
  };
  try {
    if (request.signal.aborted) throw new ChatbotError("aborted");
    if (process.env.CHATBOT_ENABLED === "false") throw new ChatbotError("unavailable");

    const input = await readChatRequest(request);
    language = input.language;

    const redisStartedAt = Date.now();
    const retryAfter = await checkChatRateLimit(request.signal);
    recordTiming("redis", Date.now() - redisStartedAt);
    if (retryAfter > 0) {
      logTiming("rate_limit");
      return errorResponse("rate_limit", language, retryAfter);
    }

    const acceptsStream = request.headers.get("accept")?.includes("text/event-stream") ?? false;
    const reply = await generateChatbotReply({
      ...input,
      signal: request.signal,
      onTiming: recordTiming,
    });
    logTiming("success");
    return acceptsStream
      ? validatedReplyResponse(reply, timings)
      : Response.json({ reply }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = request.signal.aborted ? "aborted"
      : error instanceof ChatbotError || error instanceof ChatRequestError ? error.code
      : "unavailable";
    logTiming(code);
    return errorResponse(code, language);
  }
}
