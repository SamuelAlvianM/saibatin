#!/usr/bin/env bash
#
# deploy.sh — BANGUN paket deploy cPanel dari Windows (Git Bash).
#
# Server cPanel "damar" TAK BISA build (LVE: ulimit -u=35, OOM), jadi semua
# dikerjakan di sini lalu dikirim sebagai 1 tarball berisi KODE saja (~44M).
#
# TIGA PELAJARAN MAHAL yang dikunci di script ini:
#   1) WAJIB `next build --webpack`. Turbopack + serverExternalPackages +
#      standalone = tracing rusak: driver mariadb TIDAK ikut, dan seluruh
#      project (1.6G, termasuk public/uploads) malah ter-copy.
#   2) WAJIB tukar binary sharp ke versi LINUX. node_modules di-install di
#      Windows → `@img/sharp-win32-x64` → di server Linux gagal load → Passenger
#      "something went wrong". Ini beda utama vs VPS (di sana npm install jalan
#      di Linux). sharp satu-satunya paket native; sisanya JS/wasm.
#   3) WAJIB wrapper app.js. server.js standalone tidak membaca .env, dan
#      Passenger memakai `app.js` sebagai startup file default.
#
# Pemakaian:  bash deploy.sh
# Output   :  saibatin-deploy.tar.gz
#
set -euo pipefail
cd "$(dirname "$0")"

OUT="saibatin-deploy.tar.gz"
SA=".next/standalone"
CACHE=".deploy-cache/sharp-linux"
SHARP_VER="0.35.3"

echo "▶ 1/6  prisma generate (engineType=client, Rust-free)…"
npx prisma generate >/dev/null

echo "▶ 2/6  next build --webpack  (JANGAN Turbopack)…"
# Server tes/dev yang belum mati akan mengunci .next/standalone → build GAGAL
# dengan EBUSY, dan kegagalannya mudah terlewat. Bersihkan lebih dulu.
if ! rm -rf "$SA" 2>/dev/null; then
  echo "✗ .next/standalone terkunci (ada proses node yang masih jalan)."
  echo "  Tutup server dev/tes lalu ulangi. Cek: powershell 'Get-Process node'"
  exit 1
fi
npx next build --webpack

[ -d "$SA" ] || { echo "✗ .next/standalone tidak ada. Batal."; exit 1; }

echo "▶ 3/6  Melengkapi chain driver adapter Prisma…"
mkdir -p "$SA/node_modules/@prisma"
for p in mariadb denque iconv-lite lru-cache; do
  [ -d "$SA/node_modules/$p" ] || cp -r "node_modules/$p" "$SA/node_modules/" 2>/dev/null || true
done
for p in adapter-mariadb driver-adapter-utils debug; do
  [ -d "$SA/node_modules/@prisma/$p" ] || cp -r "node_modules/@prisma/$p" "$SA/node_modules/@prisma/" 2>/dev/null || true
done
# Build webpack TIDAK menyertakan query_compiler_bg.wasm → Prisma ENOENT saat
# query. Salin .prisma/client hasil generate secara utuh.
rm -rf "$SA/node_modules/.prisma"; cp -r "node_modules/.prisma" "$SA/node_modules/.prisma"
[ -f "$SA/node_modules/.prisma/client/query_compiler_bg.wasm" ] || { echo "✗ query_compiler wasm hilang. Batal."; exit 1; }
[ -d "$SA/node_modules/mariadb" ] || { echo "✗ mariadb tidak ada di bundle. Batal."; exit 1; }
if ls "$SA"/node_modules/.prisma/client/*.so.node >/dev/null 2>&1; then
  echo "✗ Ada engine Rust — engineType bukan 'client'. Batal."; exit 1
fi

echo "▶ 4/6  Tukar sharp Windows → Linux x64…"
if [ ! -d "$CACHE/node_modules/@img/sharp-linux-x64" ]; then
  echo "   (unduh sekali, di-cache di $CACHE)"
  rm -rf "$CACHE"; mkdir -p "$CACHE"; ( cd "$CACHE"
    npm init -y >/dev/null 2>&1
    npm install "@img/sharp-linux-x64" "@img/sharp-libvips-linux-x64" \
      --no-save --force --no-audit --no-fund >/dev/null 2>&1 )
fi
[ -d "$CACHE/node_modules/@img/sharp-linux-x64" ] || { echo "✗ Gagal ambil sharp Linux. Batal."; exit 1; }
# Terapkan ke SEMUA folder @img di bundle (next punya salinan bersarang sendiri).
find "$SA/node_modules" -type d -name "@img" | while read -r d; do
  rm -rf "$d/sharp-win32-x64"                       # binary Windows: buang
  cp -r "$CACHE/node_modules/@img/sharp-linux-x64"        "$d/" 2>/dev/null || true
  cp -r "$CACHE/node_modules/@img/sharp-libvips-linux-x64" "$d/" 2>/dev/null || true
done
find "$SA/node_modules" -name "*win32*.node" -delete 2>/dev/null || true
if find "$SA/node_modules" -name "*win32*" -type d | grep -q .; then
  echo "✗ Masih ada paket win32 di bundle. Batal."; exit 1
fi

echo "▶ 5/6  Static + wrapper app.js, buang .env dev…"
rm -rf "$SA/.next/static"; cp -r ".next/static" "$SA/.next/static"
[ -d tessdata ] && { rm -rf "$SA/tessdata"; cp -r tessdata "$SA/tessdata"; }
cp "deploy/standalone-app.js" "$SA/app.js"
rm -f "$SA"/.env "$SA"/.env.local "$SA"/.env.production "$SA"/.env.development "$SA"/.env.example

echo "▶ 6/6  Mengemas (KODE saja — tanpa public/uploads, storage, .env)…"
rm -f "$OUT"
tar -czf "$OUT" -C "$SA" .next node_modules server.js app.js package.json tessdata

echo ""
echo "✅ $OUT ($(ls -lh "$OUT" | awk '{print $5}'))"
echo "   Upload ke server → File Manager di public_html/saibatin-platform:"
echo "   rename node_modules→node_modules_OLD, .next→.next_OLD, server.js→server_OLD.js"
echo "   → Extract tarball → buat/refresh tmp/restart.txt → cek /api/health"
