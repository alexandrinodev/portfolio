import "server-only";

import { ChatbotError, type ChatLanguage, type ChatMessage } from "./contracts";

function normalizeForInspection(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, "")
    .toLowerCase().replace(/\s+/g, " ");
}

// Sinais explícitos, não uma classificação completa de intenção ou de segurança.
const injectionPatterns = [
  /\b(ignore|disregard|forget|override|bypass|desconsidere|esqueca|substitua|burle)\b.{0,100}\b(previous|prior|system|instructions|rules|policies|instrucoes|regras|anteriores|sistema)\b/,
  /\b(show|reveal|print|repeat|display|dump|expose|mostre|revele|imprima|repita|exiba|retorne|forneca)\b.{0,100}\b(system prompt|system instructions|developer message|developer instructions|prompt de sistema|instrucoes de sistema|instrucoes internas|api key|api keys|chave de api|chaves de api|credenciais|credentials|variaveis de ambiente|environment variables)\b/,
  /\b(translate|traduza|encode|codifique)\b.{0,100}\b(system prompt|system instructions|prompt de sistema|instrucoes internas|instrucoes de sistema)\b/,
  /^(system|developer)\s*:/,
  /<\|(?:im_start|im_end|start_header_id|end_header_id|system|developer)\|>|\[(?:system|developer)\]|<\/?(?:system|developer)>/,
  /\b(?:you are now|act as|voce agora e|atue como)\b.{0,60}\b(?:system|developer|unrestricted|sem restricoes)\b/,
];

export function hasInjectionSignals(content: string): boolean {
  const normalized = normalizeForInspection(content);
  return injectionPatterns.some((pattern) => pattern.test(normalized));
}

export const guardrailRefusal: Record<ChatLanguage, string> = {
  pt: "Posso ajudar com a trajetória, as habilidades e os contatos públicos de Alex. Não posso alterar minhas regras nem fornecer instruções internas ou credenciais.",
  en: "I can help with Alex's background, skills and public contact information. I cannot change my rules or provide internal instructions or credentials.",
};

export function inspectConversation(messages: ChatMessage[]): {
  blocked: boolean;
  messages: ChatMessage[];
} {
  const question = messages.at(-1);
  if (!question || question.role !== "user") throw new ChatbotError("invalid_input");
  if (hasInjectionSignals(question.content)) return { blocked: true, messages: [] };

  const history: ChatMessage[] = [];
  // Retirar o par inteiro preserva a continuidade sem reintroduzir ataques antigos.
  for (let index = 0; index < messages.length - 1; index += 2) {
    const pair = messages.slice(index, index + 2);
    if (!pair.some((message) => hasInjectionSignals(message.content))) history.push(...pair);
  }
  return { blocked: false, messages: [...history, question] };
}

function extractUrls(text: string): string[] {
  return (text.match(/\b(?:https?:\/\/|mailto:)[^\s<>"'`]+/gi) ?? [])
    .map((url) => url.replace(/[.,;!?)\]]+$/, ""))
    .map((url) => {
      try { return new URL(url).href; } catch { return url; }
    });
}

export function validateGuardedReply({
  reply, instructions, referenceTexts, protectedValues,
}: {
  reply: string;
  instructions: string;
  referenceTexts: string[];
  protectedValues: string[];
}): void {
  const normalizedReply = normalizeForInspection(reply);
  const leaksCredential = protectedValues.some((value) => value.length >= 8 && reply.includes(value));
  const instructionSentences = instructions.split(/[\n.!?]+/)
    .map(normalizeForInspection).filter((sentence) => sentence.length >= 80);
  const leaksInstructions = instructionSentences.some((sentence) => normalizedReply.includes(sentence));
  const referenceEmails = referenceTexts.flatMap((text) => text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) ?? []);
  const allowedUrls = new Set([
    ...referenceTexts.flatMap(extractUrls),
    ...referenceEmails.map((email) => `mailto:${email}`),
  ]);
  const hasUnknownUrl = extractUrls(reply).some((url) => !allowedUrls.has(url));
  if (leaksCredential || leaksInstructions || hasUnknownUrl ||
      /"type"\s*:\s*"(?:retrieved_reference_data|portfolio_question)"/.test(normalizedReply)) {
    console.info("[chatbot] guardrail", { stage: "output", decision: "blocked" });
    throw new ChatbotError("invalid_response");
  }
}
