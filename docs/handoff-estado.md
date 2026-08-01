# Handoff — Barbear.IA

**Atualizado:** 2026-08-01 ~19:00 BRT  
**Branch ativa:** `main` (sincronizada com `origin/main`)  
**Último commit:** `219476e` — `fix(cd): remover locations nginx legadas do Barbear.IA`  
**PR mergeado:** [#8](https://github.com/guelfi/Barbear.IA/pull/8) (`feature/e0-e1-foundation-auth` → `main`)

## Estado da sessão (resumo)

Publicação na OCI **concluída**. Stack completa em produção (front + API + Postgres + Redis), nginx com `/barbear-ia/api` e swagger, CI/CD verde no `main`.

| Ambiente | URL | Status verificado |
|----------|-----|-------------------|
| Produção front | https://batuara.org.br/barbear-ia/ | HTTP 200 |
| Produção API | https://batuara.org.br/barbear-ia/api/v1/ | Login SA OK |
| Produção Swagger | https://batuara.org.br/barbear-ia/swagger/index.html | HTTP 200 |
| Local (paridade) | http://192.168.15.119/barbear-ia/ | Compose local |

**CI/CD (último ciclo observado):**
- CI `30720245116` — success (fix nginx legado)
- CD `30720331542` — success (deploy OCI pós-CI)
- CD anterior com falha (`30719461819`) — corrigido: `sudo` no apply nginx + strip de locations legadas

## Como retomar na próxima sessão

1. Ler este handoff + [`docs/backlog-fases-futuras.md`](./backlog-fases-futuras.md).
2. `git checkout main && git pull origin main`
3. Local (se for mexer em código):  
   `docker compose -f docker-compose.local.yml up -d --build`
4. Smoke rápido prod ou local: login SA (`admin@barbear.ia` / `Admin123#` / persona **Barbear.IA**).
5. Escolher próximo item da seção **Próximos passos sugeridos**.

## Progresso (épicos / fases)

| Fase | Status | Notas |
|------|--------|-------|
| A Seed 3 tenants | ✅ | Alpha/Beta approved+trial; Gamma suspended |
| B Gaps API | ✅ | Controllers + policies + seed |
| C0–C10 Front API-only | ✅ | Sem mock; hotfix SA dashboard + chip login |
| D E2E local | ✅ | Validado em sessão anterior + stack local |
| E Go-live OCI (stack) | ✅ | Compose OCI + CD + nginx IP + `batuara.org.br:443` |
| E1b Evolution OTP real | ⬜ | Stub/desligado (`Evolution__Enabled=false`) |
| E7 Stripe real | ⬜ | Sandbox/stub |
| E9 harden (ZAP, secrets, HttpOnly) | ⬜ | Secrets default no `.env` OCI — trocar |
| F-BARBER / F-CLIENT-MT / F-PKG | ⬜ | Ver backlog fases futuras |

## Credenciais seed (local e OCI seed)

| Persona | Email | Senha | Persona login |
|---------|-------|-------|---------------|
| Super Admin | `admin@barbear.ia` | `Admin123#` | Barbear.IA |
| Dono Alpha/Beta/Gamma | `dono.{alpha\|beta\|gamma}@barbear.ia` | `Demo@123456` | Barbearia |
| Barbeiro 1/2 | `barbeiro.{t}@` / `barbeiro2.{t}@barbear.ia` | `Demo@123456` | Barbeiro |
| Cliente 1/2 | `cliente.{t}@` / `cliente2.{t}@barbear.ia` | `Demo@123456` | Cliente |

Tenants: Alpha + Beta = `approved` + trial; Gamma = `suspended` (mutações 403).  
Mismatch de persona → “Credenciais inválidas.”

## Infra / ops

| Item | Valor |
|------|--------|
| Repo servidor | `/var/www/Barbear.IA` |
| Compose OCI | `docker-compose.yml` (front+api+postgres+redis) |
| Secrets OCI | `/var/www/Barbear.IA/.env` (criado no 1º deploy; **não** versionado) |
| Nginx fragment | `deploy/nginx-barbear-ia.locations.conf` |
| Apply nginx | `deploy/apply-nginx-barbear-ia.py` (via `sudo` no CD) |
| Nginx fonte local | `/home/guelfi/Projetos/nginx/nginx.oci.conf` |
| Rede Docker | `www_projetos-net` + `barbear-ia-net` |
| SSH ops | `ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168` |
| CD workflow | `.github/workflows/deploy-oci.yml` (auto após CI verde em `main`) |

**Containers esperados:** `barbear-ia-frontend`, `barbear-ia-api`, `barbear-ia-postgres`, `barbear-ia-redis`.

## Arquivos-chave

- Seed: `backend/.../DemoDataSeeder.cs` (v2, marcador `barbeiro.beta@barbear.ia`)
- API: Controllers + Auth/JWT + Tenant middleware
- Front HTTP: `src/api/http.ts` + módulos; `AuthContext` (`isInitializing` vs `isLoading`)
- Compose local: `docker-compose.local.yml`
- Compose OCI: `docker-compose.yml` (`VITE_API_URL=https://batuara.org.br/barbear-ia/api/v1`)
- Docs: `docs/oci-ambiente-atual.md`, `docs/plano-implementacao-backend.md`, `docs/backlog-fases-futuras.md`

## Pendências conhecidas (pós go-live)

1. **Secrets produção:** trocar `Jwt__SigningKey` e `POSTGRES_PASSWORD` no `.env` OCI (hoje defaults fracos do 1º deploy).
2. **Evolution real:** ligar `Evolution__Enabled`, rede/URL para `batuara-evolution-api`, OTP + outbox.
3. **Stripe real:** sair do sandbox/stub; webhook assinado.
4. **Hardening E9:** ZAP, HttpOnly cookies (hoje JWT no client), CSP, desligar Swagger em prod se desejado.
5. **Limpeza cosméticas:** `src/database/*.json` órfãos; `ProductionDebugPanel` / logs verbosos no AuthContext.
6. **Nginx local vs OCI:** `nginx.oci.conf` local já espelha locations; manter em sync se o CD alterar só o servidor.
7. **Produto futuro:** F-BARBER, F-CLIENT-MT, F-PKG (backlog).

## Próximos passos sugeridos (prioridade)

| # | Item | Por quê |
|---|------|---------|
| 1 | Rotacionar secrets OCI (JWT + Postgres) e reiniciar API | Segurança imediata pós go-live |
| 2 | Smoke E2E UI em produção (SA + dono Alpha + barbeiro + cliente) | Confirmar UX além do login API |
| 3 | Evolution OTP (E1b) com número de teste | Canal WhatsApp |
| 4 | Priorizar F-BARBER ou F-CLIENT-MT | Melhorias de produto pedidas |
| 5 | ZAP + fechar Swagger público se não precisar | Hardening |

## Comandos úteis

```bash
# Local
docker compose -f docker-compose.local.yml up -d --build

# OCI (no servidor)
cd /var/www/Barbear.IA
git pull origin main
sudo docker compose --env-file .env up -d --build
sudo python3 deploy/apply-nginx-barbear-ia.py /var/www/nginx/nginx.conf deploy/nginx-barbear-ia.locations.conf
sudo docker exec nginx-proxy nginx -t && sudo docker exec nginx-proxy nginx -s reload

# Acompanhar Actions
gh run list --branch main --limit 5
```

## Histórico rápido desta sessão de sync

1. Estendido `docker-compose.yml` OCI para stack completa + `VITE_API_URL`.
2. CD atualizado para `up` de todos os serviços + apply nginx.
3. PR #8 mergeado; CI main verde; 1º CD falhou em permissão nginx → fix `sudo`.
4. 2º CD falhou em `duplicate location` → fix strip de locations legadas.
5. Nginx aplicado; login SA validado em IP e `batuara.org.br`; CD final success.
