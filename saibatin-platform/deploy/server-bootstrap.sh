#!/usr/bin/env bash
set -euo pipefail
# Provisioning di server (Ubuntu 22.04, root) — AMAN untuk server SHARED (sudah ada
# app "dukcapil"/KTT: Nginx + PHP-FPM + MySQL db u179716481_dbktt001).
# Prinsip: ADDITIF saja. TIDAK menyentuh dukcapil, TIDAK install/rekonfig MySQL,
# TIDAK hapus site lain, TIDAK pakai default_server. Idempoten.
# Dipakai oleh: deploy.sh --provision.

log()  { echo -e "\033[0;32m[bootstrap]\033[0m $*"; }
warn() { echo -e "\033[1;33m[warn]\033[0m $*"; }

export DEBIAN_FRONTEND=noninteractive

# --- Node.js 20 (NodeSource) — belum ada di server, install bersih ---
if ! command -v node &>/dev/null || [[ "$(node -v 2>/dev/null | cut -c2-3)" -lt 20 ]]; then
  log "Pasang Node.js 20 (tak mengganggu PHP/nginx/mysql)..."
  # Terima perubahan label repo (mis. ondrej/php dipakai KTT) agar apt update tak gagal.
  apt-get update --allow-releaseinfo-change || true
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get remove -y nodejs nodejs-doc libnode72 >/dev/null 2>&1 || true
  apt-get install -y nodejs
fi
log "Node: $(node -v), npm: $(npm -v)"

# --- PM2 ---
command -v pm2 &>/dev/null || { log "Pasang PM2..."; npm install -g pm2; }
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# --- MySQL: JANGAN install/rekonfig (sudah ada & dipakai KTT). Hanya verifikasi. ---
if command -v mysql &>/dev/null && systemctl is-active --quiet mysql; then
  log "MySQL sudah ada & aktif — TIDAK disentuh (DB KTT aman)."
else
  warn "MySQL tidak terdeteksi aktif — hentikan & cek manual sebelum lanjut."
fi

# --- Nginx: TAMBAH site saibatin saja. JANGAN hapus default/dukcapil. ---
if ! command -v nginx &>/dev/null; then
  warn "Nginx belum ada (aneh untuk server ini) — pasang..."
  apt-get install -y nginx
fi
if [[ -f /root/saibatin-platform/deploy/nginx-saibatin.conf ]]; then
  log "Tambah site Nginx 'saibatin' (host nip.io; site lain tak diubah)..."
  cp /root/saibatin-platform/deploy/nginx-saibatin.conf /etc/nginx/sites-available/saibatin
  ln -sf /etc/nginx/sites-available/saibatin /etc/nginx/sites-enabled/saibatin
  # Uji dulu; reload HANYA jika lulus (agar dukcapil tak ikut down).
  if nginx -t; then
    systemctl reload nginx
    log "Nginx reload OK — dukcapil tetap jalan, saibatin ditambahkan."
  else
    warn "nginx -t GAGAL — batalkan site saibatin agar tidak merusak yang lain."
    rm -f /etc/nginx/sites-enabled/saibatin
    exit 1
  fi
fi

# --- Firewall: pastikan 80 & 22 terbuka bila ufw aktif (tak menutup apa pun) ---
if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp || true; ufw allow 22/tcp || true
fi

log "✅ Bootstrap AMAN selesai (Node/PM2 + site saibatin). KTT tidak disentuh."
