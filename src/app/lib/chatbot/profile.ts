import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export const profileSource = {
  file: "docs/alex_portfolio_knowledge_public.md",
  approvedAt: "2026-10-28",
} as const;

// O caminho é fixo: perguntas do visitante nunca escolhem o arquivo lido.
export async function getPublicProfile(): Promise<string> {
  const content = await readFile(
    path.join(process.cwd(), "docs", "alex_portfolio_knowledge_public.md"),
    "utf8",
  );

  if (!content.trim()) {
    throw new Error("A base pública do chatbot está vazia.");
  }

  return content.trim();
}
