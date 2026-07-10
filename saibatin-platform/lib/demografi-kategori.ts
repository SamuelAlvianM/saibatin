/** Kategori data demografi (media informasi). Slug = nilai kolom `kategori` di DB. */
export interface DemografiKategori {
  slug: string;
  label: string;
  /** Petunjuk nama file Excel Dukcapil yang sesuai (untuk bantuan admin). */
  fileHint: string;
}

export const DEMOGRAFI_KATEGORI: DemografiKategori[] = [
  { slug: "jenis-kelamin", label: "Jenis Kelamin", fileHint: "AGR_JK_DUSUN…" },
  { slug: "agama", label: "Agama", fileHint: "AGR_AGAMA…" },
  { slug: "gol-darah", label: "Golongan Darah", fileHint: "AGR_DRH_DUSUN / AGR_GOL_DRH…" },
  { slug: "pekerjaan", label: "Pekerjaan", fileHint: "AGR_PEKERJAAN / AGR_PKRJN_DUSUN…" },
  { slug: "pendidikan", label: "Pendidikan", fileHint: "AGR_PDDKN_DUSUN…" },
  { slug: "status-kawin", label: "Status Perkawinan", fileHint: "AGR_STAT_KWN_DUSUN…" },
  { slug: "kk", label: "Kartu Keluarga", fileHint: "AGR_KK_DUSUN…" },
  { slug: "wajib-ktp", label: "Wajib KTP", fileHint: "AGR_WKTP…" },
];

export const DEMOGRAFI_SLUGS = new Set(DEMOGRAFI_KATEGORI.map((k) => k.slug));

export function getDemografiKategori(slug: string): DemografiKategori | undefined {
  return DEMOGRAFI_KATEGORI.find((k) => k.slug === slug);
}
