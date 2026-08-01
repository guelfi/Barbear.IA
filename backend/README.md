# Barbear.IA API

.NET 10 · ASP.NET Core · EF Core · PostgreSQL · Redis · JWT · Evolution (OTP) · Swagger

## Acesso (sem portas no host — paridade OCI)

Tudo passa pelo nginx (`nginx-local` / `nginx-proxy`):

| Recurso | URL |
|---------|-----|
| Frontend | `http://192.168.15.119/barbear-ia/` |
| Swagger | `http://192.168.15.119/barbear-ia/swagger/index.html` |
| API | `http://192.168.15.119/barbear-ia/api/v1/...` |
| OCI (IP) | `http://129.153.86.168/barbear-ia/swagger/index.html` |

## Subir local

```bash
# Stack completa (front + api + postgres + redis)
docker compose -f docker-compose.local.yml up -d --build

# Ou só backend (precisa rede projetos-local)
cd backend && docker compose up -d --build
```

## Seed demo (navegação sem Evolution / Stripe)

Aplicado no boot quando `Seed:Enabled` + `Seed:DemoData` (idempotente via tenant `demo.alpha@barbear.ia`).

| Persona | Email | Senha | O que validar |
|---------|-------|-------|----------------|
| Super Admin | `admin@barbear.ia` | `Admin123#` | Global |
| Dono Alpha/Beta/Gamma | `dono.{alpha\|beta\|gamma}@barbear.ia` | `Demo@123456` | Tenant completo (Gamma suspenso) |
| Barbeiro / Cliente | `barbeiro*.{t}@` / `cliente*.{t}@barbear.ia` | `Demo@123456` | Personas por tenant |
| Admin Alpha (aprovado + trial) | `dono.alpha@barbear.ia` | `Demo@123456` | Catálogo, agenda, billing sandbox, dashboard |
| Barbeiro Alpha | `barbeiro.alpha@barbear.ia` | `Demo@123456` | Agenda do dia, notificações |
| Cliente Alpha | `cliente.alpha@barbear.ia` | `Demo@123456` | Meus agendamentos |
| Admin Beta (pending) | `dono.beta@barbear.ia` | `Demo@123456` | Fluxo aguardando aprovação |
| Admin Gamma (suspenso) | `dono.gamma@barbear.ia` | `Demo@123456` | Bloqueio de tenant suspenso |

**Contornos locais (sem provedores reais):**

- **WhatsApp / Evolution** (`Evolution:Enabled=false`): OTP em sandbox — código fixo `123456` (também em `devCode` na resposta de `POST /auth/otp/request`). Telefones do seed já vêm `PhoneNumberConfirmed=true`.
- **Pagamento / Stripe** (`Stripe:Enabled=false`): `POST /billing/checkout` ativa assinatura em `local_sandbox` sem PSP. Alpha já nasce em **trial 14 dias**.

Para reaplicar o seed do zero: `docker compose -f docker-compose.local.yml down -v` e subir de novo.

## Endpoints principais (`/barbear-ia/api/v1` no proxy → `/api/v1` no container)

- `POST /auth/login|register/barbershop|register/client|refresh|logout`
- `GET /auth/me`
- `POST /auth/otp/request|verify`
- `GET/POST /tenants…`
- `CRUD /barbers`, `/clients`, `/services`
- `GET/POST /appointments`
- `GET /dashboard/stats|global|barber`
- `POST /webhooks/evolution`

## Testes (CI usa Postgres/Redis de serviço)

```bash
dotnet test Barbear.IA.slnx -c Release
```

## Migrations

```bash
dotnet tool restore
dotnet tool run dotnet-ef database update --project src/Barbear.IA.Infrastructure --startup-project src/Barbear.IA.Api
```
