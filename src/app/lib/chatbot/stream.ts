// NDJSON permite distinguir texto parcial, conclusão e falha após os cabeçalhos.
export async function readChatStream(
  body: ReadableStream<Uint8Array>,
  onText: (text: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  let hasText = false;
  function consume(line: string) {
    if (!line.trim()) return;
    if (completed) throw new Error("invalid_response");
    const event = JSON.parse(line);
    if (event?.type === "delta" && typeof event.text === "string") {
      hasText ||= Boolean(event.text.trim());
      onText(event.text);
    } else if (event?.type === "done" && hasText) {
      completed = true;
    } else if (event?.type === "error" && typeof event.code === "string") {
      throw new Error(event.code);
    } else {
      throw new Error("invalid_response");
    }
  }
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        consume(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
      }
      if (done) break;
    }
    if (buffer.trim()) consume(buffer);
    if (!completed) throw new Error("invalid_response");
  } finally {
    try { await reader.cancel(); } finally { reader.releaseLock(); }
  }
}
