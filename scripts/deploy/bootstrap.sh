#!/usr/bin/env bash
#
# Bootstrap — chạy 1 lần trên VPS (root)
# curl -fsSL ... hoặc:
#   bash bootstrap.sh
#
set -euo pipefail

GIT_REPO="${GIT_REPO:-https://github.com/ILoveKroos/BackupBooking.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"
CLONE_DIR="${CLONE_DIR:-/opt/BackupBooking}"

echo "[bootstrap] Clone ${GIT_REPO} → ${CLONE_DIR}"
apt-get update -qq
apt-get install -y -qq git

mkdir -p "$(dirname "${CLONE_DIR}")"
if [[ -d "${CLONE_DIR}/.git" ]]; then
  git -C "${CLONE_DIR}" pull origin "${GIT_BRANCH}"
else
  git clone --branch "${GIT_BRANCH}" --depth 1 "${GIT_REPO}" "${CLONE_DIR}"
fi

cd "${CLONE_DIR}/scripts/deploy"
[[ -f deploy.env ]] || cp deploy.env.example deploy.env
chmod +x install.sh update.sh
bash install.sh
