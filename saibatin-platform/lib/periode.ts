/**
 * Rentang waktu untuk filter dashboard.
 *
 * Dipakai bersama oleh server (menyusun klausa `where`) dan klien (menampilkan
 * rentangnya di UI) — satu sumber supaya tanggal yang dibaca petugas selalu
 * sama dengan data yang benar-benar difilter.
 *
 * Periode bisa DIGESER maju/mundur lewat `acuan`, jadi petugas dapat melihat
 * minggu lalu, bulan lalu, dan seterusnya — bukan hanya periode berjalan.
 */

export type KodePeriode = '' | 'hari' | 'minggu' | 'bulan' | 'tahun';

export const PERIODE: { kode: KodePeriode; label: string }[] = [
  { kode: '', label: 'Semua waktu' },
  { kode: 'hari', label: 'Harian' },
  { kode: 'minggu', label: 'Mingguan' },
  { kode: 'bulan', label: 'Bulanan' },
  { kode: 'tahun', label: 'Tahunan' },
];

export interface Rentang {
  awal: Date;
  /** Eksklusif — dipakai sebagai `lt` agar seluruh hari terakhir ikut terhitung. */
  akhir: Date;
}

/** Geser titik acuan sebanyak `langkah` periode (negatif = mundur). */
export function geserAcuan(kode: string, acuan: Date, langkah: number): Date {
  const d = new Date(acuan);
  switch (kode) {
    case 'hari':
      d.setDate(d.getDate() + langkah);
      break;
    case 'minggu':
      d.setDate(d.getDate() + langkah * 7);
      break;
    case 'bulan':
      d.setMonth(d.getMonth() + langkah);
      break;
    case 'tahun':
      d.setFullYear(d.getFullYear() + langkah);
      break;
  }
  return d;
}

/** Rentang [awal, akhir) untuk periode di sekitar `acuan`. null = tanpa batas. */
export function rentangPeriode(
  kode: string | null,
  acuan: Date = new Date(),
): Rentang | null {
  if (!kode) return null;
  const y = acuan.getFullYear();
  const m = acuan.getMonth();

  switch (kode) {
    case 'hari': {
      const awal = new Date(y, m, acuan.getDate());
      return { awal, akhir: new Date(y, m, acuan.getDate() + 1) };
    }
    case 'minggu': {
      // Minggu dimulai Senin (konvensi Indonesia).
      const geser = (acuan.getDay() + 6) % 7;
      const awal = new Date(y, m, acuan.getDate() - geser);
      return { awal, akhir: new Date(y, m, acuan.getDate() - geser + 7) };
    }
    case 'bulan':
      return { awal: new Date(y, m, 1), akhir: new Date(y, m + 1, 1) };
    case 'tahun':
      return { awal: new Date(y, 0, 1), akhir: new Date(y + 1, 0, 1) };
    default:
      return null;
  }
}

/** Parse `?acuan=YYYY-MM-DD`; jatuh ke hari ini bila kosong/tidak sah. */
export function bacaAcuan(nilai: string | null): Date {
  if (!nilai) return new Date();
  const d = new Date(`${nilai}T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/** Format `Date` → "YYYY-MM-DD" (waktu lokal, bukan UTC). */
export function tulisAcuan(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString('id-ID', o);

/** Judul periode yang sedang dilihat, mis. "22 Jul 2026" / "Juli 2026" / "2026". */
export function labelAcuan(kode: string, acuan: Date): string {
  switch (kode) {
    case 'hari':
      return fmt(acuan, { day: 'numeric', month: 'short', year: 'numeric' });
    case 'minggu': {
      const r = rentangPeriode('minggu', acuan)!;
      return `Minggu ${fmt(r.awal, { day: 'numeric', month: 'short' })}`;
    }
    case 'bulan':
      return fmt(acuan, { month: 'long', year: 'numeric' });
    case 'tahun':
      return String(acuan.getFullYear());
    default:
      return '';
  }
}

/** Rentang lengkap untuk keterangan, mis. "20 Jul 2026 – 26 Jul 2026". */
export function labelRentang(kode: string, acuan: Date): string {
  const r = rentangPeriode(kode, acuan);
  if (!r) return '';
  // `akhir` eksklusif → mundurkan sehari untuk ditampilkan.
  const akhirTampil = new Date(r.akhir);
  akhirTampil.setDate(akhirTampil.getDate() - 1);

  const opsi: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  if (kode === 'hari') return fmt(r.awal, opsi);
  return `${fmt(r.awal, opsi)} – ${fmt(akhirTampil, opsi)}`;
}
