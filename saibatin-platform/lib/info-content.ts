import type { InfoPageContent } from '@/components/shared/info-page';

/**
 * Konten statis untuk halaman informasi (Produk, PPID, WBS, Hubungi Kami).
 * Diisi placeholder yang relevan untuk Disdukcapil Pesisir Barat (SAIBATIN)
 * hingga konten asli dari portal lama tersedia untuk dipindahkan.
 */
export const produkContent: Record<string, InfoPageContent> = {
  'produk-disdukcapil': {
    title: 'Produk Disdukcapil',
    description: 'Daftar dokumen kependudukan dan pencatatan sipil yang diterbitkan.',
    list: [
      'Kartu Keluarga (KK)',
      'Kartu Tanda Penduduk Elektronik (KTP-el)',
      'Kartu Identitas Anak (KIA)',
      'Akta Kelahiran',
      'Akta Kematian',
      'Akta Perkawinan',
      'Akta Perceraian',
      'Surat Keterangan Pindah Datang',
    ],
  },
  'formulir-persyaratan': {
    title: 'Formulir & Persyaratan',
    description: 'Persyaratan dokumen untuk setiap jenis permohonan layanan adminduk.',
    body: [
      'Setiap permohonan layanan administrasi kependudukan memerlukan dokumen pendukung yang berbeda-beda sesuai jenis layanannya. Persyaratan lengkap dapat dilihat saat mengisi formulir Permohonan Online, atau ditanyakan langsung ke loket pelayanan.',
    ],
    list: [
      'KK & KTP-el: fotokopi KK lama, surat pengantar RT/RW',
      'Akta Kelahiran: surat keterangan lahir dari bidan/rumah sakit, KK orang tua',
      'Akta Kematian: surat keterangan kematian, KTP/KK almarhum',
      'Pindah Datang: surat pengantar dari daerah asal/tujuan',
    ],
  },
  hukum: {
    title: 'Produk Hukum',
    description: 'Dasar hukum penyelenggaraan administrasi kependudukan.',
    list: [
      'UU No. 23 Tahun 2006 tentang Administrasi Kependudukan',
      'UU No. 24 Tahun 2013 tentang Perubahan UU Adminduk',
      'Peraturan Pemerintah No. 40 Tahun 2019',
      'Peraturan Menteri Dalam Negeri terkait pelayanan Dukcapil',
      'Peraturan Daerah Kabupaten Pesisir Barat terkait Disdukcapil',
    ],
  },
  sop: {
    title: 'Standar Operasional Prosedur (SOP)',
    description: 'SOP pelayanan administrasi kependudukan Disdukcapil Pesisir Barat.',
    body: [
      'SOP pelayanan disusun untuk menjamin kepastian waktu, biaya (gratis), dan prosedur dalam setiap layanan adminduk.',
    ],
  },
};

export const ppidContent: Record<string, InfoPageContent> = {
  'profil-ppid': {
    title: 'Profil PPID',
    description: 'Pejabat Pengelola Informasi dan Dokumentasi Disdukcapil Pesisir Barat.',
    body: [
      'PPID (Pejabat Pengelola Informasi dan Dokumentasi) bertugas mengelola dan menyajikan informasi publik di lingkungan Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat, sesuai amanat UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.',
    ],
  },
  'laporan-ppid-pelaksana': {
    title: 'Laporan PPID Pelaksana',
    description: 'Laporan pelaksanaan tugas PPID pelaksana tahunan.',
  },
  lkjip: {
    title: 'LKJIP',
    description: 'Laporan Kinerja Instansi Pemerintah Disdukcapil Pesisir Barat.',
  },
  'survey-kepuasan-masyarakat': {
    title: 'Survey Kepuasan Masyarakat',
    description: 'Hasil survey kepuasan masyarakat terhadap pelayanan publik.',
  },
  'buku-profil-kependudukan': {
    title: 'Buku Profil Kependudukan',
    description: 'Buku profil data kependudukan Kabupaten Pesisir Barat.',
  },
  dpa: {
    title: 'Dokumen Pelaksana Anggaran (DPA)',
    description: 'Dokumen pelaksanaan anggaran tahunan Disdukcapil.',
  },
  iki: {
    title: 'Indikator Kinerja Individu (IKI)',
    description: 'Indikator kinerja individu pegawai Disdukcapil Pesisir Barat.',
  },
  rkt: {
    title: 'Rencana Kinerja Tahunan (RKT)',
    description: 'Rencana kinerja tahunan Disdukcapil Pesisir Barat.',
  },
  renka: {
    title: 'Rencana Kerja (Renka)',
    description: 'Rencana kerja tahunan instansi.',
  },
  'perjanjian-kerjasama': {
    title: 'Perjanjian Kerjasama',
    description: 'Daftar perjanjian kerjasama Disdukcapil dengan pihak lain.',
  },
  'renstra-opd': {
    title: 'Renstra OPD',
    description: 'Rencana Strategis Organisasi Perangkat Daerah.',
  },
  'standar-pelayanan': {
    title: 'Standar Pelayanan',
    description: 'Standar pelayanan publik Disdukcapil Pesisir Barat.',
  },
  iku: {
    title: 'Indikator Kinerja Utama (IKU)',
    description: 'Indikator kinerja utama instansi.',
  },
  'perjanjian-kinerja': {
    title: 'Perjanjian Kinerja',
    description: 'Perjanjian kinerja pejabat Disdukcapil Pesisir Barat.',
  },
  'sop': {
    title: 'Standar Operasional Prosedur (SOP)',
    description: 'SOP PPID Disdukcapil Pesisir Barat.',
  },
  'zona-integritas': {
    title: 'Zona Integritas',
    description: 'Pembangunan zona integritas menuju WBK/WBBM.',
  },
  'pengendalian-gratifikasi': {
    title: 'Pengendalian Gratifikasi',
    description: 'Kebijakan dan pelaporan pengendalian gratifikasi.',
  },
};

export const wbsContent: Record<string, InfoPageContent> = {
  'tentang-wbs': {
    title: 'Tentang WBS',
    description: 'Whistle Blowing System Disdukcapil Pesisir Barat.',
    body: [
      'Whistle Blowing System (WBS) adalah sarana pelaporan dugaan pelanggaran/tindak pidana korupsi di lingkungan Disdukcapil Pesisir Barat. Identitas pelapor dijamin kerahasiaannya.',
    ],
  },
  'form-pengaduan': {
    title: 'Form Pengaduan WBS',
    description: 'Sampaikan laporan dugaan pelanggaran melalui form pengaduan resmi.',
    body: [
      'Untuk menyampaikan pengaduan masyarakat secara umum, gunakan halaman Pengaduan Masyarakat. Form WBS khusus untuk pelaporan dugaan pelanggaran/korupsi akan segera tersedia.',
    ],
  },
};

export const hubungiKamiContent: Record<string, InfoPageContent> = {
  alamat: {
    title: 'Alamat Disdukcapil',
    description: 'Alamat dan informasi kontak kantor Disdukcapil Pesisir Barat.',
    body: [
      'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat',
      'Jl. Pelayanan Publik, Kabupaten Pesisir Barat, Provinsi Lampung',
    ],
  },
  kontak: {
    title: 'Kontak Kami',
    description: 'Hubungi Disdukcapil Pesisir Barat melalui kanal berikut.',
    list: [
      'Telepon: (0728) 21XXX',
      'Email: disdukcapil@pesisirbaratkab.go.id',
      'Jam Layanan: Senin–Jumat, 08.00–16.00 WIB',
    ],
  },
  'kritik-saran': {
    title: 'Kritik & Saran',
    description: 'Sampaikan kritik dan saran Anda untuk peningkatan pelayanan Disdukcapil Pesisir Barat.',
    body: [
      'Gunakan halaman Pengaduan Masyarakat untuk menyampaikan kritik, saran, atau keluhan terkait pelayanan. Setiap masukan akan menjadi bahan evaluasi peningkatan mutu layanan.',
    ],
  },
  'pengaduan-masyarakat': {
    title: 'Pengaduan Masyarakat',
    description: 'Sampaikan keluhan atau saran terkait pelayanan Disdukcapil.',
  },
};
