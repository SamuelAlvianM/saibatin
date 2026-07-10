# Prompt: Penyempurnaan Fitur Aksesibilitas / Disabilitas (SAIBATIN)

> Prompt ini untuk dijalankan di **Claude Code Desktop (Fable)** pada repo
> `saibatin-platform`. Tujuan: melengkapi fitur aksesibilitas untuk penyandang
> disabilitas agar setara dengan widget aksesibilitas situs pemerintah seperti
> `dpmk.bantulkab.go.id`. Fondasi saat ini sudah benar namun belum lengkap dan
> belum nyaman — sempurnakan, jangan bongkar ulang arsitektur yang ada.

---

## Konteks Teknis (WAJIB diikuti, sudah diverifikasi di codebase)

- **Framework**: Next.js 16 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS v4 dengan token CSS di `app/globals.css`. Sudah ada
  varian gelap lewat `@custom-variant dark (&:is(.dark *))` dan token brand
  (`--brand-blue`, dst). **Gunakan token & varian `.dark` yang sudah ada**,
  jangan hardcode warna baru bila token-nya tersedia.
- **Layout global**: `app/layout.tsx` merender `<Navbar />` lalu `children`.
  Provider client ada di `app/providers.tsx` (Redux `StoreProvider`, `sonner`
  `Toaster`, `InlineEditProvider`, reCAPTCHA opsional).
- **State**: Redux Toolkit (`store/`). **Untuk widget ini JANGAN pakai Redux** —
  cukup React state + `localStorage` (lihat di bawah), agar tidak menambah
  kompleksitas store dan tetap berfungsi di semua halaman termasuk yang belum
  di-hydrate.
- **Ikon**: `lucide-react`. **Animasi**: `framer-motion` / `anime.js` sudah ada.
- **Bahasa UI**: **Bahasa Indonesia** (formal, ramah). Semua label, tooltip,
  dan `aria-label` dalam Bahasa Indonesia.

## Yang Harus Dibuat

### 1. Komponen `AccessibilityWidget` (client component)
Buat `components/shared/accessibility-widget.tsx` (`"use client"`) dan render
**sekali** di `app/layout.tsx` (di dalam `<Providers>`, setelah `<Navbar/>`),
sehingga muncul di seluruh halaman publik.

**Bentuk UI:**
- Tombol terapung (FAB) di **pojok kanan** layar (posisi `fixed`, mis.
  `bottom` tengah-kanan), ikon aksesibilitas (`lucide-react`
  `Accessibility` / `PersonStanding`), `z-index` tinggi agar di atas navbar &
  modal Radix, tetapi jangan menutupi konten penting.
- Saat diklik membuka **panel** (slide-in dari kanan atau popover) berisi daftar
  kontrol dalam grid tombol-toggle dengan ikon + label. Panel harus dapat
  ditutup (tombol X, klik overlay, tombol `Esc`).
- Responsif: di mobile panel menjadi bottom-sheet / full-width yang dapat
  di-scroll.

### 2. Daftar Kontrol Aksesibilitas (minimal set berikut)
Setiap kontrol menampilkan status aktif/nonaktif secara visual (mis. highlight
+ `aria-pressed`).

**Ukuran & keterbacaan teks**
1. **Perbesar Teks** — naikkan skala font global bertahap (mis. 100% → 110% →
   125% → 150%, maks 200%). Implementasi via CSS var `--a11y-font-scale` pada
   `:root`/`<html>` dan `font-size` responsif, **bukan** mengubah `px` tiap
   elemen. Pastikan tidak merusak layout (uji navbar, kartu, tabel).
2. **Perkecil Teks** — kebalikan dari di atas (min 90%).
3. **Spasi Teks** — perlebar `letter-spacing`, `word-spacing`, `line-height`
   (toggle beberapa tingkat).
4. **Font Ramah Disleksia** — ganti font-family ke font sans lebih tebal/legible
   (pakai font yang sudah dimuat: Geist/Montserrat dengan weight tegas, atau
   sediakan class util). Tidak perlu unduh font eksternal baru.

**Warna & kontras**
5. **Kontras Tinggi** — tingkatkan kontras teks/latar.
6. **Kontras Negatif / Invert** — invert warna halaman.
7. **Grayscale / Skala Abu** — `filter: grayscale(1)`.
8. **Latar Terang** — paksa latar terang, teks gelap (untuk yang silau di mode
   gelap).
9. **Sorot Tautan** — beri outline/underline tebal + warna kontras pada semua
   `<a>` dan tombol interaktif.

**Bantuan navigasi & baca**
10. **Garis Bantu Baca (Reading Guide)** — garis horizontal mengikuti kursor.
11. **Kursor Besar** — perbesar kursor (custom cursor).
12. **Jeda Animasi (Pause Animations)** — hentikan animasi/transisi &
    `prefers-reduced-motion` behaviour (matikan framer-motion/anime.js loop dan
    `animation`/`transition` via CSS global).
13. **Text-to-Speech (Baca Nyaring)** — gunakan **Web Speech API**
    (`window.speechSynthesis`) dengan suara **Bahasa Indonesia** (`lang="id-ID"`
    bila tersedia). Mode: saat aktif, klik/hover pada blok teks → dibacakan;
    sediakan tombol Stop. Tangani browser yang tidak mendukung dengan sembunyikan
    kontrol + pesan.

**Kontrol umum**
14. **Reset** — kembalikan semua pengaturan ke default & bersihkan
    `localStorage`.

### 3. Persistensi & anti-flicker
- Simpan seluruh preferensi ke `localStorage` (mis. key `saibatin-a11y`) sebagai
  satu objek JSON.
- Terapkan kelas/atribut ke `<html>` (mis. `data-a11y-*` atau class) **sebelum
  paint** agar tidak ada kedipan (flash). Gunakan inline script kecil di
  `app/layout.tsx` (`<head>`) atau `next/script` strategi `beforeInteractive`
  yang membaca `localStorage` dan menetapkan atribut sedini mungkin.
- Semua efek visual didefinisikan di `app/globals.css` sebagai class/attribute
  selector (mis. `html[data-a11y-grayscale="true"] { filter: grayscale(1) }`)
  agar terpusat dan mudah dirawat.

### 4. Aksesibilitas dari widget itu sendiri (jangan ironis)
- Semua tombol punya `aria-label`, `aria-pressed`, fokus keyboard yang jelas
  (`focus-visible` ring), dan dapat dioperasikan penuh dengan keyboard (Tab,
  Enter/Space, Esc).
- FAB & panel diberi `role`/`aria-expanded` yang tepat; kelola focus-trap saat
  panel terbuka dan kembalikan fokus ke FAB saat ditutup.
- Kontras warna widget memenuhi **WCAG 2.1 AA**.
- Hormati `prefers-reduced-motion` bawaan OS.

### 5. Integrasi & batasan
- **Jangan** menampilkan widget di area dashboard admin (`app/dashboard/**`) bila
  mengganggu — cukup di halaman publik. (Boleh: render kondisional berdasar
  path via `usePathname`.)
- Pastikan tidak bentrok dengan modal Radix, `sonner` Toaster, dan peta Leaflet
  (`office-map`) — cek `z-index` dan `filter` (filter grayscale/invert bisa
  memengaruhi peta; kecualikan kontainer peta bila perlu).
- **Jangan** mengubah logika bisnis lain (OCR, permohonan, auth).

## Kualitas & Verifikasi (lakukan sebelum selesai)
1. `npm run lint` bersih, TypeScript tanpa error.
2. Uji manual di beberapa halaman: beranda (`/`), berita, permohonan online,
   halaman info. Pastikan tiap kontrol berfungsi, persist setelah reload, dan
   Reset mengembalikan semuanya.
3. Uji keyboard-only dan cek kontras.
4. Pastikan tidak ada layout shift/flicker saat reload dengan pengaturan aktif.
5. Uji mode gelap (`.dark`) tetap konsisten dengan tiap kontrol.

## Deliverable
- `components/shared/accessibility-widget.tsx` (+ file pendukung bila perlu, mis.
  `lib/a11y.ts` untuk util localStorage & konstanta, `hooks/use-a11y.ts`).
- Perubahan `app/layout.tsx` (render widget + inline init script).
- Penambahan class/selector aksesibilitas di `app/globals.css`.
- Commit rapi dengan pesan deskriptif (mis.
  `feat(a11y): widget aksesibilitas disabilitas (teks, kontras, TTS, dll)`).

> Prioritas: fungsional, tidak merusak layout, ramah keyboard, dan preferensi
> tersimpan. Estetika mengikuti sistem token/desain yang sudah ada — konsisten,
> tidak norak.
