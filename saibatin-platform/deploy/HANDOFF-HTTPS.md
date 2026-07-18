# Handoff: Pasang HTTPS untuk domain resmi (Kominfo) di VPS

> Prompt siap-pakai untuk sesi/agen berikutnya. Tugas: membuat HTTPS valid
> (gembok, dipercaya browser) untuk domain resmi yang disediakan Kominfo,
> lalu menyesuaikan konfigurasi aplikasi. Berlaku untuk **saibatin** dan
> **sidako** yang berbagi satu VPS.

---

## ⚠️ Koreksi penting: mkcert BUKAN alat yang tepat di sini

Permintaan awal menyebut **mkcert**. Untuk kasus ini mkcert **tidak boleh dipakai**:

- **mkcert** membuat **CA lokal** yang hanya dipercaya di komputer tempat CA
  itu di-install. Browser pengunjung publik (HP warga, dll.) **tidak** mengenal
  CA itu → akan muncul peringatan **"Koneksi tidak aman / Not secure"**.
  mkcert hanya cocok untuk HTTPS di `localhost` saat development.
- Domain dari Kominfo bersifat **publik** dan (kata pemilik) **hanya menarik IP
  VPS** (A-record → `76.13.19.247`), artinya TLS diterminasi di VPS ini sendiri.
  Untuk itu WAJIB sertifikat yang dipercaya publik.
- Alat yang benar: **Let's Encrypt via `certbot`** — gratis, otomatis, dipercaya
  semua browser, auto-renew tiap 90 hari. Prasyaratnya persis sudah terpenuhi:
  domain publik yang resolve ke VPS + port 80 terbuka.

**Kesimpulan: pakai certbot, bukan mkcert.**

---

## Konteks server (VPS `root@76.13.19.247`)

Nginx melayani port 80 dengan beberapa app (reverse proxy ke Next.js / PHP):

| App | Proses | Port lokal | Akses sekarang |
|-----|--------|-----------|----------------|
| **saibatin** (Disdukcapil Pesisir Barat, Next.js) | PM2 `saibatin` | 3000 | `saibatin.76.13.19.247.nip.io` |
| **sidako** (Next.js) | PM2 `tanatidung` | 3001 | `tanahtidung.76.13.19.247.nip.io` + default raw IP |
| KTT (Laravel `dukcapil`) | php-fpm | — | dinonaktifkan |

- Config nginx: `/etc/nginx/sites-available/{saibatin,tanatidung}` (symlink di `sites-enabled`).
- `.env` runtime app saibatin di server: `/root/saibatin-platform/.env`.
- Deploy saibatin dari lokal Windows: `REMOTE=root@76.13.19.247 bash deploy/deploy.sh`.

## Prasyarat (verifikasi dulu, jangan diasumsikan)

1. Domain sudah resolve ke VPS:
   `dig +short <DOMAIN>` → harus `76.13.19.247`. Kalau belum, tunggu propagasi
   DNS / konfirmasi ke Kominfo. **certbot HTTP-01 akan gagal bila DNS belum benar.**
2. Port 80 **dan** 443 terbuka: cek `ufw status` di VPS dan pastikan tidak ada
   blokir upstream. HTTP-01 challenge butuh port 80 dari internet.
3. Domain **tidak** diletakkan di balik proxy/CDN yang menerminasi TLS sendiri
   (kalau iya, sertifikat diurus di proxy, bukan di VPS — konfirmasi ke Kominfo).

## Langkah pemasangan (ulangi per domain)

```bash
# 1. Install certbot + plugin nginx (Ubuntu)
apt update && apt install -y certbot python3-certbot-nginx

# 2. Pastikan server_name pada config app = domain resmi.
#    Edit /etc/nginx/sites-available/saibatin (atau tanatidung), tambahkan domain
#    resmi ke baris `server_name` (boleh berdampingan dg host nip.io lama), lalu:
nginx -t && systemctl reload nginx

# 3. Terbitkan sertifikat + pasang otomatis ke nginx + redirect 80->443
certbot --nginx -d <DOMAIN> --agree-tos -m <EMAIL_ADMIN> --redirect

# 4. Pastikan auto-renew jalan
certbot renew --dry-run
systemctl status certbot.timer   # timer bawaan; harus enabled
```

Untuk dua domain sekaligus boleh `certbot --nginx -d <DOMAIN_SAIBATIN> -d <DOMAIN_SIDAKO>`
asalkan keduanya sudah resolve ke VPS.

## Setelah HTTPS aktif — WAJIB ubah konfigurasi app (kalau tidak, login rusak)

Untuk **tiap** app (saibatin, lalu sidako) edit `deploy/.env`:

- `APP_URL=https://<DOMAIN>` dan `NEXT_PUBLIC_APP_URL=https://<DOMAIN>`
- `AUTH_COOKIE_SECURE=true`  ← cookie sesi baru boleh Secure setelah HTTPS
- Isi `RECAPTCHA_V3_SECRET_KEY` + (saat build) `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
  dengan key yang domainnya didaftarkan ke domain resmi baru.
- `NEXT_PUBLIC_*` di-**bake saat build**, jadi harus **rebuild + deploy**, bukan
  sekadar restart:
  `REMOTE=root@76.13.19.247 bash deploy/deploy.sh`
- Setelah HTTPS: fitur yang butuh secure context bisa diaktifkan (mis. Web Push
  notifikasi HP; OTP email tetap jalan tanpa syarat ini).

## Yang harus diisi eksekutor sebelum mulai

- `<DOMAIN_SAIBATIN>` = ? (mis. `saibatin.pesisirbaratkab.go.id`)
- `<DOMAIN_SIDAKO>`   = ?
- `<EMAIL_ADMIN>`     = email untuk notifikasi kedaluwarsa Let's Encrypt
- Konfirmasi: apakah keduanya berbagi VPS ini, atau sidako pindah VPS?

## Rollback

certbot menyimpan config nginx lama (`*.conf` sebelum diubah). Kalau bermasalah:
`certbot --nginx` bisa diulang, atau kembalikan `server_name` & hapus blok SSL,
lalu `nginx -t && systemctl reload nginx`. Sertifikat yang sudah terbit tidak
merusak apa pun bila tidak dirujuk.
