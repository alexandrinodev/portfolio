import "server-only";

import {
  ChatbotError,
  validateChatInput,
  type ChatLanguage,
  type ChatMessage,
  chatLimits,
} from "./contracts";

type ChatRequestErrorCode = "invalid_input" | "body_too_large" | "unsupported_media_type";

export class ChatRequestError extends Error {
  readonly code: ChatRequestErrorCode;

  constructor(code: ChatRequestErrorCode) {
    super(code);
    this.code = code;
    this.name = "ChatRequestError";
  }
}

const MAX_BODY_BYTES = chatLimits.maxBodyBytes;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readChatRequest(request: Request): Promise<{
  messages: ChatMessage[];
  language: ChatLanguage;
}> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ChatRequestError("unsupported_media_type");
  }

  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw new ChatRequestError("body_too_large");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new ChatRequestError("invalid_input");

  // Contar os bytes reais também protege requisições sem Content-Length.
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new ChatRequestError("body_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new ChatRequestError("invalid_input");
  }

  if (
    !isRecord(body) ||
    Object.keys(body).some((key) => key !== "messages" && key !== "language") ||
    (body.language !== "pt" && body.language !== "en") ||
    !Array.isArray(body.messages) ||
    body.messages.some((message: unknown) =>
      !isRecord(message) ||
      Object.keys(message).some((key) => key !== "role" && key !== "content") ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string",
    )
  ) {
    throw new ChatbotError("invalid_input");
  }

  const messages = body.messages as ChatMessage[];
  validateChatInput(messages, body.language);

  return { messages, language: body.language };
}
