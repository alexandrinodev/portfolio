import { ChatbotError, generateChatbotReply, type ChatLanguage } from "@/app/lib/chatbot/provider";
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

export async function POST(request: Request): Promise<Response> {
  let language: ChatLanguage = request.headers.get("accept-language")?.startsWith("en") ? "en" : "pt";

  try {
    if (request.signal.aborted) throw new ChatbotError("aborted");
    if (process.env.CHATBOT_ENABLED === "false") throw new ChatbotError("unavailable");

    const input = await readChatRequest(request);
    language = input.language;

    const retryAfter = await checkChatRateLimit(request.signal);
    if (retryAfter > 0) return errorResponse("rate_limit", language, retryAfter);

    const reply = await generateChatbotReply({ ...input, signal: request.signal });
    return Response.json({ reply }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (request.signal.aborted) return errorResponse("aborted", language);
    if (error instanceof ChatbotError) {
      return errorResponse(error.code, language);
    }
    if (error instanceof ChatRequestError && error.message in errors) {
      return errorResponse(error.message as keyof typeof errors, language);
    }
    return errorResponse("unavailable", language);
  }
}
