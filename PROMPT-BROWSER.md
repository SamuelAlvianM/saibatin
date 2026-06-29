# Prompt untuk Claude Browser — Lengkapi Halaman 404 + Foto Carousel

> Salin seluruh blok di bawah ini ke Claude yang punya akses Chrome (claude.ai / Claude in Chrome).
> Tujuan: melengkapi halaman yang masih 404 dengan konten & foto ASLI dari live site.

---

Kamu adalah Claude dengan akses Chrome. Tugasmu: melengkapi halaman yang masih 404
pada aplikasi Next.js di repo GitHub berikut, dengan konten & foto ASLI dari website live.

REPO: https://github.com/SamuelAlvianM/saibatin  → kerja di folder `saibatin-platform`
LIVE SITE (sumber konten & foto, BENCHMARK TERTINGGI): https://saibatin.pesisirbaratkab.go.id/
PENTING: kontennya = Disdukcapil Kabupaten PESISIR BARAT (SAIBATIN), BUKAN "KTT".

## STACK YANG SUDAH ADA (ikuti gaya & struktur ini, jangan ubah arsitektur)
- Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (components/ui)
- Redux Toolkit (store/), framer-motion, lucide-react
- Backend: Route Handlers (app/api/**) + Prisma + MySQL
- Helper: lib/site-config.ts (branding), lib/utils.ts (cn), komponen shared di components/shared
- Format respons API: { error:[], success:[], data, html }

## SETUP LOKAL
```
cd saibatin-platform
npm install
cp .env.example .env.local   # isi:
#   DATABASE_URL="mysql://root:PASSWORD@localhost:3306/saibatin"
#   AUTH_SECRET="string-acak-min-32-karakter"
#   biarkan RECAPTCHA_V3_SECRET_KEY KOSONG (dev)
# (butuh MySQL lokal + buat database "saibatin")
npm run db:push && npm run db:seed
npm run dev    # http://localhost:3000
```
Catatan: live site JS-rendered (AJAX). Untuk baca konten/menu/foto, BUKA di Chrome dan
render dulu, lalu telusuri tiap menu. Untuk foto: pakai DevTools (tab Network/Elements)
cari URL gambar, lalu UNDUH ke `saibatin-platform/public/carousel/` dan `public/img/`.

## HALAMAN YANG SUDAH ADA (jangan dirombak)
/, /login, /register, /forgot-password, /reset-password, /permohonan-online

## HALAMAN 404 YANG HARUS DIBUAT (sumber daftar resmi: components/shared/navbar.tsx)
Produk:
- /produk/produk-disdukcapil, /produk/formulir-persyaratan, /produk/hukum, /produk/sop
Media Informasi:
- /media/berita            → WIRE ke API yang sudah ada: GET /api/berita & /api/berita/[slug]
- /media/peta              → embed Google Maps (lihat lib/site-config.ts: maps.alamatEmbed)
- /media/survey-kepuasan   → form SKM
- /media/gis
- /media/laporan-demografi
Data Demografi (statistik; boleh pakai chart):
- /media/demografi/agama, /golongan-darah, /jenis-kelamin, /kepala-keluarga,
  /pendidikan, /status-perkawinan, /wajib-ktp
PPID (lihat navbar.tsx untuk daftar lengkap sub-itemnya):
- /ppid/profil-ppid, /ppid/laporan-ppid-pelaksana, /ppid/lkjip, dll
Footer:
- /kebijakan-privasi, /privasi, /syarat, /sitemap

TIPS efisien: untuk halaman yang isinya statis/informasi, boleh buat 1 komponen reusable
(mis. components/shared/info-page.tsx) + catch-all route per seksi (app/produk/[...slug],
app/ppid/[...slug], app/media/[...slug]) yang membaca peta konten. Tapi /media/berita,
/media/demografi/*, /media/survey-kepuasan buat sebagai halaman NYATA (bukan placeholder).

## API yang BISA dipakai (sudah jadi)
GET /api/stats · GET /api/berita?page&limit · GET /api/berita/[slug] ·
GET /api/wilayah?jenis=KECAMATAN · GET /api/jenis-permohonan ·
POST /api/pengaduan · GET/POST /api/permohonan (perlu login) · /api/auth/*
Kalau butuh data baru (mis. SKM, demografi), tambah Route Handler + model Prisma
mengikuti pola yang ada (lihat app/api/berita & prisma/schema.prisma).

## CAROUSEL — WAJIB pakai FOTO ASLI SAIBATIN
File: components/landingpage/carousel.tsx (DEFAULT_SLIDES masih pakai Unsplash — GANTI).
1. Dari live site, unduh 3–5 foto slider/hero/kegiatan ASLI → simpan ke public/carousel/.
2. Buat slides bertema Pesisir Barat (judul+subjudul Indonesia, mis. layanan adminduk,
   foto kantor/kegiatan Disdukcapil), referensikan ke /carousel/xxx.jpg.
3. Oper slides via prop dari app/page.tsx (atau ubah DEFAULT_SLIDES).
Ambil juga logo dinas (dinas_pesisirbarat.png) untuk navbar/footer bila ada.

## ATURAN
- Konten teks ambil semirip mungkin dengan live site (bahasa Indonesia, nama "Pesisir Barat").
- Jangan hapus/ubah endpoint & skema yang sudah ada; tambah saja bila perlu.
- Pastikan `npm run build` LULUS sebelum selesai.
- Setelah selesai: commit dengan pesan jelas lalu `git push origin main`.
- Akhiri dengan ringkasan: halaman apa saja yang dibuat + foto yang diunduh + sisa TODO.

Mulai dengan: buka live site di Chrome, petakan semua menu & konten, unduh foto,
lalu bangun halaman satu per satu sambil cek di http://localhost:3000.
