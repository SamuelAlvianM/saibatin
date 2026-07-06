import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { getStaticDefaults, STATIC_BLOCKS } from "@/lib/static-content-registry";

/**
 * Konten statis untuk halaman publik.
 * GET /api/static-content?keys=profil.visi-misi,profil.motto
 * Hasil = default registry di-merge dengan override dari DB (jika pernah diedit).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keysParam = searchParams.get("keys");
  const keys = keysParam
    ? keysParam.split(",").map((k) => k.trim()).filter(Boolean)
    : STATIC_BLOCKS.map((b) => b.kunci);

  const rows = await prisma.staticContent.findMany({
    where: { kunci: { in: keys } },
  });
  const byKey = new Map(rows.map((r) => [r.kunci, r.konten]));

  const items: Record<string, unknown> = {};
  for (const key of keys) {
    const defaults = getStaticDefaults(key);
    const override = byKey.get(key);
    items[key] =
      override && typeof override === "object"
        ? { ...defaults, ...(override as Record<string, unknown>) }
        : defaults;
  }

  return ok({ items });
}
