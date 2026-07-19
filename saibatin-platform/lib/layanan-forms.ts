/**
 * Skema formulir permohonan untuk mode "Pengajuan Baru" (dibantu petugas).
 * Setiap layanan memetakan ke slug catch-all /api/<slug>/(upload|create)
 * yang sudah ada di app/api/[layanan]/[action]/route.ts.
 *
 * SUMBER KEBENARAN: form asli portal lama app.pesbar.002
 * (resources/views/fronts/permohonans/*.blade.php + validasi controller-nya).
 * Nama field & dokumen mengikuti form lama agar payload konsisten dengan
 * data migrasi dan kamus label lib/permohonan-display.ts.
 */

export type FieldType =
  | 'text'
  | 'nik'
  | 'kk'
  | 'phone'
  | 'email'
  | 'date'
  | 'time'
  | 'number'
  | 'textarea'
  | 'select'
  | 'file';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  half?: boolean; // tampil setengah lebar (grid 2 kolom)
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
}

export interface LayananForm {
  slug: string; // harus cocok dengan key LAYANAN_KODE di API
  title: string;
  desc: string;
  icon: string; // nama lucide icon (di-resolve di komponen)
  sections: SectionDef[];
}

// Blok data pemohon — sama untuk semua layanan (persis form lama).
const pemohon: SectionDef = {
  title: 'Data Pemohon',
  fields: [
    { name: 'pemohonnik', label: 'NIK Pemohon', type: 'nik', required: true, half: true },
    { name: 'pemohonnama', label: 'Nama Pemohon', type: 'text', required: true, half: true },
    { name: 'pemohonkk', label: 'KK Pemohon', type: 'kk', required: true, half: true },
    { name: 'pemohonhp', label: 'No. Telp Pemohon', type: 'phone', required: true, half: true },
    { name: 'pemohonemail', label: 'Email Pemohon', type: 'email', required: true },
  ],
};

const catatanSection: SectionDef = {
  title: 'Catatan',
  fields: [
    {
      name: 'catatan',
      label: 'Catatan (opsional)',
      type: 'textarea',
      placeholder:
        'Silahkan isi catatan disini kalau ada pesan yang akan disampaikan ke petugas...',
    },
  ],
};

const f = (name: string, label: string, type: FieldType = 'text', opts: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type,
  ...opts,
});

// ── Opsi dropdown (mengikuti m_options / form lama) ──
const OPT_JENIS_KELAMIN = ['Laki-laki', 'Perempuan'];
const OPT_TEMPAT_DILAHIRKAN = ['Rumah Sakit/Bersalin', 'Puskesmas', 'Polindes', 'Rumah', 'Lainnya'];
const OPT_JENIS_KELAHIRAN = ['Tunggal', 'Kembar Dua', 'Kembar Tiga', 'Kembar Empat', 'Kembar Banyak/Lainnya'];
const OPT_PENOLONG = ['Dokter', 'Bidan/Perawat', 'Dukun', 'Lainnya'];
const OPT_AGAMA = ['Islam', 'Kristen', 'Katholik', 'Hindu', 'Budha', 'Konghuchu', 'Kepercayaan'];
const OPT_GOLDAR = ['A', 'A+', 'A-', 'B', 'B+', 'B-', 'AB', 'AB+', 'AB-', 'O', 'O+', 'O-', 'Tidak Tahu'];
const OPT_PENDIDIKAN = [
  'Tidak/Belum Sekolah', 'Belum Tamat SD/Sederajat', 'Tamat SD/Sederajat',
  'SLTP/Sederajat', 'SLTA/Sederajat', 'Diploma I/II',
  'Akademi/Diploma III/Sarjana Muda', 'Diploma IV/Strata I', 'Strata II', 'Strata III',
];
const OPT_STATUS_KAWIN = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];
const OPT_JENIS_BIODATA = [
  'Nama Lengkap', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Golongan Darah',
  'Agama', 'Pendidikan', 'Pekerjaan', 'Nama Ayah', 'Nama Ibu', 'Status Perkawinan',
];

// Blok data anak + kelahiran + saksi — dipakai kedua form akta kelahiran.
const kelahiranFields = (withNikBayi: boolean): FieldDef[] => [
  ...(withNikBayi ? [f('nikbayi', 'NIK Bayi', 'nik', { required: true, half: true })] : []),
  f('namalengkap', 'Nama Lengkap', 'text', { required: true, half: !withNikBayi ? false : true }),
  f('jeniskelamin', 'Jenis Kelamin', 'select', { required: true, half: true, options: OPT_JENIS_KELAMIN }),
  f('tgllahir', 'Tanggal Lahir', 'date', { required: true, half: true }),
  f('nikayah', 'NIK Ayah', 'nik', { required: true, half: true }),
  f('namaayah', 'Nama Ayah', 'text', { required: true, half: true }),
  f('pekerjaan', 'Pekerjaan', 'text', { required: true, half: true }),
  f('nikibu', 'NIK Ibu', 'nik', { required: true, half: true }),
  f('namaibu', 'Nama Ibu', 'text', { required: true, half: true }),
  f('anakke', 'Anak Ke', 'number', { required: true, half: true }),
  f('tempatdilahirkan', 'Tempat Dilahirkan', 'select', { required: true, half: true, options: OPT_TEMPAT_DILAHIRKAN }),
  f('tempatkelahiran', 'Tempat Kelahiran', 'text', { required: true, half: true }),
  f('jamkelahiran', 'Jam Kelahiran', 'time', { required: true, half: true }),
  f('jeniskelahiran', 'Jenis Kelahiran', 'select', { required: true, half: true, options: OPT_JENIS_KELAHIRAN }),
  f('berat', 'Berat (kg)', 'text', { required: true, half: true }),
  f('panjang', 'Panjang (cm)', 'text', { required: true, half: true }),
  f('penolong', 'Penolong', 'select', { required: true, half: true, options: OPT_PENOLONG }),
  f('niksaksi1', 'NIK Saksi I', 'nik', { required: true, half: true }),
  f('namasaksi1', 'Nama Lengkap Saksi I', 'text', { required: true, half: true }),
  f('niksaksi2', 'NIK Saksi II', 'nik', { required: true, half: true }),
  f('namasaksi2', 'Nama Lengkap Saksi II', 'text', { required: true, half: true }),
];

const kelahiranDokumen: SectionDef = {
  title: 'Dokumen Syarat',
  fields: [
    f('filebukunikah', 'File Buku Nikah/SPTJM Asli', 'file', { required: true }),
    f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
    f('fileketeranganlahir', 'File Keterangan Lahir/SPTJM Asli', 'file', { required: true }),
    f('filektpsaksi1', 'File KTP Saksi I', 'file', { required: true }),
    f('filektpsaksi2', 'File KTP Saksi II', 'file', { required: true }),
    f('filektpayah', 'File KTP Ayah', 'file'),
    f('filektpibu', 'File KTP Ibu', 'file'),
    f('filependukung1', 'File Dokumen Pendukung I', 'file'),
    f('filependukung2', 'File Dokumen Pendukung II', 'file'),
  ],
};

export const LAYANAN_FORMS: LayananForm[] = [
  {
    slug: 'konsolidasi-update-data',
    title: 'Konsolidasi Data',
    desc: 'Pengecekan dan penyesuaian data kependudukan.',
    icon: 'FileText',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('namakepalakeluarga', 'Nama Kepala Keluarga', 'text', { required: true, half: true }),
          f('alasankonsolidasidata', 'Alasan Konsolidasi Data', 'select', {
            required: true,
            half: true,
            options: ['BPJS', 'Imigrasi', 'Kartu Pra-Kerja', 'Kepolisian', 'Perbankan', 'Telekomunikasi', 'Vaksin', 'Lainnya'],
          }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filektp', 'File KTP', 'file', { required: true }),
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('filependukung1', 'File Pendukung', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'akta-kelahiran-nik-tidak-ada',
    title: 'Akta Kelahiran (Blm Ada NIK)',
    desc: 'Penerbitan akta kelahiran untuk yang belum memiliki NIK.',
    icon: 'Baby',
    sections: [
      pemohon,
      { title: 'Kelengkapan Data', fields: kelahiranFields(false) },
      kelahiranDokumen,
      catatanSection,
    ],
  },
  {
    slug: 'akta-kelahiran-nik-ada',
    title: 'Akta Kelahiran (Ada NIK)',
    desc: 'Penerbitan akta kelahiran untuk yang sudah memiliki NIK.',
    icon: 'Baby',
    sections: [
      pemohon,
      { title: 'Kelengkapan Data', fields: kelahiranFields(true) },
      kelahiranDokumen,
      catatanSection,
    ],
  },
  {
    slug: 'kk-perubahan-biodata',
    title: 'KK Perubahan Biodata',
    desc: 'Perubahan data pada Kartu Keluarga.',
    icon: 'Users',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('kk', 'Nomor KK', 'kk', { required: true, half: true }),
          f('nik', 'Nomor NIK', 'nik', { required: true, half: true }),
          f('jenisbiodata', 'Jenis Biodata yang Diubah', 'select', { required: true, options: OPT_JENIS_BIODATA }),
          f('namalengkap', 'Nama Lengkap', 'text', { half: true }),
          f('jeniskelamin', 'Jenis Kelamin', 'select', { half: true, options: OPT_JENIS_KELAMIN }),
          f('tempatlahir', 'Tempat Lahir', 'text', { half: true }),
          f('tanggallahir', 'Tanggal Lahir', 'date', { half: true }),
          f('golongandarah', 'Golongan Darah', 'select', { half: true, options: OPT_GOLDAR }),
          f('agama', 'Agama', 'select', { half: true, options: OPT_AGAMA }),
          f('pendidikan', 'Pendidikan', 'select', { half: true, options: OPT_PENDIDIKAN }),
          f('pekerjaan', 'Pekerjaan', 'text', { half: true }),
          f('namaayah', 'Nama Ayah', 'text', { half: true }),
          f('namaibu', 'Nama Ibu', 'text', { half: true }),
          f('statusperkawinan', 'Status Perkawinan', 'select', { half: true, options: OPT_STATUS_KAWIN }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('fileaktalahir', 'File Akta Lahir', 'file'),
          f('fileijazah', 'File Ijazah', 'file'),
          f('filebukunikah', 'File Buku Nikah', 'file'),
          f('filependukung1', 'File Pendukung', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'kk-pisah',
    title: 'KK Pisah KK',
    desc: 'Pemisahan Kartu Keluarga.',
    icon: 'Users',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('jenispisah', 'Jenis Pisah', 'select', {
            required: true,
            half: true,
            options: ['Pisah KK dengan Pasangan', 'Pisah KK dengan Anggota Keluarga'],
          }),
          f('alasanpisah', 'Alasan Pisah', 'select', {
            required: true,
            half: true,
            options: [
              'Menikah', 'Menikah & Pindah Alamat', 'Cerai', 'Cerai & Pindah Alamat',
              'Cerai Mati', 'Cerai Mati & Pindah Alamat', 'Kepala Keluarga Meninggal',
              'Kepala Keluarga Meninggal & Pindah Alamat', 'Anak Keluarga Meninggal',
              'Anak Keluarga Meninggal & Pindah Alamat',
            ],
          }),
          f('nikygpisah', 'NIK Yang Pisah', 'textarea', { required: true, placeholder: 'Tulis NIK yang pisah — satu NIK per baris' }),
          f('nikpasangan', 'Nomor NIK Pasangan', 'nik', { half: true }),
          f('kecamatantujuan', 'Kecamatan Tujuan', 'text', { half: true }),
          f('kelurahantujuan', 'Kelurahan Tujuan', 'text', { half: true }),
          f('norwtujuan', 'Nomor RW Tujuan', 'text', { half: true }),
          f('norttujuan', 'Nomor RT Tujuan', 'text', { half: true }),
          f('alamattujuan', 'Alamat Tujuan', 'textarea'),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('filekkpasangan', 'File KK Pasangan', 'file'),
          f('filebukunikah', 'File Buku Nikah', 'file'),
          f('filesuratcerai', 'File Surat Cerai', 'file'),
          f('fileaktamati', 'File Akta Mati', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'kk-numpang',
    title: 'KK Numpang KK',
    desc: 'Penambahan anggota keluarga yang menumpang.',
    icon: 'Users',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('kklama', 'Nomor KK Lama', 'kk', { required: true, half: true }),
          f('kkygditempati', 'Nomor KK Yang Ditempati', 'kk', { required: true, half: true }),
          f('nikygnumpangkk', 'NIK Yang Numpang KK', 'textarea', { required: true, placeholder: 'Tulis NIK yang menumpang — satu NIK per baris' }),
          f('alasannumpangkk', 'Alasan Numpang KK', 'select', {
            required: true,
            options: ['Pekerjaan', 'Pendidikan', 'Perawatan Kesehatan', 'Lainnya'],
          }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekklama', 'File Kartu Keluarga Lama', 'file', { required: true }),
          f('filekkygditempati', 'File KK Yang Ditempati', 'file', { required: true }),
          f('filependukung1', 'File Pendukung', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'kk-tambah-anak',
    title: 'KK Penambahan Anak',
    desc: 'Penambahan data anak dalam Kartu Keluarga.',
    icon: 'UserPlus',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('namaanggotakeluarga', 'Nama Anggota Keluarga', 'text', { required: true, half: true }),
          f('tempatlahir', 'Tempat Lahir', 'text', { required: true, half: true }),
          f('tanggallahir', 'Tanggal Lahir', 'date', { required: true, half: true }),
          f('jeniskelamin', 'Jenis Kelamin', 'select', { required: true, half: true, options: OPT_JENIS_KELAMIN }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('fileakta', 'File Akta / Surat Ket. Lahir', 'file', { required: true }),
          f('filebukunikah', 'File Buku Nikah', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'kk-cetak-ulang',
    title: 'KK Cetak Ulang',
    desc: 'Pencetakan ulang Kartu Keluarga.',
    icon: 'Printer',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('namakepalakeluarga', 'Nomor Kepala Keluarga', 'kk', { required: true, half: true }),
          f('alasancetakulang', 'Alasan Cetak Ulang', 'select', {
            required: true,
            half: true,
            options: ['Hilang', 'Perubahan KK', 'Rusak'],
          }),
          f('alamatkepalakeluarga', 'Alamat Kepala Keluarga', 'textarea', { required: true }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekk', 'File Kartu Keluarga', 'file'),
          f('filesuratkehilangan', 'File Surat Kehilangan', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'akta-perceraian',
    title: 'Akta Perceraian',
    desc: 'Penerbitan akta perceraian.',
    icon: 'ScrollText',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('nokk', 'Nomor KK', 'kk', { required: true, half: true }),
          f('niksuami', 'Nomor NIK Suami', 'nik', { required: true, half: true }),
          f('nikistri', 'Nomor NIK Istri', 'nik', { required: true, half: true }),
          f('yangmengajukan', 'Yang Mengajukan', 'select', { required: true, half: true, options: ['Suami', 'Istri'] }),
          f('alasancerai', 'Alasan Cerai', 'select', {
            required: true,
            options: [
              'Berbuat Zina', 'Pemabuk/Pemadat', 'Penjudi',
              'Meninggalkan Pasangan Lebih dari 2 Tahun Tanpa Alasan',
              'Hukuman Penjara di Atas 5 Tahun/Lebih Berat',
              'Melakukan Kekejaman/Kekerasan dalam Rumah Tangga',
              'Mendapat Cacat Badan/Penyakit',
              'Perselisihan/Pertengkaran Terus Menerus', 'Lainnya',
            ],
          }),
          f('noputusanpengadilan', 'Nomor Putusan Pengadilan', 'text', { required: true, half: true }),
          f('tglputusan', 'Tanggal Putusan', 'date', { required: true, half: true }),
          f('instansipemberiputusan', 'Instansi Pemberi Putusan', 'select', {
            required: true,
            options: ['Pengadilan Negeri', 'Pengadilan Agama', 'Pengadilan Tinggi Negeri', 'Pengadilan Tinggi Agama', 'Mahkamah Agung'],
          }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('filektpsuami', 'File KTP Suami', 'file', { required: true }),
          f('filektpistri', 'File KTP Istri', 'file', { required: true }),
          f('fileputusan', 'File Putusan', 'file', { required: true }),
          f('filependukung1', 'File Dokumen Pendukung I', 'file'),
          f('filependukung2', 'File Dokumen Pendukung II', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'akta-kematian',
    title: 'Akta Kematian',
    desc: 'Penerbitan akta kematian.',
    icon: 'Heart',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('nikjenazah', 'NIK Jenazah', 'nik', { required: true, half: true }),
          f('namalengkap', 'Nama Lengkap', 'text', { required: true, half: true }),
          f('jeniskelamin', 'Jenis Kelamin', 'select', { required: true, half: true, options: OPT_JENIS_KELAMIN }),
          f('tgllahir', 'Tanggal Lahir', 'date', { required: true, half: true }),
          f('nikayah', 'NIK Ayah', 'nik', { required: true, half: true }),
          f('namaayah', 'Nama Ayah', 'text', { required: true, half: true }),
          f('pekerjaan', 'Pekerjaan', 'text', { required: true, half: true }),
          f('nikibu', 'NIK Ibu', 'nik', { required: true, half: true }),
          f('namaibu', 'Nama Ibu', 'text', { required: true, half: true }),
          f('anakke', 'Anak Ke', 'number', { required: true, half: true }),
          f('tglkematian', 'Tanggal Kematian', 'date', { required: true, half: true }),
          f('jamkematian', 'Jam Kematian', 'time', { required: true, half: true }),
          f('tempatkematian', 'Tempat Kematian', 'text', { required: true, half: true }),
          f('sebabkematian', 'Sebab Kematian', 'select', {
            required: true,
            half: true,
            options: ['Sakit Biasa / Tua', 'Pandemi / Wabah Penyakit', 'Kecelakaan', 'Kriminalitas', 'Bunuh Diri', 'Lainnya'],
          }),
          f('menerangkankematian', 'Menerangkan', 'select', {
            required: true,
            half: true,
            options: ['Dokter', 'Tenaga Kesehatan', 'Kepolisian', 'Lainnya'],
          }),
          f('niksaksi1', 'NIK Saksi I', 'nik', { required: true, half: true }),
          f('namasaksi1', 'Nama Lengkap Saksi I', 'text', { required: true, half: true }),
          f('niksaksi2', 'NIK Saksi II', 'nik', { required: true, half: true }),
          f('namasaksi2', 'Nama Lengkap Saksi II', 'text', { required: true, half: true }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('fileketkematian', 'File Ket. Kematian Asli', 'file', { required: true }),
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('filektppelapor', 'File KTP Pelapor', 'file', { required: true }),
          f('filektpjenazah', 'File KTP Jenazah', 'file', { required: true }),
          f('filependukung1', 'File Dokumen Pendukung I', 'file'),
          f('filependukung2', 'File Dokumen Pendukung II', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'akta-nikah',
    title: 'Akta Perkawinan',
    desc: 'Penerbitan akta perkawinan.',
    icon: 'Book',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('nokksuami', 'Nomor KK Suami', 'kk', { required: true, half: true }),
          f('niksuami', 'Nomor NIK Suami', 'nik', { required: true, half: true }),
          f('suamianakke', 'Suami Anak Ke', 'number', { required: true, half: true }),
          f('nokkistri', 'Nomor KK Istri', 'kk', { required: true, half: true }),
          f('nikistri', 'Nomor NIK Istri', 'nik', { required: true, half: true }),
          f('istrianakke', 'Istri Anak Ke', 'number', { required: true, half: true }),
          f('niksaksi1', 'Nomor NIK Saksi 1', 'nik', { required: true, half: true }),
          f('niksaksi2', 'Nomor NIK Saksi 2', 'nik', { required: true, half: true }),
          f('tglpemberkatan', 'Tanggal Pemberkatan', 'date', { required: true, half: true }),
          f('tmptpemberkatan', 'Tempat Pemberkatan', 'text', { required: true, half: true }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekksuami', 'File Kartu Keluarga Suami', 'file', { required: true }),
          f('filektpsuami', 'File KTP Suami', 'file', { required: true }),
          f('filekkistri', 'File Kartu Keluarga Istri', 'file', { required: true }),
          f('filektpistri', 'File KTP Istri', 'file', { required: true }),
          f('filesuamiistri', 'File Foto Suami & Istri', 'file', { required: true }),
          f('filebukunikahagama', 'File Foto Buku Nikah Agama', 'file', { required: true }),
          f('filependukung1', 'File Dokumen Pendukung I', 'file'),
          f('filependukung2', 'File Dokumen Pendukung II', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'kia',
    title: 'Kartu Identitas Anak (KIA)',
    desc: 'Penerbitan Kartu Identitas Anak.',
    icon: 'IdCard',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('nikanak', 'NIK Anak', 'nik', { required: true, half: true }),
          f('namalengkap', 'Nama Lengkap', 'text', { required: true, half: true }),
          f('tgllahir', 'Tanggal Lahir', 'date', { required: true, half: true }),
          f('tempatlahir', 'Tempat Lahir', 'text', { required: true, half: true }),
          f('jeniskelamin', 'Jenis Kelamin', 'select', { required: true, half: true, options: OPT_JENIS_KELAMIN }),
          f('nikayah', 'NIK Ayah', 'nik', { required: true, half: true }),
          f('namaayah', 'Nama Ayah', 'text', { required: true, half: true }),
          f('nikibu', 'NIK Ibu', 'nik', { required: true, half: true }),
          f('namaibu', 'Nama Ibu', 'text', { required: true, half: true }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('fileaktakelahiran', 'File Akta Kelahiran', 'file', { required: true }),
          f('filepassfoto', 'File Photo Anak Terbaru', 'file', { required: true }),
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('filependukung1', 'File Dokumen Pendukung I', 'file'),
          f('filependukung2', 'File Dokumen Pendukung II', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'perpindahan-penduduk',
    title: 'Perpindahan Penduduk',
    desc: 'Layanan perpindahan alamat penduduk.',
    icon: 'MapPin',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('klasifikasikepindahan', 'Klasifikasi Kepindahan', 'select', {
            required: true,
            half: true,
            options: ['Dalam Satu Desa/Kelurahan', 'Antar Desa/Kelurahan', 'Antar Kecamatan', 'Antar Kabupaten/Kota', 'Provinsi'],
          }),
          f('jeniskepindahan', 'Jenis Kepindahan', 'select', {
            required: true,
            half: true,
            options: ['Kepala Keluarga', 'KK & Sebagian Anggota Keluarga', 'KK & Seluruh Anggota Keluarga', 'Anggota Keluarga'],
          }),
          f('nikygpindah', 'NIK Yang Pindah', 'textarea', { required: true, placeholder: 'Tulis NIK yang pindah — satu NIK per baris' }),
          f('alasanpindah', 'Alasan Pindah', 'textarea', { required: true }),
          f('alamat', 'Alamat Tujuan', 'textarea', { required: true }),
          f('provinsi', 'Provinsi Tujuan', 'text', { required: true, half: true }),
          f('kabupaten', 'Kabupaten Tujuan', 'text', { required: true, half: true }),
          f('kecamatan', 'Kecamatan Tujuan', 'text', { required: true, half: true }),
          f('kelurahan', 'Kelurahan Tujuan', 'text', { required: true, half: true }),
          f('rt', 'RT Tujuan', 'number', { required: true, half: true }),
          f('rw', 'RW Tujuan', 'number', { required: true, half: true }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('filependukung1', 'File Dokumen Pendukung I', 'file'),
          f('filependukung2', 'File Dokumen Pendukung II', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'kedatangan',
    title: 'Kedatangan Penduduk',
    desc: 'Pencatatan kedatangan penduduk baru.',
    icon: 'Home',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('skpwni', 'No Surat Pindah / SKPWNI', 'text', { required: true }),
          f('namapemohon', 'Nama Yang Pindah', 'text', { required: true, half: true }),
          f('nikpemohon', 'NIK Yang Pindah', 'nik', { required: true, half: true }),
          f('nohp', 'No. HP', 'phone', { required: true, half: true }),
          f('email', 'Email', 'email', { required: true, half: true }),
          f('kecamatantujuan', 'Kecamatan Tujuan', 'text', { required: true, half: true }),
          f('desatujuan', 'Desa Tujuan', 'text', { required: true, half: true }),
          f('dusuntujuan', 'Dusun Tujuan', 'text', { required: true, half: true }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filesuratpindah', 'File Surat Pindah', 'file', { required: true }),
          f('filebukunikah', 'File Buku Nikah/SPTJM (kalau ada)', 'file'),
          f('filependukung1', 'File Dokumen Pendukung I', 'file'),
          f('filependukung2', 'File Dokumen Pendukung II', 'file'),
        ],
      },
      catatanSection,
    ],
  },
  {
    slug: 'ktpel',
    title: 'KTP Elektronik',
    desc: 'Penerbitan dan pembaruan KTP Elektronik.',
    icon: 'Zap',
    sections: [
      pemohon,
      {
        title: 'Kelengkapan Data',
        fields: [
          f('nokk', 'Nomor KK', 'kk', { required: true, half: true }),
          f('nik', 'Nomor NIK', 'nik', { required: true, half: true }),
          f('nama', 'Nama Lengkap', 'text', { required: true, half: true }),
          f('alasancetak', 'Alasan Cetak', 'select', {
            required: true,
            half: true,
            options: ['Baru (Pemula)', 'Hilang', 'Rusak', 'Pindah Datang', 'Perubahan Data', 'Cetak Ulang'],
          }),
        ],
      },
      {
        title: 'Dokumen Syarat',
        fields: [
          f('filekk', 'File Kartu Keluarga', 'file', { required: true }),
          f('filektplama', 'File KTP Lama', 'file'),
          f('filesuratkehilangan', 'File Surat Kehilangan', 'file'),
          f('fileketerangan', 'File Surat Keterangan', 'file'),
        ],
      },
      catatanSection,
    ],
  },
];

export const getLayananForm = (slug: string) => LAYANAN_FORMS.find((l) => l.slug === slug);
