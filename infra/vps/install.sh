#!/usr/bin/env bash
# Karpos VPS bootstrap — Postgres + API + Web + Caddy block.
# Idempotent: safe to re-run. Does NOT touch Supabase or LibreChat.
set -euo pipefail

KARPOS_DIR="/opt/karpos"
REPO_URL="${REPO_URL:-https://github.com/ivangarcia0969-ux/karpos.git}"
PUBLIC_HOST="${PUBLIC_HOST:-app.karpos.surcoapp.tech}"
CADDY_INCLUDE="/etc/caddy/karpos.caddy"

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

echo "[1/6] Verificando dependencias del host..."
ensure_pkg git
ensure_pkg openssl
command -v docker >/dev/null || { echo "Docker no está instalado en el host"; exit 1; }
command -v caddy  >/dev/null || { echo "Caddy no está instalado en el host"; exit 1; }

echo "[2/6] Cloning / actualizando repo en ${KARPOS_DIR}..."
if [ -d "${KARPOS_DIR}/.git" ]; then
  git -C "${KARPOS_DIR}" pull --ff-only
else
  mkdir -p "${KARPOS_DIR}"
  git clone "${REPO_URL}" "${KARPOS_DIR}"
fi

echo "[3/6] Generando /opt/karpos/.env si no existe..."
ENV_FILE="${KARPOS_DIR}/.env"
if [ ! -f "${ENV_FILE}" ]; then
  cp "${KARPOS_DIR}/infra/vps/.env.production.template" "${ENV_FILE}"
  PG_PWD="$(openssl rand -base64 24 | tr -d '\n=' | tr '/+' '_-')"
  JWT_SECRET_VAL="$(openssl rand -hex 32)"
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${PG_PWD}|" "${ENV_FILE}"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET_VAL}|" "${ENV_FILE}"
  sed -i "s|^PUBLIC_HOST=.*|PUBLIC_HOST=${PUBLIC_HOST}|" "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
  echo "  → secretos generados; revisá ${ENV_FILE} (chmod 600)."
else
  echo "  → ${ENV_FILE} ya existe, no lo sobreescribo."
fi

echo "[4/6] Construyendo imágenes y arrancando Postgres..."
cd "${KARPOS_DIR}/infra/vps"
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml build api web
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d postgres

echo "[5/6] Aplicando migraciones y seeds (perfil 'once')..."
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml --profile once run --rm migrate || {
  echo "Migración falló — revisá logs"; exit 1;
}
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml --profile once run --rm seed || {
  echo "Seed falló (no fatal — los seeds son idempotentes)";
}

docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d api web

echo "[6/6] Configurando Caddy..."
cp "${KARPOS_DIR}/infra/vps/Caddyfile.karpos" "${CADDY_INCLUDE}"

if ! grep -q "import ${CADDY_INCLUDE}" /etc/caddy/Caddyfile 2>/dev/null; then
  echo "" >> /etc/caddy/Caddyfile
  echo "# Karpos (added by install.sh)" >> /etc/caddy/Caddyfile
  echo "import ${CADDY_INCLUDE}" >> /etc/caddy/Caddyfile
  echo "  → bloque añadido al Caddyfile principal."
else
  echo "  → bloque Karpos ya estaba referenciado en /etc/caddy/Caddyfile."
fi

caddy validate --config /etc/caddy/Caddyfile || { echo "Caddyfile inválido"; exit 1; }
systemctl reload caddy

echo ""
echo "✅ Karpos arrancado."
echo ""
echo "Verificá:"
echo "   curl -fsS https://${PUBLIC_HOST}/v1/health"
echo "   abrir https://${PUBLIC_HOST} en el navegador"
echo ""
echo "Logs:     docker compose -f ${KARPOS_DIR}/infra/vps/docker-compose.prod.yml logs -f api web"
echo "Redeploy: bash ${KARPOS_DIR}/infra/vps/install.sh"
