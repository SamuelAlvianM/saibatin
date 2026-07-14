#!/usr/bin/env bash
set -euo pipefail
# ---------------------------------------------------------------------------
# deploy.sh — Build saibatin-platform di LOKAL, kirim .next/standalone ke VPS,
# jalankan via PM2 di belakang Nginx. Source TIDAK dikirim (hanya output build).
#
# Jalankan dari root saibatin-platform:
#   bash deploy/deploy.sh                 # build + kirim + restart
#   bash deploy/deploy.sh --provision     # (sekali) pasang Node/PM2/MySQL/Nginx
#   bash deploy/deploy.sh --db-setup      # buat DB + push skema + seed (via tunnel)
#   bash deploy/deploy.sh --skip-build    # pakai build yang sudah ada
#   REMOTE=root@76.13.19.247 bash deploy/deploy.sh   # tanpa alias SSH
#
# Target SSH: alias `saibatin` (di ~/.ssh/config) atau REMOTE=root@IP.
# ---------------------------------------------------------------------------

REMOTE="${REMOTE:-saibatin}"
REMOTE_DIR="/root/saibatin-platform"
TUNNEL_PORT="${TUNNEL_PORT:-33061}"
SHARP_VER="0.35.3"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROVISION=false; DB_SETUP=false; SKIP_BUILD=false; SKIP_SEED=false
for a in "$@"; do
  case "$a" in
    --provision) PROVISION=true ;;
    --db-setup)  DB_SETUP=true ;;
    --skip-build) SKIP_BUILD=true ;;
    --skip-seed)  SKIP_SEED=true ;;
  esac
done

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
err()  { echo -e "${RED}[error]${NC} $*"; exit 1; }

[[ -f deploy/.env ]] || err "deploy/.env tidak ada. Salin dari deploy/.env.example lalu isi."
[[ -f deploy/ecosystem.config.cjs ]] || err "deploy/ecosystem.config.cjs tidak ada."

# ============================================================ BUILD
if [[ "$SKIP_BUILD" == false ]]; then
  log "prisma generate (sertakan engine Linux)..."
  npx prisma generate || err "prisma generate gagal (stop dev server dulu bila EPERM)."
  # WAJIB --webpack: build Turbopack + serverExternalPackages + standalone menghasilkan
  # nama modul ber-hash yang gagal di-resolve saat runtime (sharp/@prisma/client).
  log "next build --webpack (standalone)..."
  npx next build --webpack || err "build gagal."
else
  warn "Build di-skip (--skip-build)."
fi
[[ -d .next/standalone ]] || err ".next/standalone tidak ada — jangan pakai --skip-build."

# --- Verifikasi engine Prisma Linux ikut ter-bundle ---
if ! find .next/standalone -name "libquery_engine-debian-openssl-3.0.x.so.node" | grep -q .; then
  warn "Engine Prisma Linux belum terlihat di standalone — cek binaryTargets di schema.prisma."
fi

# ============================================================ ASSEMBLE BUNDLE
log "Rakit bundle standalone (static + public + tessdata)..."
rm -rf .next/standalone/.next/static .next/standalone/public .next/standalone/tessdata
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
[[ -d public ]] && cp -r public .next/standalone/public
[[ -d tessdata ]] && cp -r tessdata .next/standalone/tessdata
# PENTING: Next standalone menyalin .env/.env.local DEV ke bundle → buang, agar
# tidak menimpa .env produksi di server (dev pakai root@localhost).
rm -f .next/standalone/.env .next/standalone/.env.local .next/standalone/.env.production \
      .next/standalone/.env.development .next/standalone/.env.example

# ============================================================ KIRIM CONFIG
log "Kirim ecosystem, .env, & skrip server..."
ssh "$REMOTE" "mkdir -p '$REMOTE_DIR/deploy'"
scp deploy/ecosystem.config.cjs "$REMOTE:$REMOTE_DIR/"
scp deploy/.env                 "$REMOTE:$REMOTE_DIR/.env"
scp deploy/server-bootstrap.sh deploy/server-db-setup.sh deploy/nginx-saibatin.conf "$REMOTE:$REMOTE_DIR/deploy/"

# ============================================================ PROVISION (sekali)
if [[ "$PROVISION" == true ]]; then
  log "Provisioning server (Node/PM2/MySQL/Nginx)..."
  ssh "$REMOTE" "bash '$REMOTE_DIR/deploy/server-bootstrap.sh'"
fi

# ============================================================ DB SETUP
if [[ "$DB_SETUP" == true ]]; then
  log "Buat DB + user di server..."
  ssh "$REMOTE" "bash '$REMOTE_DIR/deploy/server-db-setup.sh'"

  log "Buka SSH tunnel & push skema + seed dari lokal (prisma tetap lokal)..."
  set -a; source deploy/.env; set +a
  # Tanpa ControlMaster (tak didukung Windows OpenSSH): background job + kill via PID.
  ssh -NL "${TUNNEL_PORT}:127.0.0.1:3306" "$REMOTE" &
  TUNNEL_PID=$!
  trap 'kill $TUNNEL_PID 2>/dev/null || true' EXIT
  sleep 3 # beri waktu tunnel siap
  export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${TUNNEL_PORT}/${DB_NAME}"
  npx prisma db push --skip-generate || err "prisma db push gagal (cek auth MySQL)."
  if [[ "$SKIP_SEED" == false ]]; then
    log "Seed data awal (admin, referensi)..."
    npm run db:seed || warn "seed gagal — lanjut (bisa diulang)."
  fi
  kill $TUNNEL_PID 2>/dev/null || true
  trap - EXIT
fi

# ============================================================ TRANSFER BUNDLE
log "Transfer bundle standalone ke server..."
tar czf - -C .next/standalone . | ssh "$REMOTE" "mkdir -p '$REMOTE_DIR' && tar xzf - -C '$REMOTE_DIR'"

# .env produksi FINAL (setelah transfer, agar tak tertimpa bundle): secrets +
# NEXT_PUBLIC_ dari build lokal (deploy/.env menang untuk yg bentrok, mis. APP_URL).
log "Pasang .env produksi final di server..."
TMP_ENV="$(mktemp)"
{ cat deploy/.env; echo; grep '^NEXT_PUBLIC_' .env 2>/dev/null || true; } > "$TMP_ENV"
scp "$TMP_ENV" "$REMOTE:$REMOTE_DIR/.env"
rm -f "$TMP_ENV"
ssh "$REMOTE" "rm -f '$REMOTE_DIR/.env.local' '$REMOTE_DIR/.env.production' '$REMOTE_DIR/.env.development'"

# ============================================================ FINALIZE + PM2
log "Finalisasi di server (sharp Linux, uploads, restart PM2)..."
ssh "$REMOTE" bash <<EOF
set -e
cd '$REMOTE_DIR'
if [ ! -d node_modules/@img/sharp-linux-x64 ]; then
  echo "[server] pasang binary sharp Linux..."
  npm install --os=linux --cpu=x64 --libc=glibc "sharp@$SHARP_VER" --no-audit --no-fund --prefix . 2>/dev/null \
    || npm install "sharp@$SHARP_VER" --no-audit --no-fund || true
fi
mkdir -p storage/uploads app/uploads
set -a; source .env; set +a
command -v pm2 >/dev/null || npm install -g pm2
# --update-env WAJIB: tanpa ini PM2 memakai ulang env dari start sebelumnya,
# sehingga perubahan nilai di deploy/.env (mis. ganti FONNTE_TOKEN) tak terpakai.
pm2 startOrRestart ecosystem.config.cjs --env production --update-env
pm2 save
pm2 status
EOF

log "Selesai! Buka: http://saibatin.76.13.19.247.nip.io  (KTT/dukcapil di IP mentah tetap jalan)"
