# Handoff — Barbear.IA

**Atualizado:** 2026-08-03 ~08:35 BRT  
**Branch ativa:** `main` @ `f62e3bb` (sincronizada com `origin/main`)  
**PR fundação:** [#8](https://github.com/guelfi/Barbear.IA/pull/8) (mergeado)

## Estado atual (resumo)

Produção OCI **estável** com stack completa (front + API + Postgres + Redis). Acesso canônico por **IP + path**. Seed v2 aplicado. Em `main`: UX do cliente, guards de tenant suspenso, permissões do barbeiro e padronização de datas **DD/MM/YYYY** (pt-BR) em todos os perfis.

| Ambiente | URL | Notas |
|----------|-----|--------|
| **OCI (canônico)** | http://129.153.86.168/barbear-ia/ | Front + API + Swagger |
| Produção API | http://129.153.86.168/barbear-ia/api/v1/ | Login SA / dono / barbeiro / cliente |
| Produção Swagger | http://129.153.86.168/barbear-ia/swagger/index.html | HTTP 200 |
| **Local (paridade)** | http://192.168.15.119/barbear-ia/ | `docker-compose.local.yml` |

> **Não usar** `batuara.org.br/barbear-ia/` como URL canônica — o produto responde em `http://129.153.86.168/barbear-ia/`.

## Como retomar na próxima sessão

1. Ler este handoff + [`docs/backlog-fases-futuras.md`](./backlog-fases-futuras.md).
2. `git checkout main && git pull origin main`
3. Local (dev): `docker compose -f docker-compose.local.yml up -d --build`
4. Smoke: http://129.153.86.168/barbear-ia/ — login SA (`admin@barbear.ia` / `Admin123#` / persona **Barbear.IA**).
5. Escolher item em **Próximos passos sugeridos**.

## Credenciais seed (local e OCI)

| Persona | Email | Senha |
|---------|-------|-------|
| Super Admin | `admin@barbear.ia` | `Admin123#` |
| Dono (Owner) | `dono.{alpha\|beta\|gamma}@barbear.ia` | `Demo@123456` |
| Barbeiro / Cliente | `barbeiro*.{t}@` / `cliente*.{t}@barbear.ia` | `Demo@123456` |

- **Persona do login deve bater com o role** (mismatch → credenciais inválidas genéricas).
- Tenants: Alpha + Beta = `Approved` + trial; **Gamma = `Suspended`** (mutações 403 / read-only).
- Exemplos: `dono.alpha@barbear.ia`, `barbeiro.beta@barbear.ia`, `cliente.gamma@barbear.ia`.

## Infra / ops

| Item | Valor |
|------|--------|
| SSH | `ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168` |
| Sync DB | `./scripts/db-sync.sh status\|pull\|push` — default **OCI → local** (`pull`); `push` exige `CONFIRM=yes` |
| Repo servidor | `/var/www/Barbear.IA` @ `main` |
| Compose OCI | `docker-compose.yml` (front+api+postgres+redis) |
| Secrets OCI | `/var/www/Barbear.IA/.env` (**não** versionado; CD não sobrescreve se existir) |
| `VITE_API_URL` | `http://129.153.86.168/barbear-ia/api/v1` |
| Nginx fragment | `deploy/nginx-barbear-ia.locations.conf` |
| Apply nginx | `sudo python3 deploy/apply-nginx-barbear-ia.py …` (no CD) |
| Rede Docker | `www_projetos-net` + `barbear-ia-net` |
| CD | `.github/workflows/deploy-oci.yml` (auto após CI verde em `main`) |

**Postgres local ≠ volume OCI.** Schema converge via EF `MigrateAsync` no boot da API (migrate **desacoplado** do seed). Dados: espelhar com `db-sync` (fonte operacional = OCI → `pull` após mudanças em prod).

**Containers:** `barbear-ia-frontend`, `barbear-ia-api`, `barbear-ia-postgres`, `barbear-ia-redis`.

## Recentemente entregue (em `main` / pushed)

### `f62e3bb` — Datas DD/MM/YYYY (pt-BR)
- Helpers canônicos em `src/lib/formatDate.ts`: `formatDate`, `formatDateTime`, `toIsoDateLocal`
- Exibição UI: **DD/MM/YYYY** (e data+hora `DD/MM/YYYY HH:mm`) em dashboards, agenda, perfis, listas, notificações, debug
- DayPicker com locale `pt-BR` em `src/components/ui/calendar.tsx`
- Inputs `type=date` e payloads de API permanecem **ISO `YYYY-MM-DD`**

### `88821a6` — UX cliente + guards + permissões barbeiro
- **Sidebar cliente:** Início, Agendamentos, Barbearias, Meu Perfil
- **ClientHome:** histórico (passados) + fidelidade **mock** (`src/data/loyaltyPlanMock.ts`); **sem** métricas de receita
- **Barbearias públicas:** `GET /tenants/discover`, `GET /tenants/{id}/public`, UI `ClientBarbershops`
- **Booking:** seleção de barbearia, checagem de conflito, cancelar/reagendar com janela 24h; **sem** hard delete
- **Perfil:** `PUT /auth/me`
- **Notificações:** unread real
- Badge de tenant suspenso no Header; writes via `useTenantWriteAccess`
- **Barbeiro:** sem CRUD de clientes/serviços
- Auth expõe `tenantStatus`, `clientProfileId`
- Landing copy; label UI “Dashboard”; menu SA Serviços = catálogo read-only

### `923922f` — Dashboard black screen + ops
- Fix tela preta do Dashboard (donos e demais roles)
- `ErrorBoundary`; timeout em auth `/me`
- Migrate EF desacoplado do seed
- Script `scripts/db-sync.sh` (status / pull / push)

## Convenção de datas

- Exibição ao usuário: **DD/MM/YYYY** (e data+hora `DD/MM/YYYY HH:mm`) via `src/lib/formatDate.ts`
- Persistência / `<input type="date">` / API: **YYYY-MM-DD** (`toIsoDateLocal`)
- Preferir sempre `formatDate` / `formatDateTime` / `toIsoDateLocal` em vez de `toLocaleDateString` ad-hoc

## Notas de produto (abertas)

1. **Planos de fidelidade:** só mock; shape em `src/data/loyaltyPlanMock.ts` para reutilizar entre roles.
2. Ajuste **perfil a perfil** de sidebars/telas (dono, barbeiro, SA, cliente) — trabalho incremental previsto.
3. Manter **Início** do cliente = histórico + loyalty mock — **não** dashboard admin com receita/métricas de gestão.
4. **F-CLIENT-MT** (backlog): discovery + booking com barbearia avançaram no pacote `88821a6`, mas o épico completo (cadastro sem tenant / N vínculos ClientProfile) ainda está no backlog.

## Progresso (épicos / fases)

| Fase | Status | Notas |
|------|--------|-------|
| A Seed 3 tenants | ✅ | Alpha/Beta Approved; Gamma Suspended — também na OCI |
| B Gaps API | ✅ | Controllers + policies + seed |
| C0–C10 Front API-only | ✅ | Sem mock de API; SA dashboard + chip login |
| D E2E local | ✅ | |
| E Go-live OCI (stack) | ✅ | Compose + CD + nginx `/barbear-ia/{api,swagger}` |
| E — URL canônica IP | ✅ | `VITE_API_URL` + docs |
| UX login alerta duplicado | ✅ | Só alerta abaixo do card |
| Mobile sidebar Sair (iPhone) | ✅ | `100dvh` + footer fixo — validar no device |
| CRUD cards (linha → dialog) | ✅ | Barbearias + Usuários; Serviços: form + API |
| Suspender Usuários/Barbearias | ✅ | stopPropagation; activate/deactivate API |
| Dashboard black screen + db-sync | ✅ | `923922f` |
| UX cliente / guards / barbeiro | ✅ | `88821a6` |
| Datas DD/MM/YYYY (pt-BR) | ✅ | `f62e3bb` — `formatDate.ts` + consumers |
| E1b Evolution OTP real | ⬜ | `Evolution__Enabled=false` |
| E7 Stripe real | ⬜ | Sandbox/stub |
| E9 harden (ZAP, secrets, HttpOnly) | ⬜ | Secrets default no `.env` OCI |
| F-BARBER / F-CLIENT-MT / F-PKG | ⬜ / parcial | [`backlog-fases-futuras.md`](./backlog-fases-futuras.md) |

## Arquivos-chave

- Seed: `backend/.../DemoDataSeeder.cs` (v2)
- Auth UI: `src/components/auth/AuthForm.tsx`
- Front HTTP: `src/api/http.ts` + módulos; `AuthContext` (`tenantStatus`, `clientProfileId`)
- Cliente: `ClientHome.tsx`, `ClientBarbershops.tsx`, `loyaltyPlanMock.ts`
- Guards: `src/hooks/useTenantWriteAccess.ts`
- Datas: `src/lib/formatDate.ts` (`formatDate`, `formatDateTime`, `toIsoDateLocal`)
- Sync DB: `scripts/db-sync.sh`
- Compose local / OCI: `docker-compose.local.yml` · `docker-compose.yml`
- Docs: `docs/oci-ambiente-atual.md` · `docs/plano-implementacao-backend.md` · `docs/backlog-fases-futuras.md` · `STATUS.md`

## Pendências conhecidas

1. **Mobile audit (iPhone 11):** validar Sair no sidebar; varrer demais telas.
2. **Ajuste UX perfil a perfil** (sidebars/telas) — pedido do produto.
3. **Secrets produção:** rotacionar `Jwt__SigningKey` e `POSTGRES_PASSWORD` no `.env` OCI.
4. **Evolution real:** `Evolution__Enabled`, OTP + outbox.
5. **Stripe real:** webhook assinado.
6. **Hardening E9:** ZAP, HttpOnly cookies, CSP, Swagger.
7. **Limpeza:** `src/database/*.json`; `ProductionDebugPanel` / logs AuthContext.
8. **Produto futuro:** F-BARBER, F-CLIENT-MT (completo), F-PKG + loyalty real.

## Próximos passos sugeridos (prioridade)

| # | Item | Por quê |
|---|------|---------|
| 1 | Ajustar sidebars/telas perfil a perfil (manter Início cliente) | Pedido produto |
| 2 | Validar sidebar mobile (Sair) no iPhone 11 | Fix antigo ainda a validar no device |
| 3 | Rotacionar secrets OCI | Segurança |
| 4 | Evolution OTP / F-BARBER / F-CLIENT-MT completo / F-PKG | Produto |
| 5 | ZAP + Swagger | Hardening |

## Comandos úteis

```bash
# Local
docker compose -f docker-compose.local.yml up -d --build

# Sync DB (OCI → local por padrão)
./scripts/db-sync.sh status
./scripts/db-sync.sh pull
# ./scripts/db-sync.sh push   # só com CONFIRM=yes

# SSH OCI
ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168

# OCI (no servidor)
cd /var/www/Barbear.IA
git fetch origin && git reset --hard origin/main
sudo docker compose --env-file .env up -d --build
sudo python3 deploy/apply-nginx-barbear-ia.py /var/www/nginx/nginx.conf deploy/nginx-barbear-ia.locations.conf
sudo docker exec nginx-proxy nginx -t && sudo docker exec nginx-proxy nginx -s reload

# Acompanhar Actions
gh run list --branch main --limit 5
```

## Histórico compacto (go-live → agora)

1. Stack OCI + CD + nginx API/swagger; PR #8.
2. Fixes CD: `sudo` no apply nginx + strip locations legadas.
3. URL canônica = IP público; seed confirmado na OCI.
4. Fix UI alerta login duplicado (`4b30544`).
5. Sidebar mobile Sair (`95ae25c`); CRUD por clique (`383e3f1`); métricas SA (`1e5e102`).
6. Fix Dashboard black screen + ErrorBoundary + db-sync (`923922f`).
7. UX cliente, guards suspenso, permissões barbeiro (`88821a6`).
8. Datas DD/MM/YYYY via `formatDate.ts` (`f62e3bb`).
