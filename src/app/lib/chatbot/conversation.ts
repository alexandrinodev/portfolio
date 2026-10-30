import { chatLimits } from "./contracts";

// Este módulo contém apenas dados da interface; pode ser usado no navegador.
export type ConversationMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export function buildRequestMessages(history: ConversationMessage[], question: string) {
  const selected: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: question },
  ];
  let totalCharacters = question.length;

  // Preservar pares completos mantém a alternância exigida pela rota.
  for (let index = history.length - 2; index >= 0; index -= 2) {
    const pair = history.slice(index, index + 2);
    const pairCharacters = pair.reduce((total, message) => total + message.content.length, 0);
    if (
      selected.length + 2 > chatLimits.maxMessages ||
      totalCharacters + pairCharacters > chatLimits.maxConversationCharacters ||
      pair.some((message) => message.content.length > chatLimits.maxMessageCharacters)
    ) break;

    selected.unshift(...pair.map(({ role, content }) => ({ role, content })));
    totalCharacters += pairCharacters;
  }

  return selected;
}
