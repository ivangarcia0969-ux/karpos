#!/usr/bin/env bash
# Karpos VPS redeploy — idempotente. Pull + rebuild + migrate + restart.
# Uso: bash /opt/karpos/infra/vps/deploy.sh
set -euo pipefail

KARPOS_DIR="/opt/karpos"
ENV_FILE="${KARPOS_DIR}/.env"
COMPOSE="docker compose --env-file ${ENV_FILE} -f ${KARPOS_DIR}/infra/vps/docker-compose.prod.yml"

[ -f "${ENV_FILE}" ] || { echo "Falta ${ENV_FILE} — corré install.sh primero"; exit 1; }

echo "[1/4] git pull"
git -C "${KARPOS_DIR}" pull --ff-only

echo "[2/4] rebuild de imágenes (api, web, ml)"
${COMPOSE} build api web ml

echo "[3/4] migraciones idempotentes"
${COMPOSE} --profile once run --rm migrate

echo "[4/4] rolling restart"
${COMPOSE} up -d --no-deps api web ml

echo ""
echo "Health check:"
sleep 3
curl -fsS http://127.0.0.1:4100/health  | head -3 || echo "  api no responde"
curl -fsS http://127.0.0.1:3100/        | head -3 >/dev/null && echo "  web OK" || echo "  web no responde"
echo ""
echo "Listo. https://cultivarapp.karpos.surcoapp.tech"
