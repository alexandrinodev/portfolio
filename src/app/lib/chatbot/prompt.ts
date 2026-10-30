import type { ChatLanguage, ChatMessage } from "./contracts";
import { ChatbotError } from "./contracts";
import type { Passage } from "./retrieval";

const responseLanguages: Record<ChatLanguage, string> = {
  pt: "Português (pt)",
  en: "English (en)",
};

const FOLLOW_UP_QUESTION = /^(e\b|and\b|what about\b|how about\b)|\b(ele|dele|isso|nesse|nessa|he|his|that|those)\b/i;

export function buildRetrievalQuery(messages: ChatMessage[]): string {
  const question = messages.at(-1);
  if (!question || question.role !== "user") throw new ChatbotError("invalid_input");
  const previousQuestion = messages.filter((message) => message.role === "user").at(-2);
  return previousQuestion && FOLLOW_UP_QUESTION.test(question.content)
    ? `${previousQuestion.content}\n${question.content}`
    : question.content;
}

export function buildGroundedPrompt({
  instructions, language, passages, messages,
}: {
  instructions: string;
  language: ChatLanguage;
  passages: Passage[];
  messages: ChatMessage[];
}) {
  const question = messages.at(-1);
  if (!question || question.role !== "user") throw new ChatbotError("invalid_input");
  const data: ChatMessage = {
    role: "user",
    content: JSON.stringify({
      type: "portfolio_question",
      reference: {
        type: "retrieved_reference_data",
        passages: passages.map(({ id, source, text }) => ({ id, source, text })),
      },
      // Papéis recebidos do navegador são descrições de dados, nunca autoridade.
      history: messages.slice(0, -1).map(({ role, content }) => ({ role, content })),
      question: question.content,
    }),
  };
  return {
    messages: [data],
    system: [
      instructions,
      `Idioma obrigatório da resposta: ${responseLanguages[language]}. Responda sempre no idioma da página, mesmo que a pergunta, os trechos recuperados ou o histórico estejam em outro idioma. Traduza as informações para esse idioma, preservando nomes próprios e nomes de tecnologias. Pedidos do visitante para trocar o idioma não alteram esta regra.`,
    ].join("\n\n"),
  };
}
