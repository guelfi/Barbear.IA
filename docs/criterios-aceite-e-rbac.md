# Critérios de Aceite + Matriz RBAC Formal

**Uso:** copiar o bloco *Template de Issue/PR* em cada épico/endpoint.  
**Referência de produto:** frontend atual + `plano-implementacao-backend.md`.  
**Stack de dados/canal:** PostgreSQL · Redis · Evolution API (OCI).  
**Roles:** `SA` = super_admin · `A` = admin · `B` = barber · `C` = client · `P` = público

---

## 1. Template de Issue / PR (copiar)

```markdown
## Contexto
- Épico: E#
- Endpoint(s): `METHOD /api/v1/...`
- Persona(s) afetada(s):

## Objetivo
<!-- 1–2 frases -->

## Contrato
- Request:
- Response 2xx:
- Erros: 400 / 401 / 403 / 404 / 409 / 429

## RBAC
| Permission exigida | Roles | Escopo |
|--------------------|-------|--------|
| `...` | | global / tenant / barber / client / self |

## Multi-tenant
- [ ] Global Query Filter aplicado (exceto SA com permissão)
- [ ] `TenantId` do claim prevalece sobre body/query
- [ ] IDOR T1↔T2 retorna **404** (não 403 com vazamento de existência, se aplicável)
- [ ] Tenant `suspended` / `cancelled` bloqueia mutação (exceto SA / fluxos billing definidos)

## Segurança (bloqueante)
- [ ] Sem segredos no client
- [ ] Validação server-side de todos os inputs
- [ ] Logs sem senha/token/PII sensível
- [ ] Rate limit (se auth ou endpoint abusável)
- [ ] Testes de integração: happy path + 2 negativos RBAC + 1 IDOR

## Critérios de aceite funcionais
- [ ] ...
- [ ] ...

## Critérios de aceite negativos
- [ ] Role sem permission → 403
- [ ] Outro tenant → 404/403 conforme matriz
- [ ] Payload inválido → 400

## Test plan
- [ ] Unit (regras de domínio)
- [ ] Integration (API + DB)
- [ ] Manual (persona no front, se UI pronta)

## Definition of Done
- [ ] Gates G1–G8 aplicáveis verdes
- [ ] OpenAPI atualizado
- [ ] Sem `console`/debug sensível
```

---

## 2. Catálogo formal de Permissions

| Permission | Descrição | Escopo típico |
|------------|-----------|---------------|
| `view_all_barbershops` | Listar/ver qualquer tenant | global |
| `manage_barbershops` | Aprovar/rejeitar/suspender/reativar | global |
| `view_all_users` | Listar usuários da plataforma | global |
| `manage_users` | Ativar/desativar/alterar users globais | global |
| `view_global_stats` | Dashboard SA | global |
| `manage_subscriptions` | Intervir em assinaturas | global |
| `view_billing` | Receita/billing plataforma | global |
| `manage_system_settings` | Config global | global |
| `view_barbershop_stats` | Dashboard do tenant | tenant |
| `manage_barbershop_settings` | Perfil/settings do tenant | tenant |
| `view_barbers` | Listar barbeiros do tenant | tenant |
| `manage_barbers` | CRUD barbeiros | tenant |
| `view_clients` | Listar clientes do tenant | tenant |
| `manage_clients` | CRUD clientes | tenant |
| `view_services` | Listar serviços | tenant |
| `manage_services` | CRUD serviços | tenant |
| `view_appointments` | Listar agenda do tenant | tenant |
| `manage_appointments` | CRUD agenda do tenant | tenant |
| `view_own_stats` | Dashboard do barbeiro | barber |
| `view_own_appointments` | Ver próprios agendamentos | barber/client |
| `manage_own_appointments` | Alterar status dos próprios (barber) | barber |
| `view_assigned_clients` | Clientes com vínculo via agenda | barber |
| `update_own_profile` | Atualizar perfil próprio | self |
| `create_appointments` | Criar agendamento (cliente) | client |
| `cancel_own_appointments` | Cancelar próprio agendamento | client |
| `manage_whatsapp_settings` | Configurar preferências/vínculo WhatsApp do tenant (Fase 2) | tenant |
| `view_messaging_status` | Ver status do canal Evolution (plataforma/tenant) | global/tenant |

### Seed Role → Permissions

| Role | Permissions |
|------|-------------|
| `super_admin` | `view_all_barbershops`, `manage_barbershops`, `view_all_users`, `manage_users`, `view_global_stats`, `manage_subscriptions`, `view_billing`, `manage_system_settings`, `view_messaging_status` |
| `admin` | `view_barbershop_stats`, `manage_barbershop_settings`, `view_barbers`, `manage_barbers`, `view_clients`, `manage_clients`, `view_services`, `manage_services`, `view_appointments`, `manage_appointments`, `manage_whatsapp_settings` (Fase 2) |
| `barber` | `view_own_stats`, `view_own_appointments`, `manage_own_appointments`, `view_assigned_clients`, `view_services`, `update_own_profile` |
| `client` | `view_own_appointments`, `create_appointments`, `cancel_own_appointments`, `view_barbers`, `view_services`, `update_own_profile` |

---

## 3. Matriz RBAC por endpoint

Legenda de acesso: `✓` permitido · `—` negado · `own` somente recurso próprio · `assigned` somente clientes com vínculo · `public*` tenants ativos (discovery)

### 3.1 Auth — Épico E1

| Método | Path | P | SA | A | B | C | Permission / regra | Escopo |
|--------|------|---|----|---|---|---|--------------------|--------|
| POST | `/auth/register` | ✓ | — | — | — | — | Público; tipos `barbershop`\|`client` | — |
| POST | `/auth/login` | ✓ | — | — | — | — | Público; rate limit | — |
| POST | `/auth/logout` | — | ✓ | ✓ | ✓ | ✓ | Autenticado | self |
| POST | `/auth/refresh` | — | ✓ | ✓ | ✓ | ✓ | Refresh válido | self |
| GET | `/auth/me` | — | ✓ | ✓ | ✓ | ✓ | Autenticado | self |
| POST | `/auth/otp/request` | ✓ | ✓ | ✓ | ✓ | ✓ | Público ou auth; purpose: `verify_phone`\|`login_2fa`\|`recovery` | self/phone |
| POST | `/auth/otp/verify` | ✓ | ✓ | ✓ | ✓ | ✓ | Valida OTP; rate limit | self/phone |

**AC Auth (bloqueantes)**
- [ ] Senha nunca retornada; hash só no servidor
- [ ] Erro de login genérico (“Credenciais inválidas”)
- [ ] Register `barbershop` cria User(`admin`) + Tenant(`pending`) + Subscription(trial) em transação
- [ ] Register `barber` **rejeitado** no público (D2) → 400
- [ ] Refresh rota e invalida o anterior
- [ ] `/me` devolve `role`, `permissions[]`, `tenantId`, `barberId`/`clientId`, `phoneConfirmed` se houver
- [ ] 429 após N tentativas de login
- [ ] Telefone persistido em E.164

---

### 3.1b Evolution / OTP WhatsApp — Épico E1b

| Método | Path | P | SA | A | B | C | Permission / regra | Escopo |
|--------|------|---|----|---|---|---|--------------------|--------|
| POST | `/auth/otp/request` | ✓ | ✓ | ✓ | ✓ | ✓ | Rate limit; Evolution outbound | phone |
| POST | `/auth/otp/verify` | ✓ | ✓ | ✓ | ✓ | ✓ | TTL + tentativas | phone |
| POST | `/webhooks/evolution` | ✓‡ | — | — | — | — | `EVOLUTION_WEBHOOK_SECRET` / JWT header | plataforma |
| GET | `/messaging/status` | — | ✓ | —† | — | — | `view_messaging_status` | global |
| POST | `/messaging/test` | — | ✓ | — | — | — | SA only; envia msg teste | plataforma |

‡ Público na rede; autenticado pelo secret do webhook  
† Admin: só na Fase 2 (`manage_whatsapp_settings` / status do vínculo do tenant)

**AC Evolution (bloqueantes)**
- [ ] `EVOLUTION_API_KEY` e webhook secret **apenas** no servidor
- [ ] OTP: 6 dígitos, TTL ≤ 5 min, hash em Redis/DB, máx. tentativas, rate limit por telefone/IP
- [ ] Request OTP não revela se o telefone está cadastrado (recovery)
- [ ] Falha da Evolution → 503/202 com outbox; não vaza stack/API key
- [ ] Webhook: rejeita secret inválido; processa só eventos allowlisted; idempotente por message/event id
- [ ] CI usa **mock** HTTP (WireMock/HttpMessageHandler); smoke staging usa Evolution OCI
- [ ] Logs sem OTP em claro e sem apikey

**Purposes OTP**
| purpose | Pré-condição | Efeito no verify |
|---------|--------------|------------------|
| `verify_phone` | User autenticado ou pós-register | `PhoneConfirmed = true` |
| `login_2fa` | Credenciais ok / challenge pendente | Emite access+refresh |
| `recovery` | Telefone cadastrado (resposta genérica) | Token de reset de senha de curto prazo |

---

### 3.2 Tenants — Épico E2

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/tenants` | ✓ | — | — | public* | SA: `view_all_barbershops`; C: discovery | global / public |
| POST | `/tenants` | ✓ | — | — | — | `manage_barbershops` (ou só via register) | global |
| GET | `/tenants/{id}` | ✓ | own | — | public* | SA view_all; A own; C se ativo | global/tenant |
| PATCH | `/tenants/{id}` | ✓ | own | — | — | SA manage; A `manage_barbershop_settings` | tenant |
| PATCH | `/tenants/{id}/settings` | — | own | — | — | `manage_barbershop_settings` | tenant |
| POST | `/tenants/{id}/approve` | ✓ | — | — | — | `manage_barbershops` | global |
| POST | `/tenants/{id}/reject` | ✓ | — | — | — | `manage_barbershops` | global |
| POST | `/tenants/{id}/suspend` | ✓ | — | — | — | `manage_barbershops` | global |
| POST | `/tenants/{id}/reactivate` | ✓ | — | — | — | `manage_barbershops` | global |
| GET | `/tenants/{id}/stats` | ✓ | own | — | — | SA ou `view_barbershop_stats` | tenant |

**AC Tenants**
- [ ] Aprovar define `status=approved` + `approvedAt`
- [ ] Suspender bloqueia POST/PATCH/DELETE operacionais do tenant
- [ ] Admin T1 não lê tenant T2 (404)
- [ ] Settings: `appointmentDuration`, `advanceBookingDays`, `cancellationHours`, `timezone`, `currency`, businessHours

---

### 3.3 Users — Épico E3

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/users` | ✓ | tenant | — | — | SA `view_all_users`; A (implícito manage no tenant) | global/tenant |
| POST | `/users` | ✓ | tenant | — | — | SA `manage_users`; A cria `barber`/`client`/`admin` | tenant |
| GET | `/users/{id}` | ✓ | tenant | self | self | + self | tenant/self |
| PATCH | `/users/{id}` | ✓ | tenant | self* | self* | self só campos de perfil | tenant/self |
| POST | `/users/{id}/deactivate` | ✓ | tenant | — | — | `manage_users` / admin tenant | tenant |
| POST | `/users/{id}/activate` | ✓ | tenant | — | — | idem | tenant |
| GET | `/users/stats` | ✓ | tenant | — | — | SA / A | global/tenant |

\* self*: name, phone, avatar, password change — **nunca** `role` / `tenantId`

**AC Users**
- [ ] Admin não cria `super_admin`
- [ ] Admin não altera user de outro tenant
- [ ] Desativar invalida sessões ativas do user
- [ ] Filtros: `role`, `isActive`, `search`, paginação

---

### 3.4 Barbers — Épico E4

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/barbers` | — | ✓ | ✓ | ✓ | A manage/view; B/C `view_barbers` ou listagem tenant | tenant |
| POST | `/barbers` | — | ✓ | — | — | `manage_barbers` | tenant |
| GET | `/barbers/{id}` | — | ✓ | own | ✓ | | tenant |
| PATCH | `/barbers/{id}` | — | ✓ | own | — | A manage; B `update_own_profile` | tenant/own |
| PATCH | `/barbers/{id}/status` | — | ✓ | — | — | `manage_barbers` | tenant |
| GET | `/barbers/{id}/stats` | — | ✓ | own | — | A ou `view_own_stats` | tenant/own |
| GET | `/barbers/{id}/services` | — | ✓ | ✓ | ✓ | `view_services` / view_barbers | tenant |
| PUT | `/barbers/{id}/services` | — | ✓ | — | — | `manage_barbers` | tenant |

**AC Barbers**
- [ ] Criação pode provisionar User(`barber`) + BarberProfile
- [ ] Campos: name, email, phone, specialties[], workingHours, bio, isActive, serviceIds
- [ ] Barber não altera outro barbeiro

---

### 3.5 Clients — Épico E4

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/clients` | — | ✓ | assigned | — | A `view_clients`; B `view_assigned_clients` | tenant |
| POST | `/clients` | — | ✓ | — | — | `manage_clients` | tenant |
| GET | `/clients/{id}` | — | ✓ | assigned | own | | tenant |
| PATCH | `/clients/{id}` | — | ✓ | — | own | A manage; C `update_own_profile` | tenant/own |
| GET | `/clients/{id}/stats` | — | ✓ | assigned | own | | tenant |
| GET | `/clients/{id}/appointments` | — | ✓ | assigned | own | | tenant |

**AC Clients**
- [ ] Walk-in sem `userId` permitido
- [ ] Client não lista todos os clients
- [ ] Barber só vê clients com pelo menos 1 appointment próprio (regra `assigned`)

---

### 3.6 Services — Épico E4

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/services` | — | ✓ | ✓ | ✓ | `view_services` | tenant |
| POST | `/services` | — | ✓ | — | — | `manage_services` | tenant |
| GET | `/services/{id}` | — | ✓ | ✓ | ✓ | `view_services` | tenant |
| PATCH | `/services/{id}` | — | ✓ | — | — | `manage_services` | tenant |
| DELETE | `/services/{id}` | — | ✓ | — | — | soft-delete | tenant |
| GET | `/services/categories` | — | ✓ | ✓ | ✓ | `view_services` | tenant |

**AC Services**
- [ ] Campos: name, description, duration, price, category, isActive
- [ ] Delete soft; serviços inativos não aparecem no booking (client) salvo filtro admin

---

### 3.7 Appointments — Épico E5

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/appointments` | — | ✓ | own | own | A view/manage; B/C own | tenant |
| POST | `/appointments` | — | ✓ | — | ✓ | A `manage_appointments`; C `create_appointments` | tenant |
| GET | `/appointments/{id}` | — | ✓ | own | own | | tenant |
| PATCH | `/appointments/{id}` | — | ✓ | own† | — | A manage; B `manage_own_appointments` | tenant |
| POST | `/appointments/{id}/cancel` | — | ✓ | own† | own | A; B; C `cancel_own_appointments` | tenant |
| GET | `/appointments/today` | — | ✓ | own | — | | tenant |
| GET | `/appointments/upcoming` | — | ✓ | own | own | | tenant |

† Barber: apenas appointments com `barberId` = self; transição de status limitada (ex.: confirmed → in_progress → completed / no_show)

**AC Appointments**
- [ ] Conflito de horário do barbeiro → 409
- [ ] Respeita `advanceBookingDays` e `cancellationHours`
- [ ] Client força `clientId` do token
- [ ] Price/duration derivados do Service no create (client não arbitra preço)
- [ ] Status enum canônico: `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`

---

### 3.8 Dashboard — Épico E6

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/dashboard/stats` | — | ✓ | ✓ | ✓ | role-scoped | tenant/barber/client |
| GET | `/dashboard/global` | ✓ | — | — | — | `view_global_stats` | global |
| GET | `/dashboard/realtime` | — | ✓ | ✓ | — | A stats; B own | tenant |
| GET | `/dashboard/monthly` | ✓ | ✓ | — | — | SA / A | global/tenant |

**AC Dashboard**
- [ ] Totais calculados no servidor
- [ ] Barber/Client nunca recebem métricas de outro escopo

---

### 3.9 Billing — Épico E7

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/billing/plans` | — | ✓ | — | — | autenticado admin | — |
| GET | `/billing/subscription` | ✓ | own | — | — | SA / A | global/tenant |
| POST | `/billing/checkout` | — | own | — | — | A | tenant |
| POST | `/billing/portal` | — | own | — | — | A | tenant |
| GET | `/billing/revenue` | ✓ | — | — | — | `view_billing` | global |
| POST | `/billing/webhooks/stripe` | P‡ | — | — | — | Assinatura Stripe | — |

‡ Público na rede, autenticado pela assinatura do webhook

**AC Billing**
- [ ] `secretKey` / `webhookSecret` **apenas** no servidor
- [ ] Webhook rejeita assinatura inválida (400/401)
- [ ] Atualiza `Subscription` de forma idempotente

---

### 3.10 Notifications — Épico E8

| Método | Path | SA | A | B | C | Permission | Escopo |
|--------|------|----|---|---|---|------------|--------|
| GET | `/notifications` | ✓ | ✓ | ✓ | ✓ | autenticado | self |
| PATCH | `/notifications/{id}/read` | ✓ | ✓ | ✓ | ✓ | own | self |
| POST | `/notifications/read-all` | ✓ | ✓ | ✓ | ✓ | own | self |
| DELETE | `/notifications/{id}` | ✓ | ✓ | ✓ | ✓ | own | self |

**AC Notifications**
- [ ] Tipos: `appointment`, `payment`, `client`, `system`, `reminder`
- [ ] Usuário A não lê notificação do usuário B (404)
- [ ] Eventos de agenda disparam WhatsApp via Evolution quando `PhoneConfirmed` + preferência ativa
- [ ] Falha WhatsApp não remove notificação in-app; outbox retenta

---

## 4. Matriz de testes multi-tenant / auth / Evolution (obrigatória no CI)

| ID | Cenário | Esperado |
|----|---------|----------|
| MT-01 | Admin T1 `GET /clients` | só T1 |
| MT-02 | Admin T1 `GET /clients/{idT2}` | 404 |
| MT-03 | Admin T1 `PATCH /tenants/{idT2}` | 404/403 |
| MT-04 | Barber T1 `GET /appointments` | só `barberId=self` |
| MT-05 | Barber T1 `PATCH` appointment de outro barbeiro | 404/403 |
| MT-06 | Client `POST /appointments` com `clientId` de outro | 403; usa token |
| MT-07 | Client `POST /appointments` com `tenantId` de outro | 403 |
| MT-08 | Body `tenantId` ≠ claim | claim vence; body ignorado |
| MT-09 | Tenant suspended: Admin POST service | 403 |
| MT-10 | SA `POST /tenants/{id}/suspend` | 200; efeitos MT-09 |
| MT-11 | User sem permission acessa rota | 403 |
| MT-12 | Token expirado | 401 |
| MT-13 | Refresh reuse após rotação | 401 |
| MT-14 | Login brute-force | 429 |
| MT-15 | OTP request acima / rate limit | 429 |
| MT-16 | OTP inválido / expirado | 400/401 genérico |
| MT-17 | Webhook Evolution sem secret | 401 |
| MT-18 | Webhook Evolution duplicado (mesmo event id) | 200 idempotente; sem side-effect duplo |
| MT-19 | Lembrete WhatsApp cliente T1 não usa dados T2 | destinatário/conteúdo só T1 |

---

## 5. Critérios de aceite por épico (resumo colável)

### E0 — Fundação
- [ ] Solution `net10.0` sobe com Docker Compose (**Postgres** + Redis + API)
- [ ] EF + Npgsql; migration aplica em DB limpo
- [ ] CI: build + test + audit high/critical
- [ ] Health: `GET /health` (incl. check Postgres)
- [ ] Secrets só via env (incl. placeholders Evolution)

### E1 — Identity/RBAC
- [ ] Matriz Auth §3.1 completa
- [ ] Seed permissions = §2
- [ ] MT-11, MT-12, MT-13, MT-14

### E1b — Evolution OTP/WhatsApp
- [ ] Matriz §3.1b completa
- [ ] MT-15–MT-18
- [ ] Mock Evolution no CI; documentação de secrets OCI

### E2 — Tenants
- [ ] Matriz §3.2 + MT-03, MT-08, MT-09, MT-10
- [ ] Register barbearia → pending + trial

### E3 — Users
- [ ] Matriz §3.3
- [ ] Sem elevação indevida de role

### E4 — Catálogo
- [ ] Matrizes §3.4–3.6
- [ ] Formulários do front cobertos por DTOs

### E5 — Appointments
- [ ] Matriz §3.7 + MT-04–MT-07
- [ ] Conflito 409 + regras de settings

### E6 — Dashboard
- [ ] Matriz §3.8; números coerentes com dados seed de teste

### E7 — Billing
- [ ] Matriz §3.9; webhook verificado; zero secret no front

### E8 — Notifications
- [ ] Matriz §3.10 + MT-19
- [ ] Canal in-app + WhatsApp (Evolution)

### E-FE — Landing + login UX
- [ ] LP comercial antes do login (marca hero + headline + frase + CTAs + hero full-bleed)
- [ ] Fluxo LP ↔ AuthForm
- [ ] Background de barbearia de luxo no login
- [ ] Sem autofill de credenciais mock em produção

### E9 — Front + go-live
- [ ] Mock auth desligado em prod
- [ ] Bundle sem `users.json` com senhas
- [ ] Debug panels fora da prod
- [ ] ZAP smoke Top 10 em staging sem high abertos
- [ ] CSP/HTTPS/HSTS ok
- [ ] Smoke OTP WhatsApp em staging (Evolution OCI)
- [ ] Postgres backup/restore documentado

---

## 6. Exemplo preenchido (Issue)

```markdown
## Contexto
- Épico: E5
- Endpoint(s): `POST /api/v1/appointments`
- Persona(s): Admin, Client

## Objetivo
Permitir criação de agendamento com validação de conflito e escopo multi-tenant.

## Contrato
- Request: `{ barberId, serviceId, date, time, notes?, clientId? }`
- Response 201: Appointment DTO enriquecido
- Erros: 400 validação, 401, 403, 404 refs, 409 conflito

## RBAC
| Permission exigida | Roles | Escopo |
|--------------------|-------|--------|
| `manage_appointments` | admin | tenant |
| `create_appointments` | client | client (clientId do token) |

## Multi-tenant
- [x] Filtro tenant do claim
- [x] clientId do body ignorado para role client
- [x] IDOR coberto por MT-06/MT-07

## Segurança (bloqueante)
- [x] Preço/duração do Service
- [x] Testes integração happy + 403 + 409

## Critérios de aceite funcionais
- [ ] Admin agenda para qualquer client do tenant
- [ ] Client agenda só para si
- [ ] Conflito de horário → 409
- [ ] Fora de advanceBookingDays → 400

## Definition of Done
- [ ] Gates G1–G8 aplicáveis
- [ ] OpenAPI atualizado
```

---

## 7. Checklist de PR (short)

```markdown
### RBAC / Tenant
- [ ] Permission policy na rota
- [ ] Teste negativo 403
- [ ] Teste IDOR outro tenant

### Segurança
- [ ] Sem segredo novo no front
- [ ] Validação FluentValidation/DataAnnotations
- [ ] Logs ok

### Qualidade
- [ ] Testes passando
- [ ] OpenAPI
- [ ] Sem warnings relevantes novos
```
