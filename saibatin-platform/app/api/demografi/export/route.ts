import { NextRequest } from "next/server";
import { fail } from "@/lib/api-response";
import { DEMOGRAFI_SLUGS } from "@/lib/demografi-kategori";
import { buildDemografiWorkbook, workbookResponse } from "@/lib/demografi-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ekspor data demografi ke Excel — PUBLIK (data demografi memang terbuka,
 * sama dengan yang ditampilkan tabel /media/demografi).
 * GET /api/demografi/export             → semua kategori (1 sheet per kategori)
 * GET /api/demografi/export?kategori=…  → satu kategori
 */
export async function GET(req: NextRequest) {
  const kategori = (new URL(req.url).searchParams.get("kategori") ?? "").trim();
  if (kategori && !DEMOGRAFI_SLUGS.has(kategori)) {
    return fail(["Kategori tidak dikenal"]);
  }

  const wb = await buildDemografiWorkbook(kategori || undefined);
  if (!wb) return fail(["Belum ada data untuk diekspor"], 404);

  const namaFile = kategori ? `demografi-${kategori}.xlsx` : "demografi-semua.xlsx";
  return workbookResponse(wb, namaFile);
}
