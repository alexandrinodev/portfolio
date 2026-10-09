# Plano Detalhado: Botão PT/EN no Portfolio

## 🔍 Informações Coletadas

**Stack tecnológica:**
- Next.js 16.2.2 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animações)
- Lucide React + React Icons

**Estrutura do conteúdo:**
- Conteúdo em português brasileiro e inglês
- Dados centralizados em `src/app/lib/constants.tsx` (menuItems, services, stats, projectsData, etc.)
- Componentes: NavBar, Hero, Services, Work, Resume, Contact

## 📝 Plano de Implementação

### Etapa 1: Configurar sistema de internacionalização
- [x] Criar pasta `src/app/i18n/` com arquivos de tradução
- [x] Criar `translations/pt.json` com todas as strings em português
- [x] Criar `translations/en.json` com todas as strings em inglês
- [x] Criar hook `useTranslation` (Context API do React)

### Etapa 2: Criar componente do botão de idioma
- [x] Criar componente `LanguageToggle.tsx` no diretório components
- [x] Implementar botão com flags (🇧🇷 / 🇺🇸) ou texto (PT/EN)
- [x] Adicionar animação com Framer Motion
- [x] Persistir escolha no localStorage

### Etapa 3: Integrar no NavBar
- [x] Importar e adicionar o `LanguageToggle` no `NavBar.tsx`
- [x] Posicionar entre o menu e o botão "Me Contrate"

### Etapa 4: Substituir textos hardcoded nos componentes
- [x] Hero.tsx: "Desenvolvedor Full Stack", "Olá, Eu sou", textos do botão Download
- [x] Services.tsx: título da seção (se existir)
- [x] Work.tsx: textos dos botões de navegação
- [x] constants.tsx: Separar strings de menuItems, services, stats, etc.

### Etapa 5: Testar e validar
- [ ] Verificar alternância PT ↔ EN no navegador e persistência após recarregar
- [ ] Verificar visualmente o layout em PT e EN
- [ ] Testar responsividade no navegador

## 📁 Arquivos a serem criados/editados

| Ação | Arquivo |
|------|---------|
| Criar | `src/app/i18n/translations/pt.json` |
| Criar | `src/app/i18n/translations/en.json` |
| Criar | `src/app/i18n/LanguageContext.tsx` |
| Criar | `src/components/LanguageToggle.tsx` |
| Editar | `src/components/NavBar.tsx` |
| Editar | `src/app/lib/constants.tsx` |
| Editar | `src/components/Hero.tsx` |

## Implementação realizada

- Contexto `useLanguage` com alias `useTranslation`, conteúdo inicial renderizado em PT e preferência persistida no localStorage.
- Idioma do HTML sincronizado com a seleção; armazenamento indisponível usa preferência em memória.
- Botão PT/EN presente no menu desktop e mobile, com animação e nome acessível traduzido.
- Textos e rótulos dos componentes centralizados nas traduções; dados duplicados removidos das constantes.
- Download CV aponta para `/cv/EN - Software Engineer - Alex Alexandrino.pdf` em ambos os idiomas (único PDF fornecido).
- Contato via WhatsApp preservado; “Me Contrate” continua levando à seção de contato.

## Validação

- [x] ESLint sem erros ou avisos.
- [x] TypeScript sem erros.
- [x] Build de produção concluído; rotas geradas como conteúdo estático.
- [x] Estrutura de chaves PT/EN equivalente.
- [x] Arquivo do currículo existe e possui assinatura PDF válida.
- Validação visual e interação no navegador pendentes: não há ferramenta de navegador disponível nesta sessão.

## Alinhamento do portfólio ao currículo

- [x] Histórico confirmado: Tester Engineer no SIDIA (2022–2023) e Software Engineer (2023–2026). Sem vínculo atual no conteúdo público.
- [x] Hero atualizado para Engenharia de Software Full Stack, web/desktop, arquitetura, automação, DevOps e qualidade.
- [x] Estatísticas alinhadas ao PDF: 5 anos no SDLC, 4 em web/desktop, até 60% de redução no tempo de execução e 2 idiomas.
- [x] Experiências detalhadas com entregas e resultado de automação/LLMs com RAG.
- [x] Educação atualizada: UNIPDS (conclusão prevista em outubro/2027), AOSP Icomp/UFAM (2024–2025), UNINORTE (2017–2020).
- [x] Idiomas: português nativo e inglês B2.
- [x] Habilidades agrupadas por área, incluindo arquitetura/dados, DevOps, testes e IA.
- [x] Serviços alinhados às competências e entregas do currículo.
- [x] Projetos provisórios substituídos por entregas profissionais descritas no PDF, sem inventar repositórios, imagens ou demos.
- [x] Conteúdo equivalente em PT/EN e README atualizado.
- [ ] Revisão visual mobile/desktop e interação no navegador.

Para estudos de caso individuais com imagens e links, ainda são necessários materiais reais dos projetos. As entregas atuais resumem a experiência profissional documentada no currículo.

Validação desta atualização: ESLint, TypeScript e build de produção aprovados; HTML gerado conferido para cargos, período e métrica de 60%. Estrutura PT/EN equivalente. Revisão visual pendente.
