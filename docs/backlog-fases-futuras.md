# Backlog — Fases futuras (melhorias pós-v1)

**Arquivo canônico da lista de itens pendentes de implementação futura.**  
Atualizar este documento ao priorizar ou concluir itens.

**Última atualização:** 2026-08-01  
**Relacionados:** [`plano-implementacao-backend.md`](./plano-implementacao-backend.md) (roadmap E0–E9 / v1) · [`handoff-estado.md`](./handoff-estado.md) (estado da branch atual)

---

## Como usar

| Documento | Para quê |
|-----------|----------|
| **`docs/backlog-fases-futuras.md`** (este) | Ideias e épicos **após** a v1 / go-live local |
| `docs/plano-implementacao-backend.md` | Escopo e status da implementação **v1** (E0–E9) |
| `docs/handoff-estado.md` | Retomada da sessão / hotfixes da branch atual |
| `STATUS.md` (raiz) | Status operacional antigo — **desatualizado**; preferir este backlog + plano |

---

## Decisões de produto registradas (2026-08-01)

Estas decisões **substituem/evoluem** D1/D2 da v1 quando forem implementadas.

### F-BARBER — Auto-cadastro de barbeiro com aprovação do tenant

| Campo | Valor |
|-------|--------|
| Status | ⬜ Pendente |
| Prioridade | Alta (UX cadastro) |
| Origem | Solicitação produto 2026-08-01 |

**Comportamento desejado**
1. Barbeiro pode se **cadastrar publicamente**.
2. No cadastro, **escolhe uma barbearia (tenant) já aprovada** (lista via discovery).
3. Cadastro fica em estado **pendente de aceite** (`pending` / `awaiting_approval`).
4. Acesso liberado **somente** quando o **Admin da barbearia/tenant** escolhida **aceitar** o cadastro.
5. Admin pode rejeitar; barbeiro rejeitado não opera naquele tenant.

**Implicações técnicas (rascunho)**
- Endpoint `POST /auth/register/barber` (ou equivalente) + `tenantId` obrigatório.
- Entidade de vínculo `BarberMembership` / status no `BarberProfile` (`pending` | `active` | `rejected`).
- Policies: login pode autenticar, mas mutações/agenda bloqueadas até `active`.
- UI admin: fila “Solicitações de barbeiros”.
- Atualizar D2 no plano quando este item for puxado para sprint.

---

### F-CLIENT-MT — Cliente multi-barbearia na hora do serviço

| Campo | Valor |
|-------|--------|
| Status | ⬜ Pendente |
| Prioridade | Alta (produto SaaS marketplace-light) |
| Origem | Solicitação produto 2026-08-01 · evolui D1 |

**Comportamento desejado**
1. Cliente pode se **cadastrar sem escolher barbearia**.
2. Ao escolher um **serviço / agendar**, o sistema oferece **quais barbearias/tenants** podem executar aquele serviço (ou lista tenants ativos + serviços de cada uma).
3. Cliente pode usar **mais de uma barbearia** ao longo do tempo (não fica preso a um único `TenantId` no user).

**Implicações técnicas (rascunho)**
- Separar `User` (identidade) de `ClientProfile` **por tenant** (N vínculos).
- Fluxo de booking: discovery → tenant → serviços → barbeiro → horário.
- Claims/token: `tenantId` de contexto da sessão de agendamento (ou seleção explícita).
- IDOR: cliente só vê/agenda nos tenants em que tem vínculo ou que estão `approved` + públicos.
- Atualizar D1 no plano quando for puxado para sprint.

---

### F-PKG — Assinatura de pacotes de serviços (mensalidade fixa)

| Campo | Valor |
|-------|--------|
| Status | ⬜ Pendente |
| Prioridade | Média–Alta (monetização tenant) |
| Origem | Solicitação produto 2026-08-01 |

**Comportamento desejado**
1. **Admin da barbearia** cria **pacotes** (ex.: “4 cortes/mês”, “combo barba+corte”).
2. Cliente faz **assinatura com pagamento fixo mensal**.
3. Assinatura dá direito a uma **quantidade de serviços** do pacote naquela barbearia.
4. Agendamentos consomem créditos/saldo do pacote; regras de renovação/expiração a definir.

**Implicações técnicas (rascunho)**
- Entidades: `ServicePackage`, `ClientSubscription` (tenant-scoped), `PackageAllowance` / ledger de consumo.
- Billing: Stripe Subscription **por tenant** (não só assinatura SaaS da plataforma — E7 atual).
- UI admin: CRUD pacotes; UI cliente: assinar, ver saldo, agendar usando crédito.
- Relação com E7: hoje billing é assinatura **da barbearia na plataforma**; isto é billing **cliente → barbearia**.

---

## Outros itens futuros já conhecidos (do plano v1)

| ID | Item | Status |
|----|------|--------|
| F-E9 | Go-live OCI (API + nginx + secrets + ZAP) | ⬜ |
| F-STRIPE | Stripe Checkout/Portal real (assinatura SaaS tenant) | ⬜ |
| F-EVO | Evolution OCI real (OTP + WhatsApp transacional) | ⬜ |
| F-D7-F2 | WhatsApp próprio por tenant | ⬜ |
| F-HTTPONLY | Tokens em cookie HttpOnly | ⬜ |
| F-MOBILE | App mobile nativo | ⬜ (fora v1) |

---

## Ordem sugerida (quando for priorizar)

1. **F-BARBER** — desbloqueia cadastro real de barbeiro alinhado ao UI  
2. **F-CLIENT-MT** — base para cliente usar várias barbearias  
3. **F-PKG** — depende de cliente↔tenant estável + billing cliente  
4. Em paralelo/ops: **F-E9** / **F-STRIPE** / **F-EVO** conforme go-live
