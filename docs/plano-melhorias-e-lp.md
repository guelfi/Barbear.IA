# Plano de melhorias + proposta de nova Landing Page — Barbear.IA

**Data:** 2026-10-27 · **Domínio:** https://barbear.me (OCI, nginx-proxy + Cloudflare)
**Base da análise:** código em `main`/`codex/pin-validated-oci-revision-20261014`, `docs/handoff-estado.md`, `docs/backlog-fases-futuras.md`, `src/components/marketing/LandingPage.tsx`, `src/styles/marketing.css`, `index.html`.

---

## 1. Diagnóstico do projeto

### 1.1 O que já está sólido
- Backend .NET 10 (Clean Architecture), Postgres, Redis, JWT/RBAC, multi-tenant com guard por `TenantId`.
- Agenda, catálogo, barbeiros, clientes, dashboard, notificações, OTP/WhatsApp (Evolution), trial de 7 dias, checkout Stripe (sandbox local).
- CI/CD com deploy da revisão exata validada pelo CI (`d1a1fcc`), domínio `barbear.me` configurado.
- Front com Framer Motion, tema claro/escuro, PWA, Radix UI.

### 1.2 Lacunas relevantes (ordenadas por impacto no negócio)

| # | Lacuna | Evidência | Impacto |
|---|--------|-----------|---------|
| 1 | **LP de 1 tela só**, sem scroll, sem prova social, preço, FAQ ou features | `.lp-root { height:100dvh; overflow:hidden }`, componente com 83 linhas e 1 seção | Visitante não entende o valor nem tem motivo para converter |
| 2 | **Sem SEO/compartilhamento** | `index.html` sem `og:*`, `canonical`, `robots`, JSON-LD; SPA sem prerender | Link no WhatsApp/Instagram sai "pelado"; Google indexa pouco |
| 3 | **Imagens de hero hotlinkadas do Unsplash** e fonte via `@import` CSS | `--lp-hero-image: url(images.unsplash.com…)` | LCP lento, risco de quebra, bloqueio de render |
| 4 | **Sem analytics/funil** | nenhum script de métrica | Impossível medir conversão ou otimizar copy |
| 5 | **PWA/SW com escopo `/`** e `CACHE_NAME` fixo | `manifest.json`, `sw.js` | Risco de cache velho após deploy; revisar no domínio novo |
| 6 | **Docs/ambiente desatualizados** (IP + `/barbear-ia/` como canônico) | `STATUS.md`, `handoff-estado.md`, `.env.example` | Retomada confusa; ainda citam URL antiga e credenciais seed |
| 7 | **Fidelidade/pacotes só mock** (`loyaltyPlanMock.ts`), Stripe e OTP reais pendentes | handoff "não-bloqueadores" | Principais "ganchos" de venda ainda não existem de fato |
| 8 | **Sem testes de front**, lint inexistente | `npm test`/`lint` são `echo` | Regressões na LP/fluxos passam batido |
| 9 | **Bundle**: terser com `keep_fnames`, `drop_console:false`, `manualChunks` mínimo; Recharts/Framer carregados para visitante anônimo | `vite.config.ts` | LP deveria ser leve; hoje carrega o app inteiro |
| 10 | **Segredos/ops**: rotação de secrets OCI pendente, chave SSH e senhas seed em docs versionados | `STATUS.md`, `.env.example` | Higiene de segurança (SECURITY.md existe, mas docs expõem caminhos/credenciais) |

---

## 2. Plano de melhorias (priorizado)

### Fase 0 — Higiene rápida (1–2 dias)
1. Atualizar `STATUS.md`, `handoff-estado.md`, `.env.example` para `https://barbear.me` como URL canônica; remover senhas seed e caminho de chave SSH dos docs.
2. Rotacionar secrets da OCI (JWT, Postgres, Stripe, Evolution).
3. Versionar cache do SW por build (hash) e validar `start_url`/`scope` no domínio novo.
4. Redirecionar `www.barbear.me` → `barbear.me` e HTTP → HTTPS (confirmar no Cloudflare/nginx).

### Fase 1 — Landing page de conversão (2–3 semanas) ← prioridade
Ver seções 3–6 abaixo. Entregáveis: nova LP multi-seção, SEO técnico, analytics, CTA de trial com UTM.

### Fase 2 — Produto que sustenta a promessa (3–5 semanas)
1. **Lembretes e confirmação por WhatsApp** (Evolution OTP + outbox já existem) — é o maior gancho de venda ("reduza faltas").
2. **Link público de agendamento** por barbearia (`barbear.me/{slug}`) com QR Code — vira ativo de marketing do cliente e distribuição orgânica.
3. **Fidelidade e pacotes reais** (F-PKG): tirar do mock.
4. **Stripe real** (checkout + webhooks) com plano mensal/anual; página de preços coerente com a LP.
5. **F-BARBER / F-CLIENT-MT** do backlog.

### Fase 3 — Qualidade e escala (contínuo)
1. Testes: Vitest + Testing Library (fluxos de auth/agenda), Playwright para smoke da LP e do login.
2. ESLint/Prettier + `tsc --noEmit` no CI.
3. Code splitting: LP em chunk próprio, app autenticado em lazy (`LazyComponents` já existe).
4. Observabilidade: logs estruturados da API, healthcheck, alertas de uptime, backup do Postgres.
5. Cobertura backend (meta do README é >90%; hoje há poucos testes).

---

## 3. Análise da LP atual

**O que existe:** uma única tela com foto de barbearia (Ken Burns), marca, headline em itálico, parágrafo e dois botões ("Começar agora", "Entrar"), mais um aside com "Menos improvisação. Mais casa cheia."

**Problemas de copy**
- A headline ("A operação da sua barbearia, no padrão de quem cobra por excelência") é abstrata: não diz **o que o produto faz**, **para quem** nem **qual resultado** entrega.
- Linguagem de engenharia ("plataforma multi-tenant", "isolamento entre unidades", "controle de acesso") — o dono de barbearia não compra isso.
- O nome da marca ocupa o maior destaque; a proposta de valor fica em corpo 1.35–2.1rem.
- O diferencial "IA" do nome não é explicado em lugar nenhum.
- CTA genérico ("Começar agora") sem promessa nem redução de risco (não menciona os **7 dias grátis**, que existem no produto).
- Zero prova: sem números, depoimentos, logos, demonstração do produto.

**Problemas de estrutura/UX**
- Sem scroll: não há onde colocar benefícios, preço, FAQ.
- Nenhuma imagem do produto (dashboard, agenda, WhatsApp).
- Sem navegação, sem rodapé, sem links legais/contato.
- Animação limitada a fade-in de entrada e zoom de fundo.

**Problemas técnicos:** ver lacunas 2, 3, 4 e 9.

---

## 4. Proposta de copy (pt-BR)

**Posicionamento:** "O sistema que enche a agenda da sua barbearia e acaba com o cliente que não aparece."
**Público:** donos de barbearia pequena/média (1–10 cadeiras), hoje usando WhatsApp + caderno/planilha.

### Hero
- **Eyebrow:** Gestão + WhatsApp para barbearias
- **H1:** *Agenda cheia. Cadeira ocupada. Zero cliente esquecido.*
- **Sub:** O Barbear.IA agenda, confirma e lembra seus clientes pelo WhatsApp — e mostra quanto sua barbearia fatura, sem planilha e sem caderno.
- **CTA primário:** Testar 7 dias grátis
- **CTA secundário:** Ver como funciona (rola até a demo)
- **Microcopy sob o botão:** Sem cartão de crédito · Pronto em 5 minutos · Cancele quando quiser
  *(confirmar que "sem cartão" é verdade no fluxo atual antes de publicar)*

### Faixa de números (animada, contador ao entrar na viewport)
Usar apenas números reais ou claramente rotulados como meta/estimativa. Exemplos de formato:
- "−X% de faltas com lembrete automático" *(preencher com dado de piloto)*
- "5 min para configurar"
- "24h/dia agendando por você"

### Seção Dor → Solução (3 cartões "antes / depois")
1. **"Cliente marca e some"** → Lembrete automático no WhatsApp 24h e 2h antes, com confirmar/remarcar em 1 toque.
2. **"Agenda no caderno e no zap, tudo bagunçado"** → Agenda única por barbeiro, sem conflito de horário.
3. **"Não sei quanto ganhei no mês"** → Painel com faturamento, serviços mais vendidos e clientes que sumiram.

### Funcionalidades (grid com ícones animados)
- Agenda inteligente por barbeiro · Link de agendamento próprio + QR Code · Lembretes por WhatsApp · Cadastro e histórico de clientes · Catálogo de serviços e preços · Painel financeiro · Equipe com permissões · Clube de fidelidade e pacotes *(marcar "em breve" até F-PKG sair)* · Funciona no celular como app (PWA).

### Como funciona (3 passos com linha animada)
1. Crie sua barbearia (2 min) → 2. Cadastre serviços e equipe → 3. Compartilhe seu link e deixe a agenda trabalhar.

### Para cada perfil (tabs: Dono · Barbeiro · Cliente)
Cada aba troca o mockup e 3 bullets de benefício — usa o RBAC real do produto como argumento.

### Prova social
- Depoimentos em carrossel (com foto, nome da barbearia, cidade). **Enquanto não houver reais, não inventar**: usar bloco "Seja uma das barbearias fundadoras" com condição especial.
- Selo "Dados protegidos (LGPD) · Hospedagem em nuvem · Backup diário" — só se verdadeiro.

### Preço
Um plano (README: "Plano único Pro") com toggle Mensal/Anual, lista do que inclui, e garantia/trial. **Valores: decisão de negócio — não definidos no código** (o checkout usa só `pro-monthly`/`pro-yearly`).
Gancho: "Oferta de fundador: trava o preço para sempre nas 20 primeiras barbearias" (se o negócio quiser usar).

### FAQ (accordion — Radix já instalado)
Preciso de cartão no teste? · Funciona para barbearia com 1 barbeiro? · Meus clientes precisam instalar algo? · Como funciona o WhatsApp? · Posso cancelar? · Meus dados estão seguros? · Migrar do caderno/planilha?

### CTA final
"Sua agenda não precisa depender de memória." + botão de trial + botão "Falar no WhatsApp" (link `wa.me`).

---

## 5. Proposta de layout (ordem das seções)

```
┌────────────────────────────────────────────────────────────┐
│ NAV sticky (vira vidro ao rolar): logo · Recursos · Preço ·│
│ FAQ · [Entrar] [Testar grátis]                              │
├────────────────────────────────────────────────────────────┤
│ 1 HERO  split 55/45                                        │
│  esq: eyebrow, H1 grande (palavras destacadas em latão),   │
│       sub, 2 CTAs, microcopy, selos                        │
│  dir: mockup do app em moldura de celular + cartões        │
│       flutuantes ("✓ Lucas confirmou 15:30",               │
│       "+R$ 45 corte+barba") surgindo em sequência          │
│  fundo: foto escurecida + grão + brilho latão (já existe)  │
├────────────────────────────────────────────────────────────┤
│ 2 FAIXA DE NÚMEROS (contadores)                            │
├────────────────────────────────────────────────────────────┤
│ 3 DOR → SOLUÇÃO  3 cartões antes/depois (flip ou slide)    │
├────────────────────────────────────────────────────────────┤
│ 4 DEMO INTERATIVA: tabs Dono/Barbeiro/Cliente + mockup     │
│   (screenshots reais do app, sticky com scroll-driven)     │
├────────────────────────────────────────────────────────────┤
│ 5 WHATSAPP: simulação de conversa que "digita" sozinha     │
│   lembrete → "1 confirmar / 2 remarcar" → agenda atualiza  │
├────────────────────────────────────────────────────────────┤
│ 6 FUNCIONALIDADES  grid 3x3 com ícones animados no hover   │
├────────────────────────────────────────────────────────────┤
│ 7 COMO FUNCIONA   3 passos, linha que se desenha ao rolar  │
├────────────────────────────────────────────────────────────┤
│ 8 PROVA SOCIAL    depoimentos / fundadores                 │
├────────────────────────────────────────────────────────────┤
│ 9 PREÇO           card único + toggle + oferta fundador    │
├────────────────────────────────────────────────────────────┤
│ 10 FAQ            accordion                                │
├────────────────────────────────────────────────────────────┤
│ 11 CTA FINAL      fundo latão/escuro, botão pulsante       │
├────────────────────────────────────────────────────────────┤
│ FOOTER: links, contato, termos/privacidade, redes          │
└────────────────────────────────────────────────────────────┘
+ barra de CTA fixa no mobile ("Testar 7 dias grátis")
+ botão flutuante de WhatsApp
```

**Identidade visual:** manter o que já funciona — paleta ink `#0c0a09` / latão `#c4a574` / creme `#f5f0e8`, Cormorant Garamond (display) + Manrope (corpo). Mudanças: usar a serifa só em títulos, aumentar o tamanho do H1 (hoje 2.1rem máx.), reduzir o peso do logotipo no hero (vai para a nav), e adicionar um terceiro tom de acento (verde WhatsApp `#25D366`) apenas nos elementos de mensagem.

---

## 6. Animações e ganchos (com critério)

**Animações (Framer Motion já instalado, sem nova dependência):**
| Onde | Efeito | Por quê |
|------|--------|---------|
| Hero | Palavras do H1 entram em sequência (stagger); cartões flutuantes aparecem em loop leve | Mostra o produto "vivo" nos 3 primeiros segundos |
| Números | Contagem animada via `useInView` | Chama atenção para a prova |
| Antes/depois | Cartão vira (flip) ou slider ao hover/toque | Contraste dor × solução |
| Demo | Troca de aba com `AnimatePresence` + mockup com parallax suave (`useScroll`) | Interatividade sem custo de vídeo |
| WhatsApp | Digitação simulada + balões sequenciais | É o principal diferencial; precisa ser visto |
| Como funciona | Linha SVG que se desenha (`pathLength`) | Guia a leitura |
| CTA | Pulso discreto e brilho latão que cruza o botão | Direciona o clique |

**Regras:** respeitar `prefers-reduced-motion` (já há precedente em `marketing.css`), animar só `transform`/`opacity`, nada que bloqueie LCP, e pausar loops fora da viewport.

**Ganchos de conversão:**
1. **Trial de 7 dias** em destaque (existe no produto).
2. **Oferta de fundador** com contador de vagas *(só se for real)*.
3. **Calculadora de faltas**: "Quantos clientes faltam por mês? × ticket médio = quanto você perde" → mostra o valor recuperado e leva ao CTA. É o gancho mais forte para dono de barbearia.
4. **Link/QR Code de agendamento** como brinde imediato no cadastro.
5. **WhatsApp direto** para dúvidas (reduz fricção de compra B2B pequeno).
6. **Exit-intent / scroll 70%**: oferta "baixe o checklist de gestão de barbearia" (captura e-mail) — opcional.

---

## 7. Requisitos técnicos da LP

1. **Separar a LP do app**: rota `/` estática/pré-renderizada (ex.: Vite SSG com `vite-plugin-ssr`/`vite-react-ssg`, ou página HTML própria) e app autenticado em `/app`. Hoje a LP é estado (`guestView`) dentro do SPA, o que prejudica SEO e peso.
2. **SEO:** `<title>` e `meta description` por intenção de busca, `og:*`/`twitter:*` com imagem 1200×630, `canonical https://barbear.me/`, `robots.txt`, `sitemap.xml`, JSON-LD `SoftwareApplication` + `FAQPage`.
3. **Performance:** hospedar imagens/fontes localmente (WebP/AVIF, `font-display: swap`, subset), `preload` do LCP, alvo Lighthouse ≥ 90 mobile.
4. **Analytics e funil:** Plausible/Umami (leve, sem cookie banner pesado) ou GA4; eventos `cta_click`, `trial_start`, `signup_complete`, `pricing_view`, `faq_open`; UTM propagado até o cadastro.
5. **Acessibilidade:** contraste do texto `--lp-smoke` sobre fundo, foco visível, `aria-label` nos controles, navegação por teclado nas tabs/accordion.
6. **LGPD:** página de Privacidade e Termos, aviso de cookies só se usar analytics com cookie.
7. **Conteúdo real:** capturas de tela do app (dashboard, agenda, mobile) com dados demo — exportar do ambiente seed.

---

## 8. Cronograma sugerido da LP

| Semana | Entrega |
|--------|---------|
| 1 | Copy final aprovada, wireframes em alta, capturas de tela do app, decisão de preço e oferta |
| 2 | Hero + nav + números + dor/solução + funcionalidades (com animações) |
| 3 | Demo por perfil, simulação de WhatsApp, preço, FAQ, CTA final, footer |
| 4 | SEO técnico, analytics, performance, a11y, teste A/B de headline, publicar em `barbear.me` |

## 9. Métricas de sucesso
- Taxa visita → clique em CTA (meta inicial 8–12%)
- Clique → cadastro concluído (meta 30–40%)
- Cadastro → trial ativo com ≥ 1 agendamento criado (ativação)
- Trial → pagante
- Lighthouse mobile ≥ 90 · LCP < 2,5 s

## 10. Decisões que dependem de você
1. **Preço** e se haverá oferta de fundador/limite de vagas.
2. **Sem cartão no trial?** (o fluxo atual não pede cartão, mas confirme a política.)
3. **Provas reais** disponíveis: barbearias piloto, depoimentos, números.
4. **WhatsApp comercial** para o botão de contato.
5. **LP separada do app** (recomendado) ou manter dentro do SPA.
6. Como tratar o "IA" do nome: se não há IA de fato, evitar prometer; se houver (ex.: sugestão de horários, reativação de clientes), destacar com exemplos concretos.
