/**
 * Titik perkiraan pusat tiap kecamatan Kabupaten Pesisir Barat (Lampung) untuk
 * peta sebaran penduduk. Koordinat bersifat PERKIRAAN (indikatif) — silakan
 * sesuaikan bila perlu. Pencocokan dengan data demografi memakai nama wilayah
 * yang dinormalisasi (huruf besar tanpa spasi berlebih).
 */
export interface KecamatanGeo {
  nama: string;
  lat: number;
  lng: number;
}

// Pusat peta (sekitar Krui / Pesisir Tengah).
export const PESISIR_BARAT_CENTER: [number, number] = [-5.25, 103.86];
export const PESISIR_BARAT_ZOOM = 10;

export const KECAMATAN_GEO: KecamatanGeo[] = [
  { nama: "LEMONG", lat: -4.905, lng: 103.975 },
  { nama: "PESISIR UTARA", lat: -5.02, lng: 103.99 },
  { nama: "PULAU PISANG", lat: -5.115, lng: 103.795 },
  { nama: "KARYA PENGGAWA", lat: -5.105, lng: 103.955 },
  { nama: "PESISIR TENGAH", lat: -5.193, lng: 103.942 },
  { nama: "WAY KRUI", lat: -5.225, lng: 103.935 },
  { nama: "KRUI SELATAN", lat: -5.26, lng: 103.925 },
  { nama: "PESISIR SELATAN", lat: -5.36, lng: 103.85 },
  { nama: "NGAMBUR", lat: -5.46, lng: 103.78 },
  { nama: "NGARAS", lat: -5.56, lng: 103.72 },
  { nama: "BENGKUNAT", lat: -5.68, lng: 103.63 },
];

const normNama = (s: string) => s.trim().toUpperCase().replace(/\s+/g, " ");

const GEO_BY_NAMA = new Map(KECAMATAN_GEO.map((k) => [normNama(k.nama), k]));

/** Cari koordinat kecamatan dari nama wilayah data demografi. */
export function geoForWilayah(wilayah: string): KecamatanGeo | undefined {
  return GEO_BY_NAMA.get(normNama(wilayah));
}
