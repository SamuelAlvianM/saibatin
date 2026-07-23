/**
 * Registry 15 layanan permohonan warga — satu sumber kebenaran untuk halaman
 * pemilih (/user/pengajuan/baru) dan halaman form (/user/pengajuan/baru/[layanan]).
 *
 * Sebelumnya daftar ini tertanam di app/permohonan-online/page.tsx dan tiap
 * layanan dibuka sebagai modal. Sejak permohonan dipindah ke dashboard, tiap
 * layanan punya URL sendiri sehingga bisa di-bookmark dan dibuka langsung.
 *
 * `icon` disimpan sebagai NAMA (bukan komponen) agar berkas ini aman dipakai
 * dari server component — resolusi ikon lewat lib/icon-map.ts.
 */

export interface LayananPermohonan {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: "akta" | "kk" | "identitas" | "pindah" | "data";
  color: string;
}

export const LAYANAN_PERMOHONAN: LayananPermohonan[] = [
  {
    slug: "konsolidasi-update-data",
    title: "Konsolidasi Update Data",
    description: "Pengecekan dan penyesuaian data kependudukan",
    icon: "FileText",
    category: "data",
    color: "from-primary to-primary/70",
  },
  {
    slug: "akta-kelahiran-belum-nik",
    title: "Akta Kelahiran (Blm Ada Nik)",
    description: "Penerbitan akta kelahiran untuk yang belum memiliki NIK",
    icon: "Baby",
    category: "akta",
    color: "from-pink-500 to-rose-600",
  },
  {
    slug: "akta-kelahiran-ada-nik",
    title: "Akta Kelahiran (Ada Nik)",
    description: "Penerbitan akta kelahiran untuk yang sudah memiliki NIK",
    icon: "Baby",
    category: "akta",
    color: "from-pink-500 to-rose-600",
  },
  {
    slug: "kk-perubahan-biodata",
    title: "Kartu Keluarga Perubahan Biodata",
    description: "Perubahan data pada Kartu Keluarga",
    icon: "Users",
    category: "kk",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "kk-pisah-kk",
    title: "Kartu Keluarga Pisah KK",
    description: "Pemisahan Kartu Keluarga",
    icon: "Users",
    category: "kk",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "kk-numpang-kk",
    title: "Kartu Keluarga Numpang KK",
    description: "Penambahan anggota keluarga yang numpang",
    icon: "Users",
    category: "kk",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "kk-penambahan-anak",
    title: "Kartu Keluarga Penambahan Anak",
    description: "Penambahan data anak dalam Kartu Keluarga",
    icon: "UserPlus",
    category: "kk",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "kk-cetak-ulang",
    title: "Kartu Keluarga Cetak Ulang",
    description: "Pencetakan ulang Kartu Keluarga",
    icon: "Printer",
    category: "kk",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "akta-perceraian",
    title: "Akta Perceraian",
    description: "Penerbitan akta perceraian",
    icon: "ScrollText",
    category: "akta",
    color: "from-warning to-warning/70",
  },
  {
    slug: "akta-kematian",
    title: "Akta Kematian",
    description: "Penerbitan akta kematian",
    icon: "Heart",
    category: "akta",
    color: "from-slate-500 to-slate-700",
  },
  {
    slug: "akta-perkawinan",
    title: "Akta Perkawinan",
    description: "Penerbitan akta perkawinan",
    icon: "Book",
    category: "akta",
    color: "from-destructive to-destructive/70",
  },
  {
    slug: "kartu-identitas-anak",
    title: "Kartu Identitas Anak (KIA)",
    description: "Penerbitan Kartu Identitas Anak",
    icon: "IdCard",
    category: "identitas",
    color: "from-success to-success/70",
  },
  {
    slug: "perpindahan-penduduk",
    title: "Perpindahan Penduduk",
    description: "Layanan perpindahan alamat penduduk",
    icon: "MapPin",
    category: "pindah",
    color: "from-primary to-primary/70",
  },
  {
    slug: "kedatangan-penduduk",
    title: "Kedatangan Penduduk",
    description: "Pencatatan kedatangan penduduk baru",
    icon: "Home",
    category: "pindah",
    color: "from-primary to-primary/70",
  },
  {
    slug: "ktp-elektronik",
    title: "KTP Elektronik",
    description: "Penerbitan dan pembaruan KTP Elektronik",
    icon: "Zap",
    category: "identitas",
    color: "from-warning to-warning/70",
  },
];

export const KATEGORI_LAYANAN = [
  { id: "all", name: "Semua Layanan", icon: "FileText" },
  { id: "akta", name: "Akta", icon: "ScrollText" },
  { id: "kk", name: "Kartu Keluarga", icon: "Users" },
  { id: "identitas", name: "Identitas", icon: "IdCard" },
  { id: "pindah", name: "Perpindahan", icon: "MapPin" },
  { id: "data", name: "Data", icon: "FileText" },
] as const;

export function getLayanan(slug: string) {
  return LAYANAN_PERMOHONAN.find((l) => l.slug === slug);
}

/**
 * Peta slug rute publik (di atas) → slug skema form tersegmentasi
 * (lib/layanan-forms.ts, `LAYANAN_FORMS`). Rute publik memakai slug yang mudah
 * dibaca/di-bookmark; API catch-all & skema form memakai slug warisan Laravel.
 * Keduanya menunjuk layanan yang sama — pemetaan ini menyatukannya sehingga
 * form warga/OPD bisa memakai renderer segmen yang sama dengan form petugas.
 */
export const ROUTE_KE_FORM_SLUG: Record<string, string> = {
  "konsolidasi-update-data": "konsolidasi-update-data",
  "akta-kelahiran-belum-nik": "akta-kelahiran-nik-tidak-ada",
  "akta-kelahiran-ada-nik": "akta-kelahiran-nik-ada",
  "kk-perubahan-biodata": "kk-perubahan-biodata",
  "kk-pisah-kk": "kk-pisah",
  "kk-numpang-kk": "kk-numpang",
  "kk-penambahan-anak": "kk-tambah-anak",
  "kk-cetak-ulang": "kk-cetak-ulang",
  "akta-perceraian": "akta-perceraian",
  "akta-kematian": "akta-kematian",
  "akta-perkawinan": "akta-nikah",
  "kartu-identitas-anak": "kia",
  "perpindahan-penduduk": "perpindahan-penduduk",
  "kedatangan-penduduk": "kedatangan",
  "ktp-elektronik": "ktpel",
};
