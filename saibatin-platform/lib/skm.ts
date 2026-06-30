/**
 * Aspek penilaian Survei Kepuasan Masyarakat (SKM).
 * jawaban disimpan di SkmJawaban.jawaban sebagai { "0": nilai, ..., "5": nilai }
 * dengan skala 1-5.
 */
export const SKM_ASPEK = [
  "Kemudahan prosedur pelayanan",
  "Kesesuaian persyaratan",
  "Kecepatan waktu pelayanan",
  "Kewajaran biaya/tarif",
  "Kompetensi & sikap petugas",
  "Kenyamanan & keamanan lingkungan",
] as const;

export const SKM_SKALA_MAX = 5;
