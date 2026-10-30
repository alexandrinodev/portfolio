import "./register-typescript.mjs";

const { chatLimits } = await import("../src/app/lib/chatbot/contracts.ts");
const { generationSettings } = await import("../src/app/lib/chatbot/config.ts");

const question = process.argv.slice(2).join(" ").trim();
const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!question || question.length > chatLimits.maxMessageCharacters || !apiKey) {
  console.error('Configure GEMINI_API_KEY em .env.local e execute: npm run inspect:rag -- "Qual a experiência com Python?"');
  process.exitCode = 1;
} else {
  try {
    const { retrieveProfile } = await import("../src/app/lib/chatbot/retrieval.ts");
    const { passages, cacheHit } = await retrieveProfile({
      query: question, apiKey, signal: AbortSignal.timeout(generationSettings.timeoutMs),
    });
    console.log(JSON.stringify({ cacheHit, passages }, null, 2));
  } catch {
    // Não imprimir erros brutos do provedor, que podem incluir detalhes da chamada.
    console.error("Falha ao recuperar trechos. Verifique modelo, cota, chave e conectividade.");
    process.exitCode = 1;
  }
}
