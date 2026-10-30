import "server-only";

import { getGenerationConfig, generationSettings } from "./config";
import { validateChatInput, type ChatLanguage, type ChatMessage, type RecordTiming } from "./contracts";
import { normalizeChatbotError } from "./errors";
import { generateGroundedReply } from "./generation";
import { guardrailRefusal, inspectConversation } from "./guardrails";
import { getChatbotInstructions } from "./instructions";
import { buildRetrievalQuery } from "./prompt";
import { retrieveProfile } from "./retrieval";

type GenerateReplyOptions = {
  messages: ChatMessage[];
  language: ChatLanguage;
  signal?: AbortSignal;
  onTiming?: RecordTiming;
};

const missingInformation: Record<ChatLanguage, string> = {
  en: "I don't have that information available at the moment.",
  pt: "Não tenho essa informação disponível no momento.",
};

// Coordena o caso de uso; transporte HTTP e SDKs ficam nas respectivas camadas.
export async function generateChatbotReply({
  messages, language, signal, onTiming,
}: GenerateReplyOptions): Promise<string> {
  validateChatInput(messages, language);
  if (signal?.aborted) throw normalizeChatbotError(signal.reason, signal);
  const inspected = inspectConversation(messages);
  if (inspected.blocked) {
    console.info("[chatbot] guardrail", { stage: "input", decision: "blocked" });
    return guardrailRefusal[language];
  }
  const safeMessages = inspected.messages;
  const { apiKey, model } = getGenerationConfig();
  const timeoutSignal = AbortSignal.timeout(generationSettings.timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
  const startedAt = Date.now();
  try {
    requestSignal.throwIfAborted();
    const query = buildRetrievalQuery(safeMessages);
    const [instructions, retrieval] = await Promise.all([
      getChatbotInstructions(),
      retrieveProfile({ query, apiKey, signal: requestSignal, onTiming }),
    ]);
    requestSignal.throwIfAborted();
    onTiming?.("context", Date.now() - startedAt);
    if (!retrieval.passages.length) return missingInformation[language];
    return await generateGroundedReply({
      apiKey, model, instructions, passages: retrieval.passages,
      messages: safeMessages, language, signal: requestSignal, onTiming,
    });
  } catch (error) {
    throw normalizeChatbotError(error, signal, timeoutSignal);
  }
}
