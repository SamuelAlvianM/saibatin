# HANDOFF — Panduan Lanjutan

> Dokumen ini untuk Claude atau developer berikutnya yang melanjutkan migrasi.
> Baca **ringkasan di bawah** sebelum menyentuh kode.

---

## STACK (sudah final, jangan ubah)

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| Styling | Tailwind v4 + shadcn/ui (style "new-york") |
| State | Redux Toolkit + react-redux |
| ORM | **Prisma + MySQL** (bukan PostgreSQL — karena cPanel shared hosting) |
| Auth | jose (JWT, cookie httpOnly `saibatin_session`, 7 hari) + bcryptjs |
| reCAPTCHA | v3 server-side — kalau `RECAPTCHA_V3_SECRET_KEY` kosong → bypass (dev) |
| Animasi | framer-motion + CSS keyframes di `globals.css` |
| Toast | sonner |

---

## SETUP LOKAL

```bash
cd saibatin-platform
npm install

# Buat file .env (untuk Prisma CLI):
echo 'DATABASE_URL="mysql://root:saibatin123@localhost:3306/saibatin"' > .env

# Buat .env.local (untuk Next.js dev):
cp .env.example .env.local
# Edit .env.local:
#   DATABASE_URL="mysql://root:saibatin123@localhost:3306/saibatin"
#   AUTH_SECRET="string-acak-min-32-karakter"
#   RECAPTCHA_V3_SECRET_KEY=""   ← kosongkan untuk dev
#   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""  ← kosongkan untuk dev

# Sync schema ke DB dan isi data awal:
npm run db:push
npm run db:seed

# Jalankan dev server (gunakan port 3500 jika 3000 bentrok):
npx next dev -p 3500
```

**Akun demo dari seed:**
- Admin: `admin` / `admin123` (level 1)
- Warga: `1813010101900001` / `warga123` (level 3)

---

## PALET WARNA (brand)

Diambil dari CSS asli aplikasi Laravel (`app.css`):

| Token | Hex | Pakai untuk |
|---|---|---|
| Brand Blue | `#2176bd` | Primary, navbar, tombol utama |
| Brand Blue Dark | `#1b4b72` | Hero gradient, header |
| Brand Blue Light | `#6cb2eb` | Aksen, border |
| Brand Yellow | `#ffed4a` | Secondary, highlight |
| Brand Yellow Dark | `#e77817` | Gradient kuning (tombol) |

**Glass utility classes** (di `globals.css`):
- `.glass-card` — card putih frosted (bg utama)
- `.glass-card-blue` — card biru tipis
- `.glass-nav` — navbar biru gelap blur

---

## STRUKTUR FOLDER `saibatin-platform/`

```
app/
├── api/
│   ├── auth/          login, register, logout, session, check-nik, forgot/reset-password
│   ├── berita/        GET list + GET [slug]
│   ├── galeri/        GET list + POST (admin)
│   ├── jenis-permohonan/  GET semua aktif
│   ├── pengaduan/     POST (publik) + GET (admin)
│   ├── permohonan/    GET riwayat user + POST buat baru
│   ├── stats/         GET statistik homepage
│   ├── upload/        POST upload file (max 5MB, JPG/PNG/PDF)
│   └── wilayah/       GET kecamatan/kelurahan
├── dashboard/         halaman dashboard (warga + admin)
├── galeri/            halaman galeri publik + lightbox
├── login/             halaman login
├── media/
│   ├── berita/        list + [slug] detail
│   ├── demografi/[slug]  7 jenis statistik
│   ├── gis/           peta GIS
│   ├── laporan-demografi/
│   ├── peta/          embed Google Maps
│   └── survey-kepuasan/  form SKM
├── pengaduan/         form pengaduan masyarakat (publik)
├── permohonan-online/ halaman + 15 modal form permohonan
├── ppid/[...slug]/    halaman-halaman PPID
├── produk/[...slug]/  produk disdukcapil, formulir, hukum, SOP
├── register/          halaman daftar
├── riwayat/           daftar riwayat permohonan warga
│   └── [id]/          detail permohonan
└── (halaman lain: forgot-password, reset-password, kebijakan-privasi, dll)

components/
├── landingpage/       carousel, hero, stats, layanan
├── permohonan-online/ 15 modal form (AktaKelahiran, KK, KTP, dll)
├── shared/            navbar, footer, info-page
└── ui/                shadcn components

lib/
├── auth.ts            createSession / getSession / destroySession
├── api-response.ts    ok() dan fail() helper
├── prisma.ts          singleton PrismaClient
├── recaptcha.ts       verifyRecaptcha (bypass jika key kosong)
└── site-config.ts     mapping NEXT_PUBLIC_SITE_* env vars

store/
├── slices/authSlice.ts   Redux auth state
└── hooks.ts
```

---

## FORMAT RESPONS API (SEMUA endpoint ikuti ini)

```ts
// Sukses:
{ error: [], success: ["pesan"], data: { ... } }

// Gagal:
{ error: ["pesan error"], success: [], data: {} }
```

Helper: `lib/api-response.ts` → `ok(data, messages)` dan `fail(messages, status)`

---

## FLOW AUTH

1. POST `/api/auth/login` → verifikasi reCAPTCHA → cari user by `userId` → bcrypt.compare → `createSession()` set cookie httpOnly
2. Server Component: `const session = await getSession()` — kalau null → `redirect('/login')`
3. Client Component: dispatch `verifySession` thunk → Redux `isAuthenticated`
4. Logout: POST `/api/auth/logout` → `destroySession()` hapus cookie

---

## YANG SUDAH SELESAI ✅

### Auth
- [x] Login (fix bug double redirect)
- [x] Register (validasi NIK 16 digit, password)
- [x] Logout
- [x] Lupa password / reset password (flow ada, email belum)
- [x] Session JWT via cookie

### Halaman Publik
- [x] Homepage / landing page (carousel, stats, layanan)
- [x] `/media/berita` — list + `/media/berita/[slug]` detail
- [x] `/galeri` — grid masonry + lightbox + filter kategori
- [x] `/pengaduan` — form pengaduan masyarakat
- [x] `/media/survey-kepuasan` — form SKM
- [x] `/media/peta` — embed Google Maps
- [x] `/media/gis`
- [x] `/media/demografi/[slug]` — 7 jenis statistik
- [x] `/produk/[...slug]` — produk disdukcapil, formulir, hukum, SOP
- [x] `/ppid/[...slug]` — halaman PPID
- [x] `/kebijakan-privasi`, `/privasi`, `/syarat`, `/sitemap`
- [x] `/hubungi-kami/[...slug]`
- [x] `/wbs/[...slug]`

### Warga (login level 3)
- [x] Dashboard warga (link permohonan + riwayat)
- [x] `/permohonan-online` — 15 jenis permohonan via modal
- [x] `/riwayat` — daftar riwayat + tab status
- [x] `/riwayat/[id]` — detail + berkas lampiran

### Admin (login level 1-2)
- [x] Dashboard admin — statistik user + permohonan
- [x] Manajemen user (aktivasi akun warga)

### API
- [x] `/api/auth/*` (login, register, logout, session, check-nik, forgot, reset)
- [x] `/api/berita`, `/api/berita/[slug]`
- [x] `/api/galeri`
- [x] `/api/pengaduan`
- [x] `/api/permohonan` (GET riwayat + POST buat baru)
- [x] `/api/jenis-permohonan`
- [x] `/api/stats`
- [x] `/api/upload` (file handler, max 5MB)
- [x] `/api/wilayah`

---

## YANG BELUM SELESAI ❌ (PRIORITAS TINGGI → RENDAH)

### PRIORITAS 1 — Profil Warga
- [ ] `/profil` — halaman edit biodata (nama, HP, email, alamat)
  - API: `PUT /api/profil` → update kolom user di DB
- [ ] Data keluarga (opsional, dari `user_nokk`)

### PRIORITAS 2 — Admin Panel CRUD

**Manajemen Permohonan** (paling kritis):
- [ ] `/dashboard/permohonan` — tabel semua permohonan masuk
  - Kolom: no. register, nama pemohon, jenis, status, tanggal
  - Aksi: lihat detail, ubah status (MENUNGGU→DIPROSES→SELESAI/DITOLAK), isi catatan
  - API: `GET /api/admin/permohonan`, `PATCH /api/admin/permohonan/[id]`

**Manajemen Berita** (konten):
- [ ] `/dashboard/berita` — tabel CRUD berita
  - Form: judul, slug (auto dari judul), kategori, ringkasan, isi (rich text), gambar, status publish
  - API: `POST /api/berita`, `PUT /api/berita/[id]`, `DELETE /api/berita/[id]`

**Manajemen Galeri**:
- [ ] `/dashboard/galeri` — upload foto + hapus
  - API POST sudah ada di `/api/galeri`, tinggal buat halaman

**Manajemen Pengaduan**:
- [ ] `/dashboard/pengaduan` — tabel pengaduan masuk + balas/tandai selesai

### PRIORITAS 3 — Modal Permohonan (koneksi ke API)

Modal-modal di `components/permohonan-online/` sudah punya form lengkap tapi **belum semua terhubung ke API**. Yang perlu dicek/diperbaiki:
- Setiap modal harus POST ke `/api/permohonan` dengan `{ jenisKode, payload }`
- Upload berkas via `/api/upload` lalu POST ke `/api/berkas` (atau sertakan URL di payload)
- Setelah sukses: redirect ke `/riwayat`

Buat juga endpoint berkas:
- [ ] `POST /api/berkas` — simpan record berkas (permohonanId, namaFile, fileUrl, jenisFile)
- Model `Berkas` sudah ada di `prisma/schema.prisma`

### PRIORITAS 4 — Email & Notifikasi
- [ ] Email aktivasi akun (saat register) — pakai Nodemailer atau Resend
  - Env yang sudah disiapkan: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
- [ ] Email reset password
- [ ] Notifikasi status permohonan berubah

### PRIORITAS 5 — Konten & Aset
- [ ] Foto carousel → ganti dari Unsplash ke foto asli Disdukcapil Pesisir Barat
  - Sumber: `https://saibatin.pesisirbaratkab.go.id/` (live site)
  - File: `components/landingpage/carousel.tsx` → ubah `DEFAULT_SLIDES`
- [ ] Logo `LOGO-dinas_ktt.png` → ganti ke logo Pesisir Barat yang benar
  - File logo tersedia di folder `html.app.pesbar.001.20240721/img/logo/dinas_pesisirbarat.png`
- [ ] Isi konten halaman produk/SOP/hukum dengan data asli (sekarang masih placeholder)

### PRIORITAS 6 — Sebelum Deploy ke cPanel
- [ ] `npm run build` harus LULUS tanpa error
- [ ] Ganti `AUTH_SECRET` dengan string random 64 karakter
- [ ] Isi `RECAPTCHA_V3_SECRET_KEY` dan `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` dengan key production
- [ ] Set `DATABASE_URL` ke MySQL cPanel
- [ ] Folder `public/uploads/` → upload manual via cPanel File Manager (tidak ikut git)
- [ ] Konfigurasi `next.config.js` untuk subdomain/subfolder jika perlu

---

## CATATAN KEAMANAN (WAJIB DIIKUTI)

- **JANGAN commit `.env` atau `.env.local`** — sudah di `.gitignore`
- `RECAPTCHA_V3_SECRET_KEY` hanya server-side, **tidak boleh** pakai prefix `NEXT_PUBLIC_`
- Password di DB selalu **bcrypt hash** — tidak pernah simpan plaintext
- Upload file: validasi ekstensi (JPG/PNG/PDF) dan ukuran (max 5MB) sudah ada di `/api/upload`
- Session cookie: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` di production

---

## KONVENSI KODE

```ts
// Route Handler (API)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Belum login"], 401);
  // ...
  return ok({ data }, ["Berhasil"]);
}

// Server Component dengan auth
export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  // ...
}

// Client Component dengan Redux
const { isAuthenticated, user } = useAppSelector(state => state.auth);
```

---

## FILE REFERENSI ASLI LARAVEL

Folder **`html.app.pesbar.001.20240721/`** (ada di lokal, tidak di GitHub) berisi:
- `pesbar/app.pesbar.002/` — source Laravel lengkap
- `img/logo/dinas_pesisirbarat.png` — logo resmi
- `product/disdukcapil/` — 13 ikon PNG layanan
- `product/persyaratan/` — formulir F1.01/F1.02/F1.03 (PDF resmi)
- `img/berita/`, `img/gallery/` — foto-foto konten

Routes Laravel lengkap: `pesbar/app.pesbar.002/routes/web.php` (495 baris)
