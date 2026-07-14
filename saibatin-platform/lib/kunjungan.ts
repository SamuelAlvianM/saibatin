import { prisma } from "@/lib/prisma";

/**
 * Statistik kunjungan situs publik (tabel t_kunjungan — satu baris per
 * pengunjung anonim per hari). Dipakai API /api/kunjungan dan kartu
 * "Pengunjung Situs" di dashboard.
 */

/** Pengunjung dianggap online bila ping terakhirnya <= 5 menit lalu. */
export const ONLINE_WINDOW_MS = 5 * 60_000;

/**
 * Tanggal "hari ini" untuk kolom DATE MySQL: pakai komponen tanggal lokal
 * server yang dibungkus UTC agar tidak bergeser sehari saat Prisma
 * mengonversi ke UTC (WIB = UTC+7).
 */
export function tanggalHariIni() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function statsKunjungan() {
  const [online, hariIni, totalAgg] = await Promise.all([
    prisma.kunjungan.count({
      where: { lastSeen: { gte: new Date(Date.now() - ONLINE_WINDOW_MS) } },
    }),
    prisma.kunjungan.count({ where: { tanggal: tanggalHariIni() } }),
    prisma.kunjungan.aggregate({ _sum: { hits: true } }),
  ]);
  return { online, hariIni, total: totalAgg._sum.hits ?? 0 };
}
