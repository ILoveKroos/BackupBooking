#!/usr/bin/env bash
#
# Smart Booking Salon — VPS install (1GB RAM, no Docker)
# Domain : bookingsalon.tino.page
# Repo   : https://github.com/ILoveKroos/BackupBooking
#
# Usage (on VPS as root):
#   curl -fsSL https://raw.githubusercontent.com/ILoveKroos/BackupBooking/main/scripts/deploy/install.sh -o install.sh
#   # OR after git clone:
#   cd /opt/BackupBooking/scripts/deploy && cp deploy.env.example deploy.env && nano deploy.env && bash install.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/deploy.env"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

DOMAIN="${DOMAIN:-bookingsalon.tino.page}"
GIT_REPO="${GIT_REPO:-https://github.com/ILoveKroos/BackupBooking.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"
INSTALL_DIR="${INSTALL_DIR:-/opt/bookingsalon}"
WEB_ROOT="${WEB_ROOT:-/var/www/bookingsalon}"
MYSQL_APP_USER="${MYSQL_APP_USER:-bookingsalon}"
MYSQL_DB_NAME="${MYSQL_DB_NAME:-booking_system}"
SWAP_SIZE="${SWAP_SIZE:-2G}"
NODE_MAJOR="${NODE_MAJOR:-20}"

log() { echo "[deploy] $*"; }
die() { echo "[deploy] ERROR: $*" >&2; exit 1; }

require_root() {
  [[ "${EUID:-$(id -u)}" -eq 0 ]] || die "Chạy script này bằng root: sudo bash install.sh"
}

rand_secret() {
  openssl rand -hex 32 2>/dev/null || tr -dc 'A-Za-z0-9' </dev/urandom | head -c 64
}

urlencode_mysql_password() {
  python3 - <<'PY' "$1"
import sys, urllib.parse
print(urllib.parse.quote(sys.argv[1], safe=""))
PY
}

SECRETS_FILE="${SCRIPT_DIR}/.secrets.generated"
if [[ -f "${SECRETS_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${SECRETS_FILE}"
fi

MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-$(rand_secret)}"
MYSQL_APP_PASSWORD="${MYSQL_APP_PASSWORD:-$(rand_secret)}"
JWT_SECRET="${JWT_SECRET:-$(rand_secret)}"

require_root

mysql_root() {
  if mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
    mysql -u root "$@"
  else
    mysql "$@"
  fi
}

log "=== Smart Booking Salon — Install ==="
log "Domain     : ${DOMAIN}"
log "Install dir: ${INSTALL_DIR}"
log "Git repo   : ${GIT_REPO} (${GIT_BRANCH})"

export DEBIAN_FRONTEND=noninteractive

# ── 1. System packages ──────────────────────────────────────────────────────────
log "Cài package hệ thống..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  nginx mysql-server git curl ufw certbot python3-certbot-nginx \
  build-essential python3 openssl rsync

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt "${NODE_MAJOR}" ]]; then
  log "Cài Node.js ${NODE_MAJOR}.x..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  log "Cài PM2..."
  npm install -g pm2
fi

# ── 2. Swap (1GB RAM) ───────────────────────────────────────────────────────
if [[ ! -f /swapfile ]]; then
  log "Tạo swap ${SWAP_SIZE}..."
  fallocate -l "${SWAP_SIZE}" /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
else
  log "Swap đã tồn tại, bỏ qua."
fi

# ── 3. Firewall ───────────────────────────────────────────────────────────────
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 80/tcp >/dev/null 2>&1 || true
ufw allow 443/tcp >/dev/null 2>&1 || true
echo "y" | ufw enable >/dev/null 2>&1 || true

# ── 4. MySQL tune + database ────────────────────────────────────────────────
log "Cấu hình MySQL..."
cp "${SCRIPT_DIR}/mysql-low-memory.cnf" /etc/mysql/mysql.conf.d/99-bookingsalon-low-memory.cnf
systemctl enable mysql
systemctl restart mysql

log "Tạo database và user..."
mysql_root <<SQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DB_NAME}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_APP_USER}'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
ALTER USER '${MYSQL_APP_USER}'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${MYSQL_DB_NAME}\`.* TO '${MYSQL_APP_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

# ── 5. Clone / update source ──────────────────────────────────────────────
log "Clone source code..."
mkdir -p "$(dirname "${INSTALL_DIR}")"
if [[ -d "${INSTALL_DIR}/.git" ]]; then
  log "Repo đã tồn tại — git pull..."
  git -C "${INSTALL_DIR}" fetch origin
  git -C "${INSTALL_DIR}" checkout "${GIT_BRANCH}"
  git -C "${INSTALL_DIR}" pull origin "${GIT_BRANCH}"
else
  git clone --branch "${GIT_BRANCH}" --depth 1 "${GIT_REPO}" "${INSTALL_DIR}"
fi

SQL_FILE="${INSTALL_DIR}/database/001-recreate_booking_system.sql"
[[ -f "${SQL_FILE}" ]] || die "Không tìm thấy ${SQL_FILE}"

TABLE_COUNT="$(mysql -u "${MYSQL_APP_USER}" -p"${MYSQL_APP_PASSWORD}" -N -e \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${MYSQL_DB_NAME}';" 2>/dev/null || echo 0)"

if [[ "${TABLE_COUNT}" -eq 0 ]]; then
  log "Import schema lần đầu..."
  mysql -u "${MYSQL_APP_USER}" -p"${MYSQL_APP_PASSWORD}" "${MYSQL_DB_NAME}" < "${SQL_FILE}"
else
  log "Database đã có ${TABLE_COUNT} bảng — bỏ qua import schema (dùng update.sh nếu chỉ cần deploy code)."
fi

# ── 6. Backend ──────────────────────────────────────────────────────────────
log "Cài backend..."
cd "${INSTALL_DIR}/backend"
npm install --legacy-peer-deps --no-audit --no-fund

ENCODED_DB_PASS="$(urlencode_mysql_password "${MYSQL_APP_PASSWORD}")"

cat > "${INSTALL_DIR}/backend/.env" <<EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d

FRONTEND_URL=https://${DOMAIN}
FRONTEND_URLS=https://${DOMAIN}
BACKEND_PUBLIC_URL=https://${DOMAIN}/api
FRONTEND_PAYMENT_RETURN_URL=https://${DOMAIN}/payment-result

DATABASE_URL=mysql://${MYSQL_APP_USER}:${ENCODED_DB_PASS}@127.0.0.1:3306/${MYSQL_DB_NAME}

AUTOMATION_RUN_ON_STARTUP=false
GEMINI_ENABLED=false
GENERAL_RATE_LIMIT_MAX=3000
EOF

mkdir -p "${INSTALL_DIR}/backend/uploads"

if pm2 describe booking-api >/dev/null 2>&1; then
  pm2 restart booking-api --update-env
else
  pm2 start src/server.js --name booking-api --max-memory-restart 300M
fi
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# ── 7. Frontend build ─────────────────────────────────────────────────────
log "Build frontend..."
cd "${INSTALL_DIR}/frontend"
npm install --legacy-peer-deps --no-audit --no-fund
REACT_APP_API_URL=/api npm run build

mkdir -p "${WEB_ROOT}"
rsync -a --delete "${INSTALL_DIR}/frontend/build/" "${WEB_ROOT}/"

# ── 8. Nginx ───────────────────────────────────────────────────────────────
log "Cấu hình Nginx..."
cp "${SCRIPT_DIR}/nginx-bookingsalon.conf" /etc/nginx/sites-available/bookingsalon
ln -sf /etc/nginx/sites-available/bookingsalon /etc/nginx/sites-enabled/bookingsalon
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

# ── 9. SSL ────────────────────────────────────────────────────────────────
if [[ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]]; then
  log "Cài SSL Let's Encrypt..."
  CERTBOT_ARGS=(--nginx -d "${DOMAIN}" --non-interactive --agree-tos)
  if [[ -n "${CERTBOT_EMAIL:-}" ]]; then
    CERTBOT_ARGS+=(--email "${CERTBOT_EMAIL}")
  else
    CERTBOT_ARGS+=(--register-unsafely-without-email)
  fi
  certbot "${CERTBOT_ARGS[@]}" || log "Certbot thất bại — kiểm tra DNS A record trỏ về VPS rồi chạy: certbot --nginx -d ${DOMAIN}"
else
  log "SSL certificate đã tồn tại."
fi

# ── 10. PM2 log rotate ───────────────────────────────────────────────────
pm2 install pm2-logrotate >/dev/null 2>&1 || true
pm2 set pm2-logrotate:max_size 10M >/dev/null 2>&1 || true

# ── 11. Save secrets for re-deploy ────────────────────────────────────
cat > "${SECRETS_FILE}" <<EOF
# Generated $(date -Iseconds) — GIỮ BÍ MẬT, không commit lên Git
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_APP_USER=${MYSQL_APP_USER}
MYSQL_APP_PASSWORD=${MYSQL_APP_PASSWORD}
JWT_SECRET=${JWT_SECRET}
DOMAIN=${DOMAIN}
EOF
chmod 600 "${SECRETS_FILE}"

# ── Done ────────────────────────────────────────────────────────────────
log ""
log "=== HOÀN TẤT ==="
log "Website : https://${DOMAIN}"
log "API     : https://${DOMAIN}/api/"
log "Secrets : ${SECRETS_FILE}"
log ""
log "Tài khoản demo (nếu có trong seed SQL):"
log "  Admin    : admin@beautybook.com / Beauty123"
log "  Khách    : khachhang@beautybook.com / Beauty123"
log ""
log "Kiểm tra:"
log "  pm2 status"
log "  pm2 logs booking-api --lines 50"
log "  curl -s http://127.0.0.1:5000/"
log ""
log "Cập nhật code sau này: bash ${SCRIPT_DIR}/update.sh"
