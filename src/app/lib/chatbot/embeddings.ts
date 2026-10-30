import "server-only";

import { embed, embedMany, type EmbeddingModel } from "ai";
import { createGoogle } from "@ai-sdk/google";
import { Embeddings } from "@langchain/core/embeddings";
import { ChatbotError } from "./contracts";

export type EmbeddingOptions = { apiKey: string; model: string; signal: AbortSignal };

export function validateEmbedding(vector: number[], dimensions?: number): void {
  if (!vector.length || (dimensions !== undefined && vector.length !== dimensions) ||
      vector.some((value) => !Number.isFinite(value)) || !vector.some((value) => value !== 0)) {
    throw new ChatbotError("invalid_response");
  }
}

// Adapta a interface LangChain ao transporte Google já usado pela aplicação.
export class GeminiEmbeddings extends Embeddings {
  private readonly model: EmbeddingModel;
  private readonly signal: AbortSignal;

  constructor({ apiKey, model, signal }: EmbeddingOptions) {
    super({ maxRetries: 0 });
    this.model = createGoogle({ apiKey }).embedding(model);
    this.signal = signal;
  }

  async embedDocuments(values: string[]): Promise<number[][]> {
    if (!values.length) throw new ChatbotError("invalid_response");
    const result = await embedMany({
      model: this.model,
      values,
      maxRetries: 0,
      abortSignal: this.signal,
      providerOptions: { google: { taskType: "RETRIEVAL_DOCUMENT" } },
    });
    if (result.embeddings.length !== values.length) throw new ChatbotError("invalid_response");
    for (const vector of result.embeddings) {
      validateEmbedding(vector, result.embeddings[0]?.length);
    }
    return result.embeddings;
  }

  async embedQuery(value: string): Promise<number[]> {
    const result = await embed({
      model: this.model,
      value,
      maxRetries: 0,
      abortSignal: this.signal,
      providerOptions: { google: { taskType: "RETRIEVAL_QUERY" } },
    });
    validateEmbedding(result.embedding);
    return result.embedding;
  }
}
