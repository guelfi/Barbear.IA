---
name: Épico / Endpoint API
about: Critérios de aceite + RBAC para implementação da API Barbear.IA
title: "[E#] "
labels: ["backend", "security"]
---

## Contexto
- Épico: E#
- Endpoint(s): `METHOD /api/v1/...`
- Persona(s) afetada(s):
- Doc: `docs/criterios-aceite-e-rbac.md` · `docs/plano-implementacao-backend.md`

## Objetivo


## Contrato
- Request:
- Response 2xx:
- Erros: 400 / 401 / 403 / 404 / 409 / 429

## RBAC
| Permission exigida | Roles | Escopo |
|--------------------|-------|--------|
| | | global / tenant / barber / client / self |

## Multi-tenant
- [ ] Global Query Filter aplicado (exceto SA com permissão)
- [ ] `TenantId` do claim prevalece sobre body/query
- [ ] IDOR T1↔T2 retorna 404 quando aplicável
- [ ] Tenant suspenso/cancelled bloqueia mutação (exceto SA / billing)

## Segurança (bloqueante)
- [ ] Sem segredos no client
- [ ] Validação server-side
- [ ] Logs sem senha/token/PII sensível
- [ ] Rate limit (se auth/abusável)
- [ ] Testes: happy path + 2 negativos RBAC + 1 IDOR

## Critérios de aceite funcionais
- [ ]
- [ ]

## Critérios de aceite negativos
- [ ] Role sem permission → 403
- [ ] Outro tenant → 404/403
- [ ] Payload inválido → 400

## Test plan
- [ ] Unit
- [ ] Integration
- [ ] Manual (persona no front)

## Definition of Done
- [ ] Gates G1–G8 aplicáveis
- [ ] OpenAPI atualizado
- [ ] Referência à matriz RBAC da doc oficial
