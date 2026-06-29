import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

/** Daftar master jenis permohonan aktif. */
export async function GET() {
  const items = await prisma.jenisPermohonan.findMany({
    where: { aktif: true },
    orderBy: { urutan: "asc" },
  });
  return ok({ items });
}
