import "server-only";

import { APICallError } from "ai";
import { ChatbotError } from "./contracts";

export function normalizeChatbotError(
  error: unknown, signal?: AbortSignal, timeoutSignal?: AbortSignal,
): ChatbotError {
  if (signal?.aborted) return new ChatbotError("aborted");
  if (timeoutSignal?.aborted || (error instanceof Error && error.name === "TimeoutError")) {
    return new ChatbotError("timeout");
  }
  if (error instanceof ChatbotError) return error;
  if (APICallError.isInstance(error)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[chatbot] Falha na Gemini API", { status: error.statusCode });
    }
    if (error.statusCode === 429) return new ChatbotError("rate_limit");
    if (error.statusCode === 504 || error.statusCode === 408) return new ChatbotError("timeout");
    if ([400, 401, 403, 404].includes(error.statusCode ?? 0)) return new ChatbotError("configuration");
  }
  return new ChatbotError("unavailable");
}
