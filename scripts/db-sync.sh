#!/usr/bin/env bash
# Sincroniza Postgres Barbear.IA entre OCI e local (dump/restore).
#
# Uso (na máquina local):
#   ./scripts/db-sync.sh status          # compara contagens
#   ./scripts/db-sync.sh pull            # OCI → local (padrão para espelhar prod)
#   ./scripts/db-sync.sh push            # local → OCI (exige CONFIRM=yes)
#
# Variáveis opcionais:
#   OCI_HOST=ubuntu@129.153.86.168
#   OCI_SSH_KEY=/home/guelfi/Projetos/oci-key-2026-07-29
#   LOCAL_COMPOSE=docker-compose.local.yml
#   PG_CONTAINER=barbear-ia-postgres
#   PG_USER=barbear
#   PG_DB=barbear_ia

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OCI_HOST="${OCI_HOST:-ubuntu@129.153.86.168}"
OCI_SSH_KEY="${OCI_SSH_KEY:-/home/guelfi/Projetos/oci-key-2026-07-29}"
LOCAL_COMPOSE="${LOCAL_COMPOSE:-docker-compose.local.yml}"
PG_CONTAINER="${PG_CONTAINER:-barbear-ia-postgres}"
PG_USER="${PG_USER:-barbear}"
PG_DB="${PG_DB:-barbear_ia}"
DUMP_DIR="${DUMP_DIR:-$ROOT/.db-sync}"
CMD="${1:-}"

SSH=(ssh -i "$OCI_SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new "$OCI_HOST")

die() { echo "❌ $*" >&2; exit 1; }
info() { echo "→ $*"; }
ok() { echo "✅ $*"; }

require_local_pg() {
  docker inspect "$PG_CONTAINER" >/dev/null 2>&1 \
    || die "Container local $PG_CONTAINER não encontrado. Suba: docker compose -f $LOCAL_COMPOSE up -d"
  docker exec "$PG_CONTAINER" pg_isready -U "$PG_USER" -d "$PG_DB" >/dev/null \
    || die "Postgres local não está ready"
}

require_ssh() {
  [[ -f "$OCI_SSH_KEY" ]] || die "Chave SSH não encontrada: $OCI_SSH_KEY"
  "${SSH[@]}" "docker exec $PG_CONTAINER pg_isready -U $PG_USER -d $PG_DB" >/dev/null \
    || die "Postgres OCI inacessível via SSH ($OCI_HOST)"
}

counts_sql() {
  cat <<'SQL'
SELECT 'tenants' AS entity, COUNT(*)::text AS n FROM tenants
UNION ALL SELECT 'users', COUNT(*)::text FROM users
UNION ALL SELECT 'appointments', COUNT(*)::text FROM appointments
UNION ALL SELECT 'services', COUNT(*)::text FROM services
UNION ALL SELECT 'barbers', COUNT(*)::text FROM barber_profiles
UNION ALL SELECT 'clients', COUNT(*)::text FROM client_profiles
ORDER BY 1;
SQL
}

fetch_counts() {
  local where="$1"
  if [[ "$where" == "local" ]]; then
    docker exec -i "$PG_CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -At -F$'\t' <<<"$(counts_sql)"
  else
    "${SSH[@]}" "docker exec -i $PG_CONTAINER psql -U $PG_USER -d $PG_DB -At -F\$'\\t'" <<<"$(counts_sql)"
  fi
}

cmd_status() {
  require_local_pg
  require_ssh
  echo "Comparando contagens (local vs OCI)…"
  echo
  printf '%-14s %8s %8s %s\n' "entity" "local" "oci" "match"
  printf '%-14s %8s %8s %s\n' "--------------" "--------" "--------" "-----"
  local_tmp="$(mktemp)"
  oci_tmp="$(mktemp)"
  fetch_counts local >"$local_tmp"
  fetch_counts oci >"$oci_tmp"
  all_ok=1
  while IFS=$'\t' read -r entity local_n; do
    oci_n="$(awk -F'\t' -v e="$entity" '$1==e {print $2}' "$oci_tmp")"
    oci_n="${oci_n:-?}"
    if [[ "$local_n" == "$oci_n" ]]; then
      mark="✓"
    else
      mark="≠"
      all_ok=0
    fi
    printf '%-14s %8s %8s %s\n' "$entity" "$local_n" "$oci_n" "$mark"
  done <"$local_tmp"
  rm -f "$local_tmp" "$oci_tmp"
  echo
  if [[ "$all_ok" -eq 1 ]]; then
    ok "Bancos alinhados (contagens iguais)."
  else
    echo "⚠️  Divergência detectada. Use: ./scripts/db-sync.sh pull   # OCI → local"
    echo "                         ou: CONFIRM=yes ./scripts/db-sync.sh push   # local → OCI"
    exit 2
  fi
}

restore_dump_into() {
  local target="$1" # local|oci
  local dump_file="$2"
  info "Restaurando dump em $target…"
  if [[ "$target" == "local" ]]; then
    # Encerra conexões da API durante o restore
    docker compose -f "$LOCAL_COMPOSE" stop barbear-ia-api >/dev/null 2>&1 || true
    docker exec -i "$PG_CONTAINER" pg_restore \
      -U "$PG_USER" -d "$PG_DB" \
      --clean --if-exists --no-owner --no-acl \
      <"$dump_file" || true
    docker compose -f "$LOCAL_COMPOSE" start barbear-ia-api >/dev/null 2>&1 || true
  else
    "${SSH[@]}" "cd /var/www/Barbear.IA && docker compose stop barbear-ia-api >/dev/null 2>&1 || true"
    # shellcheck disable=SC2029
    cat "$dump_file" | "${SSH[@]}" "docker exec -i $PG_CONTAINER pg_restore -U $PG_USER -d $PG_DB --clean --if-exists --no-owner --no-acl"
    "${SSH[@]}" "cd /var/www/Barbear.IA && docker compose start barbear-ia-api >/dev/null 2>&1 || true"
  fi
}

cmd_pull() {
  require_local_pg
  require_ssh
  mkdir -p "$DUMP_DIR"
  local stamp dump_file
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  dump_file="$DUMP_DIR/oci-$stamp.dump"
  info "Dump OCI → $dump_file"
  "${SSH[@]}" "docker exec $PG_CONTAINER pg_dump -U $PG_USER -d $PG_DB -Fc --no-owner --no-acl" >"$dump_file"
  [[ -s "$dump_file" ]] || die "Dump vazio"
  restore_dump_into local "$dump_file"
  ok "Local espelhou OCI ($dump_file)"
  cmd_status || true
}

cmd_push() {
  [[ "${CONFIRM:-}" == "yes" ]] \
    || die "push sobrescreve o Postgres da OCI. Reexecute com CONFIRM=yes"
  require_local_pg
  require_ssh
  mkdir -p "$DUMP_DIR"
  local stamp dump_file
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  dump_file="$DUMP_DIR/local-$stamp.dump"
  info "Dump local → $dump_file"
  docker exec "$PG_CONTAINER" pg_dump -U "$PG_USER" -d "$PG_DB" -Fc --no-owner --no-acl >"$dump_file"
  [[ -s "$dump_file" ]] || die "Dump vazio"
  restore_dump_into oci "$dump_file"
  ok "OCI espelhou local ($dump_file)"
  cmd_status || true
}

usage() {
  cat <<EOF
Uso: $0 <status|pull|push>

  status  Compara contagens local vs OCI
  pull    Espelha OCI → local (recomendado após mudanças em prod)
  push    Espelha local → OCI (CONFIRM=yes obrigatório)

Fonte de verdade operacional: OCI (pull). Use push só quando o local
for o estado desejado e você quiser atualizar a produção.
EOF
}

case "$CMD" in
  status) cmd_status ;;
  pull) cmd_pull ;;
  push) cmd_push ;;
  *) usage; exit 1 ;;
esac
