#!/usr/bin/env bash
set -euo pipefail
# ---------------------------------------------------------------------------
# nginx-switch-sidako.sh — jadikan SIDAKO (tanatidung, :3001) pemilik IP utama
# dan nonaktifkan situs KTT (dukcapil, Laravel).
#
# Dijalankan DI SERVER (root@76.13.19.247). Idempoten & punya rollback:
#   - backup config ke /root/nginx-backup-<stamp>/ sebelum menyentuh apa pun
#   - kalau `nginx -t` gagal, semua dikembalikan dan reload TIDAK dilakukan
#   - situs dukcapil hanya dilepas symlink-nya (sites-available tetap utuh)
#
# Kembalikan seperti semula (manual):
#   cp /root/nginx-backup-<stamp>/tanatidung /etc/nginx/sites-available/tanatidung
#   ln -s /etc/nginx/sites-available/dukcapil /etc/nginx/sites-enabled/dukcapil
#   nginx -t && systemctl reload nginx
# ---------------------------------------------------------------------------

SA=/etc/nginx/sites-available
SE=/etc/nginx/sites-enabled
STAMP="$(date +%Y%m%d-%H%M%S)"
BK="/root/nginx-backup-$STAMP"

[[ -f "$SA/tanatidung" ]] || { echo "[err] $SA/tanatidung tidak ada"; exit 1; }

mkdir -p "$BK"
cp -a "$SA/tanatidung" "$BK/tanatidung"
[[ -e "$SE/dukcapil" ]] && cp -aL "$SE/dukcapil" "$BK/dukcapil" || true
echo "[ok] backup di $BK"

rollback() {
  echo "[rollback] nginx -t gagal — kembalikan config"
  cp -a "$BK/tanatidung" "$SA/tanatidung"
  if [[ -f "$BK/dukcapil" && ! -e "$SE/dukcapil" ]]; then
    ln -s "$SA/dukcapil" "$SE/dukcapil"
  fi
  nginx -t
  exit 1
}

# 1) tanatidung -> default_server (hanya listen port 80 yang belum punya)
if grep -qE 'listen[^;]*default_server' "$SA/tanatidung"; then
  echo "[skip] tanatidung sudah default_server"
else
  sed -i -E 's/^(\s*listen\s+80)(\s*;)/\1 default_server\2/; s/^(\s*listen\s+\[::\]:80)(\s*;)/\1 default_server\2/' "$SA/tanatidung"
  grep -nE 'listen' "$SA/tanatidung"
fi

# 2) pastikan tak ada default_server ganda dari situs lain yang masih aktif
LAIN="$(grep -rlE 'listen[^;]*default_server' "$SE"/ 2>/dev/null | grep -v tanatidung || true)"
if [[ -n "$LAIN" ]]; then
  echo "[warn] default_server lain masih aktif: $LAIN"
  echo "       (kalau itu dukcapil, langkah 3 melepasnya)"
fi

# 3) nonaktifkan situs KTT (dukcapil) — lepas symlink saja
if [[ -e "$SE/dukcapil" ]]; then
  rm -f "$SE/dukcapil"
  echo "[ok] symlink dukcapil dilepas"
else
  echo "[skip] dukcapil sudah tidak enabled"
fi

# 4) validasi + reload
nginx -t || rollback
systemctl reload nginx
echo "[ok] nginx reloaded"

# 5) verifikasi dari dalam server
echo; echo "=== verifikasi ==="
echo "--- raw IP (harus SIDAKO) ---"
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: 76.13.19.247' http://127.0.0.1/ || true
curl -s http://127.0.0.1/ -H 'Host: 76.13.19.247' | grep -ioE 'sidako|tana ?tidung|saibatin|ktt' | sort -u | head -5 || true
echo "--- saibatin nip.io (harus tetap saibatin) ---"
curl -s http://127.0.0.1/ -H 'Host: saibatin.76.13.19.247.nip.io' | grep -ioE 'saibatin|sidako' | sort -u | head -3 || true
