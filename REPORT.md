# Laporan Analisis & Migrasi — saibatin.pesisirbaratkab.go.id → Next.js

> Website: **https://saibatin.pesisirbaratkab.go.id/**
> Sistem: Portal layanan **Disdukcapil Kabupaten Pesisir Barat** (SAIBATIN) — pelayanan administrasi kependudukan & pencatatan sipil online.

---

## FASE 1 — Verifikasi Source Code

Terdapat 3 kandidat folder. Kesimpulan: **`data-2` adalah source produksi yang benar.**

### Perbandingan

| Aspek | `data-1` | **`data-2`** ✅ | `data-3` |
|---|---|---|---|
| Path | `data-1/app.pesbar.001` | `data-2/pesbar/app.pesbar.002` | `data-3/...` |
| Framework | Laravel 9 | Laravel 9 | Hybrid (web root + Laravel) |
| `APP_ENV` | `local` | `production` | — |
| `APP_URL` | `http://127.0.0.1` | `https://saibatin.pesisirbaratkab.go.id` | — |
| Database | `db.pesbar.001` | `db.pesbar.002` | — |
| `app/Mail/` | ❌ | ✅ | — |
| Analytics (GA + GTM) | ❌ | ✅ | — |
| Branding/maps/tenant config | minimal | lengkap | — |
| Jumlah file | 8.466 | 8.903 | 14.413 |
| Peran | development/staging | **PRODUKSI** | public web-root (static asset + proxy ke `app.pesbar.002`) |

### Alasan memilih `data-2`
1. `.env` memuat domain live + `APP_ENV=production`.
2. Konfigurasi paling lengkap (GA, GTM, reCAPTCHA host verification, maps, tenant, branding).
3. Punya `app/Mail/` (fitur email aktifasi/notifikasi) yang tidak ada di `data-1`.
4. `data-3` bukan source mandiri — ia hanya *public web root* (static asset hasil build) yang memanggil backend `pesbar/app.pesbar.002` (= isi `data-2`).

---

## FASE 2 — Analisis Sistem

### Tech stack (lama)
- **Backend:** Laravel 9 (PHP ^8.0.2)
- **Frontend (lama):** Blade + Bootstrap 5.2 + jQuery/DataTables + AdminLTE 3 (panel admin)
- **Build:** Vite 3
- **DB:** MySQL
- **Library kunci:** DOMPDF (cetak PDF), reCAPTCHA v3, Guzzle, Leaflet (peta demografi), SweetAlert
- **Auth:** Laravel session auth + Sanctum (route `api` minimal)

### Pola endpoint (PENTING untuk migrasi)
Hampir semua interaksi memakai pola **AJAX POST** ke route bernama, dengan sufiks fungsi konsisten:
- `…/index` — render awal (HTML/modal)
- `…/getdata` — ambil data tabel (DataTables server-side)
- `…/postdata` — simpan/submit (banyak dilindungi **reCAPTCHA v3**)
- `…/fetchdata` — ambil satu record (untuk edit)
- `…/procdata` — proses (approve/reject/delete record)
- `…/upload` / `…images` — upload & galeri bukti/berkas
- `…/downloadPDF` — generate PDF (DOMPDF)
- `…/delfile` — hapus file

### Domain fungsional (dari `routes/web.php`, ±150 route)
1. **Auth** — signin/signout, `panel.login`, `panel.register`, `panel.forgot`, reset, aktivasi (`frtDaftar/activate`), login v2.
2. **Front/Landing** — `/` (`FrontController@index`), `start`…`start41` (data dashboard publik), loginstate.
3. **Profil warga** — biodir, keluarga, pengaturan, ganti password.
4. **Permohonan (layanan online)** — ±17 jenis:
   Akta Kelahiran (NIK ada / belum ada), Akta Nikah, Sakinah, Akta Kematian, Akta Perceraian, KIA, Pindah, Konsolidasi Update Data, Kedatangan, KTP-el, KK Tambah Anak, KK Pisah KK, KK Numpang, KK Perubahan Biodata, KK Cetak Ulang, Pencetakan KTP (Baru/Hilang/Rusak/Ganti Data/Ganti Suket).
   Tiap jenis: `index, postdata(+reCAPTCHA), fetchdata, getdata, upload, images, downloadPDF`.
5. **Riwayat** — Dalam Proses / Selesai / Ditolak.
6. **Produk** — Hukum, Persyaratan (+Manag), Standar Pelayanan, SOP, Persyaratan Dafduk.
7. **Media Informasi** — Peta Demografi (Leaflet/GIS), Data Demografi (Agama, Gol. Darah, Jenis Kelamin, KK, Pendidikan, Pekerjaan, Status Perkawinan, Wajib KTP — masing-masing data/total/grafik/detail kecamatan), Berita (+Manag), SKM, IKM.
8. **Hubungi Kami** — Alamat/Kontak, Layanan Pengaduan, Kritik Saran.
9. **Pengaduan Masyarakat** — publik + admin.
10. **Gallery** — Bupati, Pelayanan (+Manag).
11. **User Management** — CRUD user + verifikasi.
12. **Admin Panel** (`/panel`, middleware `auth`) — rekap pengajuan, permohonan, pengaduan, galeri, berita, IKM, user, produk.
13. **Kebijakan Privasi**, **Import dapduk resume**, **Options** (`opt`/`optx` — dropdown kecamatan/kelurahan dll).

### Environment variables (lihat mapping di FASE 4)
Sumber: `data-2/pesbar/app.pesbar.002/.env`. Berisi identitas situs (`APP_SITE_*`), maps, analytics (GA `G-F08BV5LJHS`, GTM `GTM-MM4PL9NZ`), reCAPTCHA v3, DB MySQL, SMTP Gmail.
> ⚠️ `.env` asli berisi password DB & email + secret reCAPTCHA → **TIDAK di-commit** (lihat HANDOFF). Disarankan rotasi kredensial.

---

## FASE 3 — Rencana & Status Migrasi (Next.js)

### Target stack (mengikuti benchmark `disdukcapil-ktt-frontend`)
- **Next.js 16 (App Router) + React 19 + TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (style "new-york", Radix UI)
- **Redux Toolkit** + react-redux (state, async thunk)
- **framer-motion** (animasi), **lucide-react** (ikon)
- **react-google-recaptcha-v3** (reCAPTCHA)
- Backend Laravel tetap dipakai sebagai **API**; Next.js memanggil lewat **Route Handlers** (`app/api/**`) sebagai proxy (pola sama seperti `app/api/auth/login/route.ts` di ktt).

### Strategi
Karena backend Laravel masih hidup, migrasi = **rewrite frontend (Blade → React/Next)** sambil mempertahankan kontrak endpoint. Setiap route Blade lama → halaman/komponen Next + Route Handler proxy ke endpoint Laravel yang sama. Tidak ada fitur yang dibuang.

### Mapping konvensi (lama → baru)
| Laravel (lama) | Next.js (baru) |
|---|---|
| `routes/web.php` route bernama | `app/<segment>/page.tsx` + `app/api/<segment>/route.ts` |
| Blade view | React Server/Client Component |
| Controller `getdata` (DataTables) | Route Handler `GET/POST` → proxy → tabel client |
| `postdata` + reCAPTCHA v3 | client ambil token via `react-google-recaptcha-v3` → kirim ke Route Handler → verifikasi server-side |
| AdminLTE panel | layout `app/(panel)/` + komponen dashboard |
| DOMPDF `downloadPDF` | tetap di backend; Next.js stream/redirect |
| `APP_SITE_*` env | `lib/site-config.ts` (dari `NEXT_PUBLIC_*`) |

### Struktur folder baru (`saibatin-platform/`)
```
saibatin-platform/
├── app/
│   ├── api/            # Route Handlers (proxy ke Laravel) — per domain
│   ├── (public)/       # landing, berita, produk, media informasi, pengaduan
│   ├── (auth)/         # login, register, forgot, reset, aktivasi
│   ├── (panel)/        # area login: profil, permohonan, riwayat, admin
│   ├── layout.tsx, providers.tsx, globals.css
├── components/
│   ├── ui/             # shadcn/ui
│   ├── shared/         # navbar, footer
│   ├── landingpage/    # carousel, stats, menu-populer, profile-tabs
│   └── permohonan-online/  # modal tiap jenis permohonan
├── store/              # Redux (store, hooks, slices)
├── lib/                # utils, site-config, api client
└── .env.example
```

### Status saat ini (yang sudah dibuat)
✅ Fondasi project: `package.json`, `tsconfig`, `next.config`, `postcss`, `eslint`, `components.json`, `.gitignore`
✅ `lib/utils.ts`, `lib/site-config.ts`
✅ `.env.example` + `.env.local` (mapping lengkap dari Laravel `.env`)
⏳ **Belum:** store Redux, `app/layout.tsx` + `globals.css` + providers, halaman per-domain, Route Handlers, komponen UI.
> `disdukcapil-ktt-frontend` sudah berisi referensi siap-pakai untuk: landing page, auth (login/register/forgot/reset), dan modal `permohonan-online` — **pakai ini sebagai titik awal** (lihat HANDOFF).

---

## FASE 4 — Catatan & Mapping Environment

### Mapping `.env` Laravel → Next.js
| Laravel | Next.js | Catatan |
|---|---|---|
| `APP_NAME` | `NEXT_PUBLIC_APP_NAME` | publik |
| `APP_URL` | `NEXT_PUBLIC_APP_URL` | publik |
| `APP_SITE_*` | `NEXT_PUBLIC_SITE_*` | semua publik → `lib/site-config.ts` |
| `APP_SITE_GOOGLEANALYTIC_ID` | `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | publik |
| `APP_SITE_GOOGLETAGMANAGER_ID` | `NEXT_PUBLIC_GOOGLE_TAGMANAGER_ID` | publik |
| `RECAPTCHA_V3_SITE_KEY` | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | publik |
| `RECAPTCHA_V3_SECRET_KEY` | `RECAPTCHA_V3_SECRET_KEY` | **server-only** |
| `DB_*` | (opsional) `DB_*` server-only | default: akses via backend, bukan langsung |
| `MAIL_*` | `MAIL_*` server-only | jika kirim email dari Next.js |
| — (baru) | `BACKEND_URL` | base URL backend Laravel untuk proxy |

### Hal yang perlu perhatian (breaking changes / risiko)
1. **reCAPTCHA v3** — verifikasi secret HARUS pindah ke Route Handler (server), jangan di client. Host name terdaftar: `saibatin.pesisirbaratkab.go.id` (perlu tambah domain dev di Google reCAPTCHA admin).
2. **Session/Auth** — Laravel pakai session cookie. Saat proxy, teruskan cookie & header (`credentials: 'include'`). Pertimbangkan strategi auth (cookie httpOnly).
3. **DataTables server-side** — endpoint `getdata` memakai format DataTables (draw/start/length). Komponen tabel baru harus mengirim param yang kompatibel atau buat adapter.
4. **DOMPDF / downloadPDF** — biarkan di backend; Next.js cukup redirect/stream agar PDF identik.
5. **Peta Demografi** — pakai Leaflet + GeoJSON (`maps_pesisirbarat`). Perlu port ke react-leaflet.
6. **Kredensial bocor** — `.env` asli sudah ada di disk lokal; **rotasi password DB & Gmail app-password + reset secret reCAPTCHA** sangat disarankan.
7. **Upload berkas** — banyak endpoint `upload`/`images`. Perhatikan limit ukuran & path (`APP_SITE_UPLOAD_PATH`).
