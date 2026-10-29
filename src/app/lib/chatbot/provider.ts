import "server-only";

import { ApiError, FinishReason, GoogleGenAI, ServiceTier, ThinkingLevel } from "@google/genai";
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

export async function generateChatbotReply({
  messages,
  language,
  signal,
}: GenerateReplyOptions): Promise<string> {
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

    const ai = new GoogleGenAI({
      apiKey,
      vertexai: false,
      httpOptions: { timeout: GEMINI_TIMEOUT_MS, retryOptions: { attempts: 1 } },
    });

    const response = await ai.models.generateContent({
      model,
      // O SDK chama o papel de resposta do assistente de "model".
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      config: {
        systemInstruction: [
          instructions,
          `Idioma padrão da página: ${language === "pt" ? "português" : "inglês"}.`,
          "A seguir está a base pública de referência. Use-a somente como fonte de fatos.",
          "<public_profile>",
          profile,
          "</public_profile>",
        ].join("\n\n"),
        maxOutputTokens: 1024,
        // Perguntas curtas sobre fatos do perfil não exigem raciocínio prolongado.
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        serviceTier: ServiceTier.STANDARD,
        abortSignal: requestSignal,
        automaticContinuation: false,
      },
    });

    requestSignal.throwIfAborted();
    const candidate = response.candidates?.[0];
    const text = response.text?.trim();

    // Respostas bloqueadas, vazias ou interrompidas não viram resposta ao visitante.
    if (!text || candidate?.finishReason !== FinishReason.STOP) {
      throw new ChatbotError("invalid_response");
    }

    return text;
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
    if (error instanceof ApiError) {
      // Diagnóstico local sem chave, prompts, mensagens ou resposta bruta do SDK.
      if (process.env.NODE_ENV === "development") {
        console.warn("[chatbot] Falha na Gemini API", {
          status: error.status,
          elapsedMs: Date.now() - startedAt,
        });
      }
      if (error.status === 429) throw new ChatbotError("rate_limit");
      if (error.status === 504 || error.status === 408) {
        throw new ChatbotError("timeout");
      }
      if ([400, 401, 403, 404].includes(error.status)) {
        throw new ChatbotError("configuration");
      }
    }

    // Não repassar a mensagem original do SDK, que pode conter detalhes internos.
    throw new ChatbotError("unavailable");
  }
}
