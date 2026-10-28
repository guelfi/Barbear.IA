# Handoff — Barbear.ME (antes Barbear.IA)

**Atualizado:** 2026-10-28 America/Sao_Paulo
**Produção (`main`):** `07f672a` (merge PR #10) — republicado via `workflow_dispatch` em 2026-10-28 ~01:53 UTC (run `40617676322`, sucesso)
**Em andamento:** PR [#11](https://github.com/guelfi/Barbear.IA/pull/11) `feat/rebrand-barbear-me-lp` @ `aae171b` — **aberto, checks verdes, aguardando merge** (merge via `gh` foi negado pelo classificador de permissões; fazer pela UI do GitHub ou liberar a permissão)

## Estado atual (resumo)

Produção OCI **estável** em **https://barbear.me** (stack front + API + Postgres + Redis, nginx-proxy + Cloudflare). Chaves SSH/CD **rotacionadas em 2026-10-23** e **validadas** com deploy real em 2026-10-28. O rebrand **Barbear.IA → Barbear.ME** e a **nova landing page** estão prontos no PR #11, ainda **não** em produção.

| Ambiente | URL | Notas |
|----------|-----|--------|
| **Produção (canônico)** | https://barbear.me/ | Front 200; API sem auth 401 (esperado) |
| API | https://barbear.me/api/v1/ | |
| Swagger | https://barbear.me/swagger/index.html | |
| Local (paridade) | http://192.168.15.119/barbear-ia/ | `docker-compose.local.yml` (base `/barbear-ia/`) |
| Legado | http://129.153.86.168/barbear-ia/ | URL antiga por IP; não usar como canônica |

## Verificação (2026-10-28)

| Check | Resultado |
|-------|-----------|
| SSH com `oci-barbear-ia-20261023` (`ubuntu@129.153.86.168`) | OK |
| OCI `/var/www/Barbear.IA` | `07f672a` ≡ `origin/main` (0/0) |
| CD manual (`deploy-oci.yml`, `workflow_dispatch`) | Sucesso (validate 3s + deploy 3m43s) |
| Containers | frontend/API/Postgres `healthy`; Redis `Up` (sem healthcheck) |
| Secrets GitHub | `OCI_HOST`, `OCI_USERNAME` (2025-10-29), `OCI_SSH_KEY` (2026-10-23) |

## Como retomar na próxima sessão

1. Ler este handoff + [`docs/backlog-fases-futuras.md`](./backlog-fases-futuras.md).
2. `git checkout main && git pull origin main` (a branch `codex/pin-validated-oci-revision-20261014` já foi mergeada; trabalho novo sai de branch nova a partir da `main`)
3. Local (dev): `docker compose -f docker-compose.local.yml up -d --build`
4. Smoke: https://barbear.me/ — login SA (`admin@barbear.ia` / persona **Barbear.ME**).
5. Se o PR #11 ainda estiver aberto: mergear e acompanhar CI + CD (ver "Comandos úteis").
6. Escolher item em **Próximos passos sugeridos**.

## Credenciais seed (local e OCI)

| Persona | Email | Senha |
|---------|-------|-------|
| Super Admin | `admin@barbear.ia` | `Admin123#` |
| Dono (Owner) | `dono.{alpha\|beta\|gamma}@barbear.ia` | `Demo@123456` |
| Barbeiro | `barbeiro*.{t}@barbear.ia` | `Demo@123456` |
| Cliente | `cliente.alpha@barbear.ia` (não `cliente1`) / `cliente*.{t}@` | `Demo@123456` |

- **Persona do login (`userType`) deve bater com o role** (mismatch → credenciais inválidas genéricas).
- Tenants: Alpha + Beta = `Approved` + trial; **Gamma = `Suspended`** (mutações 403 / read-only).
- Exemplos: `dono.alpha@barbear.ia`, `barbeiro.beta@barbear.ia`, `cliente.alpha@barbear.ia`, `cliente.gamma@barbear.ia`.

## Infra / ops

| Item | Valor |
|------|--------|
| SSH | `ssh -i /home/guelfi/Projetos/oci-deploy-keys/oci-barbear-ia-20261023 -o IdentitiesOnly=yes ubuntu@129.153.86.168` (chave por projeto; a antiga `oci-key-2026-07-29` foi substituída) |
| Sync DB | `./scripts/db-sync.sh status\|pull\|push` — default **OCI → local** (`pull`); `push` exige `CONFIRM=yes` |
| Repo servidor | `/var/www/Barbear.IA` @ `main` (`8e160b5`) |
| Compose OCI | `docker-compose.yml` (front+api+postgres+redis) |
| Secrets OCI | `/var/www/Barbear.IA/.env` (**não** versionado; CD não sobrescreve se existir) |
| `VITE_API_URL` | `https://barbear.me/api/v1` (default do compose; `VITE_BASE_PATH=/`) |
| Nginx fragment | `deploy/nginx-barbear-ia.locations.conf` |
| Apply nginx | `sudo python3 deploy/apply-nginx-barbear-ia.py …` (no CD) |
| Rede Docker | `www_projetos-net` + `barbear-ia-net` |
| CD | `.github/workflows/deploy-oci.yml` — auto após CI verde em push na `main` **ou** `workflow_dispatch` (somente a partir da `main`, input `confirm_deploy=YES`); publica o SHA exato validado |

**Postgres local ≠ volume OCI.** Schema converge via EF `MigrateAsync` no boot da API (migrate **desacoplado** do seed). Dados: espelhar com `db-sync` (fonte operacional = OCI → `pull` após mudanças em prod).

**Containers:** `barbear-ia-frontend`, `barbear-ia-api`, `barbear-ia-postgres`, `barbear-ia-redis`.

## Recentemente entregue (em `main` / pushed)

### PR #11 — Rebrand Barbear.ME + nova LP (aberto, `aae171b`)
- Marca **Barbear.IA → Barbear.ME** na UI, PWA, manifest, ícones e `sw.js` (cache `barbear-me-v2.0.0`). **Não** renomeados: e-mails seed `@barbear.ia`, containers, namespaces .NET, repositório, banco
- LP multi-seção (`src/components/marketing/LandingPage.tsx` + `src/styles/marketing.css`): hero com mockup, números, antes/depois (flip), abas por perfil, simulação WhatsApp, recursos, 3 passos, calculadora de faltas, depoimentos, preço, FAQ, CTA final; `prefers-reduced-motion` respeitado
- **Preço:** Mensal **R$ 99,00** · Anual **R$ 900,00** pagamento único (≈ R$ 75/mês, economia R$ 288) · **pagamento via PIX** · 7 dias grátis
- **Depoimentos = modelo ilustrativo de layout** (sem clientes reais; selo "modelo ilustrativo"). Trocar por reais quando existirem
- "Em breve" na LP: lembretes WhatsApp, link/QR próprio, fidelidade e pacotes (não há backend de lembretes de agendamento; só OTP + outbox)
- SEO: `canonical`, Open Graph, Twitter Card, `public/og-image.png` (1200×630)
- Plano completo de melhorias + proposta de LP: [`plano-melhorias-e-lp.md`](./plano-melhorias-e-lp.md)
- Verificado no navegador em largura desktop; **mobile não verificado visualmente**

### Ops 2026-10 — chaves e CD
- 2026-10-14: `af6af9a` domínio `barbear.me`; `d1a1fcc`/PR #10 deploy pinado ao SHA do CI verde
- 2026-10-23: novas chaves SSH por projeto em `/home/guelfi/Projetos/oci-deploy-keys/` e `OCI_SSH_KEY` atualizado no GitHub
- 2026-10-28: SSH e CD validados com a chave nova

### `8e160b5` — Docs: STATUS / ponteiros
- Alinha `STATUS.md` e ponteiros com o handoff vigente

### `d306261` — Docs handoff
- Handoff atualizado com tip de produto `f62e3bb` (datas DD/MM/YYYY)

### `f62e3bb` — Datas DD/MM/YYYY (pt-BR) — tip de produto
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
- Calendário: locale **pt-BR**
- Preferir sempre `formatDate` / `formatDateTime` / `toIsoDateLocal` em vez de `toLocaleDateString` ad-hoc

## Notas de produto (abertas)

1. **Planos de fidelidade:** só mock; shape em `src/data/loyaltyPlanMock.ts` para reutilizar entre roles.
2. Ajuste **perfil a perfil** de sidebars/telas (dono, barbeiro, SA, cliente) — trabalho incremental previsto.
3. Manter **Início** do cliente = histórico + loyalty mock — **não** dashboard admin com receita/métricas de gestão.
4. **F-CLIENT-MT** (backlog): discovery + booking com barbearia avançaram no pacote `88821a6`, mas o épico completo (cadastro sem tenant / N vínculos ClientProfile) ainda está no backlog.
5. **Não-bloqueadores conhecidos:** rotacionar secrets OCI; Evolution OTP real; Stripe real; hardening E9.

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
| Docs STATUS / ponteiros | ✅ | `8e160b5` |
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
3. **Secrets de aplicação:** chaves SSH/CD já rotacionadas; **falta** confirmar rotação de `Jwt__SigningKey`, `POSTGRES_PASSWORD`, Stripe e Evolution no `.env` OCI.
4. **Evolution real:** `Evolution__Enabled`, OTP + outbox.
5. **Cobrança:** checkout hoje é **Stripe** (sandbox); a LP promete **PIX** → integrar provedor PIX (Mercado Pago/Asaas/Stripe PIX) antes do fim do trial.
6. **Hardening E9:** ZAP, HttpOnly cookies, CSP, Swagger.
7. **Limpeza:** `src/database/*.json`; `ProductionDebugPanel` / logs AuthContext.
8. **Produto futuro:** F-BARBER, F-CLIENT-MT (completo), F-PKG + loyalty real; lembretes de agendamento por WhatsApp; link/QR público por barbearia.
9. **Segurança UI:** `AuthForm.tsx` exibe credenciais demo no login público (`Demo: dono.alpha@barbear.ia · senha …`) — ocultar em produção.
10. **LP:** confirmar políticas "sem cartão" e "cancele quando quiser"; criar páginas Termos/Privacidade; definir WhatsApp comercial; analytics; validar mobile.
11. **Docs:** `STATUS.md`, `.env.example` e `oci-ambiente-atual.md` ainda citam IP + `/barbear-ia/` e a chave antiga.
12. **CI:** `actions/checkout@v4` e `webfactory/ssh-agent@v0.9.0` em Node 20 (deprecado); `ubuntu-latest` migrando para Ubuntu 26.

## Próximos passos sugeridos (prioridade)

| # | Item | Por quê |
|---|------|---------|
| 1 | Mergear PR #11, acompanhar CI/CD e validar LP em https://barbear.me (desktop + mobile) | Rebrand/LP ainda fora do ar |
| 2 | Integrar cobrança **PIX** | LP já promete PIX |
| 3 | Ocultar credenciais demo no login; rotacionar secrets de app | Segurança |
| 4 | Lembretes WhatsApp (Evolution) + link/QR público | Principais ganchos de venda da LP ("em breve") |
| 5 | Atualizar docs (`STATUS.md`, `.env.example`, `oci-ambiente-atual.md`) | Ainda apontam para IP/chave antigos |
| 6 | Ajustar sidebars/telas perfil a perfil; validar sidebar mobile no iPhone 11 | Pedido produto / validação pendente |
| 7 | F-BARBER / F-CLIENT-MT / F-PKG; ZAP + Swagger | Produto / hardening |

## Comandos úteis

```bash
# Local
docker compose -f docker-compose.local.yml up -d --build

# Sync DB (OCI → local por padrão)
./scripts/db-sync.sh status
./scripts/db-sync.sh pull
# ./scripts/db-sync.sh push   # só com CONFIRM=yes

# SSH OCI
ssh -i /home/guelfi/Projetos/oci-deploy-keys/oci-barbear-ia-20261023 -o IdentitiesOnly=yes ubuntu@129.153.86.168

# OCI (no servidor)
cd /var/www/Barbear.IA
git fetch origin && git reset --hard origin/main
sudo docker compose --env-file .env up -d --build
sudo python3 deploy/apply-nginx-barbear-ia.py /var/www/nginx/nginx.conf deploy/nginx-barbear-ia.locations.conf
sudo docker exec nginx-proxy nginx -t && sudo docker exec nginx-proxy nginx -s reload

# Acompanhar Actions
gh run list --branch main --limit 5
gh pr checks 11 --watch

# Deploy manual (somente a partir da main)
gh workflow run deploy-oci.yml --ref main -f confirm_deploy=YES
gh run watch <run-id> --exit-status
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
9. Docs STATUS / ponteiros (`8e160b5`); handoff refresh ~11:06 America/Sao_Paulo.
10. Rotação de chaves SSH/CD (2026-10-23) e validação por deploy manual (2026-10-28, run `40617676322`).
11. Rebrand Barbear.ME + nova LP + plano de melhorias (PR #11, `aae171b`) — aguardando merge.
