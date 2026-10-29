import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

// As regras ficam separadas dos fatos profissionais e do histórico da conversa.
export async function getChatbotInstructions(): Promise<string> {
  const content = await readFile(
    path.join(process.cwd(), "docs", "alex_ai_system_prompt.md"),
    "utf8",
  );

  if (!content.trim()) {
    throw new Error("As instruções do chatbot estão vazias.");
  }

  return content.trim();
}
