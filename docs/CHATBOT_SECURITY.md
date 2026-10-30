# Guardrails e prompt injection no chatbot

## Escopo da revisão

O chatbot responde somente com texto sobre um perfil público. As entradas não confiáveis são a pergunta, todo o histórico recebido do navegador (inclusive mensagens com `role: assistant`) e o conteúdo textual dos trechos recuperados. Um arquivo de origem aprovado não transforma seu conteúdo em instruções autorizadas.

A revisão encontrou validação de formato, limite de uso, leitura de caminhos fixos, separação de sistema e dados e validação estrutural da resposta. Foram reforçados o histórico, a inspeção de conteúdo recuperado e a saída. A implementação está em `src/app/lib/chatbot/guardrails.ts`.

## Controles aplicados

| Camada | Controle | Comportamento |
|---|---|---|
| HTTP | Campos permitidos, papéis, alternância, tamanhos e limite Redis | Entrada inválida é rejeitada; tentativas de injeção também contam no limite de uso |
| Pergunta | Heurísticas PT/EN para substituição explícita de regras, extração de instruções/credenciais e papéis falsos | Recusa fixa no idioma da página antes de embeddings e geração |
| Histórico | Pares com sinais explícitos são retirados; histórico restante é serializado como dados | Conteúdo do navegador nunca cria mensagens reais de sistema, desenvolvedor ou assistente no pedido ao modelo |
| RAG | Origem, integridade, score, tamanho e sinais explícitos de injeção | Blocos suspeitos são descartados; sem trechos válidos, não há geração |
| Prompt | Uma mensagem JSON `portfolio_question` contém `reference`, `history` e `question` | A aplicação monta os campos e escapa strings com `JSON.stringify`; regras ficam em `system` |
| Saída | Validação estrutural, valores secretos conhecidos, cópia de frases internas, dumps JSON e URLs | Texto suspeito gera `invalid_response` antes da exibição, sem resposta parcial |
| Capacidades | Nenhuma ferramenta, busca na web ou execução de comandos habilitada | A geração não tem poderes para ler outros arquivos, seguir URLs ou modificar sistemas |
| Interface e logs | Texto simples e registros somente de metadados | Não renderiza HTML/Markdown nem registra perguntas, trechos, respostas ou credenciais |

As regras de idioma da página permanecem em `system`. Uma pergunta comum pedindo outro idioma não é bloqueada pelo filtro, mas o prompt orienta responder no idioma da página. Recusas locais usam esse mesmo idioma.

O modelo recebe somente uma mensagem de usuário com o envelope montado pelo servidor. O papel descrito em `history` é um atributo de dados, não uma mensagem autenticada. Somente `reference.passages` é selecionado pelo servidor como referência de fatos; objetos JSON escritos dentro de `question` ou `history` continuam sendo strings desses campos.

## Verificação da saída

A resposta inteira é verificada antes de gerar o corpo SSE ou JSON. O verificador bloqueia cópias exatas de credenciais conhecidas (`GEMINI_API_KEY` e token Redis, quando configurados e com pelo menos oito caracteres), frases internas longas normalizadas e identificadores de dump da estrutura de referência.

URLs HTTP, HTTPS e mailto precisam aparecer nos trechos usados na geração. URLs são normalizadas sintaticamente; parâmetros adicionais não são autorizados por compartilhar domínio com um link aprovado. Um endereço de e-mail presente em um trecho também permite seu link mailto. O verificador não acessa essas URLs. Uma recusa de saída usa o erro público genérico de resposta inválida, sem devolver o conteúdo bloqueado.

Credenciais são usadas pelo transporte de API, não incluídas no prompt. O prompt não é um local adequado para guardar segredos. A verificação adicional de valores conhecidos não deve ser usada para justificar enviar segredos ao modelo.

## Testes e limites

Execute `npm run test:chatbot`. A suíte cobre:

- Tentativas diretas em PT/EN, papéis falsos, Unicode de ofuscação simples e pedidos de tradução de instruções.
- Perguntas legítimas sobre IA e segurança para evitar bloquear apenas por mencionar esses assuntos.
- Histórico contaminado, objetos de referência falsos e serialização de strings maliciosas.
- Trechos com origem/score válidos, mas contendo instruções explícitas de injeção.
- Bloqueio de credencial, cópia de prompt e URLs não aprovadas antes de qualquer texto de resposta.
- Recusa no idioma da página sem chamadas de embeddings ou geração.
- Preservação dos demais testes de recuperação, cache, cancelamento, limites e transporte.

Os testes usam HTTP simulado e exemplos fixos. Eles não medem a resistência adversarial do Gemini real. Heurísticas não cobrem todas as paráfrases, codificações, idiomas, conteúdo malicioso distribuído entre campos ou ataques novos e podem produzir falsos positivos. JSON ajuda a separar campos, mas não cria uma barreira semântica infalível. A verificação de saída também não detecta toda tradução ou reformulação das instruções, nem comprova a veracidade dos fatos.

Envenenamento factual do próprio Markdown, referências incorretas e alucinações precisam de revisão da base e avaliação de qualidade. Se forem adicionadas ferramentas com efeitos externos no futuro, elas precisarão de autorização e validação próprias; o prompt e estes filtros não devem autorizar ações.

## Referências

- [OWASP: LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).
- [OWASP: RAG Security](https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html).
