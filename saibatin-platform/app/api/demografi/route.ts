import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { DEMOGRAFI_SLUGS } from "@/lib/demografi-kategori";

export const dynamic = "force-dynamic";

/**
 * Data demografi publik.
 * GET /api/demografi?kategori=jenis-kelamin             → daftar kecamatan (level 4)
 * GET /api/demografi?kategori=jenis-kelamin&parent=KODE → daftar pekon di kecamatan
 *
 * Angka kecamatan = PENJUMLAHAN seluruh pekon (level 5) di bawahnya, sehingga
 * tabel utama selalu berupa ringkasan dari data rinci. Baris kecamatan dari
 * Excel hanya dipakai sebagai sumber nama & cadangan bila belum ada data pekon.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kategori = (searchParams.get("kategori") ?? "").trim();
  const parent = (searchParams.get("parent") ?? "").trim();
  if (!DEMOGRAFI_SLUGS.has(kategori)) return fail(["Kategori tidak dikenal"]);

  // Detail pekon dalam satu kecamatan — apa adanya.
  if (parent) {
    const rows = await prisma.demografiWilayah.findMany({
      where: { kategori, level: 5, parentKode: parent },
      orderBy: { kode: "asc" },
      select: { kode: true, wilayah: true, data: true },
    });
    const kolom = rows.length
      ? Object.keys(rows[0].data as Record<string, number>)
      : [];
    return ok({ kolom, items: rows });
  }

  // Ringkasan kecamatan: jumlahkan data pekon per parentKode.
  const [kecamatan, pekon] = await Promise.all([
    prisma.demografiWilayah.findMany({
      where: { kategori, level: 4 },
      orderBy: { kode: "asc" },
      select: { kode: true, wilayah: true, data: true },
    }),
    prisma.demografiWilayah.findMany({
      where: { kategori, level: 5 },
      orderBy: { kode: "asc" },
      select: { parentKode: true, data: true },
    }),
  ]);

  const kolom = (kecamatan[0] ?? pekon[0])
    ? Object.keys(((kecamatan[0] ?? pekon[0]).data ?? {}) as Record<string, number>)
    : [];

  // Jumlah per kecamatan dari pekon-pekonnya.
  const sumByParent = new Map<string, Record<string, number>>();
  const countByParent = new Map<string, number>();
  for (const p of pekon) {
    const key = p.parentKode ?? "";
    if (!key) continue;
    const acc = sumByParent.get(key) ?? {};
    for (const [k, v] of Object.entries(p.data as Record<string, number>)) {
      acc[k] = (acc[k] ?? 0) + (Number(v) || 0);
    }
    sumByParent.set(key, acc);
    countByParent.set(key, (countByParent.get(key) ?? 0) + 1);
  }

  const items = kecamatan.map((k) => ({
    kode: k.kode,
    wilayah: k.wilayah,
    // Ada data pekon → pakai jumlahnya; belum ada → angka kecamatan dari Excel.
    data: sumByParent.get(k.kode) ?? (k.data as Record<string, number>),
    jumlahPekon: countByParent.get(k.kode) ?? 0,
  }));

  // Kecamatan yang hanya muncul lewat pekon (tak ada baris level 4 tersimpan).
  const known = new Set(kecamatan.map((k) => k.kode));
  for (const [kode, data] of sumByParent) {
    if (!known.has(kode)) {
      items.push({
        kode,
        wilayah: `Kecamatan ${kode}`,
        data,
        jumlahPekon: countByParent.get(kode) ?? 0,
      });
    }
  }
  items.sort((a, b) => a.kode.localeCompare(b.kode));

  return ok({ kolom, items });
}
