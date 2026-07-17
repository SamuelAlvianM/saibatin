/**
 * Aspek penilaian Survei Kepuasan Masyarakat (SKM).
 *
 * Mengikuti standar nasional Permenpan RB No. 14 Tahun 2017: 9 unsur penilaian
 * dengan skala 1-4 (bukan 1-5). Daftar unsur di bawah diambil PERSIS dari
 * portal lama (tabel m_mediainformasi_skm_pertanyaan, urut kolom `sort`) supaya
 * 203 jawaban warga yang dimigrasikan tetap sebanding — jangan diubah urutannya
 * tanpa memigrasikan ulang kolom `jawaban`.
 *
 * jawaban disimpan di SkmJawaban.jawaban sebagai { "0": nilai, ..., "8": nilai }.
 */
export const SKM_ASPEK = [
  "Kesesuaian persyaratan pelayanan dengan jenis pelayanan yang didapatkan",
  "Kemudahan prosedur pelayanan Administrasi Kependudukan",
  "Kecepatan waktu dalam pelayanan Administrasi Kependudukan",
  "Biaya/tarif pelayanan dokumen Kependudukan dan Pencatatan Sipil",
  "Kesesuaian SOP dan Standar Pelayanan setiap produk pelayanan dengan hasil yang diterima",
  "Kemampuan dan kecakapan petugas dalam memberikan pelayanan",
  "Perilaku petugas (kesopanan dan keramahan) dalam memberikan pelayanan kepada masyarakat",
  "Kualitas sarana dan prasarana pada Dinas Kependudukan dan Pencatatan Sipil",
  "Ketersediaan pelayanan pengaduan bagi pengguna layanan",
] as const;

export const SKM_SKALA_MAX = 4;

/** Label tiap nilai pada skala Permenpan (indeks = nilai - 1). */
export const SKM_SKALA_LABEL = [
  "Tidak Baik",
  "Kurang Baik",
  "Baik",
  "Sangat Baik",
] as const;
