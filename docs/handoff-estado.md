# Handoff — Barbear.IA

**Atualizado:** 2026-08-02 ~23:40 BRT  
**Branch ativa:** `main` (sincronizada com `origin/main`)  
**Último commit:** `4b30544` — `fix(ui): remove alerta duplicado dentro do card de login`  
**PR fundação:** [#8](https://github.com/guelfi/Barbear.IA/pull/8) (mergeado)

## Estado atual (resumo)

Produção OCI **estável** com stack completa (front + API + Postgres + Redis). Acesso canônico por **IP + path**. Seed v2 aplicado e validado. CI/CD no `main` verde no último deploy do fix de login.

| Ambiente | URL | Status |
|----------|-----|--------|
| **Produção front (canônico)** | http://129.153.86.168/barbear-ia/ | HTTP 200 · commit `4b30544` |
| Produção API | http://129.153.86.168/barbear-ia/api/v1/ | Login SA / dono / barbeiro OK |
| Produção Swagger | http://129.153.86.168/barbear-ia/swagger/index.html | HTTP 200 |
| Local (paridade) | http://192.168.15.119/barbear-ia/ | `docker-compose.local.yml` |

> **Não usar** `batuara.org.br/barbear-ia/` como URL canônica — o produto responde em `http://129.153.86.168/barbear-ia/`.

**Último CI/CD observado:**
- CI `30778572663` — success (alerta login duplicado)
- CD `30778681042` — success (deploy OCI)

## Feito nesta sessão (desde handoff anterior)

1. URL canônica OCI alinhada ao IP (`VITE_API_URL=http://129.153.86.168/barbear-ia/api/v1`); front rebuildado na OCI.
2. Confirmado seed v2 no Postgres OCI: 3 tenants + 16 users; logins SA / dono.alpha / barbeiro.beta OK.
3. Removido alerta duplicado “Usuário ou senha inválido” **dentro** do card de login (mantido só o abaixo do card) — `AuthForm.tsx` → deployado.

## Como retomar na próxima sessão

1. Ler este handoff + [`docs/backlog-fases-futuras.md`](./backlog-fases-futuras.md).
2. `git checkout main && git pull origin main`
3. Local (dev): `docker compose -f docker-compose.local.yml up -d --build`
4. Smoke: http://129.153.86.168/barbear-ia/ — login SA (`admin@barbear.ia` / `Admin123#` / persona **Barbear.IA**).
5. Escolher item em **Próximos passos sugeridos**.

## Progresso (épicos / fases)

| Fase | Status | Notas |
|------|--------|-------|
| A Seed 3 tenants | ✅ | Alpha/Beta Approved; Gamma Suspended — **também na OCI** |
| B Gaps API | ✅ | Controllers + policies + seed |
| C0–C10 Front API-only | ✅ | Sem mock; SA dashboard + chip login |
| D E2E local | ✅ | |
| E Go-live OCI (stack) | ✅ | Compose + CD + nginx `/barbear-ia/{api,swagger}` |
| E — URL canônica IP | ✅ | `VITE_API_URL` + docs |
| UX login alerta duplicado | ✅ | Só alerta abaixo do card |
| E1b Evolution OTP real | ⬜ | `Evolution__Enabled=false` |
| E7 Stripe real | ⬜ | Sandbox/stub |
| E9 harden (ZAP, secrets, HttpOnly) | ⬜ | Secrets default no `.env` OCI |
| F-BARBER / F-CLIENT-MT / F-PKG | ⬜ | [`backlog-fases-futuras.md`](./backlog-fases-futuras.md) |

## Credenciais seed (local e OCI)

| Persona | Email | Senha | Persona login |
|---------|-------|-------|---------------|
| Super Admin | `admin@barbear.ia` | `Admin123#` | Barbear.IA |
| Dono Alpha/Beta/Gamma | `dono.{alpha\|beta\|gamma}@barbear.ia` | `Demo@123456` | Barbearia |
| Barbeiro 1/2 | `barbeiro.{t}@` / `barbeiro2.{t}@barbear.ia` | `Demo@123456` | Barbeiro |
| Cliente 1/2 | `cliente.{t}@` / `cliente2.{t}@barbear.ia` | `Demo@123456` | Cliente |

Tenants: Alpha + Beta = `Approved` + trial; Gamma = `Suspended` (mutações 403).  
Mismatch de persona → mensagem genérica de credenciais inválidas.

## Infra / ops

| Item | Valor |
|------|--------|
| Repo servidor | `/var/www/Barbear.IA` @ `main` |
| Compose OCI | `docker-compose.yml` (front+api+postgres+redis) |
| Secrets OCI | `/var/www/Barbear.IA/.env` (**não** versionado; CD não sobrescreve se existir) |
| `VITE_API_URL` | `http://129.153.86.168/barbear-ia/api/v1` |
| Nginx fragment | `deploy/nginx-barbear-ia.locations.conf` |
| Apply nginx | `sudo python3 deploy/apply-nginx-barbear-ia.py …` (no CD) |
| Nginx fonte local | `/home/guelfi/Projetos/nginx/nginx.oci.conf` |
| Rede Docker | `www_projetos-net` + `barbear-ia-net` |
| SSH | `ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168` |
| CD | `.github/workflows/deploy-oci.yml` (auto após CI verde em `main`) |

**Containers:** `barbear-ia-frontend`, `barbear-ia-api`, `barbear-ia-postgres`, `barbear-ia-redis`.

## Arquivos-chave

- Seed: `backend/.../DemoDataSeeder.cs` (v2)
- Auth UI: `src/components/auth/AuthForm.tsx` (alerta só abaixo do card)
- Front HTTP: `src/api/http.ts` + módulos; `AuthContext` (`isInitializing` vs `isLoading`)
- Compose local / OCI: `docker-compose.local.yml` · `docker-compose.yml`
- Docs: `docs/oci-ambiente-atual.md` · `docs/plano-implementacao-backend.md` · `docs/backlog-fases-futuras.md`

## Pendências conhecidas

1. **Secrets produção:** rotacionar `Jwt__SigningKey` e `POSTGRES_PASSWORD` no `.env` OCI (defaults do 1º deploy).
2. **Evolution real:** `Evolution__Enabled`, rede/URL `batuara-evolution-api`, OTP + outbox.
3. **Stripe real:** webhook assinado; sair do stub.
4. **Hardening E9:** ZAP, HttpOnly cookies, CSP, Swagger público opcional.
5. **Limpeza:** `src/database/*.json` órfãos; `ProductionDebugPanel` / logs verbosos no AuthContext.
6. **Smoke E2E UI prod** além do login (dashboard SA, agenda dono Alpha, etc.).
7. **Produto futuro:** F-BARBER, F-CLIENT-MT, F-PKG.

## Próximos passos sugeridos (prioridade)

| # | Item | Por quê |
|---|------|---------|
| 1 | Rotacionar secrets OCI (JWT + Postgres) e reiniciar API | Segurança pós go-live |
| 2 | Smoke E2E UI em produção (SA + dono Alpha + barbeiro + cliente) | Validar fluxos além do login |
| 3 | Evolution OTP (E1b) com número de teste | WhatsApp |
| 4 | Priorizar F-BARBER ou F-CLIENT-MT | Melhorias de produto |
| 5 | ZAP + revisar Swagger público | Hardening |

## Comandos úteis

```bash
# Local
docker compose -f docker-compose.local.yml up -d --build

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
4. Fix UI alerta login duplicado deployado (`4b30544`).
