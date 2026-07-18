/**
 * Kamus tampilan payload permohonan — label field & dokumen mengikuti
 * data-info form portal lama (app.pesbar.002) agar warga dan petugas
 * membaca istilah yang sama dengan formulir aslinya.
 */

/** Label field data (non-berkas). */
export const FIELD_LABELS: Record<string, string> = {
  pemohonnik: "NIK Pemohon",
  pemohonnama: "Nama Pemohon",
  pemohonkk: "No. KK Pemohon",
  pemohonhp: "No. HP Pemohon",
  pemohonemail: "Email Pemohon",
  agama: "Agama",
  alamat: "Alamat Tujuan",
  alamatkepalakeluarga: "Alamat Kepala Keluarga",
  alamattujuan: "Alamat Tujuan",
  alasancerai: "Alasan Cerai",
  alasancetak: "Alasan Cetak",
  alasancetakulang: "Alasan Cetak Ulang",
  alasankonsolidasidata: "Alasan Konsolidasi Data",
  alasannumpangkk: "Alasan Numpang KK",
  alasanpindah: "Alasan Pindah",
  alasanpisah: "Alasan Pisah",
  anakke: "Anak Ke",
  berat: "Berat (kg)",
  catatan: "Catatan",
  desatujuan: "Desa Tujuan",
  dusuntujuan: "Dusun Tujuan",
  email: "Email",
  golongandarah: "Golongan Darah",
  instansipemberiputusan: "Instansi Pemberi Putusan",
  istrianakke: "Istri Anak Ke",
  jamkelahiran: "Jam Kelahiran",
  jamkematian: "Jam Kematian",
  jenisbiodata: "Jenis Biodata",
  jeniskelahiran: "Jenis Kelahiran",
  jeniskelamin: "Jenis Kelamin",
  jeniskepindahan: "Jenis Kepindahan",
  jenispisah: "Jenis Pisah",
  kabupaten: "Kabupaten Tujuan",
  kecamatan: "Kecamatan Tujuan",
  kecamatantujuan: "Kecamatan Tujuan",
  kelurahan: "Kelurahan Tujuan",
  kelurahantujuan: "Kelurahan Tujuan",
  kk: "Nomor KK",
  kklama: "Nomor KK Lama",
  kkygditempati: "Nomor KK Yang Ditempati",
  klasifikasikepindahan: "Klasifikasi Kepindahan",
  menerangkankematian: "Menerangkan",
  nama: "Nama Lengkap",
  namaanggotakeluarga: "Nama Anggota Keluarga",
  namaayah: "Nama Ayah",
  namaibu: "Nama Ibu",
  namakepalakeluarga: "Nama Kepala Keluarga",
  namalengkap: "Nama Lengkap",
  namapemohon: "Nama Pemohon",
  namasaksi1: "Nama Saksi I",
  namasaksi2: "Nama Saksi II",
  nik: "Nomor NIK",
  nikanak: "NIK Anak",
  nikayah: "NIK Ayah",
  nikbayi: "NIK Bayi",
  nikibu: "NIK Ibu",
  nikistri: "NIK Istri",
  nikjenazah: "NIK Jenazah",
  nikpasangan: "NIK Pasangan",
  nikpemohon: "NIK Pemohon",
  niksaksi1: "NIK Saksi I",
  niksaksi2: "NIK Saksi II",
  niksuami: "NIK Suami",
  nikygnumpangkk: "NIK Yang Numpang KK",
  nikygpindah: "NIK Yang Pindah",
  nikygpisah: "NIK Yang Pisah",
  nohp: "No. HP",
  nokk: "Nomor KK",
  nokkistri: "Nomor KK Istri",
  nokksuami: "Nomor KK Suami",
  nomoraktanikah: "Nomor Akta Nikah",
  noputusanpengadilan: "Nomor Putusan Pengadilan",
  norttujuan: "RT Tujuan",
  norwtujuan: "RW Tujuan",
  panjang: "Panjang (cm)",
  pekerjaan: "Pekerjaan",
  pekerjaanistri: "Pekerjaan Istri",
  pekerjaansuami: "Pekerjaan Suami",
  pendidikan: "Pendidikan",
  penolong: "Penolong Kelahiran",
  provinsi: "Provinsi Tujuan",
  rt: "RT Tujuan",
  rw: "RW Tujuan",
  sebabkematian: "Sebab Kematian",
  skpwni: "No. Surat Pindah / SKPWNI",
  statusperkawinan: "Status Perkawinan",
  suamianakke: "Suami Anak Ke",
  tanggallahir: "Tanggal Lahir",
  tempatdilahirkan: "Tempat Dilahirkan",
  tempatkelahiran: "Tempat Kelahiran",
  tempatkematian: "Tempat Kematian",
  tempatlahir: "Tempat Lahir",
  tglkematian: "Tanggal Kematian",
  tgllahir: "Tanggal Lahir",
  tglpemberkatan: "Tanggal Pemberkatan",
  tglpernikahan: "Tanggal Pernikahan",
  tglputusan: "Tanggal Putusan",
  tmptpemberkatan: "Tempat Pemberkatan",
  tmptpernikahan: "Tempat Pernikahan",
  yangmengajukan: "Yang Mengajukan",
};

/** Label dokumen berkas (key tanpa akhiran x). */
export const BERKAS_LABELS: Record<string, string> = {
  fileakta: "Akta / Surat Ket. Lahir",
  fileaktakelahiran: "Akta Kelahiran",
  fileaktalahir: "Akta Lahir",
  fileaktamati: "Akta Kematian",
  filebukunikah: "Buku Nikah",
  filebukunikahagama: "Buku Nikah Agama",
  fileformulirsuratpindah: "Formulir / Surat Pindah",
  fileijazah: "Ijazah",
  fileijazahsuamiistri: "Ijazah Suami & Istri",
  fileketerangan: "Surat Keterangan",
  fileketeranganlahir: "Keterangan Lahir / SPTJM",
  fileketkematian: "Ket. Kematian Asli",
  filekk: "Kartu Keluarga",
  filekkistri: "Kartu Keluarga Istri",
  filekklama: "Kartu Keluarga Lama",
  filekkpasangan: "KK Pasangan",
  filekksuami: "Kartu Keluarga Suami",
  filekkygditempati: "KK Yang Ditempati",
  filektp: "KTP",
  filektpayah: "KTP Ayah",
  filektpibu: "KTP Ibu",
  filektpistri: "KTP Istri",
  filektpjenazah: "KTP Jenazah",
  filektplama: "KTP Lama",
  filektppelapor: "KTP Pelapor",
  filektpsaksi1: "KTP Saksi I",
  filektpsaksi2: "KTP Saksi II",
  filektpsuami: "KTP Suami",
  filepassfoto: "Pas Foto Anak Terbaru",
  filependukung1: "Dokumen Pendukung I",
  filependukung2: "Dokumen Pendukung II",
  filependukung3: "Dokumen Pendukung III",
  filependukung4: "Dokumen Pendukung IV",
  filependukung5: "Dokumen Pendukung V",
  fileputusan: "Putusan Pengadilan",
  filesuamiistri: "Foto Suami & Istri",
  filesuratcerai: "Surat Cerai",
  filesuratkehilangan: "Surat Kehilangan",
  filesuratpindah: "Surat Pindah",
};

/** Nilai kode → label untuk select tertentu (mengikuti OptionModel lama). */
const CODE_VALUES: Record<string, Record<string, string>> = {
  jeniskelamin: { "1": "Laki-laki", "2": "Perempuan" },
  tempatdilahirkan: {
    "1": "Rumah Sakit", "2": "Puskesmas", "3": "Rumah Bersalin",
    "4": "Di Rumah", "5": "Lainnya",
  },
  jeniskelahiran: {
    "1": "Tunggal", "2": "Kembar 2", "3": "Kembar 3",
    "4": "Kembar 4", "5": "Lainnya",
  },
  penolong: { "1": "Dokter", "2": "Bidan/Perawat", "3": "Dukun", "4": "Lainnya" },
};

/** Field internal yang tidak perlu ditampilkan ke pembaca detail. */
const HIDDEN_FIELDS = new Set([
  "permohonanType", "permohonanKet", "permohonanInitial",
  "prgsts", "rjkalasan", "alasandetail", "key", "act",
]);

export function isFileField(key: string) {
  return /^file/i.test(key);
}

/** Label field data; fallback: pisahkan underscore + kapitalisasi. */
export function labelField(key: string): string {
  const base = key.replace(/x$/, "");
  return (
    FIELD_LABELS[key] ??
    FIELD_LABELS[base] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** Label dokumen berkas dari nama field file (dengan/tanpa akhiran x). */
export function labelBerkas(key: string): string {
  const base = key.replace(/x$/, "");
  return BERKAS_LABELS[base] ?? labelField(base.replace(/^file/, ""));
}

/** Format nilai payload (terjemahkan kode select yang dikenal). */
export function formatPayloadValue(key: string, value: unknown): string {
  const s = String(value ?? "");
  const map = CODE_VALUES[key.replace(/x$/, "")];
  return map?.[s] ?? s;
}

export interface PayloadBerkasItem {
  key: string;
  label: string;
  path: string;
}

/** Entri data payload yang layak tampil (tanpa berkas & field internal). */
export function payloadDataEntries(
  payload: Record<string, unknown> | null | undefined,
): [string, string][] {
  if (!payload || typeof payload !== "object") return [];
  return Object.entries(payload)
    .filter(
      ([k, v]) =>
        !HIDDEN_FIELDS.has(k) &&
        !isFileField(k) &&
        v !== null &&
        v !== undefined &&
        typeof v !== "object" &&
        String(v).trim() !== "",
    )
    .map(([k, v]) => [k, formatPayloadValue(k, v)]);
}

/** Berkas yang tersimpan di payload (field file* berisi path /uploads/...). */
export function payloadBerkasEntries(
  payload: Record<string, unknown> | null | undefined,
): PayloadBerkasItem[] {
  if (!payload || typeof payload !== "object") return [];
  const seen = new Set<string>();
  const items: PayloadBerkasItem[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (!isFileField(k)) continue;
    const s = String(v ?? "").trim();
    if (!s || !s.startsWith("/uploads/")) continue;
    if (seen.has(s)) continue; // field ganda (filekk & filekkx) → satu entri
    seen.add(s);
    items.push({ key: k, label: labelBerkas(k), path: s });
  }
  return items;
}
