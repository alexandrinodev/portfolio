import "server-only";

import { createHash } from "node:crypto";
import { Document } from "@langchain/core/documents";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { retrievalSettings, type RetrievalConfig } from "./config";
import { ChatbotError } from "./contracts";
import { GeminiEmbeddings, validateEmbedding, type EmbeddingOptions } from "./embeddings";
import { getPublicProfile, profileSource } from "./profile";

export type KnowledgeIndex = {
  store: MemoryVectorStore;
  documents: Document[];
  dimensions: number;
};

type IndexDependencies = {
  readProfile: () => Promise<string>;
  createEmbeddings: (options: EmbeddingOptions) => EmbeddingsInterface;
};

type CacheEntry = { key: string; promise: Promise<KnowledgeIndex> };

export async function splitProfile(content: string): Promise<Document[]> {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: retrievalSettings.chunkSize,
    chunkOverlap: retrievalSettings.chunkOverlap,
  });
  const documents = await splitter.splitDocuments([
    new Document({ pageContent: content, metadata: { source: profileSource.file } }),
  ]);
  documents.forEach((document, index) => { document.metadata.chunkId = index; });
  return documents;
}

// Desistir de esperar não cancela a construção compartilhada por outros visitantes.
function waitForIndex<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

export class KnowledgeIndexCache {
  private entry?: CacheEntry;

  private readonly dependencies: IndexDependencies;

  constructor(dependencies: IndexDependencies) {
    this.dependencies = dependencies;
  }

  async get(config: RetrievalConfig, signal: AbortSignal) {
    signal.throwIfAborted();
    const content = await this.dependencies.readProfile();
    signal.throwIfAborted();
    const key = createHash("sha256").update(JSON.stringify([
      content, config.model, config.apiKey,
      retrievalSettings.chunkSize, retrievalSettings.chunkOverlap,
    ])).digest("hex");
    let entry = this.entry;
    const cacheHit = entry?.key === key;
    if (!entry || entry.key !== key) {
      const promise = this.build(content, config);
      entry = { key, promise };
      this.entry = entry;
      void promise.catch(() => {
        if (this.entry?.promise === promise) this.entry = undefined;
      });
    }
    return { index: await waitForIndex(entry.promise, signal), cacheHit };
  }

  private async build(content: string, config: RetrievalConfig): Promise<KnowledgeIndex> {
    const embeddings = this.dependencies.createEmbeddings({
      apiKey: config.apiKey,
      model: config.model,
      signal: AbortSignal.timeout(retrievalSettings.indexTimeoutMs),
    });
    const documents = await splitProfile(content);
    if (!documents.length) throw new ChatbotError("invalid_response");
    const vectors = await embeddings.embedDocuments(documents.map((document) => document.pageContent));
    if (vectors.length !== documents.length) throw new ChatbotError("invalid_response");
    const dimensions = vectors[0]?.length;
    for (const vector of vectors) validateEmbedding(vector, dimensions);
    const store = new MemoryVectorStore(embeddings);
    await store.addVectors(vectors, documents);
    return { store, documents, dimensions };
  }
}

export const knowledgeIndex = new KnowledgeIndexCache({
  readProfile: getPublicProfile,
  createEmbeddings: (options) => new GeminiEmbeddings(options),
});
