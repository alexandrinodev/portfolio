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


### RAG com LangChain, Gemini e índice em memória

O fluxo atual substitui o envio integral da base por recuperação semântica. `knowledge-index.ts` lê o Markdown público de caminho fixo, usa documentos e `RecursiveCharacterTextSplitter` do LangChain (Markdown, 1.100 caracteres e sobreposição de 150) e monta um `MemoryVectorStore`. A implementação `GeminiEmbeddings`, em `embeddings.ts`, adapta a interface `Embeddings` do LangChain ao SDK Google atual, com `RETRIEVAL_DOCUMENT` e `RETRIEVAL_QUERY`, sem retries. Não utiliza FAISS, AI Gateway, LangSmith ou um serviço de banco vetorial.

Configurações adicionais (mesma chave `GEMINI_API_KEY`):

```dotenv
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
CHATBOT_RAG_MIN_SCORE=0.35
```

O modelo de geração continua em `GEMINI_MODEL`. As duas configurações adicionais têm os padrões acima se ausentes. O limiar é uma configuração inicial, não uma garantia de relevância; calibrá-lo com perguntas PT/EN e consultar as cotas do modelo de embeddings da conta.

A chave do cache usa hash do Markdown, modelo, credencial e parâmetros do splitter. A memória mantém a versão atual e compartilha a Promise de construção entre consultas simultâneas. Falhas descartam a Promise. A indexação compartilhada tem prazo próprio de 30 segundos; cancelar uma consulta não cancela uma indexação que pode atender outras. A consulta pode parar de esperar imediatamente. O prazo geral do provider de 45 segundos inclui recuperação e geração. O cache é temporário e isolado por instância Vercel: cold starts e deployments podem causar nova indexação. Não há escrita no filesystem nem cache vetorial no Redis.

A busca recupera oito candidatos, inspeciona origem, integridade, scores, duplicatas e tamanho, e seleciona até quatro blocos dentro de 4.400 caracteres. A consulta considera a pergunta atual e, em continuações detectadas por uma regra simples, a pergunta anterior do visitante. Essa regra não resolve toda referência ambígua. Sem resultados acima do limiar, retorna uma mensagem de informação indisponível, sem chamada de geração nem fallback à base completa.

As instruções ficam somente em `system`. Uma única mensagem JSON `portfolio_question` contém `reference.passages`, `history` e `question`. Papéis de assistente recebidos do navegador permanecem atributos de dados no histórico, sem se tornarem mensagens reais de assistente. O prompt orienta tratar esses textos como dados e responder apenas com fatos dos trechos. Isso reduz mistura de instruções e conteúdo; não constitui uma garantia contra toda tentativa de manipulação.

### Validação completa e transporte da interface

O widget mantém `useChat()`, `DefaultChatTransport` e `Accept: text/event-stream`. A rota usa `createUIMessageStreamResponse()` para gerar SSE compatível com o SDK. O provider consome `streamText()` internamente, mas acumula o texto e valida **antes de liberá-lo**: motivo de conclusão `stop`, texto não vazio, até 6.000 caracteres, sem HTML nem caracteres de controle inválidos. Não há exibição de tokens ainda não validados. O texto é renderizado diretamente pelo React; HTML e Markdown não são interpretados.

A validação é estrutural, sem segundo modelo de revisão factual. Fundamentação e qualidade devem ser avaliadas com perguntas de teste. Respostas truncadas, bloqueadas, vazias ou inválidas geram erro antes de iniciar o texto. Cancelamentos são propagados; a pergunta é restaurada no widget. Sem `Accept: text/event-stream`, o contrato JSON `{ "reply": "..." }` permanece. Ambos usam o mesmo fluxo de `streamText()`, coleta e validação; o cabeçalho muda somente o formato da resposta HTTP.

### Inspecionar trechos e acompanhar consumo

Com Node.js 24 e `.env.local` configurado:

```bash
npm run inspect:rag -- "Qual a experiência com Python?"
```

O comando usa o mesmo módulo de recuperação e imprime os trechos públicos e seus scores. Consome chamadas reais de embeddings, não chama o gerador e não passa pelo limite HTTP do Redis. Cada execução tem sua própria memória. Não é um teste automático de qualidade nem deve ser usado em um endpoint público sem controle de uso.

Logs normais não imprimem perguntas, trechos, respostas ou credenciais:

- `[chatbot] retrieval`: cache hit, quantidade indexada, IDs e scores selecionados e caracteres de contexto.
- `[chatbot] tokens`: tokens de entrada, saída, total, raciocínio e cache de geração quando retornados pela API (`null` quando ausentes). Não inclui embeddings.
- `[chatbot] latency`: `redis`, `index`, `queryEmbedding`, `search`, `context`, `firstText`, `responseValidation`, `gemini`, `total` e `outcome`, conforme as etapas executadas. `context` inclui a preparação e a recuperação; não somar todas as durações como etapas independentes. `firstText` mede o primeiro texto do provedor, não o momento de exibição após validação. `Server-Timing` inclui as medições disponíveis na resposta SSE.

O cache reduz reindexações na mesma instância, e o RAG limita o texto dos fatos enviados à geração. A economia líquida deve considerar embeddings, instruções e histórico. Testes HTTP simulados verificam o fluxo e não validam a relevância dos embeddings reais nem estimam custos ou latência em produção.

Referências: [MemoryVectorStore](https://docs.langchain.com/oss/javascript/integrations/vectorstores/memory), [provider Google](https://ai-sdk.dev/providers/ai-sdk-providers/google), [useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat).


### Manutenção e testes

`provider.ts` coordena o caso de uso; `prompt.ts` constrói a consulta e as mensagens, `generation.ts` integra a geração, `errors.ts` normaliza falhas e `contracts.ts` centraliza tipos, limites e validações. `config.ts` valida a configuração, incluindo o limiar de similaridade: valores vazios usam o padrão, valores inválidos resultam em `configuration`. Vetores inválidos resultam em `invalid_response`.

`KnowledgeIndexCache` recebe a leitura do Markdown e a fábrica de embeddings pelo construtor. Isso permite verificar invalidação por conteúdo, modelo e credencial, cancelamento individual sem interromper trabalho compartilhado, reconstrução após falha e preservação de uma versão nova quando uma construção antiga falha.

A API gera SSE somente depois que `generateChatbotReply()` retorna uma resposta validada. A geração em `generation.ts` usa um único caminho de `streamText()`, independente do formato HTTP, e valida a resposta completa antes da exibição. Erros HTTP e falhas de geração possuem códigos tipados; a rota não classifica erros pelo texto de `Error.message`.

Execute `npm run test:chatbot`. O script carrega `scripts/register-typescript.mjs` para resolver os imports TypeScript e inclui testes de domínio, cache, conversa, transporte e HTTP, todos sem serviços reais.


### Idioma de resposta

`language` é o idioma atual da página, enviado pelo `LanguageContext` da interface. A instrução de sistema exige português para `pt` e inglês para `en`, independentemente do idioma da pergunta, dos trechos e do histórico, inclusive quando o visitante pede outra língua. As informações recuperadas devem ser traduzidas, preservando nomes próprios e de tecnologias. A resposta fixa de ausência de trechos e os erros após validação também usam esse idioma. `Accept-Language` só é utilizado como fallback de erros antes da validação do corpo.

Os testes simulados verificam o idioma enviado ao provedor nas duas direções, com histórico misto e pedidos de mudança, e o transporte com troca de idioma e ausência de trechos. Não fazem detecção automática de idioma da resposta real do Gemini.


### Guardrails

Depois da validação HTTP e do limite Redis, `inspectConversation()` verifica sinais explícitos de injeção. Uma pergunta bloqueada retorna resposta conversacional fixa em PT/EN (HTTP 200, nos mesmos formatos JSON/SSE), sem embeddings ou geração. Pares suspeitos do histórico são removidos. O restante é serializado como dados no envelope, nunca como autoridade de sistema ou assistente. A inspeção de trechos também descarta conteúdo com esses sinais, mesmo quando a origem e a similaridade são válidas.

Depois da validação estrutural, `validateGuardedReply()` verifica valores protegidos conhecidos, cópia de frases internas longas, dumps de referência e URLs sem correspondência nos trechos aprovados. Uma saída bloqueada retorna HTTP 502 com código `invalid_response` antes de iniciar texto de resposta. Logs `[chatbot] guardrail` incluem somente etapa e decisão, sem o conteúdo detectado. Nenhuma ferramenta ou navegação foi habilitada.

Essas verificações são heurísticas, não um classificador infalível nem uma validação factual. Há testes de regressão de ataques e de perguntas legítimas; não houve avaliação adversarial com chamadas reais ao Gemini. Consulte [CHATBOT_SECURITY.md](CHATBOT_SECURITY.md).
