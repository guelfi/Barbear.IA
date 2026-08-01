# Handoff — Barbear.IA (API-only + 3 tenants)

**Atualizado:** 2026-08-01 ~17:05 BRT  
**Branch:** `feature/e0-e1-foundation-auth`  
**Modo:** auto-aprovado A→B→C→D  
**Critério 100% local:** app via API real; seed 3 tenants; E2E local.  
**Fora deste handoff (Fase E):** OCI API deploy, Stripe real, Evolution OCI, ZAP.

## Hotfix 2026-08-01 17:05 — Dashboard SA tela escura

**Sintoma:** login SA OK → Dashboard carrega e fica preto/vazio.  
**Causa:** `SuperAdminDashboard` chamava `stats.recentTenants.slice(...)` mas `getSuperAdminStats()` não retornava `recentTenants` (nem `totalTenants`/`monthlyRevenue`), gerando crash React.  
**Correção:** `src/api/dashboard.ts` monta shape completo + tenants recentes; guards no `SuperAdminDashboard`. Frontend rebuild/redeploy feito.

## Como retomar após crash

1. Ler **Progresso** e **Próximo passo**.
2. Subir stack: `docker compose -f docker-compose.local.yml up -d --build`
3. Validar: login SA + dono Alpha; listas de services/appointments.
4. Se seed v1 voltar: restart da API recria v2 (marcador `barbeiro.beta@barbear.ia`).

## Progresso

| Fase | Status | Notas |
|------|--------|-------|
| Handoff inicial | ✅ | |
| A Seed 3 tenants | ✅ | Alpha/Beta approved+trial; Gamma suspended+histórico |
| B Gaps API | ✅ | |
| C0–C1 HTTP+Auth | ✅ | |
| C2–C5 Tenants/Users/Catálogo/Agenda | ✅ | |
| C6–C8 Dashboard/Billing/Notif | ✅ | + hotfix shape SuperAdminStats |
| C9–C10 Limpeza mocks + UX | ✅ | |
| D E2E local | 🔄 | Revalidar UI SA após hotfix tela escura |

## Próximo passo (se retomar)

1. Hard refresh em `http://192.168.15.119/barbear-ia/` e login SA — Super Dashboard deve renderizar cards/tenants.  
2. Validar dono Alpha e demais personas.  
3. Commit/PR quando pedido.  
4. Fase E depois do aceite visual.

## Credenciais seed v2

| Persona | Email | Senha | Persona login |
|---------|-------|-------|---------------|
| Super Admin | `admin@barbear.ia` | `Admin123#` | Barbear.IA |
| Dono Alpha/Beta/Gamma | `dono.{alpha\|beta\|gamma}@barbear.ia` | `Demo@123456` | Barbearia |
| Barbeiro 1/2 | `barbeiro.{t}@` / `barbeiro2.{t}@barbear.ia` | `Demo@123456` | Barbeiro |
| Cliente 1/2 | `cliente.{t}@` / `cliente2.{t}@barbear.ia` | `Demo@123456` | Cliente |

Tenants: Alpha + Beta = `approved` + trial; Gamma = `suspended` (mutações 403).

## Arquivos-chave

- Seed: `backend/.../DemoDataSeeder.cs` (v2)
- API: Controllers + `ServicesController`/`AppointmentsController` ajustes
- Front HTTP: `src/api/*.ts`, `AuthContext`, `AuthForm`, `TrialBanner`, `NotificationDropdown`, `SuperAdminDashboard`
- Compose: `docker-compose.local.yml` (`VITE_API_URL`, `Seed__SuperAdmin__Password`)

## Pendências conhecidas (não bloqueiam 100% local)

- Fase E: deploy API OCI, nginx `/barbear-ia/api`, Stripe/Evolution reais, ZAP, HttpOnly cookies
- `src/database/*.json` ainda no repo (não importados pelo app)
- `ProductionDebugPanel` / logs verbosos no AuthContext (limpeza cosméticas)
- Webhook Stripe ainda stub; OTP Evolution desabilitado (sandbox)
- Alguns GET by id no backend usam list+filter no client (funcional)

## Backlog de fases futuras (produto)

Lista canônica: [`docs/backlog-fases-futuras.md`](./backlog-fases-futuras.md)  
Inclui **F-BARBER**, **F-CLIENT-MT**, **F-PKG** (anotados em 2026-08-01).

## Comando rebuild

```bash
docker compose -f docker-compose.local.yml up -d --build
```
