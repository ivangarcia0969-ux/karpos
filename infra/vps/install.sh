#!/usr/bin/env bash
# Karpos VPS bootstrap — runs ONCE on the VPS as root.
# Idempotent: safe to re-run. Does NOT touch Supabase or any other app.
set -euo pipefail

KARPOS_DIR="/opt/karpos"
REPO_URL="${REPO_URL:-https://github.com/ivangarcia0969-ux/karpos.git}"
PUBLIC_HOST="cultivarapp.karpos.surcoapp.tech"
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
ensure_pkg curl
command -v docker >/dev/null || { echo "Docker no está instalado en el host"; exit 1; }
command -v caddy  >/dev/null || { echo "Caddy no está instalado en el host"; exit 1; }
command -v ollama >/dev/null || echo "Aviso: ollama no detectado en el host — Karpos IQ caerá al stub textual."

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
  RD_PWD="$(openssl rand -base64 24 | tr -d '\n=' | tr '/+' '_-')"
  S3_PWD="$(openssl rand -base64 24 | tr -d '\n=' | tr '/+' '_-')"
  ML_KEY="$(openssl rand -hex 32)"
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${PG_PWD}|" "${ENV_FILE}"
  sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${RD_PWD}|" "${ENV_FILE}"
  sed -i "s|^S3_SECRET_KEY=.*|S3_SECRET_KEY=${S3_PWD}|" "${ENV_FILE}"
  sed -i "s|^ML_API_KEY=.*|ML_API_KEY=${ML_KEY}|" "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
  echo "  → secretos generados; revisá ${ENV_FILE} (chmod 600)."
else
  echo "  → ${ENV_FILE} ya existe, no lo sobreescribo."
fi

echo "[4/6] Construyendo imágenes y arrancando servicios (api/web/ml/postgres/redis/minio)..."
cd "${KARPOS_DIR}/infra/vps"
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml build
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d postgres redis minio minio-init

echo "[5/6] Aplicando migraciones y seeds (perfil 'once')..."
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml --profile once run --rm migrate || {
  echo "Migración falló — revisá logs"; exit 1;
}
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml --profile once run --rm seed || {
  echo "Seed falló (no fatal — los seeds son idempotentes)";
}

docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d api web ml

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
echo "✅ Karpos arrancado. Verificá:"
echo "   curl -fsS https://${PUBLIC_HOST}/health"
echo "   curl -fsS https://${PUBLIC_HOST}/v1/health  # Nest se monta en /v1"
echo "   abrir https://${PUBLIC_HOST} en el navegador"
echo ""
echo "Para ver logs:    docker compose -f ${KARPOS_DIR}/infra/vps/docker-compose.prod.yml logs -f api web"
echo "Para redeploy:    bash ${KARPOS_DIR}/infra/vps/deploy.sh"
