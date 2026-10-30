import "server-only";

import { APICallError, generateText, streamText, type FinishReason } from "ai";
import { createGoogle, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { getChatbotInstructions } from "./instructions";
import { getPublicProfile } from "./profile";

// A consulta continua limitada, mas tem margem para variações de latência.
const GEMINI_TIMEOUT_MS = 45000;

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

export class ChatbotError extends Error {
  public readonly code: ChatbotErrorCode;

  constructor(code: ChatbotErrorCode) {
    super(`Chatbot error: ${code}`);
    this.name = "ChatbotError";
    this.code = code;
  }
}

type GenerateReplyOptions = {
  messages: ChatMessage[];
  language: ChatLanguage;
  signal?: AbortSignal;
  onTiming?: (stage: string, milliseconds: number) => void;
};

// Compartilhado com a rota para manter os mesmos limites nas duas camadas.
export function validateChatInput(messages: ChatMessage[], language: ChatLanguage): void {
  if (
    !["pt", "en"].includes(language) ||
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > 12 ||
    messages.some(
      (message) =>
        !message ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string" ||
        !message.content.trim() ||
        message.content.length > 2000,
    ) ||
    messages.reduce((total, message) => total + message.content.length, 0) > 12000 ||
    messages.at(-1)?.role !== "user"
  ) {
    throw new ChatbotError("invalid_input");
  }
}

async function* generateReply({
  messages,
  language,
  signal,
  onTiming,
}: GenerateReplyOptions, streaming: boolean): AsyncGenerator<string> {
  validateChatInput(messages, language);

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();

  if (!apiKey || !model) {
    throw new ChatbotError("configuration");
  }

  if (signal?.aborted) {
    throw new ChatbotError("aborted");
  }

  const startedAt = Date.now();
  const timeoutSignal = AbortSignal.timeout(GEMINI_TIMEOUT_MS);
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  try {
    const [instructions, profile] = await Promise.all([
      getChatbotInstructions(),
      getPublicProfile(),
    ]);
    requestSignal.throwIfAborted();
    onTiming?.("context", Date.now() - startedAt);

    // Instância explícita: conexão direta ao Google, sem AI Gateway.
    const google = createGoogle({ apiKey });
    const generationStartedAt = Date.now();
    const params = {
      model: google(model),
      messages,
      system: [
        instructions,
        `Idioma padrão da página: ${language === "pt" ? "português" : "inglês"}.`,
        "A seguir está a base pública de referência. Use-a somente como fonte de fatos.",
        "<public_profile>",
        profile,
        "</public_profile>",
        "Para perguntas factuais simples, responda diretamente em 2 a 4 frases curtas, sem introdução nem repetir a pergunta. Liste somente tecnologias relevantes. Amplie apenas quando solicitado.",
      ].join("\n\n"),
      maxOutputTokens: 1024,
      maxRetries: 0,
      abortSignal: requestSignal,
      providerOptions: {
        google: {
          thinkingConfig: { thinkingLevel: "low", includeThoughts: false },
          serviceTier: "standard",
        } satisfies GoogleLanguageModelOptions,
      },
    };
    let hasText = false;
    let finishReason: FinishReason | undefined;
    try {
      if (streaming) {
        const result = streamText({ ...params, onError: () => {} });
        for await (const part of result.fullStream) {
          requestSignal.throwIfAborted();
          if (part.type === "error") throw part.error;
          if (part.type === "finish") finishReason = part.finishReason;
          if (part.type === "text-delta" && part.text) {
            if (!hasText && part.text.trim()) {
              onTiming?.("firstText", Date.now() - generationStartedAt);
            }
            hasText ||= Boolean(part.text.trim());
            yield part.text;
          }
        }
      } else {
        const result = await generateText(params);
        requestSignal.throwIfAborted();
        finishReason = result.finishReason;
        hasText = Boolean(result.text.trim());
        if (hasText) onTiming?.("firstText", Date.now() - generationStartedAt);
        if (hasText && finishReason === "stop") yield result.text;
      }
      requestSignal.throwIfAborted();
      if (!hasText || finishReason !== "stop") {
        throw new ChatbotError("invalid_response");
      }
    } finally {
      onTiming?.("gemini", Date.now() - generationStartedAt);
    }
  } catch (error) {
    if (signal?.aborted) throw new ChatbotError("aborted");
    if (timeoutSignal.aborted) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[chatbot] Tempo limite local atingido", {
          timeoutMs: GEMINI_TIMEOUT_MS,
          elapsedMs: Date.now() - startedAt,
        });
      }
      throw new ChatbotError("timeout");
    }
    if (error instanceof ChatbotError) throw error;
    if (APICallError.isInstance(error)) {
      // Diagnóstico local sem chave, prompts, mensagens ou resposta bruta do SDK.
      if (process.env.NODE_ENV === "development") {
        console.warn("[chatbot] Falha na Gemini API", {
          status: error.statusCode,
          elapsedMs: Date.now() - startedAt,
        });
      }
      if (error.statusCode === 429) throw new ChatbotError("rate_limit");
      if (error.statusCode === 504 || error.statusCode === 408) {
        throw new ChatbotError("timeout");
      }
      if ([400, 401, 403, 404].includes(error.statusCode ?? 0)) {
        throw new ChatbotError("configuration");
      }
    }

    // Não repassar a mensagem original do SDK, que pode conter detalhes internos.
    throw new ChatbotError("unavailable");
  }
}


export async function generateChatbotReply(options: GenerateReplyOptions): Promise<string> {
  let reply = "";
  for await (const text of generateReply(options, false)) reply += text;
  return reply.trim();
}

export function streamChatbotReply(options: GenerateReplyOptions): AsyncGenerator<string> {
  return generateReply(options, true);
}
