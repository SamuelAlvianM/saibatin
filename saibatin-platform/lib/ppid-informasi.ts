import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Coins,
  FileCheck,
  FileText,
  Flag,
  Gauge,
  Gift,
  Handshake,
  ShieldCheck,
  Smile,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Dua klasifikasi Informasi Publik PPID (UU No. 14 Tahun 2008) yang tampil
 * sebagai halaman indeks kartu (bukan submenu navbar): satu sumber untuk
 * halaman /ppid/informasi-setiap-saat, /ppid/informasi-berkala, navbar,
 * dan editor Konten Halaman.
 */

export interface PpidInformasiItem {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  /** Kelas gradien Tailwind untuk kotak ikon kartu (mis. "from-sky-400 to-sky-600"). */
  gradasi: string;
}

export interface PpidInformasiGrup {
  slug: string;
  /** Judul lengkap halaman indeks. */
  judul: string;
  /** Label pendek (dipakai editor Konten sebagai nama grup). */
  judulPendek: string;
  href: string;
  deskripsi: string;
  items: PpidInformasiItem[];
}

export const PPID_SETIAP_SAAT: PpidInformasiGrup = {
  slug: 'informasi-setiap-saat',
  judul: 'Informasi Wajib Tersedia Setiap Saat',
  judulPendek: 'Setiap Saat',
  href: '/ppid/informasi-setiap-saat',
  deskripsi:
    'Daftar Informasi Publik yang wajib disediakan dan dapat diakses masyarakat setiap saat, sesuai amanat Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik. Pilih salah satu kategori untuk melihat dokumen resminya.',
  items: [
    {
      title: 'Laporan PPID Pelaksana',
      href: '/ppid/laporan-ppid-pelaksana',
      description: 'Laporan pelaksanaan tugas layanan informasi publik PPID Pelaksana.',
      icon: FileText,
      gradasi: 'from-sky-400 to-sky-600',
    },
    {
      title: 'LKJIP (Laporan Kinerja Instansi Pemerintah)',
      href: '/ppid/lkjip',
      description: 'Laporan kinerja tahunan Disdukcapil Kabupaten Pesisir Barat.',
      icon: ClipboardCheck,
      gradasi: 'from-amber-400 to-amber-600',
    },
    {
      title: 'Survey Kepuasan Masyarakat',
      href: '/ppid/survey-kepuasan-masyarakat',
      description: 'Hasil pengukuran kepuasan masyarakat terhadap pelayanan publik.',
      icon: Smile,
      gradasi: 'from-emerald-400 to-emerald-600',
    },
    {
      title: 'Buku Profil Kependudukan',
      href: '/ppid/buku-profil-kependudukan',
      description: 'Buku profil data kependudukan Kabupaten Pesisir Barat.',
      icon: BookOpen,
      gradasi: 'from-violet-400 to-violet-600',
    },
    {
      title: 'Dokumen Pelaksana Anggaran (DPA)',
      href: '/ppid/dpa',
      description: 'Dokumen pelaksanaan anggaran tahunan perangkat daerah.',
      icon: Coins,
      gradasi: 'from-teal-400 to-teal-600',
    },
    {
      title: 'Indikator Kinerja Individu (IKI)',
      href: '/ppid/iki',
      description: 'Indikator kinerja individu pegawai di lingkungan Disdukcapil.',
      icon: Target,
      gradasi: 'from-rose-400 to-rose-600',
    },
    {
      title: 'Rencana Kinerja Tahunan (RKT)',
      href: '/ppid/rkt',
      description: 'Rencana kinerja tahunan Disdukcapil Kabupaten Pesisir Barat.',
      icon: CalendarDays,
      gradasi: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Rencana Kerja (Renka)',
      href: '/ppid/renka',
      description: 'Rencana kerja tahunan instansi.',
      icon: ClipboardList,
      gradasi: 'from-slate-500 to-slate-700',
    },
    {
      title: 'Perjanjian Kerjasama',
      href: '/ppid/perjanjian-kerjasama',
      description: 'Daftar perjanjian kerjasama Disdukcapil dengan pihak lain.',
      icon: Handshake,
      gradasi: 'from-cyan-400 to-cyan-600',
    },
  ],
};

export const PPID_BERKALA: PpidInformasiGrup = {
  slug: 'informasi-berkala',
  judul: 'Informasi Wajib Diumumkan Secara Berkala',
  judulPendek: 'Berkala',
  href: '/ppid/informasi-berkala',
  deskripsi:
    'Daftar Informasi Publik yang wajib disediakan dan diumumkan secara berkala oleh Badan Publik, sesuai amanat Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik. Pilih salah satu kategori untuk melihat dokumen resminya.',
  items: [
    {
      title: 'Renstra OPD',
      href: '/ppid/renstra-opd',
      description: 'Rencana Strategis Organisasi Perangkat Daerah.',
      icon: Flag,
      gradasi: 'from-sky-400 to-sky-600',
    },
    {
      title: 'Standar Pelayanan',
      href: '/ppid/standar-pelayanan',
      description: 'Standar pelayanan publik Disdukcapil Kabupaten Pesisir Barat.',
      icon: BadgeCheck,
      gradasi: 'from-emerald-400 to-emerald-600',
    },
    {
      title: 'Indikator Kinerja Utama (IKU)',
      href: '/ppid/iku',
      description: 'Indikator kinerja utama instansi.',
      icon: Gauge,
      gradasi: 'from-amber-400 to-amber-600',
    },
    {
      title: 'Perjanjian Kinerja',
      href: '/ppid/perjanjian-kinerja',
      description: 'Perjanjian kinerja pejabat Disdukcapil Kabupaten Pesisir Barat.',
      icon: FileCheck,
      gradasi: 'from-violet-400 to-violet-600',
    },
    {
      title: 'Standar Operasional Prosedur (SOP)',
      href: '/ppid/sop',
      description: 'Standar operasional prosedur pelayanan.',
      icon: ClipboardCheck,
      gradasi: 'from-teal-400 to-teal-600',
    },
    {
      title: 'LHKPN',
      href: '/ppid/lhkpn',
      description: 'Laporan Harta Kekayaan Penyelenggara Negara pejabat Disdukcapil.',
      icon: Wallet,
      gradasi: 'from-rose-400 to-rose-600',
    },
    {
      title: 'Zona Integritas',
      href: '/ppid/zona-integritas',
      description: 'Pembangunan zona integritas menuju WBK/WBBM.',
      icon: ShieldCheck,
      gradasi: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Pengendalian Gratifikasi',
      href: '/ppid/pengendalian-gratifikasi',
      description: 'Kebijakan dan pelaporan pengendalian gratifikasi.',
      icon: Gift,
      gradasi: 'from-cyan-400 to-cyan-600',
    },
  ],
};

export const PPID_INFORMASI_GRUP = [PPID_SETIAP_SAAT, PPID_BERKALA];
