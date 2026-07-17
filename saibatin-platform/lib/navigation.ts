/**
 * Struktur menu navbar publik — satu sumber untuk Navbar dan editor
 * Konten Halaman di dashboard (sidebar + submenu preview).
 */

export interface NavSubItem {
  title: string;
  href: string;
  description: string;
}

export interface NavItem {
  title: string;
  href: string;
  description: string;
  subItems?: NavSubItem[];
}

export interface NavMenu {
  title: string;
  /** Link langsung (menu tanpa dropdown). Abaikan bila `items` diisi. */
  href?: string;
  items?: NavItem[];
}

export const navigationItems: NavMenu[] = [
  {
    // Tanpa dropdown — langsung ke halaman permohonan online.
    title: "Pelayanan Online",
    href: "/permohonan-online",
  },
  {
    title: "Produk",
    items: [
      {
        title: "Produk Disdukcapil",
        href: "/produk/produk-disdukcapil",
        description: "Produk dan layanan Disdukcapil",
      },
      {
        title: "Formulir Persyaratan",
        href: "/produk/formulir-persyaratan",
        description: "Persyaratan pengurusan dokumen kependudukan",
      },
      {
        title: "Hukum",
        href: "/produk/hukum",
        description: "Produk hukum terkait kependudukan",
      },

      {
        title: "Standar Operasional Prosedur (SOP)",
        href: "/produk/sop",
        description: "Standar operasional prosedur pelayanan",
      },
    ],
  },
  {
    title: "Media Informasi",
    items: [
      {
        title: "Berita",
        href: "/media/berita",
        description: "Berita dan informasi terkini",
      },
      {
        title: "Galeri",
        href: "/galeri",
        description: "Dokumentasi kegiatan Disdukcapil",
      },
      // "Data Demografi" (submenu per kategori) dihapus — sudah tercakup
      // halaman indeks "Laporan Data Demografi" di bawah.
      // "Peta" dihapus dari menu — sudah tercakup GIS Dukcapil di bawah.
      // "Survey Kepuasan Masyarakat" dipindah ke halaman Hubungi Kami.
      {
        title: "GIS Dukcapil — Peta Sebaran Penduduk",
        href: "/media/gis",
        description: "Peta sebaran jumlah penduduk per kecamatan",
      },
      {
        // Langsung ke halaman data ber-tab kategori (tanpa halaman indeks kartu).
        title: "Laporan Data Demografi",
        href: "/media/demografi",
        description: "Laporan lengkap data demografi",
      },
    ],
  },
  {
    title: "Pengaduan",
    items: [
      {
        title: "Pengaduan Masyarakat",
        href: "/pengaduan",
        description:
          "Sampaikan pengaduan layanan maupun laporan dugaan pelanggaran (WBS) — identitas pelapor dijaga kerahasiaannya",
      },
      {
        title: "Kritik & Saran",
        href: "/hubungi-kami/kritik-saran",
        description: "Kritik dan saran untuk peningkatan layanan",
      },
      // "Hubungi Kami" dihapus dari menu Pengaduan — sudah ada menu utama Hubungi Kami.
    ],
  },
  {
    title: "PPID",
    items: [
      {
        title: "Profil PPID",
        href: "/ppid/profil-ppid",
        description: "Profil PPID Disdukcapil",
      },
      // Dua klasifikasi informasi publik kini berupa halaman indeks kartu
      // (daftar lengkap kategorinya ada di lib/ppid-informasi.ts) — klik
      // langsung masuk halaman, tanpa submenu melayang.
      {
        title: "Informasi Wajib Tersedia Setiap Saat",
        href: "/ppid/informasi-setiap-saat",
        description:
          "Daftar Informasi Publik yang wajib tersedia setiap saat (UU No. 14 Tahun 2008)",
      },
      {
        title: "Informasi Wajib Diumumkan Secara Berkala",
        href: "/ppid/informasi-berkala",
        description:
          "Daftar Informasi Publik yang wajib diumumkan secara berkala (UU No. 14 Tahun 2008)",
      },
    ],
  },
  // Menu "WBS" dilebur ke menu Pengaduan — satu kanal untuk pengaduan layanan
  // sekaligus Whistle Blowing System. Halaman /wbs/tentang-wbs dan
  // /wbs/form-pengaduan tetap dapat diakses (tercantum di peta situs).
  {
    // Tanpa dropdown — langsung ke halaman info kontak (alamat, jam kerja,
    // peta, tombol pengaduan).
    title: "Hubungi Kami",
    href: "/hubungi-kami",
  },
];
