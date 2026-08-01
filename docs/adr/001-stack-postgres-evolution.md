# ADR 001 — Stack: .NET 10, PostgreSQL, Evolution API

**Status:** Aceito  
**Data:** 2026-08-01

## Contexto

O Barbear.IA precisa de API multi-tenant com RBAC, autenticação segura e canal WhatsApp para OTP/notificações, reutilizando infra OCI existente.

## Decisão

- Runtime: **.NET 10 LTS**
- Banco: **PostgreSQL 16** (EF Core + Npgsql, snake_case / jsonb)
- Cache / OTP / rate: **Redis**
- WhatsApp: **Evolution API** já hospedada na OCI (cliente HTTP; sem redeploy no repo)
- Auth: ASP.NET Identity + JWT + refresh; OTP WhatsApp complementar (D8)

## Consequências

- Compose local sobe `api` + `postgres` + `redis`
- Secrets Evolution/JWT só via env / User Secrets
- Frontend continua em mock até E9 (`VITE_API_URL`)
