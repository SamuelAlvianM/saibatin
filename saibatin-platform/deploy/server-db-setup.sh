#!/usr/bin/env bash
set -euo pipefail
# Buat DB + user MySQL di SERVER (root via socket, tanpa password). Idempoten.
# Dipanggil deploy.sh --db-setup. Skema & seed di-push dari LOKAL via SSH tunnel
# (prisma tetap di lokal — server tak perlu prisma).
# Butuh env: DB_NAME, DB_USER, DB_PASSWORD (di-source dari deploy/.env).

log() { echo -e "\033[0;32m[db]\033[0m $*"; }
cd "$(dirname "${BASH_SOURCE[0]}")/.."   # → /root/saibatin-platform
set -a; source .env; set +a

: "${DB_NAME:?DB_NAME kosong}"; : "${DB_USER:?DB_USER kosong}"; : "${DB_PASSWORD:?DB_PASSWORD kosong}"

log "Cek MySQL berjalan..."
systemctl is-active --quiet mysql || { echo "MySQL tidak aktif"; exit 1; }

log "Buat database '$DB_NAME' + user '$DB_USER' (host 127.0.0.1 & localhost)..."
mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

log "✅ DB & user siap. (Skema + seed di-push dari lokal via tunnel oleh deploy.sh.)"
