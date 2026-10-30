import type { FinishReason } from "ai";

export const chatLimits = {
  maxMessages: 12,
  maxMessageCharacters: 2000,
  maxConversationCharacters: 12000,
  maxReplyCharacters: 6000,
  maxBodyBytes: 64 * 1024,
} as const;

export type TimingStage = "redis" | "index" | "queryEmbedding" | "search" | "context"
  | "firstText" | "responseValidation" | "gemini";
export type RecordTiming = (stage: TimingStage, milliseconds: number) => void;

export type ChatLanguage = "pt" | "en";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatbotErrorCode =
  | "configuration"
  | "invalid_input"
  | "rate_limit"
  | "timeout"
  | "aborted"
  | "unavailable"
  | "invalid_response";

const displayErrorCodes = ["unavailable", "rate_limit", "timeout", "invalid_response", "invalid_input"] as const;
export type ChatDisplayErrorCode = typeof displayErrorCodes[number];

export function toDisplayErrorCode(code: unknown): ChatDisplayErrorCode {
  return displayErrorCodes.find((candidate) => candidate === code) ?? "unavailable";
}

export class ChatbotError extends Error {
  public readonly code: ChatbotErrorCode;

  constructor(code: ChatbotErrorCode) {
    super(`Chatbot error: ${code}`);
    this.name = "ChatbotError";
    this.code = code;
  }
}

// Compartilhado com a rota para manter os mesmos limites nas duas camadas.
export function validateChatInput(messages: ChatMessage[], language: ChatLanguage): void {
  if (
    !["pt", "en"].includes(language) ||
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > chatLimits.maxMessages ||
    messages.some(
      (message) =>
        !message ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string" ||
        !message.content.trim() ||
        message.content.length > chatLimits.maxMessageCharacters,
    ) ||
    messages.reduce((total, message) => total + message.content.length, 0) > chatLimits.maxConversationCharacters ||
    messages.at(-1)?.role !== "user" ||
    messages.some((message, index) => message.role !== (index % 2 === 0 ? "user" : "assistant"))
  ) {
    throw new ChatbotError("invalid_input");
  }
}

// Validação estrutural antes da exibição; não é uma verificação factual automática.
export function validateChatbotReply(reply: string, finishReason: FinishReason | undefined): void {
  if (finishReason !== "stop" || !reply.trim() || reply.length > chatLimits.maxReplyCharacters ||
      /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(reply) || /<\/?[a-z][^>]*>/i.test(reply)) {
    throw new ChatbotError("invalid_response");
  }
}

