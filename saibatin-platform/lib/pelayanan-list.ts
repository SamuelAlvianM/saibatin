/**
 * Daftar kanonik layanan permohonan online. `modalType` dipakai sebagai kunci
 * stabil untuk toggle visibilitas (disimpan di StaticContent kunci
 * `pelayanan.visibilitas` → { hidden: string[] }). Judul di sini harus cocok
 * dengan array `services` di app/permohonan-online/page.tsx.
 */

export interface PelayananItem {
  modalType: string;
  title: string;
  category: string;
}

/** Kunci StaticContent tempat menyimpan daftar layanan yang disembunyikan. */
export const PELAYANAN_VISIBILITY_KEY = "pelayanan.visibilitas";

export const PELAYANAN_LIST: PelayananItem[] = [
  { modalType: "konsolidasi", title: "Konsolidasi Update Data", category: "data" },
  { modalType: "aktaKelahiranNikTidakAda", title: "Akta Kelahiran (Blm Ada Nik)", category: "akta" },
  { modalType: "aktaKelahiranNikAda", title: "Akta Kelahiran (Ada Nik)", category: "akta" },
  { modalType: "kartuKeluargaPerubahanData", title: "Kartu Keluarga Perubahan Biodata", category: "kk" },
  { modalType: "kartuKeluargaPisahKK", title: "Kartu Keluarga Pisah KK", category: "kk" },
  { modalType: "kartuKeluargaNumpang", title: "Kartu Keluarga Numpang KK", category: "kk" },
  { modalType: "kartuKeluargaPenambahanAnak", title: "Kartu Keluarga Penambahan Anak", category: "kk" },
  { modalType: "kartuKeluargaCetakUlang", title: "Kartu Keluarga Cetak Ulang", category: "kk" },
  { modalType: "aktaPerceraian", title: "Akta Perceraian", category: "akta" },
  { modalType: "aktaKematian", title: "Akta Kematian", category: "akta" },
  { modalType: "aktaPerkawinan", title: "Akta Perkawinan", category: "akta" },
  { modalType: "kartuIdentitasAnak", title: "Kartu Identitas Anak (KIA)", category: "identitas" },
  { modalType: "perpindahanPenduduk", title: "Perpindahan Penduduk", category: "pindah" },
  { modalType: "kedatanganPenduduk", title: "Kedatangan Penduduk", category: "pindah" },
  { modalType: "ktpElektronik", title: "KTP Elektronik", category: "identitas" },
];

/** Label kategori untuk pengelompokan di UI pengaturan. */
export const PELAYANAN_KATEGORI: Record<string, string> = {
  data: "Data Kependudukan",
  akta: "Akta Pencatatan Sipil",
  kk: "Kartu Keluarga",
  identitas: "Identitas",
  pindah: "Pindah / Datang",
};
