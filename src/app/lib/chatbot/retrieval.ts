import "server-only";

import type { Document } from "@langchain/core/documents";
import { getRetrievalConfig, retrievalSettings } from "./config";
import type { RecordTiming } from "./contracts";
import { GeminiEmbeddings, validateEmbedding } from "./embeddings";
import { hasInjectionSignals } from "./guardrails";
import { knowledgeIndex } from "./knowledge-index";
import { profileSource } from "./profile";

export type Passage = { id: number; source: string; text: string; score: number };
type RetrievalOptions = {
  query: string;
  apiKey: string;
  signal: AbortSignal;
  onTiming?: RecordTiming;
};

// Inspeção determinística: origem, integridade, score, duplicatas e orçamento.
export function inspectPassages(
  candidates: [Document, number][], documents: Document[], minimumScore: number,
): Passage[] {
  const seen = new Set<number>();
  const passages: Passage[] = [];
  let characters = 0;
  for (const [document, score] of candidates) {
    const id = document.metadata.chunkId;
    if (!Number.isInteger(id) || document.metadata.source !== profileSource.file ||
        documents[id]?.pageContent !== document.pageContent || !Number.isFinite(score) ||
        score < minimumScore || seen.has(id) || !document.pageContent.trim()) continue;
    if (hasInjectionSignals(document.pageContent)) continue;
    if (characters + document.pageContent.length > retrievalSettings.maxContextCharacters) continue;
    seen.add(id);
    characters += document.pageContent.length;
    passages.push({ id, source: profileSource.file, text: document.pageContent, score });
    if (passages.length === retrievalSettings.maxPassages) break;
  }
  return passages;
}

export async function retrieveProfile({ query, apiKey, signal, onTiming }: RetrievalOptions) {
  const config = getRetrievalConfig(apiKey);
  const indexStartedAt = Date.now();
  const { index, cacheHit } = await knowledgeIndex.get(config, signal);
  onTiming?.("index", Date.now() - indexStartedAt);

  const queryStartedAt = Date.now();
  const embeddings = new GeminiEmbeddings({ apiKey, model: config.model, signal });
  const vector = await embeddings.embedQuery(query);
  validateEmbedding(vector, index.dimensions);
  onTiming?.("queryEmbedding", Date.now() - queryStartedAt);

  const searchStartedAt = Date.now();
  const candidates = await index.store.similaritySearchVectorWithScore(vector, retrievalSettings.candidateCount);
  const passages = inspectPassages(candidates, index.documents, config.minimumScore);
  signal.throwIfAborted();
  onTiming?.("search", Date.now() - searchStartedAt);
  console.info("[chatbot] retrieval", {
    cacheHit,
    indexedChunks: index.documents.length,
    selected: passages.map(({ id, score }) => ({ id, score: Number(score.toFixed(4)) })),
    contextCharacters: passages.reduce((total, passage) => total + passage.text.length, 0),
  });
  return { passages, cacheHit };
}
