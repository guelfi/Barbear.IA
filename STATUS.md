# Barbear.IA — Status (ponteiro)

**Última atualização:** 2026-08-03 ~08:35 BRT  
**Branch:** `main` @ `d306261` — tip de produto `f62e3bb` (datas DD/MM/YYYY); UX cliente + guards em `origin/main`

## Onde acompanhar o trabalho

| Documento | Uso |
|-----------|-----|
| [`docs/handoff-estado.md`](docs/handoff-estado.md) | **Retomada da próxima sessão** — estado, credenciais, recentes, próximos passos |
| [`docs/plano-implementacao-backend.md`](docs/plano-implementacao-backend.md) | Escopo e status da **v1** (épicos E0–E9) |
| [`docs/backlog-fases-futuras.md`](docs/backlog-fases-futuras.md) | Melhorias pós-v1 (F-BARBER, F-CLIENT-MT, F-PKG) |
| [`docs/oci-ambiente-atual.md`](docs/oci-ambiente-atual.md) | Topologia OCI / nginx / Evolution |

## Ambientes

| Ambiente | URL |
|----------|-----|
| OCI (canônico) | http://129.153.86.168/barbear-ia/ |
| Local | http://192.168.15.119/barbear-ia/ |
| API | http://129.153.86.168/barbear-ia/api/v1/ |
| Swagger | http://129.153.86.168/barbear-ia/swagger/index.html |

**SSH:** `ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168`  
**DB sync:** `./scripts/db-sync.sh status|pull|push` (default OCI → local)

## Seed (resumo)

| Persona | Email | Senha |
|---------|-------|-------|
| Super Admin | `admin@barbear.ia` | `Admin123#` |
| Owner | `dono.{alpha\|beta\|gamma}@barbear.ia` | `Demo@123456` |
| Barber / Client | `barbeiro*.{t}@` / `cliente*.{t}@barbear.ia` | `Demo@123456` |

Persona deve bater com o role. Gamma = suspended (writes 403).

## Últimos commits relevantes

- `d306261` — docs: handoff atualizado (datas DD/MM/YYYY)
- `f62e3bb` — datas DD/MM/YYYY (`src/lib/formatDate.ts`) em todos os perfis
- `88821a6` — UX cliente, guards tenant suspenso, permissões barbeiro
- `923922f` — Dashboard black screen, ErrorBoundary, db-sync, migrate≠seed

## Fases futuras (resumo)

- **F-BARBER** — barbeiro se cadastra, escolhe barbearia, libera com aceite do admin
- **F-CLIENT-MT** — cliente multi-barbearia (parcial no front/API via discovery/booking; épico completo no backlog)
- **F-PKG** — pacotes/assinatura mensal (+ loyalty hoje só mock em `loyaltyPlanMock.ts`)

Detalhes em `docs/backlog-fases-futuras.md`. Handoff completo em `docs/handoff-estado.md`.
