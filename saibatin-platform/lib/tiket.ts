import { prisma } from "@/lib/prisma";

/** Hari tanpa aktivitas sebelum tiket TERBUKA ditutup otomatis. */
export const TIKET_AUTO_CLOSE_DAYS = Math.max(
  1,
  Number(process.env.TIKET_AUTO_CLOSE_DAYS ?? 3),
);

/** Warga (level 3) hanya melihat tiketnya sendiri; petugas melihat semua. */
export function isPetugas(level: number) {
  return level !== 3;
}

/**
 * Auto-close malas: setiap kali daftar/detail tiket diakses, tutup dulu
 * tiket TERBUKA yang tidak ada aktivitas selama TIKET_AUTO_CLOSE_DAYS hari.
 * Tanpa cron — cukup dan aman untuk PM2 single instance.
 */
export async function autoCloseStaleTikets() {
  const cutoff = new Date(
    Date.now() - TIKET_AUTO_CLOSE_DAYS * 24 * 60 * 60 * 1000,
  );
  await prisma.tiket.updateMany({
    where: { status: "TERBUKA", updatedAt: { lt: cutoff } },
    data: { status: "TERTUTUP", closedAt: new Date() },
  });
}
