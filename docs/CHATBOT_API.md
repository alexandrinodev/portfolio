# Etapa 3 — A rota do chatbot

O Next.js transforma `src/app/api/chat/route.ts` no endereço `/api/chat`. A função exportada `POST` atende as requisições desse método, usando `Request` e `Response` da Web. O runtime é Node.js porque o provider lê os Markdown do disco.

## Fluxo de uma pergunta

1. `request.ts` exige JSON, lê no máximo 64 KiB reais e valida o formato da conversa. Somente `language` e `messages` são aceitos na raiz; cada mensagem contém apenas `role` e `content`.
2. A conversa precisa começar com `user`, alternar com `assistant` e terminar com `user`. Os limites compartilhados com o provider são 12 mensagens, 2.000 caracteres por mensagem e 12.000 no total.
3. `rate-limit.ts` reserva uma consulta dentro dos limites globais. Esses limites incluem todos os visitantes, não são limites individuais nem cópia das cotas do Google.
4. A rota chama `generateChatbotReply()`, repassando o idioma, as mensagens e o sinal de cancelamento.
5. Em caso de sucesso, retorna `{ "reply": "texto" }`. Em caso de falha, retorna `{ "error": { "code": "...", "message": "..." } }`, sem mensagens internas do SDK.

O histórico enviado pelo navegador é conteúdo não confiável da conversa. Ele não escolhe instruções, arquivos, ferramentas ou modelo. O contexto público e as regras são montados pelo servidor.

## Contrato HTTP

`POST /api/chat`, com `Content-Type: application/json`:

```json
{
  "language": "pt",
  "messages": [
    { "role": "user", "content": "Alex tem experiência com Python?" }
  ]
}
```

Para continuar a conversa, incluir também as respostas anteriores com o papel `assistant`. O frontend deverá manter o histórico dentro dos limites, preservando pares de pergunta/resposta.

| HTTP | Situação |
| --- | --- |
| 200 | Resposta gerada |
| 400 | JSON, idioma, mensagens ou campos inválidos |
| 408 | Cancelamento |
| 413 | Corpo acima de 64 KiB |
| 415 | Content-Type diferente de application/json |
| 429 | Limite da aplicação ou cota do Gemini atingida |
| 502 | Resposta do Gemini vazia, bloqueada ou interrompida |
| 503 | Desativação, configuração ausente ou serviço indisponível |
| 504 | Timeout do provider |

Todas as respostas da rota usam `Cache-Control: no-store`. O idioma de erros é o `language` validado; antes da validação, usa `Accept-Language: en` ou português como padrão. O limite da aplicação retorna também `Retry-After`, em segundos; o erro de cota do Gemini não informa um prazo desconhecido.

## Controle de uso

Os valores iniciais são 5 consultas por minuto e 50 por dia para toda a aplicação, configuráveis em `CHATBOT_REQUESTS_PER_MINUTE` e `CHATBOT_REQUESTS_PER_DAY`. As janelas são fixas; a diária começa à meia-noite UTC. São limites conservadores iniciais, sujeitos à conferência das cotas reais do projeto Gemini.

Somente em `npm run dev`, fora da Vercel e sem credenciais Redis, o contador fica em memória. Ele reinicia com o processo e serve para aprendizado e teste local.

Em produção ou Preview, configurar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`, obtidos de uma base Redis Upstash. A rota faz uma chamada REST com script Lua que verifica e incrementa os contadores em uma única operação atômica, compartilhada entre instâncias. Não são enviados ao Redis perguntas, respostas ou endereços IP. O proprietário escolheu usar o plano Free, com intenção de custo zero; nenhuma conta foi criada por esta implementação.

Sem configuração válida ou com falha no Redis, a rota retorna 503 antes de consultar o Gemini. Não há fallback para memória em produção. Uma consulta reservada continua contando se o Gemini falhar, ajudando a conter repetição de tentativas. `CHATBOT_ENABLED=false` desativa a rota.

### Configurar o Upstash no plano Free

1. Acessar o [console Upstash](https://console.upstash.com/) e criar uma base Redis no plano **Free**. Conferir o plano selecionado antes de concluir.
2. Manter a conta no Free, sem adicionar cartão ou contratar recursos pagos. Segundo a página de preços consultada em 29/10/2026, adicionar cartão promove o banco para Pay as You Go; não fazer upgrade para manter custo zero.
3. Copiar a REST URL e o token com permissão de escrita para as variáveis abaixo em `.env.local`. Não usar o token somente de leitura: o contador precisa incrementar valores.

```dotenv
UPSTASH_REDIS_REST_URL=https://SEU-ENDPOINT.upstash.io
UPSTASH_REDIS_REST_TOKEN=SEU_TOKEN
```

4. Reiniciar `npm run dev`. Com ambas as variáveis preenchidas, o contador passa a usar Redis também no teste local.
5. Depois da validação local, cadastrar as mesmas variáveis de servidor nos ambientes necessários da Vercel e fazer novo deployment. Não enviar tokens pelo chat nem versioná-los.

Na consulta de 29/10/2026, o Free inclui 250 MB de dados, 10 GB de transferência mensal e 500 mil comandos por mês. Acompanhar o consumo no painel. O limite de 50 consultas/dia protege o Gemini, mas não é um teto de comandos Redis: solicitações bloqueadas também consultam o contador, e uma solicitação pode executar vários comandos. Se houver esgotamento ou falha, a aplicação recusa novas chamadas ao Gemini em vez de migrar automaticamente para um serviço pago.

Fonte: [preços oficiais do Upstash Redis](https://upstash.com/pricing/redis).

## Verificar localmente

Com Node.js 24, executar:

```bash
npm run test:chatbot
```

Os testes simulam HTTP do Redis e do Gemini, usam chaves fictícias e não consomem cota real. Eles verificam o contrato, validação, limites, erros e o contexto enviado ao provider.

Em 29/10/2026, uma verificação separada com as credenciais locais executou o script Lua no Upstash real. A consulta foi permitida e o contador diário tinha expiração válida. Essa verificação consumiu comandos Redis, sem consultar o Gemini nem exibir credenciais. A configuração e o fluxo no Preview da Vercel continuam pendentes; o teste de conexão não verifica o plano de cobrança da conta.

Para testar manualmente uma chamada real, preencher `.env.local` com a chave e o modelo, executar `npm run dev` e enviar:

```bash
curl -i http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"language":"pt","messages":[{"role":"user","content":"Alex tem experiência com Python?"}]}'
```

Esse comando manual consome a cota do Gemini.

### Diagnóstico do primeiro teste real (29/10/2026)

Foi reproduzido um erro com Upstash respondendo 200 e Gemini retornando 504. O provider convertia esse timeout remoto em indisponibilidade genérica (503); foi corrigido para retornar código `timeout` e HTTP 504. Erros remotos 400/401/403/404 passam a indicar `configuration`, mantendo a mensagem pública genérica. Em desenvolvimento, falhas HTTP da Gemini API registram somente seu status no terminal, sem credenciais, prompts ou conteúdo das conversas.

A consulta da lista de modelos confirmou a presença do modelo configurado para a chave. Uma nova execução da rota, com a pergunta pública sobre experiência com Python, recebeu 200 tanto do Upstash quanto do Gemini e retornou `reply`. O erro não persistiu na repetição; a causa do timeout remoto não foi determinada. A qualidade detalhada, os testes bilíngues e o fluxo no Preview continuam pendentes.

No build, `outputFileTracingIncludes` inclui explicitamente somente a base pública e o prompt na função `/api/chat`. Documentos privados não fazem parte desse contexto.

Referências: [Route Handlers do Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/route) e [REST API do Upstash Redis](https://upstash.com/docs/redis/features/restapi).

### Ajuste para consultas mais lentas

Após novo timeout no teste manual, o prazo foi ajustado de 20 para 45 segundos no provider e no SDK. A rota declara duração máxima de 60 segundos na Vercel. Naquele diagnóstico, o modelo era `gemini-3.8-flash`, com raciocínio `LOW`, apropriado ao escopo de perguntas factuais, e máximo de 1.024 tokens. Aumentar o prazo permite esperar mais; não garante que o serviço responda nem resolve toda causa de latência. Não há repetição automática.

Em desenvolvimento, o terminal diferencia `Tempo limite local atingido` de `Falha na Gemini API`, informando tempo decorrido e, no segundo caso, status HTTP. Esses registros não incluem chave, prompts ou conversa.

Referências: [controle de raciocínio Gemini](https://ai.google.dev/gemini-api/docs/thinking) e [duração de funções na Vercel](https://vercel.com/docs/functions/configuring-functions/duration).

Resultado da verificação após esse ajuste: o build de produção e os 11 testes simulados passaram, mas a consulta real completa ainda recebeu HTTP 504 do Gemini. Um pedido mínimo ao mesmo modelo, sem a base e sem instruções do portfólio, também excedeu 15 segundos. O Upstash respondeu 200. A causa da lentidão não foi determinada; não considerar a falha real resolvida apenas pelos testes locais. Próxima verificação: executar uma mensagem mínima no Google AI Studio com o modelo escolhido e comparar o comportamento. Novas chamadas automáticas foram interrompidas para preservar cota.

### Modelo atual

Configurado `GEMINI_MODEL=gemini-3.5-flash-lite` após a indicação do proprietário. A configuração local foi atualizada preservando as demais variáveis. O nível LOW é compatível com esse modelo e a tabela de preços oficial lista entrada/saída gratuitas no Free Tier. Reiniciar `npm run dev` para carregar a configuração e repetir o teste de `/api/chat`. A validação real desse novo modelo permanece pendente.


### Streaming com Vercel AI SDK e diagnóstico de latência

O chatbot usa `ai`, `@ai-sdk/google` e `@ai-sdk/react`. O provider instancia `createGoogle({ apiKey })` com `GEMINI_API_KEY` e usa o modelo de `GEMINI_MODEL` diretamente na Gemini API. Não usa AI Gateway nem requer nova chave ou conta. A dependência `@google/genai` foi removida.

O widget usa `useChat()` e `DefaultChatTransport`. O transporte converte as mensagens da interface para o contrato validado `{ language, messages: [{ role, content }] }`, preservando pares completos dentro dos limites atuais. IDs, partes de interface e opções internas do SDK não são aceitos na API.

O widget envia `Accept: text/event-stream`. Nesse modo, `streamText()` gera os trechos e `createUIMessageStreamResponse()` os serializa no protocolo UI Message Stream do SDK (SSE), com eventos `start`, `text-start`, `text-delta`, `text-end` e `finish`. Não são transmitidos pensamentos internos. O antigo protocolo NDJSON e seu leitor foram substituídos.

Sem esse cabeçalho, permanece o contrato JSON `{ "reply": "..." }`, usando `generateText()`. Falhas anteriores ao primeiro texto mantêm os status HTTP existentes. Após iniciar a transmissão, uma falha gera evento `error` com `errorText` contendo apenas um código público, sem evento `finish`. O cliente exige conclusão com motivo `stop`; falhas e cancelamentos removem a pergunta e a resposta incompleta e restauram o rascunho. Fechar o widget chama `stop()`. A API propaga o cancelamento ao provedor e mantém o prazo de 45 segundos, sem repetição automática (`maxRetries: 0`).

O servidor registra `[chatbot] latency` com durações em milissegundos: `redis`, `context`, `firstText` (da chamada Gemini até o primeiro texto), `gemini` (geração e consumo do fluxo), `total` e `outcome`. Não registra perguntas, respostas ou credenciais. O cabeçalho `Server-Timing` das respostas em streaming inclui Redis, contexto e primeiro texto. O tempo `total` termina no servidor; não inclui a renderização no navegador.

Perguntas factuais recebem orientação explícita de 2 a 4 frases curtas. O limite de 1.024 tokens e o raciocínio LOW permanecem. O streaming antecipa a exibição, mas não elimina a espera do provedor até o primeiro texto. Os testes usam respostas HTTP simuladas e o transporte real do SDK para verificar entrega incremental, erros, cancelamento, contexto e limites, sem consumir cota real.

Referências: [provider Google](https://ai-sdk.dev/providers/ai-sdk-providers/google), [useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) e [protocolo de streaming](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol).
