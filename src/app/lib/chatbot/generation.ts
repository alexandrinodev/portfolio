import "server-only";

import { streamText, type FinishReason, type LanguageModelUsage } from "ai";
import { createGoogle, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { generationSettings, getProtectedValues } from "./config";
import { ChatbotError, chatLimits, validateChatbotReply, type RecordTiming } from "./contracts";
import { validateGuardedReply } from "./guardrails";
import { buildGroundedPrompt } from "./prompt";

type GenerationOptions = Parameters<typeof buildGroundedPrompt>[0] & {
  apiKey: string;
  model: string;
  signal: AbortSignal;
  onTiming?: RecordTiming;
};
type GeneratedReply = { text: string; finishReason: FinishReason | undefined };

function logTokenUsage(usage: LanguageModelUsage): void {
  console.info("[chatbot] tokens", {
    stage: "generation",
    inputTokens: usage.inputTokens ?? null,
    outputTokens: usage.outputTokens ?? null,
    totalTokens: usage.totalTokens ?? null,
    reasoningTokens: usage.outputTokenDetails.reasoningTokens ?? null,
    cachedInputTokens: usage.inputTokenDetails.cacheReadTokens ?? null,
  });
}

function buildGenerationRequest(options: GenerationOptions) {
  return {
    ...buildGroundedPrompt(options),
    model: createGoogle({ apiKey: options.apiKey })(options.model),
    maxOutputTokens: generationSettings.maxOutputTokens,
    maxRetries: 0,
    abortSignal: options.signal,
    providerOptions: {
      google: {
        thinkingConfig: { thinkingLevel: "low", includeThoughts: false },
        serviceTier: "standard",
      } satisfies GoogleLanguageModelOptions,
    },
  };
}

type GenerationRequest = ReturnType<typeof buildGenerationRequest>;

async function collectStreamedReply(
  request: GenerationRequest, onFirstText: () => void,
): Promise<GeneratedReply> {
  const result = streamText({ ...request, onError: () => {} });
  let text = "";
  let hasText = false;
  let finishReason: FinishReason | undefined;
  for await (const part of result.fullStream) {
    request.abortSignal.throwIfAborted();
    if (part.type === "error") throw part.error;
    if (part.type === "finish") {
      finishReason = part.finishReason;
      logTokenUsage(part.totalUsage);
    }
    if (part.type === "text-delta") {
      if (!hasText && part.text.trim()) onFirstText();
      hasText ||= Boolean(part.text.trim());
      text += part.text;
      if (text.length > chatLimits.maxReplyCharacters) throw new ChatbotError("invalid_response");
    }
  }
  return { text, finishReason };
}

export async function generateGroundedReply(options: GenerationOptions): Promise<string> {
  const request = buildGenerationRequest(options);
  const startedAt = Date.now();
  const recordFirstText = () => options.onTiming?.("firstText", Date.now() - startedAt);
  let response: GeneratedReply;
  try {
    response = await collectStreamedReply(request, recordFirstText);
  } finally {
    options.onTiming?.("gemini", Date.now() - startedAt);
  }
  options.signal.throwIfAborted();
  const validationStartedAt = Date.now();
  validateChatbotReply(response.text, response.finishReason);
  validateGuardedReply({
    reply: response.text,
    instructions: request.system,
    referenceTexts: options.passages.map((passage) => passage.text),
    protectedValues: getProtectedValues(options.apiKey),
  });
  options.onTiming?.("responseValidation", Date.now() - validationStartedAt);
  return response.text.trim();
}
