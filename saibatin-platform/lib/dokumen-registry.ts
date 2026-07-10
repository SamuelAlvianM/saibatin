/**
 * Registry kategori dokumen publikasi (tabel t_produk, kolom `jenis`).
 * Satu sumber kebenaran untuk: dashboard upload (Dokumen Publikasi) dan
 * halaman publik mana saja yang menampilkan berkasnya — sehingga admin
 * selalu tahu "PDF ini bakal muncul di halaman apa".
 */

export interface DokumenKategori {
  /** Nilai kolom `jenis` di t_produk. */
  key: string;
  label: string;
  group: "Produk Layanan" | "PPID / Transparansi";
  /** Halaman publik yang menampilkan dokumen kategori ini. */
  halaman: { label: string; href: string }[];
}

export const DOKUMEN_KATEGORI: DokumenKategori[] = [
  // ── Produk layanan (kategori lama — nilai `jenis` dipertahankan) ──
  {
    key: "PERSYARATAN",
    label: "Formulir & Persyaratan",
    group: "Produk Layanan",
    halaman: [{ label: "Produk → Formulir & Persyaratan", href: "/produk/formulir-persyaratan" }],
  },
  {
    key: "HUKUM",
    label: "Produk Hukum",
    group: "Produk Layanan",
    halaman: [{ label: "Produk → Produk Hukum", href: "/produk/hukum" }],
  },
  {
    key: "SOP",
    label: "SOP",
    group: "Produk Layanan",
    halaman: [
      { label: "Produk → SOP", href: "/produk/sop" },
      { label: "PPID → SOP", href: "/ppid/sop" },
    ],
  },
  {
    key: "STANDAR_PELAYANAN",
    label: "Standar Pelayanan",
    group: "Produk Layanan",
    halaman: [{ label: "PPID → Standar Pelayanan", href: "/ppid/standar-pelayanan" }],
  },

  // ── PPID / transparansi ──
  {
    key: "LHKPN",
    label: "LHKPN",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → LHKPN", href: "/ppid/lhkpn" }],
  },
  {
    key: "LAPORAN_PPID",
    label: "Laporan PPID Pelaksana",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Laporan PPID Pelaksana", href: "/ppid/laporan-ppid-pelaksana" }],
  },
  {
    key: "LKJIP",
    label: "LKJIP",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → LKJIP", href: "/ppid/lkjip" }],
  },
  {
    key: "SKM_LAPORAN",
    label: "Laporan Survey Kepuasan Masyarakat",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Survey Kepuasan Masyarakat", href: "/ppid/survey-kepuasan-masyarakat" }],
  },
  {
    key: "BUKU_PROFIL",
    label: "Buku Profil Kependudukan",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Buku Profil Kependudukan", href: "/ppid/buku-profil-kependudukan" }],
  },
  {
    key: "DPA",
    label: "Dokumen Pelaksana Anggaran (DPA)",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → DPA", href: "/ppid/dpa" }],
  },
  {
    key: "IKI",
    label: "Indikator Kinerja Individu (IKI)",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → IKI", href: "/ppid/iki" }],
  },
  {
    key: "RKT",
    label: "Rencana Kinerja Tahunan (RKT)",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → RKT", href: "/ppid/rkt" }],
  },
  {
    key: "RENKA",
    label: "Rencana Kerja (Renka)",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Renka", href: "/ppid/renka" }],
  },
  {
    key: "PERJANJIAN_KERJASAMA",
    label: "Perjanjian Kerjasama",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Perjanjian Kerjasama", href: "/ppid/perjanjian-kerjasama" }],
  },
  {
    key: "RENSTRA_OPD",
    label: "Renstra OPD",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Renstra OPD", href: "/ppid/renstra-opd" }],
  },
  {
    key: "IKU",
    label: "Indikator Kinerja Utama (IKU)",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → IKU", href: "/ppid/iku" }],
  },
  {
    key: "PERJANJIAN_KINERJA",
    label: "Perjanjian Kinerja",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Perjanjian Kinerja", href: "/ppid/perjanjian-kinerja" }],
  },
  {
    key: "ZONA_INTEGRITAS",
    label: "Zona Integritas",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Zona Integritas", href: "/ppid/zona-integritas" }],
  },
  {
    key: "PENGENDALIAN_GRATIFIKASI",
    label: "Pengendalian Gratifikasi",
    group: "PPID / Transparansi",
    halaman: [{ label: "PPID → Pengendalian Gratifikasi", href: "/ppid/pengendalian-gratifikasi" }],
  },
];

export const DOKUMEN_KEYS = new Set(DOKUMEN_KATEGORI.map((k) => k.key));

export function getDokumenKategori(key: string) {
  return DOKUMEN_KATEGORI.find((k) => k.key === key);
}

/** Semua kategori (nilai `jenis`) yang berkasnya tampil di path publik tsb. */
export function dokumenJenisForPath(path: string): string[] {
  return DOKUMEN_KATEGORI.filter((k) =>
    k.halaman.some((h) => h.href === path),
  ).map((k) => k.key);
}
