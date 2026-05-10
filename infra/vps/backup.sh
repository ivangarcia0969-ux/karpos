#!/usr/bin/env bash
# Karpos — pg_dump nightly del Postgres dedicado de Karpos.
# Cron sugerido: 0 3 * * * /opt/karpos/infra/vps/backup.sh >> /var/log/karpos-backup.log 2>&1
set -euo pipefail

KARPOS_DIR="/opt/karpos"
BACKUP_DIR="/var/backups/karpos"
RETENTION_DAYS=14
ENV_FILE="${KARPOS_DIR}/.env"

# shellcheck disable=SC1090
set -a; . "${ENV_FILE}"; set +a

mkdir -p "${BACKUP_DIR}"
TS="$(date -u +%Y%m%d-%H%M%SZ)"
OUT="${BACKUP_DIR}/karpos-${TS}.sql.gz"

docker exec karpos-postgres pg_dump \
  -U "${POSTGRES_USER:-karpos}" \
  -d "${POSTGRES_DB:-karpos}" \
  --no-owner --no-privileges --clean --if-exists \
  | gzip -9 > "${OUT}"

chmod 600 "${OUT}"

# Retención
find "${BACKUP_DIR}" -name 'karpos-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "[$(date -u +%FT%TZ)] backup → ${OUT} ($(du -h "${OUT}" | cut -f1))"
