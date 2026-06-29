# SAIBATIN Platform

Portal layanan **Disdukcapil Kabupaten Pesisir Barat** — hasil migrasi dari Laravel 9 (`data-2`) ke **Next.js full-stack**.

- **Frontend + Backend menyatu** (Next.js App Router + Route Handlers)
- **TypeScript** (strict), **Tailwind v4 + shadcn/ui**, **Redux Toolkit**, **framer-motion**
- **Prisma + MySQL** (cocok untuk cPanel/shared hosting)
- **Auth** sendiri: bcrypt + JWT sesi (cookie httpOnly via `jose`)
- **reCAPTCHA v3** diverifikasi di server

> Gaya & struktur mengikuti benchmark `disdukcapil-ktt-frontend`.

## Menjalankan (lokal)

```bash
npm install
cp .env.example .env.local      # isi DATABASE_URL & AUTH_SECRET

# Siapkan DB MySQL (buat database "saibatin" lebih dulu), lalu:
npm run db:push                 # buat tabel dari schema Prisma
npm run db:seed                 # isi data dummy + akun demo
npm run dev                     # http://localhost:3000
```

### Akun demo (setelah seed)
| Peran | user_id (NIK) | password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Warga | `1813010101900001` | `warga123` |

## Struktur
```
app/
  api/            # BACKEND — Route Handlers
    auth/         # register, login, logout, session (Prisma + bcrypt + JWT)
    permohonan/   # ajukan & daftar permohonan
    berita/ pengaduan/ wilayah/ stats/ jenis-permohonan/
  (halaman FE)    # login, register, forgot, reset, permohonan-online, landing
components/       # ui (shadcn), shared (navbar/footer), landingpage, permohonan-online
store/            # Redux Toolkit (authSlice, dll)
lib/              # prisma, auth, recaptcha, api-response, site-config, utils
prisma/           # schema.prisma + seed.ts
```

## Status migrasi
Lihat **`../REPORT.md`** (analisis lengkap) dan **`../HANDOFF.md`** (panduan lanjutan + checklist domain).

**Sudah jalan end-to-end:** auth (register/login/logout/session), pengaduan, berita, wilayah/dropdown, stats dashboard, ajukan permohonan (17 jenis via 1 tabel + payload), seed.

**TODO (lanjutan):** wiring penuh upload berkas + downloadPDF tiap permohonan, riwayat, produk, SKM/IKM, peta & data demografi, galeri, user management, panel admin. Pola sudah ada — tinggal ikuti endpoint yang sudah dibuat.

## Deploy ke cPanel (ringkas)
1. Buat database MySQL + user di cPanel → set `DATABASE_URL`.
2. "Setup Node.js App" (Passenger), Node 20+, application root = folder ini.
3. `npm install`, `npm run db:push`, `npm run db:seed`, `npm run build`, start `npm run start`.
4. Set semua env (`.env`) lewat panel Node.js App / file `.env`.

> ⚠️ Jangan commit `.env`. Ganti `AUTH_SECRET` & kredensial DB di produksi.
