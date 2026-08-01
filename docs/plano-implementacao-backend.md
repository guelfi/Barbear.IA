# Plano de Implementação — Backend Barbear.IA

**Status:** Aprovado — em implementação  
**Versão:** 1.4  
**Data:** 2026-08-01  
**Stack alvo:** .NET 10 LTS · ASP.NET Core · EF Core · **PostgreSQL** · Redis · **Evolution API (WhatsApp)** · Docker · OCI  
**Frontend de referência:** SPA React existente (personas, telas e permissões em `src/`)

---

## 1. Objetivo

Implementar a API multi-tenant do Barbear.IA cobrindo todas as funcionalidades já desenhadas no frontend (Super Admin, Dono/Admin, Barbeiro, Cliente, Serviços), com:

- RBAC por **permissão** (não apenas por role)
- Isolamento rígido entre **tenants**
- Critérios de segurança como **gate de aceite** em cada épico
- Substituição progressiva da API mock do frontend
- **PostgreSQL** como banco oficial
- **Evolution API** (já na OCI) como canal WhatsApp complementar à autenticação e às notificações transacionais

---

## 2. Decisões de arquitetura (para aprovação)

| Decisão | Proposta | Alternativa | Recomendação |
|---------|----------|-------------|--------------|
| Runtime | **.NET 10 LTS** (suporte até nov/2028) | .NET 8 (EOL nov/2026) | **Aprovar .NET 10** |
| Arquitetura | Clean Architecture + DDD leve | Monólito anêmico | Clean Architecture |
| Auth | ASP.NET Identity + JWT + Refresh + **OTP WhatsApp via Evolution** | Cookie-only / só senha | Híbrido: senha + OTP/2FA WhatsApp |
| Multi-tenant | Coluna `TenantId` + EF Global Query Filter | Schema/DB por tenant | Coluna + filtro (escala inicial) |
| RBAC | Role → Permissions (seed) + claims/policy | Só roles | Role + permission policies |
| Banco | **PostgreSQL** | SQL Server | **PostgreSQL (aprovado)** |
| ORM | EF Core 10 + Npgsql | Dapper-only | EF Core + Npgsql |
| Cache / rate limit / OTP store | Redis | In-memory | Redis (prod); in-memory (dev) |
| Mensageria WhatsApp | **Evolution API existente na OCI** | Twilio / Meta Cloud direto | Evolution (reuso infra) |
| Billing | Stripe (webhook no backend) | Manual | Stripe |
| API style | REST `/api/v1` | GraphQL | REST |
| Deploy API | Container na OCI (junto ou ao lado do front) | PaaS | Docker + Compose |

### 2.1 Decisões de produto que precisam de OK explícito

| # | Pergunta | Proposta padrão |
|---|----------|-----------------|
| D1 | Cliente pode pertencer a **vários** tenants? | **Fase 1 (atual):** um client profile por tenant; discovery lista tenants ativos. **Futuro:** ver `backlog-fases-futuras.md` → **F-CLIENT-MT** (cadastro sem tenant; escolha da barbearia no agendamento) |
| D2 | Barbeiro se auto-registra? | **Fase 1 (atual):** **Não** — admin convida/cria; register público só `barbershop` e `client`. **Futuro:** ver `backlog-fases-futuras.md` → **F-BARBER** (auto-cadastro + escolha do tenant + aceite do admin) |
| D3 | Tenant `pending` usa o sistema (trial)? | Sim, trial limitado (N dias) até approve/reject do SA |
| D4 | Walk-in (cliente sem login)? | Sim — `Client.UserId` nullable; só admin/barbeiro cria |
| D5 | Soft-delete vs hard-delete? | Soft-delete (`IsActive` / `DeletedAt`) em entidades de negócio |
| D6 | Idioma da API (mensagens)? | pt-BR |
| D7 | Modelo Evolution multi-tenant | **Fase 1:** instância/número **da plataforma** (OCI compartilhada) para OTP + mensagens do sistema; **Fase 2:** opcional vincular WhatsApp próprio do tenant |
| D8 | OTP WhatsApp é obrigatório no login? | **Complementar:** verificação de telefone no register + 2FA opcional / recovery; login por senha permanece |

**Bloqueio:** aprovação deste documento inclui D1–D8 ou suas alterações registradas.

---

## 2.2 Banco de dados — PostgreSQL

| Item | Decisão |
|------|---------|
| Engine | PostgreSQL 16+ (imagem oficial no Compose; serviço gerenciado ou container na OCI em prod) |
| Provider | `Npgsql.EntityFrameworkCore.PostgreSQL` |
| Migrations | EF Core migrations versionadas no repositório |
| Naming | snake_case no banco (convenção Npgsql) ou PascalCase com quotes — **padrão: snake_case** |
| UUID | `uuid` para PKs (preferível a identity int em API pública) |
| JSON | `jsonb` para settings, working hours, preferences quando fizer sentido |
| Full-text / search | `ILIKE` / trigram na v1; evoluir se necessário |
| Backup | Política OCI (snapshots / `pg_dump` agendado) — runbook em E9 |

**Compose local (E0):** serviços `api`, `postgres`, `redis`. A Evolution **não** sobe no Compose do Barbear.IA — consome a instância já existente na OCI (URL + API key via secrets).

---

## 2.3 Evolution API — integração WhatsApp (OCI)

Infraestrutura **já existente** e em uso por outros projetos. O Barbear.IA será **cliente** dessa API (HTTP), sem redeploy da Evolution neste repositório.

### Papel no SaaS

| Uso | Descrição | Épico |
|-----|-----------|-------|
| Complemento de auth | Envio de **OTP** (verificação de telefone, 2FA, recovery) | E1 + E1b |
| Notificações transacionais | Confirmação/lembrete/cancelamento de agendamento, avisos ao barbeiro/admin | E8 + E1b |
| Preferências do cliente | Respeitar `preferences.notifications` (whatsapp/sms/email) já modeladas no front | E4/E8 |

### Arquitetura de integração

```
Barbear.IA API ──HTTPS + apikey──► Evolution API (OCI)
       ▲                                 │
       │         webhook (MESSAGES_UPSERT,
       │          CONNECTION_UPDATE, etc.)
       └─────────────────────────────────┘
```

- **Outbound:** `IEvolutionApiClient` em Infrastructure (send text/template, status da instância).
- **Inbound:** `POST /api/v1/webhooks/evolution` — validar autenticação do webhook (header/JWT/shared secret), processar de forma **idempotente**, responder 2xx rápido e enfileirar trabalho pesado.
- **Segredos (só servidor):** `EVOLUTION_BASE_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`, `EVOLUTION_WEBHOOK_SECRET`.
- **OTP:** código de 6 dígitos, TTL curto (ex.: 5 min), hash no Redis/Postgres, rate limit por telefone/IP, máximo de tentativas; nunca logar o OTP em claro.

### Escopo multi-tenant (D7)

| Fase | Modelo | Quem envia |
|------|--------|------------|
| v1 | Instância Evolution da **plataforma** | Mensagens “Barbear.IA” / número corporativo |
| v2 (opcional) | Instância ou número por **tenant** | Admin conecta WhatsApp da barbearia (QR/pairing); mensagens no tom da loja |

Na v1, isolamento multi-tenant continua nos **dados** (quem recebe OTP/lembrete); o canal WhatsApp é compartilhado. Conteúdo e destinatário sempre derivados do contexto autenticado/tenant — nunca de input livre sem validação.

### Segurança (bloqueante) — Evolution

- API key Evolution **nunca** no frontend nem em imagens Docker sem secret store  
- Webhook com secret/JWT validado; rejeitar payloads inválidos  
- Allowlist de eventos processados  
- Rate limit em `POST /auth/otp/request` e `POST /auth/otp/verify`  
- Telefone normalizado E.164 (Brasil)  
- Não enumerar se o número existe (mensagem genérica no request OTP de recovery)  
- Opt-out / preferências: não enviar marketing; transacional só com base legal/consentimento do fluxo

### Acesso operacional — SSH OCI + nginx + Evolution

Inventário completo: [`oci-ambiente-atual.md`](./oci-ambiente-atual.md) (inspeção SSH em 2026-08-01).

| Item | Valor / nota |
|------|----------------|
| SSH (VM) | `ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168` |
| Host | `vmoracleguelfi` · IP `129.153.86.168` |
| Proxy público | Container `nginx-proxy` (:80/:443), rede `www_projetos-net` |
| Front Barbear | `https://batuara.org.br/barbear-ia/` → `barbear-ia-frontend:80` |
| Código no servidor | `/var/www/Barbear.IA` (`main`) |
| Evolution (na VM) | `127.0.0.1:8085` → `batuara-evolution-api:8080` (não pública) |
| Manager (túnel local) | `http://192.168.15.119:8085/manager/instance/f432ff79-4ef4-4a8a-b000-c59add1091af/dashboard` |
| Instance ID (v1) | `f432ff79-4ef4-4a8a-b000-c59add1091af` |

**Regras**
- Túnel/Manager: só **humano/ops**. Backend na OCI: `EVOLUTION_BASE_URL=http://127.0.0.1:8085` (ou DNS Docker da rede Evolution).
- Dev local: URL do túnel (`192.168.15.119:8085`).
- Não commitar chave SSH nem API keys.
- E9: criar `location /barbear-ia-api/` (ou subdomínio) no `nginx-proxy`, no padrão dos outros projetos.

---

## 3. Personas e escopos

| Persona | Role | Escopo de dados |
|---------|------|-----------------|
| Administrador do SaaS | `super_admin` | Global (`TenantId` nulo) |
| Dono da Barbearia | `admin` | Tenant obrigatório |
| Profissional | `barber` | Tenant + `BarberId` do token |
| Cliente | `client` | Tenant + `ClientId` do token |

Alias de login/registro: `barbershop` → role `admin`.

---

## 4. Roadmap por fases

```
Fase 0  Fundação (repo, CI, Postgres, Redis)          ──► 1–1,5 sem
Fase 1  Identity + RBAC + Tenants                     ──► 1,5–2 sem
Fase 1b Evolution (OTP WhatsApp + client HTTP)        ──► 1–1,5 sem
Fase 2  Catálogo (Users, Barbers, Clients, Services)  ──► 2 sem
Fase 3  Appointments + regras de agenda               ──► 1,5–2 sem
Fase 4  Dashboards                                    ──► 1 sem
Fase 5  Billing Stripe + trial                        ──► 1–1,5 sem
Fase 6  Notifications (in-app + WhatsApp Evolution)   ──► 1–1,5 sem
Fase 7  Hardening, ZAP, ASVS, go-live                 ──► 1 sem
─────────────────────────────────────────────────────
Total estimado (1 dev full-time): ~11–13 semanas
```

Dependências: E1b pode iniciar em paralelo ao fim de E1 (precisa Identity + Redis). Notificações WhatsApp de agenda dependem de E5 + E1b.

---

## 5. Épicos

Cada épico tem: escopo, entregáveis, dependências, critérios de aceite (template em `criterios-aceite-e-rbac.md`), testes de segurança obrigatórios.

### E0 — Fundação

**Status:** implementado (branch `feature/e0-e1-foundation-auth`)

**Entregáveis**
- Solution .NET 10 (`src/Api`, `Application`, `Domain`, `Infrastructure`, `tests/*`)
- Docker Compose: API + **PostgreSQL** + Redis
- Provider Npgsql + primeira migration (schema Identity/tenant vazio ou mínimo)
- CI: build, test, `dotnet list package --vulnerable`, SAST básico
- OpenAPI/Swagger (não público em prod)
- Configuração de secrets via env / User Secrets (incl. placeholders Evolution)
- Documentação de ADR (decisões aprovadas: Postgres, Evolution, .NET 10)

**Fora de escopo:** regras de negócio de domínio; container Evolution (usa OCI existente).

---

### E1 — Identity, sessão e RBAC

**Status:** implementado (endpoints auth + policies + seed SA)

**Entregáveis**
- Register: `barbershop` (User+Tenant pending+Subscription trial), `client`
- Login / logout / refresh / me
- Campo telefone E.164 + flag `PhoneConfirmed`
- Seed de roles + permissions (matriz formal)
- Policies ASP.NET por permission
- Rate limit login/register
- Mensagens genéricas (anti-enumeração)
- Hash de senha (Identity / algoritmo suportado na stack)

**Segurança (bloqueante):** ver matriz AUTH em `criterios-aceite-e-rbac.md`.

---

### E1b — Evolution API (OTP + canal WhatsApp)

**Status:** implementado (config Evolution OCI adiada; outbox + testes mock)

**Dependências:** E0, E1 (usuário/telefone); Redis para OTP.

**Entregáveis**
- `EvolutionApiClient` (send text, health/instance status)
- `POST /auth/otp/request` e `POST /auth/otp/verify` (verify phone, 2FA, recovery)
- `POST /webhooks/evolution` (idempotente, autenticado)
- Outbox/fila simples para envio assíncrono (falha Evolution não derruba request HTTP do usuário)
- Feature flags: `Evolution:Enabled`, timeouts, template de mensagens pt-BR
- Testes de contrato com mock HTTP da Evolution (não depender da OCI no CI)
- Runbook: variáveis de ambiente apontando para Evolution OCI; checklist de webhook público HTTPS

**Segurança (bloqueante):** ver matriz EVOLUTION em `criterios-aceite-e-rbac.md`.

---

### E2 — Tenants (lifecycle multi-tenant)

**Status:** implementado (middleware tenant suspenso)

**Entregáveis**
- CRUD/leitura conforme role
- Approve / reject / suspend / reactivate (SA)
- Settings + business hours do tenant
- Global Query Filter por `TenantId`
- Middleware/handler: tenant suspenso bloqueia mutações
- Discovery público de tenants ativos (cliente)

**Segurança (bloqueante):** testes IDOR T1↔T2; SA-only nas ações de lifecycle.

---

### E3 — Users (plataforma e tenant)

**Status:** implementado

**Entregáveis**
- Listagem paginada + filtros (role, active, search)
- Create/update/activate/deactivate
- Admin só opera dentro do próprio tenant
- Impedir criação/elevação para `super_admin` por admin
- Stats de usuários (SA / admin)

---

### E4 — Barbers, Clients, Services

**Status:** implementado (CRUD base)

**Entregáveis**
- CRUD alinhado aos formulários do front
- Barber ↔ Services (N:N)
- Client walk-in (`UserId` null)
- Barber: update own profile; view assigned clients
- Soft-delete / toggle `IsActive`
- Categorias de serviço

---

### E5 — Appointments

**Status:** implementado

**Entregáveis**
- CRUD + cancel com motivo
- Filtros: date range, status, barber, client
- `today` / `upcoming`
- Validação de conflito de horário do barbeiro
- Respeito a `advanceBookingDays` e `cancellationHours`
- Máquina de estados: `scheduled → confirmed → in_progress → completed | cancelled | no_show`
- Escopo forçado: barber só próprios; client só próprios

---

### E6 — Dashboards

**Status:** implementado

**Entregáveis**
- `GET /dashboard/stats` por role
- `GET /dashboard/global` (SA)
- `realtime` / `monthly` (admin/SA)
- Agregações server-side (não confiar em totais do client)

---

### E7 — Billing

**Status:** implementado (sandbox local; Stripe keys no go-live)

**Entregáveis**
- Planos Pro mensal/anual
- Checkout + Customer Portal Stripe
- Webhook assinado (secret só no servidor)
- Trial banner data (`subscription` + `trialEndsAt`)
- Receita consolidada SA
- Bloqueio de features se `cancelled` / `suspended` (política definida)

---

### E8 — Notifications (in-app + WhatsApp)

**Status:** implementado (in-app + outbox; Evolution config OCI adiada)

**Entregáveis**
- Modelo: appointment, payment, client, system, reminder
- List / mark read / read-all / delete
- Escopo: só do usuário autenticado
- Dispatcher: in-app + canal WhatsApp via Evolution (E1b) quando preferência/`PhoneConfirmed`
- Templates: novo agendamento, lembrete (T-24h / T-2h), cancelamento, aprovação de tenant (SA→admin)

---


### E-FE — Landing comercial + login (frontend)

**Status:** implementado no frontend (branch atual) — revisar visual em `npm run dev`

**Entregáveis**
- Landing page comercial **antes** do login (SaaS multi-tenant), com copy forte e hero full-bleed de barbearia de luxo
- Fluxo: Landing → CTA Entrar/Começar → AuthForm; link voltar à LP
- Login com **background** visual de barbearia de luxo (atmosfera, não flat)
- Remover preenchimento automático de credenciais mock ao selecionar persona / botão "Acesso rápido" em produção (permitido só em `import.meta.env.DEV`)
- Super Admin permanece no login interno, sem atalho demo público
- Brand **Barbear.IA** como sinal hero na primeira viewport (não só nav)

**Aceite**
- [ ] Primeira viewport: marca + 1 headline + 1 frase + CTAs + imagem dominante edge-to-edge
- [ ] Sem cards/stats/overlays no hero
- [ ] Mobile e desktop
- [ ] Login sem autofill de senhas mock em build de produção
- [ ] CTA da LP abre autenticação; voltar retorna à LP

---
### E9 — Integração frontend + go-live

**Status:** parcial — `VITE_API_URL` + client HTTP + remoção debug prod; publish API na OCI só no go-live final

**Entregáveis**
- `VITE_API_URL` apontando para API real
- Remover senhas/JSON mock do bundle de produção
- Remover `ProductionDebugPanel` / test suites da build prod
- CSP/HTTPS/HSTS no edge
- Scan ZAP em staging
- Runbook de deploy OCI da API + **Postgres** + secrets Evolution/Stripe
- Location nginx `/barbear-ia-api/` no `nginx-proxy` + rede `www_projetos-net`
- Smoke: OTP WhatsApp em staging com número de teste

---

## 6. Estrutura de solution (proposta)

```
backend/
  Barbear.IA.sln
  src/
    Barbear.IA.Api/                 # Controllers, middleware, webhooks, DI
    Barbear.IA.Application/         # Commands/Queries, validators, DTOs
    Barbear.IA.Domain/              # Entities, enums, domain services
    Barbear.IA.Infrastructure/      # EF+Npgsql, Identity, Stripe, Redis, Evolution
  tests/
    Barbear.IA.UnitTests/
    Barbear.IA.IntegrationTests/    # multi-tenant + RBAC + OTP (mock Evolution)
  docker-compose.yml                # api + postgres + redis
  Directory.Build.props
```

---

## 7. Modelo de dados (visão)

```
Tenant 1──* User
Tenant 1──1 Subscription
Tenant 1──* BarberProfile ──* Service (N:N)
Tenant 1──* ClientProfile
Tenant 1──* Service
Tenant 1──* Appointment
User 1──0..1 BarberProfile
User 1──0..1 ClientProfile
Role *──* Permission
OtpChallenge (phone, purpose, hash, expires, attempts)  — Redis e/ou Postgres
MessageOutbox (canal=whatsapp, payload, status)         — envio Evolution
WhatsAppLink? (tenantId, instanceName)                  — só Fase 2 (D7)
```

Índices obrigatórios: `(tenant_id, …)` em tabelas tenant-bound; unique `(tenant_id, email)` onde aplicável; unique telefone E.164 quando `PhoneConfirmed` (política a confirmar se global ou por tenant).

---

## 8. Gates de qualidade e segurança (globais)

Nenhum épico E1–E9 é “Done” sem:

| Gate | Critério |
|------|----------|
| G1 | Testes de integração multi-tenant verdes (matriz MT-* do doc RBAC) |
| G2 | Policies por permission nas rotas mutáveis |
| G3 | Zero segredo no frontend (Stripe, Evolution API key, senhas, connection strings) |
| G4 | CI falha em vulnerabilidades **high/critical** (deps) |
| G5 | OpenAPI atualizado; DTOs sem password hash / OTP |
| G6 | Logs sem senha/token/OTP/PII sensível |
| G7 | Rate limit em auth **e** OTP |
| G8 | HTTPS + headers de segurança no ambiente deployado |
| G9 | Webhooks (Stripe + Evolution) com validação de autenticidade + idempotência |
| G10 | Migrations Postgres aplicáveis em ambiente limpo (`dotnet ef database update`) |

Meta ASVS: **nível 2** nos controles de auth, sessão, access control e crypto.

---

## 9. Cronograma sugerido (marcos)

| Marco | Conteúdo | Critério de aprovação do marco |
|-------|----------|--------------------------------|
| M0 | E0 | CI verde; Compose sobe API + Postgres + Redis |
| M1 | E1+E2 | Login + approve tenant + isolamento T1/T2 |
| M1b | E1b | OTP WhatsApp (mock CI + smoke OCI staging) |
| M2 | E3+E4 | Admin opera catálogo completo no tenant |
| M3 | E5+E6 | Agenda + dashboard por persona |
| M4 | E7+E8 | Billing sandbox + notificações in-app/WhatsApp |
| M5 | E9 | Front integrado, ZAP ok, deploy staging |

---

## 10. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| .NET 10 APIs novas / gaps de docs | Atraso | Validar templates oficiais; ADRs |
| Escopo “cliente multi-tenant” ambíguo | Retrabalho | Decisão D1 antes de E2 |
| Front com mutações só toast | Integração longa | E9 com checklist tela a tela |
| Stripe webhook em OCI | Billing quebrado | Ambiente sandbox + testes de assinatura |
| Evolution indisponível / instância desconectada | OTP e avisos falham | Outbox + retry; fallback e-mail/senha; healthcheck |
| Webhook Evolution exposto | Abuso / spoofing | Secret + rate limit + allowlist eventos |
| Subestimar testes IDOR | Vazamento entre tenants | Suite obrigatória no CI |
| Número WhatsApp compartilhado (D7 v1) | Confusão de marca | Templates claros “Barbear.IA”; Fase 2 por tenant |

---

## 11. Fora de escopo (v1)

Itens abaixo **não** entram na v1; o backlog vivo está em [`backlog-fases-futuras.md`](./backlog-fases-futuras.md).

- App mobile nativo  
- **WhatsApp próprio por tenant** (Fase 2 / D7) — v1 usa instância plataforma na OCI  
- SMS clássico (fora Evolution)  
- Fidelidade / gamificação  
- Multi-unidade dentro do mesmo tenant (além de 1 barbearia = 1 tenant)  
- Event Sourcing completo (mencionado no README antigo — **não** na v1)  
- Cobertura 90% absoluta — meta pragmática: **críticos de auth/tenant ≥ 80%** + testes de integração RBAC  
- **Auto-cadastro de barbeiro com aceite do admin do tenant** → **F-BARBER**  
- **Cliente multi-barbearia (escolhe tenant no serviço/agendamento)** → **F-CLIENT-MT**  
- **Pacotes/assinatura mensal de serviços cliente→barbearia** → **F-PKG**

---

## 12. Aprovação

| Item | Aprovado? | Observação |
|------|-----------|------------|
| Stack .NET 10 LTS | ☐ | |
| **PostgreSQL** como banco oficial | ☐ | substitui SQL Server do README antigo |
| **Evolution API (OCI)** como canal WhatsApp + complemento auth | ☐ | |
| Arquitetura Clean + EF multi-tenant | ☐ | |
| Decisões D1–D8 | ☐ | |
| Roadmap E0–E9 (+ E1b) e marcos M0–M5 | ☐ | |
| Gates G1–G10 | ☐ | |
| Matriz RBAC formal (`criterios-aceite-e-rbac.md`) | ☐ | |
| Fora de escopo v1 | ☐ | |

**Aprovador:** _________________  
**Data:** _________________

---

## 13. Documentos relacionados

- [`backlog-fases-futuras.md`](./backlog-fases-futuras.md) — **lista canônica de pendências / fases futuras**  
- [`handoff-estado.md`](./handoff-estado.md) — estado da implementação na branch atual  
- [`criterios-aceite-e-rbac.md`](./criterios-aceite-e-rbac.md) — template de AC + matriz RBAC / Evolution por endpoint  
- [`oci-ambiente-atual.md`](./oci-ambiente-atual.md) — inspeção SSH da OCI (nginx, containers, Evolution)  
- [`../README.md`](../README.md) — visão do produto (atualizar stack: .NET 10, PostgreSQL, Evolution)
