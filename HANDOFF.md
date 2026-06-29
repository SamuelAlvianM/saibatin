# HANDOFF — Panduan Lanjutan (untuk Claude Code berikutnya)

Dokumen ini supaya siapa pun (atau Claude Code lain) bisa **melanjutkan migrasi** tanpa mengulang analisis. Baca **`REPORT.md`** dulu untuk konteks lengkap.

---

## 1. Ringkasan keputusan yang sudah final
- **Source produksi yang benar = `data-2/pesbar/app.pesbar.002`** (Laravel 9). `data-1` = staging, `data-3` = public web-root. Jangan pakai data-1/3 sebagai acuan fitur.
- **Benchmark gaya & struktur = `disdukcapil-ktt-frontend/`** — sudah Next.js 16 + TS + Redux + shadcn/ui + reCAPTCHA, dan **sudah berisi port awal**: landing page, auth (login/register/forgot/reset), dan modal `permohonan-online`. Ikuti konvensinya **persis**.
- **Target migrasi = folder `saibatin-platform/`** (Next.js App Router + TypeScript).
- **Backend Laravel tetap dipakai sebagai API.** Next.js memanggil via Route Handlers (`app/api/**`) yang mem-proxy ke `BACKEND_URL`. Pola contoh: `disdukcapil-ktt-frontend/app/api/auth/login/route.ts`.

## 2. Struktur repo
```
saibatin/
├── data-1/  data-2/  data-3/      # source Laravel (vendor & .env TIDAK ikut)
├── disdukcapil-ktt-frontend/      # BENCHMARK (Next.js, port sebagian)
├── saibatin-platform/             # TARGET migrasi (sedang dikerjakan)
├── REPORT.md                      # laporan Fase 1–4
└── HANDOFF.md                     # file ini
```

## 3. Setup pertama kali (wajib)
```bash
# Backend Laravel (kalau perlu jalan lokal)
cd data-2/pesbar/app.pesbar.002
composer install            # regenerate vendor/ (di-gitignore)
cp .env.example .env        # ISI kredensial; lihat REPORT untuk var
php artisan key:generate

# Frontend Next.js (target)
cd saibatin-platform
npm install                 # regenerate node_modules/
cp .env.example .env.local  # isi RECAPTCHA_V3_SECRET_KEY dll
npm run dev

# Benchmark (untuk dilihat/dicontek)
cd disdukcapil-ktt-frontend && npm install && npm run dev
```

## 4. Status `saibatin-platform` saat ini
**Sudah ada (fondasi):**
- Config: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `.gitignore`
- `lib/utils.ts`, `lib/site-config.ts` (mapping `APP_SITE_*`)
- `.env.example` + `.env.local` (mapping lengkap dari Laravel `.env`)

**Belum dibuat (TODO berikutnya):**
- [ ] `app/globals.css` (salin dari ktt), `app/layout.tsx`, `app/providers.tsx`
- [ ] `store/` Redux (store, hooks, StoreProvider, slices) — salin pola dari ktt
- [ ] `components/ui/*` shadcn — salin dari ktt
- [ ] `lib/api.ts` — client/proxy terpusat ke `BACKEND_URL`
- [ ] Halaman + Route Handler per domain (lihat checklist §6)

## 5. Cara melanjutkan (rekomendasi)
1. **Pindahkan fondasi dari ktt** ke `saibatin-platform`: `globals.css`, `layout.tsx`, `providers.tsx`, `store/**`, `components/ui/**`, `components/shared/**`, `components/landingpage/**`, `components/permohonan-online/**`, `app/login|register|forgot-password|reset-password`, `app/page.tsx`, `app/permohonan-online`. Sesuaikan branding via `lib/site-config.ts`.
2. Lanjut **domain per domain** (lihat checklist). Untuk tiap route Laravel: buat `app/<segment>/page.tsx` + `app/api/<segment>/route.ts` (proxy ke endpoint Laravel bernama sama).
3. Pertahankan kontrak data (`getdata`/`postdata`/`fetchdata`/`procdata`/`upload`/`downloadPDF`).
4. reCAPTCHA: token diambil di client, **diverifikasi di Route Handler** pakai `RECAPTCHA_V3_SECRET_KEY`.

## 6. Checklist domain (urut prioritas)
- [x] (benchmark) Landing page
- [x] (benchmark) Auth: login / register / forgot / reset
- [x] (benchmark) Permohonan-online: modal 17 jenis
- [ ] Aktivasi akun (`frtDaftar/activate`, `activateurl`, resend code)
- [ ] Profil warga (biodir, keluarga, pengaturan, ganti password)
- [ ] Permohonan: wiring `postdata`+upload+downloadPDF ke backend (saat ini baru UI modal)
- [ ] Riwayat (dalam proses / selesai / ditolak)
- [ ] Produk (hukum, persyaratan, SOP, standar pelayanan, dafduk)
- [ ] Media Informasi: Berita, SKM, IKM
- [ ] Media Informasi: Data Demografi (8 kategori, data/total/grafik/detail kec)
- [ ] Media Informasi: Peta Demografi (Leaflet + GeoJSON)
- [ ] Hubungi Kami (kontak, layanan pengaduan, kritik saran)
- [ ] Pengaduan Masyarakat (publik + admin)
- [ ] Gallery (bupati, pelayanan + manag)
- [ ] User Management + verifikasi
- [ ] Admin Panel `/panel` (rekap semua)
- [ ] Kebijakan Privasi, Options (`opt`/`optx`)

## 7. Referensi cepat
- Daftar route lengkap: `data-2/pesbar/app.pesbar.002/routes/web.php`
- Controller: `data-2/pesbar/app.pesbar.002/app/Http/Controllers/**`
- Blade view (acuan UI lama): `data-2/pesbar/app.pesbar.002/resources/views/**`
- Asset lama (gambar/plugin): `data-3/` (css, img, js, plugin)
- Mapping env: lihat `REPORT.md` FASE 4 + `saibatin-platform/.env.example`

## 8. ⚠️ Keamanan
- File `.env` (3 buah) **sengaja tidak di-commit** — berisi password DB & Gmail app-password + secret reCAPTCHA.
- Kredensial tersebut **sudah pernah ada di disk** → disarankan **rotasi**: ganti password DB, regenerate Gmail app-password, reset secret reCAPTCHA, `php artisan key:generate` baru.
- Jangan pernah hardcode secret di kode frontend. Hanya `NEXT_PUBLIC_*` yang boleh sampai ke browser.
