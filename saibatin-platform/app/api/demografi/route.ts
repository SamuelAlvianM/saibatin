import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { DEMOGRAFI_SLUGS } from "@/lib/demografi-kategori";

export const dynamic = "force-dynamic";

/**
 * Data demografi publik.
 * GET /api/demografi?kategori=jenis-kelamin           → daftar kecamatan (level 4)
 * GET /api/demografi?kategori=jenis-kelamin&parent=KODE → daftar pekon di kecamatan
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kategori = (searchParams.get("kategori") ?? "").trim();
  const parent = (searchParams.get("parent") ?? "").trim();
  if (!DEMOGRAFI_SLUGS.has(kategori)) return fail(["Kategori tidak dikenal"]);

  const rows = await prisma.demografiWilayah.findMany({
    where: parent
      ? { kategori, level: 5, parentKode: parent }
      : { kategori, level: 4 },
    orderBy: { kode: "asc" },
    select: { kode: true, wilayah: true, data: true },
  });

  // Nama kolom nilai diambil dari baris pertama (urutan dipertahankan: L, P, JML…).
  const kolom = rows.length
    ? Object.keys(rows[0].data as Record<string, number>)
    : [];

  return ok({ kolom, items: rows });
}
