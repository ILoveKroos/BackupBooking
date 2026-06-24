#!/usr/bin/env bash
#
# Cập nhật code sau khi đã chạy install.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/deploy.env"
SECRETS_FILE="${SCRIPT_DIR}/.secrets.generated"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

if [[ -f "${SECRETS_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${SECRETS_FILE}"
fi

INSTALL_DIR="${INSTALL_DIR:-/opt/bookingsalon}"
WEB_ROOT="${WEB_ROOT:-/var/www/bookingsalon}"
GIT_BRANCH="${GIT_BRANCH:-main}"

log() { echo "[update] $*"; }
die() { echo "[update] ERROR: $*" >&2; exit 1; }

[[ -d "${INSTALL_DIR}/.git" ]] || die "Chưa cài đặt. Chạy install.sh trước."

log "Pull code mới..."
git -C "${INSTALL_DIR}" fetch origin
git -C "${INSTALL_DIR}" checkout "${GIT_BRANCH}"
git -C "${INSTALL_DIR}" pull origin "${GIT_BRANCH}"

log "Cập nhật backend..."
cd "${INSTALL_DIR}/backend"
npm install --legacy-peer-deps --no-audit --no-fund
pm2 restart booking-api

log "Build frontend..."
cd "${INSTALL_DIR}/frontend"
npm install --legacy-peer-deps --no-audit --no-fund
REACT_APP_API_URL=/api npm run build
rsync -a --delete "${INSTALL_DIR}/frontend/build/" "${WEB_ROOT}/"

log "Reload Nginx..."
nginx -t && systemctl reload nginx

log "=== Cập nhật xong ==="
log "  pm2 logs booking-api --lines 30"
