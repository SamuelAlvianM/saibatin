# Deploy saibatin-platform ke VPS (PM2 + Nginx, MySQL)

Build dilakukan di **lokal**; hanya **output build** (`.next/standalone`) yang dikirim
ke server — source code tidak diunggah.

## 0. Sekali saja: akses SSH tanpa password
Server baru hanya menerima password. Otorisasi key kamu sekali (jalankan di Git Bash,
masukkan password root saat diminta):

```bash
cat ~/.ssh/id_ed25519.pub | ssh root@76.13.19.247 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Lalu tambahkan alias ke `~/.ssh/config` (biar bisa `ssh saibatin`):

```
Host saibatin
    HostName 76.13.19.247
    User root
    IdentityFile ~/.ssh/id_ed25519
```

Uji: `ssh saibatin 'echo ok'` → harus `ok` tanpa password.
> Alternatif tanpa alias: jalankan deploy dengan `REMOTE=root@76.13.19.247 bash deploy/deploy.sh`.

## 1. Siapkan env runtime
```bash
cp deploy/.env.example deploy/.env
# isi DB_PASSWORD, DATABASE_URL (pakai password yg sama), AUTH_SECRET (openssl rand -hex 32),
# RECAPTCHA_V3_SECRET_KEY, MAIL_* (opsional).
```

## 2. Provisioning server (sekali)
Pasang Node 20, PM2, MySQL, Nginx + reverse proxy:
```bash
bash deploy/deploy.sh --provision --skip-build
```

## 3. Setup database (sekali / saat skema berubah)
Buat DB + user di server, lalu push skema & seed dari lokal via SSH tunnel:
```bash
bash deploy/deploy.sh --db-setup --skip-build
```

## 4. Deploy (build + kirim + restart)
```bash
bash deploy/deploy.sh
```
> Tip: langkah 2–4 bisa digabung pertama kali:
> `bash deploy/deploy.sh --provision --db-setup`

## Hasil
- App live di **http://76.13.19.247** (atau **http://saibatin.76.13.19.247.nip.io** —
  subdomain gratis via nip.io, tanpa domain).
- Update berikutnya cukup `bash deploy/deploy.sh` (tanpa flag).

## Catatan
- **sharp** & **engine Prisma** bersifat native/OS-specific. Engine Prisma Linux ikut
  dari build lokal (via `binaryTargets` di schema). Binary **sharp Linux** dipasang
  otomatis di server (± 9 MB, bukan source).
- **Uploads** (`storage/uploads`, `app/uploads`) dibuat & dipertahankan di server;
  redeploy tidak menimpanya.
- Sebelum deploy, **hentikan `npm run dev`** agar `prisma generate` tidak kena file-lock
  (EPERM) di Windows.
- `deploy/.env` berisi rahasia → **gitignored**, jangan commit.
- SSL/domain nanti: arahkan A record domain ke IP, lalu `certbot --nginx`.
