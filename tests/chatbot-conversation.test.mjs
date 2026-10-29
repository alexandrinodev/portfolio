import assert from "node:assert/strict";
import { test } from "node:test";
import { buildRequestMessages } from "../src/app/lib/chatbot/conversation.ts";

function history(pairs, size = 10) {
  return Array.from({ length: pairs * 2 }, (_, index) => ({
    id: index,
    role: index % 2 === 0 ? "user" : "assistant",
    content: String(index % 10).repeat(size),
  }));
}

test("primeira pergunta é enviada sem IDs da interface", () => {
  assert.deepEqual(buildRequestMessages([], "Python?"), [{ role: "user", content: "Python?" }]);
});

test("histórico longo preserva somente os pares mais recentes e alterna papéis", () => {
  const previous = history(10);
  const snapshot = structuredClone(previous);
  const selected = buildRequestMessages(previous, "Nova pergunta");
  assert.equal(selected.length, 11);
  assert.deepEqual(selected[0], { role: "user", content: previous[10].content });
  selected.forEach((message, index) => assert.equal(message.role, index % 2 ? "assistant" : "user"));
  assert.ok(selected.every((message) => !("id" in message)));
  assert.deepEqual(previous, snapshot);
});

test("limite total descarta pares antigos sem cortar o texto de uma mensagem", () => {
  const selected = buildRequestMessages(history(5, 2000), "x".repeat(2000));
  assert.equal(selected.length, 5);
  assert.ok(selected.reduce((total, message) => total + message.content.length, 0) <= 12000);
  assert.ok(selected.every((message) => message.content.length === 2000));
});

test("uma resposta acima do limite individual não é enviada truncada", () => {
  const previous = history(3);
  previous[3].content = "x".repeat(2001);
  const selected = buildRequestMessages(previous, "Próxima");
  assert.deepEqual(selected, [
    { role: "user", content: previous[4].content },
    { role: "assistant", content: previous[5].content },
    { role: "user", content: "Próxima" },
  ]);
});
