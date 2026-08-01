# Ambiente OCI atual — Barbear.IA

**Inspecionado em:** 2026-08-01 (via SSH)  
**Host:** `vmoracleguelfi` · `ubuntu@129.153.86.168`  
**Acesso SSH (ops):** `ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168`  
**Chave:** manter fora do git (já coberta por `.gitignore` no servidor / local).

> Este documento descreve o que está **rodando hoje**. Não inclui API keys nem secrets.

---

## 1. Visão geral

```
Internet → Cloudflare → nginx-proxy (:80/:443)
                              │
                              ├─ /barbear-ia/api/     → barbear-ia-api:8080
                              ├─ /barbear-ia/swagger/ → barbear-ia-api:8080
                              ├─ /barbear-ia/         → barbear-ia-frontend:80
                              ├─ outros projetos (driverhub, healthcore, batuara, …)
                              └─ …

Evolution API (compartilhada Batuara/outros)
  container: batuara-evolution-api
  bind host: 127.0.0.1:8085 → 8080
  Manager (via túnel SSH local): http://192.168.15.119:8085/manager/instance/<id>/dashboard
```

---

## 2. Barbear.IA (stack)

| Item | Valor |
|------|--------|
| Código no servidor | `/var/www/Barbear.IA` |
| Branch deployada | `main` |
| Containers | `barbear-ia-frontend`, `barbear-ia-api`, `barbear-ia-postgres`, `barbear-ia-redis` |
| Redes Docker | `barbearia_barbear-ia-net` + **`www_projetos-net`** (shared com `nginx-proxy`) |
| Compose | `/var/www/Barbear.IA/docker-compose.yml` |
| Secrets | `/var/www/Barbear.IA/.env` (criado no 1º deploy se ausente) |
| Vite `base` | `/barbear-ia/` |
| `VITE_API_URL` | `https://batuara.org.br/barbear-ia/api/v1` |

### Deploy (CD)

O workflow `deploy-oci.yml` faz SSH, `git reset --hard origin/main`, `docker compose up -d --build` da stack completa, aplica locations no `/var/www/nginx/nginx.conf` e recarrega o `nginx-proxy`.

---

## 3. Nginx (proxy reverso)

| Item | Valor |
|------|--------|
| Container | `nginx-proxy` (`nginx:stable-alpine`) |
| Portas públicas | `0.0.0.0:80`, `0.0.0.0:443` |
| Rede | `www_projetos-net` (resolve `barbear-ia-*` por nome) |

### Locations ativas (Barbear.IA)

| Ambiente | Path | Upstream |
|----------|------|----------|
| OCI + Local | `/barbear-ia/swagger/` | `barbear-ia-api:8080` → `/swagger/` |
| OCI + Local | `/barbear-ia/api/` | `barbear-ia-api:8080` → `/api/` |
| OCI + Local | `/barbear-ia/` | `barbear-ia-frontend:80` |

Locations estão no vhost IP (`:80`) e no vhost HTTPS `batuara.org.br`.

### URLs

- OCI front/API: `https://batuara.org.br/barbear-ia/` · `.../api/v1/...` · `.../swagger/index.html`
- OCI via IP: `http://129.153.86.168/barbear-ia/`
- Local: `http://192.168.15.119/barbear-ia/`

### Domínios SSL no mesmo proxy (outros produtos)

- `batuara.org.br` (Let’s Encrypt) — app Batuara (não contém `location /barbear-ia/` no bloco 443 inspecionado)
- `hakointeriores.com.br` — outro vhost

### Artefato legado (não é o proxy ativo)

`/var/www/nginx_proxy/config_test/barbear_ia.conf` — rascunho inválido (headers com lixo PowerShell). O tráfego real usa o `nginx.conf` do container `nginx-proxy`, não esse arquivo.

---

## 4. Evolution API (compartilhada)

| Item | Valor |
|------|--------|
| Container | `batuara-evolution-api` (`evoapicloud/evolution-api:latest`) |
| Bind | **somente localhost:** `127.0.0.1:8085→8080` |
| Postgres / Redis | `batuara-evolution-postgres`, `batuara-evolution-redis` |
| `SERVER_URL` | `http://127.0.0.1:8085` |
| Instância Manager (túnel) | `f432ff79-4ef4-4a8a-b000-c59add1091af` |
| CORS | `CORS_ORIGIN=*` (atenção em hardening futuro) |

### Como o futuro backend Barbear.IA deve falar com a Evolution

| Ambiente | `EVOLUTION_BASE_URL` sugerido |
|----------|-------------------------------|
| API no **mesmo host OCI** | `http://127.0.0.1:8085` **ou** juntar o container da API à rede Docker da Evolution e usar `http://batuara-evolution-api:8080` |
| Dev na máquina local | Túnel SSH → ex. `http://192.168.15.119:8085` (ou `localhost` se o forward for local) |
| Webhook Evolution → API | URL **pública HTTPS** do backend (ou path no nginx), nunca `127.0.0.1` do ponto de vista da Evolution se ela precisar callback externo — na prática, se Evolution e API estão na mesma VM, pode ser URL interna/`host.docker.internal` conforme rede |

**Importante:** Evolution **não** está na rede `www_projetos-net` hoje; está em `batuara-net_batuara-network` / `docker_evolution-network`. Para o backend Barbear chamar por DNS Docker, será preciso anexar a API a uma dessas redes (ou usar `127.0.0.1:8085` via `network_mode`/host gateway).

---

## 5. Implicações para o plano do backend

1. **Path público sugerido para a API:** algo como `/barbear-ia-api/` no mesmo `nginx-proxy` (padrão já usado por `/healthcore/api/`, `/batuara-api/`, etc.), mantendo o front em `/barbear-ia/`.
2. **PostgreSQL:** outros projetos na VM já usam `postgres:15/16-alpine` em Compose — alinhar Barbear a Postgres (como no plano) é consistente com a OCI atual.
3. **TLS/domínio:** hoje o front responde sob path em `batuara.org.br` (CF). Decidir se a API v1 fica no mesmo host/path ou ganha subdomínio próprio.
4. **Deploy:** estender o CD para build/up do serviço API + migration Postgres, sem quebrar o frontend.
5. **Secrets Evolution:** já existem no container Batuara; o Barbear deve ter **próprios** env vars (mesmo base URL/key se compartilhado) via secret store — não ler `.env` de outro projeto.

---

## 5b. Ambiente local (paridade OCI)

No Ubuntu local, o espelho do `nginx-proxy` é o container **`nginx-local`** (`/home/guelfi/Projetos/docker-compose.nginx.local.yml`), rede **`projetos-local`**.

| Item | Valor |
|------|--------|
| URL | `http://192.168.15.119/barbear-ia/` ou `http://localhost/barbear-ia/` |
| Compose local | `docker compose -f docker-compose.local.yml up -d --build` |
| Rede | `projetos-local` (sem publish de porta no front) |
| Location nginx | já existe em `nginx/nginx.local.conf` → `barbear-ia-frontend:80` |

Não use `localhost:3500` — a porta não é publicada de propósito (igual à OCI).

---

## 6. Comandos úteis (ops)

```bash
# SSH
ssh -i /home/guelfi/Projetos/oci-key-2026-07-29 ubuntu@129.153.86.168

# Status frontend
sudo docker ps --filter name=barbear-ia-frontend
cd /var/www/Barbear.IA && sudo docker compose ps

# Logs proxy / app
sudo docker logs --tail 100 nginx-proxy
sudo docker logs --tail 100 barbear-ia-frontend

# Evolution (só localhost na VM)
curl -sS http://127.0.0.1:8085/ | head
```

---

## 7. Checklist de follow-up (não bloqueante da aprovação do plano)

- [ ] Confirmar URL canônica definitiva do front (`https://batuara.org.br/barbear-ia/` vs domínio próprio)
- [ ] Definir path/subdomínio da API e location nginx correspondente
- [ ] Definir rede Docker da API ↔ Evolution (`127.0.0.1:8085` vs attach na network Evolution)
- [ ] Remover ou corrigir `config_test/barbear_ia.conf` legado
- [ ] Avaliar endurecer `CORS_ORIGIN=*` da Evolution (escopo Batuara/ops, impacto multi-projeto)
