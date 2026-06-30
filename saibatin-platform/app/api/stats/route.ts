import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

/**
 * Statistik ringkas untuk dashboard publik (port dari FrontController start*).
 */
export async function GET() {
  const [totalPermohonan, selesai, dalamProses, totalBerita] = await Promise.all([
    prisma.permohonan.count(),
    prisma.permohonan.count({ where: { status: "SELESAI" } }),
    prisma.permohonan.count({ where: { status: { in: ["MENUNGGU", "DIPROSES"] } } }),
    prisma.news.count({ where: { publish: true } }),
  ]);

  return ok({ totalPermohonan, selesai, dalamProses, totalBerita });
}
