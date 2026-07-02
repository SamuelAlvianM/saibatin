/**
 * Skema formulir permohonan untuk mode "Pengajuan Baru" (dibantu petugas).
 * Setiap layanan memetakan ke slug catch-all /api/<slug>/(upload|create)
 * yang sudah ada di app/api/[layanan]/[action]/route.ts.
 */

export type FieldType =
  | 'text'
  | 'nik'
  | 'kk'
  | 'phone'
  | 'email'
  | 'date'
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

// Blok data pemohon dipakai hampir di semua layanan
const pemohon: SectionDef = {
  title: 'Data Pemohon',
  fields: [
    { name: 'pemohonnik', label: 'NIK Pemohon', type: 'nik', required: true, half: true },
    { name: 'pemohonnama', label: 'Nama Pemohon', type: 'text', required: true, half: true },
    { name: 'pemohonkk', label: 'Nomor Kartu Keluarga', type: 'kk', required: true, half: true },
    { name: 'pemohonhp', label: 'Nomor HP', type: 'phone', required: true, half: true },
    { name: 'pemohonemail', label: 'Email', type: 'email', required: true },
  ],
};

const catatan: FieldDef = {
  name: 'catatan',
  label: 'Catatan Petugas (opsional)',
  type: 'textarea',
  placeholder: 'Catatan tambahan terkait permohonan ini...',
};

const f = (name: string, label: string, type: FieldType = 'text', opts: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type,
  ...opts,
});

export const LAYANAN_FORMS: LayananForm[] = [
  {
    slug: 'konsolidasi-update-data',
    title: 'Konsolidasi Data',
    desc: 'Pengecekan dan penyesuaian data kependudukan.',
    icon: 'FileText',
    sections: [
      pemohon,
      {
        title: 'Detail Konsolidasi',
        fields: [
          f('jenisdata', 'Jenis Data yang Disesuaikan', 'text', { required: true, placeholder: 'mis. Alamat, Status Perkawinan' }),
          f('keterangan', 'Keterangan Perubahan', 'textarea', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filependukung', 'Dokumen Pendukung', 'file', { required: true }), catatan] },
    ],
  },
  {
    slug: 'akta-kelahiran-nik-tidak-ada',
    title: 'Akta Kelahiran (Blm Ada NIK)',
    desc: 'Penerbitan akta kelahiran untuk yang belum memiliki NIK.',
    icon: 'Baby',
    sections: [
      pemohon,
      {
        title: 'Data Anak',
        fields: [
          f('namaanak', 'Nama Anak', 'text', { required: true }),
          f('tempatlahir', 'Tempat Lahir', 'text', { required: true, half: true }),
          f('tanggallahir', 'Tanggal Lahir', 'date', { required: true, half: true }),
          f('jeniskelamin', 'Jenis Kelamin', 'select', { required: true, half: true, options: ['Laki-laki', 'Perempuan'] }),
          f('namaayah', 'Nama Ayah', 'text', { required: true, half: true }),
          f('namaibu', 'Nama Ibu', 'text', { required: true, half: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filesuratlahir', 'Surat Keterangan Lahir', 'file', { required: true }), f('filekk', 'Kartu Keluarga', 'file'), catatan] },
    ],
  },
  {
    slug: 'akta-kelahiran-nik-ada',
    title: 'Akta Kelahiran (Ada NIK)',
    desc: 'Penerbitan akta kelahiran untuk yang sudah memiliki NIK.',
    icon: 'Baby',
    sections: [
      pemohon,
      {
        title: 'Data Anak',
        fields: [
          f('nikanak', 'NIK Anak', 'nik', { required: true }),
          f('namaanak', 'Nama Anak', 'text', { required: true }),
          f('tempatlahir', 'Tempat Lahir', 'text', { required: true, half: true }),
          f('tanggallahir', 'Tanggal Lahir', 'date', { required: true, half: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filesuratlahir', 'Surat Keterangan Lahir', 'file', { required: true }), f('filekk', 'Kartu Keluarga', 'file'), catatan] },
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
        title: 'Detail Perubahan',
        fields: [
          f('elemenubah', 'Elemen yang Diubah', 'text', { required: true, placeholder: 'mis. Pekerjaan, Pendidikan' }),
          f('nilaibaru', 'Nilai Baru', 'text', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filekk', 'Kartu Keluarga', 'file', { required: true }), f('filependukung', 'Dokumen Pendukung', 'file'), catatan] },
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
        title: 'Data Pemisahan',
        fields: [
          f('namakkbaru', 'Nama Kepala Keluarga Baru', 'text', { required: true }),
          f('alamatbaru', 'Alamat KK Baru', 'textarea', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filekk', 'Kartu Keluarga Lama', 'file', { required: true }), catatan] },
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
        title: 'Data Numpang',
        fields: [
          f('kktujuan', 'Nomor KK Tujuan', 'kk', { required: true }),
          f('namakepalatujuan', 'Nama Kepala Keluarga Tujuan', 'text', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filekkasal', 'KK Asal', 'file', { required: true }), f('filekktujuan', 'KK Tujuan', 'file', { required: true }), catatan] },
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
        title: 'Data Anak',
        fields: [
          f('namaanak', 'Nama Anak', 'text', { required: true }),
          f('tempatlahir', 'Tempat Lahir', 'text', { required: true, half: true }),
          f('tanggallahir', 'Tanggal Lahir', 'date', { required: true, half: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filekk', 'Kartu Keluarga', 'file', { required: true }), f('fileakta', 'Akta Kelahiran Anak', 'file'), catatan] },
    ],
  },
  {
    slug: 'kk-cetak-ulang',
    title: 'KK Cetak Ulang',
    desc: 'Pencetakan ulang Kartu Keluarga.',
    icon: 'Printer',
    sections: [
      pemohon,
      { title: 'Alasan', fields: [f('alasan', 'Alasan Cetak Ulang', 'select', { required: true, options: ['Rusak', 'Hilang', 'Perubahan Data'] })] },
      { title: 'Dokumen', fields: [f('filependukung', 'Dokumen Pendukung', 'file'), catatan] },
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
        title: 'Data Perceraian',
        fields: [
          f('nikpasangan', 'NIK Mantan Pasangan', 'nik', { required: true }),
          f('nomorputusan', 'Nomor Putusan Pengadilan', 'text', { required: true }),
          f('tanggalputusan', 'Tanggal Putusan', 'date', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('fileputusan', 'Akta/Putusan Pengadilan', 'file', { required: true }), catatan] },
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
        title: 'Data Almarhum',
        fields: [
          f('nikalmarhum', 'NIK Almarhum', 'nik', { required: true }),
          f('namaalmarhum', 'Nama Almarhum', 'text', { required: true }),
          f('tanggalmeninggal', 'Tanggal Meninggal', 'date', { required: true, half: true }),
          f('tempatmeninggal', 'Tempat Meninggal', 'text', { required: true, half: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filesuratkematian', 'Surat Keterangan Kematian', 'file', { required: true }), catatan] },
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
        title: 'Data Pasangan',
        fields: [
          f('nikpasangan', 'NIK Pasangan', 'nik', { required: true }),
          f('namapasangan', 'Nama Pasangan', 'text', { required: true }),
          f('tanggalnikah', 'Tanggal Perkawinan', 'date', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filenikah', 'Surat Nikah / Buku Nikah', 'file', { required: true }), catatan] },
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
        title: 'Data Anak',
        fields: [
          f('nikanak', 'NIK Anak', 'nik', { required: true }),
          f('namaanak', 'Nama Anak', 'text', { required: true }),
          f('tanggallahir', 'Tanggal Lahir Anak', 'date', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('fileakta', 'Akta Kelahiran', 'file', { required: true }), f('filekk', 'Kartu Keluarga', 'file'), f('filefoto', 'Pas Foto Anak', 'file'), catatan] },
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
        title: 'Alamat Tujuan',
        fields: [
          f('kecamatantujuan', 'Kecamatan Tujuan', 'text', { required: true, half: true }),
          f('desatujuan', 'Desa/Pekon Tujuan', 'text', { required: true, half: true }),
          f('alamattujuan', 'Alamat Lengkap Tujuan', 'textarea', { required: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filekk', 'Kartu Keluarga', 'file', { required: true }), f('filependukung', 'Dokumen Pendukung', 'file'), catatan] },
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
        title: 'Data Kedatangan',
        fields: [
          f('skpwni', 'Nomor SKPWNI', 'text', { required: true }),
          f('daerahasal', 'Daerah Asal', 'text', { required: true, half: true }),
          f('alamattujuan', 'Alamat Tujuan', 'text', { required: true, half: true }),
        ],
      },
      { title: 'Dokumen', fields: [f('filesuratpindah', 'Surat Pindah (SKPWNI)', 'file', { required: true }), catatan] },
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
        title: 'Detail Permohonan',
        fields: [
          f('jenispermohonan', 'Jenis Permohonan', 'select', { required: true, options: ['Baru', 'Perpanjangan', 'Perubahan Data', 'Hilang/Rusak'] }),
        ],
      },
      { title: 'Dokumen', fields: [f('filekk', 'Kartu Keluarga', 'file', { required: true }), f('filependukung', 'Dokumen Pendukung', 'file'), catatan] },
    ],
  },
];

export const getLayananForm = (slug: string) => LAYANAN_FORMS.find((l) => l.slug === slug);
