#!/usr/bin/env bash
# Karpos VPS bootstrap — DB-only.
# Idempotent: safe to re-run. Does NOT touch Supabase or any other app.
set -euo pipefail

KARPOS_DIR="/opt/karpos"
REPO_URL="${REPO_URL:-https://github.com/ivangarcia0969-ux/karpos.git}"

require_root() {
  if [ "$(id -u)" -ne 0 ]; then echo "Run as root (sudo bash $0)"; exit 1; fi
}

ensure_pkg() {
  local pkg="$1"
  if ! command -v "$pkg" >/dev/null 2>&1; then
    apt-get update -y && apt-get install -y "$pkg"
  fi
}

require_root

echo "[1/4] Verificando dependencias del host..."
ensure_pkg git
ensure_pkg openssl
command -v docker >/dev/null || { echo "Docker no está instalado en el host"; exit 1; }

echo "[2/4] Cloning / actualizando repo en ${KARPOS_DIR}..."
if [ -d "${KARPOS_DIR}/.git" ]; then
  git -C "${KARPOS_DIR}" pull --ff-only
else
  mkdir -p "${KARPOS_DIR}"
  git clone "${REPO_URL}" "${KARPOS_DIR}"
fi

echo "[3/4] Generando /opt/karpos/.env si no existe..."
ENV_FILE="${KARPOS_DIR}/.env"
if [ ! -f "${ENV_FILE}" ]; then
  cp "${KARPOS_DIR}/infra/vps/.env.production.template" "${ENV_FILE}"
  PG_PWD="$(openssl rand -base64 24 | tr -d '\n=' | tr '/+' '_-')"
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${PG_PWD}|" "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
  echo "  → password de Postgres generado en ${ENV_FILE} (chmod 600)."
else
  echo "  → ${ENV_FILE} ya existe, no lo sobreescribo."
fi

echo "[4/4] Arrancando Postgres y aplicando migraciones + seeds..."
cd "${KARPOS_DIR}/infra/vps"
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d postgres
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml --profile once run --rm migrate || {
  echo "Migración falló — revisá logs"; exit 1;
}
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml --profile once run --rm seed || {
  echo "Seed falló (no fatal — los seeds son idempotentes)";
}

echo ""
echo "✅ Karpos DB lista."
echo ""
echo "Datos de conexión (sólo accesibles desde el VPS / vía SSH tunnel):"
echo "   Host:     127.0.0.1"
echo "   Port:     5433"
echo "   Database: $(grep ^POSTGRES_DB ${ENV_FILE} | cut -d= -f2)"
echo "   User:     $(grep ^POSTGRES_USER ${ENV_FILE} | cut -d= -f2)"
echo "   Password: (ver ${ENV_FILE})"
echo ""
echo "Probar:"
echo "   docker exec -it karpos-postgres psql -U karpos -d karpos -c '\\dt karpos.*'"
echo ""
echo "Logs:    docker compose -f ${KARPOS_DIR}/infra/vps/docker-compose.prod.yml logs -f postgres"
