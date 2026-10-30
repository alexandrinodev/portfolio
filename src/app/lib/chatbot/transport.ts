import { DefaultChatTransport, type UIMessage } from "ai";
import { buildRequestMessages } from "./conversation";

export function messageText(message: UIMessage): string {
  return message.parts.filter((part) => part.type === "text").map((part) => part.text).join("");
}

export function createChatTransport() {
  return new DefaultChatTransport({
    api: "/api/chat",
    headers: { Accept: "text/event-stream" },
    prepareSendMessagesRequest({ messages, body }) {
      const question = messages.at(-1);
      if (!question || question.role !== "user") throw new Error("invalid_input");
      const history = messages.slice(0, -1).map((message, index) => ({
        id: index,
        role: message.role === "assistant" ? "assistant" as const : "user" as const,
        content: messageText(message),
      }));
      return { body: {
        language: body?.language,
        messages: buildRequestMessages(history, messageText(question)),
      } };
    },
    async fetch(url, init) {
      const response = await fetch(url, init);
      if (!response.ok) {
        let code = "unavailable";
        try {
          const data = await response.json();
          if (["rate_limit", "timeout", "invalid_response", "invalid_input"].includes(data?.error?.code)) {
            code = data.error.code;
          }
        } catch { /* Resposta de proxy sem JSON também vira erro público. */ }
        throw new Error(code);
      }
      return response;
    },
  });
}
