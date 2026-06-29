export interface DemografiDataset {
  title: string;
  description: string;
  unit: string;
  items: { label: string; value: number }[];
}

/**
 * Data demografi contoh (placeholder) — sumber data resmi belum terhubung
 * ke backend (belum ada model Prisma untuk rekap demografi).
 * TODO: ganti dengan query Prisma nyata setelah model demografi tersedia.
 */
export const demografiData: Record<string, DemografiDataset> = {
  agama: {
    title: 'Statistik Penduduk Berdasarkan Agama',
    description: 'Distribusi jumlah penduduk Kabupaten Pesisir Barat menurut agama yang dianut.',
    unit: 'jiwa',
    items: [
      { label: 'Islam', value: 167420 },
      { label: 'Kristen Protestan', value: 1850 },
      { label: 'Kristen Katolik', value: 620 },
      { label: 'Hindu', value: 210 },
      { label: 'Buddha', value: 95 },
      { label: 'Konghucu', value: 12 },
    ],
  },
  'golongan-darah': {
    title: 'Statistik Penduduk Berdasarkan Golongan Darah',
    description: 'Distribusi jumlah penduduk menurut golongan darah.',
    unit: 'jiwa',
    items: [
      { label: 'A', value: 38500 },
      { label: 'B', value: 41200 },
      { label: 'AB', value: 12800 },
      { label: 'O', value: 52900 },
      { label: 'Tidak Tahu', value: 24800 },
    ],
  },
  'jenis-kelamin': {
    title: 'Statistik Penduduk Berdasarkan Jenis Kelamin',
    description: 'Distribusi jumlah penduduk menurut jenis kelamin.',
    unit: 'jiwa',
    items: [
      { label: 'Laki-laki', value: 86340 },
      { label: 'Perempuan', value: 83867 },
    ],
  },
  'kepala-keluarga': {
    title: 'Statistik Kepala Keluarga',
    description: 'Jumlah kepala keluarga per kecamatan di Kabupaten Pesisir Barat.',
    unit: 'KK',
    items: [
      { label: 'Pesisir Tengah', value: 9120 },
      { label: 'Krui Selatan', value: 5430 },
      { label: 'Pesisir Selatan', value: 6210 },
      { label: 'Bangkunat', value: 4870 },
      { label: 'Lemong', value: 3590 },
      { label: 'Pulau Pisang', value: 980 },
    ],
  },
  pendidikan: {
    title: 'Statistik Penduduk Berdasarkan Pendidikan Terakhir',
    description: 'Distribusi jumlah penduduk menurut jenjang pendidikan terakhir.',
    unit: 'jiwa',
    items: [
      { label: 'Tidak/Belum Sekolah', value: 28400 },
      { label: 'SD', value: 41200 },
      { label: 'SMP', value: 35600 },
      { label: 'SMA/SMK', value: 48700 },
      { label: 'Diploma', value: 4200 },
      { label: 'S1/S2/S3', value: 12100 },
    ],
  },
  'status-perkawinan': {
    title: 'Statistik Penduduk Berdasarkan Status Perkawinan',
    description: 'Distribusi jumlah penduduk menurut status perkawinan.',
    unit: 'jiwa',
    items: [
      { label: 'Belum Kawin', value: 62300 },
      { label: 'Kawin', value: 94100 },
      { label: 'Cerai Hidup', value: 5800 },
      { label: 'Cerai Mati', value: 8007 },
    ],
  },
  'wajib-ktp': {
    title: 'Statistik Wajib KTP',
    description: 'Jumlah penduduk wajib KTP dan yang sudah memiliki KTP-el.',
    unit: 'jiwa',
    items: [
      { label: 'Sudah Memiliki KTP-el', value: 118400 },
      { label: 'Belum Memiliki KTP-el', value: 9620 },
    ],
  },
};
