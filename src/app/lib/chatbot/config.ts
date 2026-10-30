import "server-only";

import { ChatbotError } from "./contracts";

export const generationSettings = {
  timeoutMs: 45000,
  maxOutputTokens: 1024,
} as const;

export const retrievalSettings = {
  chunkSize: 1100,
  chunkOverlap: 150,
  maxContextCharacters: 4400,
  maxPassages: 4,
  candidateCount: 8,
  indexTimeoutMs: 30000,
} as const;

export type RetrievalConfig = {
  apiKey: string;
  model: string;
  minimumScore: number;
};

export function getRetrievalConfig(apiKey: string): RetrievalConfig {
  const model = process.env.GEMINI_EMBEDDING_MODEL?.trim() || "gemini-embedding-001";
  const rawScore = process.env.CHATBOT_RAG_MIN_SCORE?.trim();
  const minimumScore = rawScore ? Number(rawScore) : 0.35;
  if (!Number.isFinite(minimumScore) || minimumScore < -1 || minimumScore > 1) {
    throw new ChatbotError("configuration");
  }
  return { apiKey, model, minimumScore };
}

export function getGenerationConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();
  if (!apiKey || !model) throw new ChatbotError("configuration");
  return { apiKey, model };
}

export function getProtectedValues(apiKey: string): string[] {
  return [apiKey, process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? ""];
}
