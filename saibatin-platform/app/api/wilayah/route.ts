import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

/**
 * Dropdown wilayah (port opt/optx getkeclists & getkellists).
 * ?jenis=KECAMATAN  atau  ?jenis=KELURAHAN&parent=<idKecamatan>
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jenis = searchParams.get("jenis") ?? "KECAMATAN";
  const parent = searchParams.get("parent");

  const items = await prisma.wilayah.findMany({
    where: {
      jenis,
      ...(parent ? { parentId: Number(parent) } : {}),
    },
    orderBy: { nama: "asc" },
    select: { id: true, kode: true, nama: true },
  });

  return ok({ items });
}
