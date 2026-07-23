#!/usr/bin/env bash
#
# cpanel-apply.sh — pasang paket deploy DI SERVER cPanel (aman, bisa rollback).
# Jalankan DARI DALAM app-root (folder yang jadi "Application root" di cPanel
# Setup Node.js App, tempat .env & public berada).
#
# Pemakaian:
#   cd ~/path/ke/app-root
#   bash cpanel-apply.sh ~/saibatin-deploy.tar.gz [https://domain/api/health]
#
# Yang diganti  : .next  node_modules  server.js  app.js  package.json  tessdata
# Yang DIJAGA   : .env  public/ (uploads warga)  storage/   ← tidak disentuh
#
set -euo pipefail

TARBALL="${1:-}"
HEALTH_URL="${2:-}"
TS="$(date +%Y%m%d-%H%M%S)"
BAK=".backup-$TS"

[ -n "$TARBALL" ] && [ -f "$TARBALL" ] || { echo "✗ Tarball tidak ditemukan: '$TARBALL'"; exit 1; }

echo "▶ App-root : $(pwd)"
if [ ! -f .env ]; then
  echo "⚠  .env TIDAK ADA di sini. App tak akan konek DB."
  echo "   Pastikan kamu di app-root yang benar, atau buat .env dulu. Batal."
  exit 1
fi

echo "▶ Backup kode lama → $BAK/ (data .env/public/storage TIDAK disentuh)"
mkdir -p "$BAK"
for f in .next node_modules server.js app.js package.json tessdata; do
  [ -e "$f" ] && mv "$f" "$BAK/" || true
done

echo "▶ Ekstrak paket baru…"
tar -xzf "$TARBALL"

# Sanity: pastikan client Rust-free (tak ada engine .so) — kalau ada, rollback.
if ls node_modules/.prisma/client/*.so.node >/dev/null 2>&1; then
  echo "✗ Paket mengandung engine Rust — salah build. Rollback."
  rm -rf .next node_modules server.js app.js package.json tessdata
  mv "$BAK"/* . 2>/dev/null || true
  exit 1
fi

echo "▶ Restart Passenger…"
mkdir -p tmp && touch tmp/restart.txt

echo "▶ Tunggu app bangun & cek /api/health…"
OK=""
if [ -n "$HEALTH_URL" ]; then
  for i in $(seq 1 20); do
    R="$(curl -s -m 5 "$HEALTH_URL" || true)"
    case "$R" in
      *'"db":"ok"'*) echo "  ✓ HEALTH OK: $R"; OK=1; break ;;
      *) sleep 2 ;;
    esac
  done
fi

echo ""
if [ -n "$OK" ]; then
  echo "✅ DEPLOY SUKSES. Backup lama ada di $BAK/ (boleh dihapus bila sudah yakin)."
else
  echo "ℹ  Deploy terpasang. Verifikasi manual:"
  echo "     curl -s ${HEALTH_URL:-https://DOMAINMU/api/health}"
  echo "   Harus muncul \"db\":\"ok\"."
  echo ""
  echo "↩  ROLLBACK bila rusak:"
  echo "     rm -rf .next node_modules server.js app.js package.json tessdata"
  echo "     mv $BAK/* .  &&  touch tmp/restart.txt"
fi
