import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { DEMOGRAFI_SLUGS } from "@/lib/demografi-kategori";

export const dynamic = "force-dynamic";

/** Ambil seluruh baris (kecamatan + pekon) satu kategori untuk editor manual. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  const kategori = (new URL(req.url).searchParams.get("kategori") ?? "").trim();
  if (!DEMOGRAFI_SLUGS.has(kategori)) return fail(["Kategori tidak dikenal"]);

  const rows = await prisma.demografiWilayah.findMany({
    where: { kategori },
    orderBy: { kode: "asc" },
    select: { kode: true, wilayah: true, level: true, parentKode: true, data: true },
  });
  const kolom = rows.length
    ? Object.keys(rows[0].data as Record<string, number>)
    : [];

  return ok({ kolom, rows });
}

interface SaveRow {
  kode: string;
  wilayah: string;
  level: number;
  parentKode: string | null;
  data: Record<string, number>;
}

/** Simpan (ganti total) data satu kategori dari editor manual. */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  const body = await req.json().catch(() => ({}));
  const kategori = String((body as { kategori?: string }).kategori ?? "").trim();
  const raw = (body as { rows?: unknown }).rows;
  if (!DEMOGRAFI_SLUGS.has(kategori)) return fail(["Kategori tidak dikenal"]);
  if (!Array.isArray(raw)) return fail(["Data tidak valid"]);

  // Validasi & normalisasi ringan; kode 6 digit = kecamatan, 10 digit = pekon.
  const seen = new Set<string>();
  const rows: SaveRow[] = [];
  for (const r of raw as SaveRow[]) {
    const kode = String(r?.kode ?? "").replace(/\D/g, "");
    const wilayah = String(r?.wilayah ?? "").trim();
    if (!wilayah) continue;
    const level = kode.length === 10 ? 5 : 4;
    if (!kode || seen.has(kode)) continue;
    seen.add(kode);
    const data: Record<string, number> = {};
    for (const [k, v] of Object.entries(r?.data ?? {})) {
      data[k] = Number(v) || 0;
    }
    rows.push({
      kode,
      wilayah,
      level,
      parentKode: level === 5 ? kode.slice(0, 6) : null,
      data,
    });
  }

  await prisma.$transaction([
    prisma.demografiWilayah.deleteMany({ where: { kategori } }),
    ...(rows.length
      ? [prisma.demografiWilayah.createMany({ data: rows.map((r) => ({ kategori, ...r })) })]
      : []),
  ]);

  return ok({ tersimpan: rows.length }, ["Data demografi disimpan"]);
}
