import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { DEMOGRAFI_SLUGS } from "@/lib/demografi-kategori";
import { catatAktivitas } from "@/lib/log-aktivitas";

export const dynamic = "force-dynamic";

/** Pesan akses yang jelas: bedakan sesi habis vs level akun kurang. */
async function cekPetugas() {
  const session = await getSession();
  if (!session)
    return { session: null, error: fail(["Sesi berakhir — silakan login ulang sebagai petugas"], 401) };
  if (session.level !== 1)
    return { session: null, error: fail(["Akses khusus petugas dinas — akun Anda bukan petugas"], 403) };
  return { session, error: null };
}

/** Ambil seluruh baris (kecamatan + pekon) satu kategori untuk editor manual. */
export async function GET(req: NextRequest) {
  const { error } = await cekPetugas();
  if (error) return error;

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
  const { session, error } = await cekPetugas();
  if (error) return error;

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

  await catatAktivitas(
    session,
    "UBAH",
    "Demografi",
    `Menyimpan data demografi kategori ${kategori} (${rows.length} baris)`,
    { entitasId: kategori, req },
  );

  return ok({ tersimpan: rows.length }, ["Data demografi disimpan"]);
}

/**
 * Hapus data demografi. Tanpa `?kategori` → hapus SEMUA kategori (reset total);
 * dengan `?kategori=slug` → hapus satu kategori saja.
 */
export async function DELETE(req: NextRequest) {
  const { session, error } = await cekPetugas();
  if (error) return error;

  const kategori = (new URL(req.url).searchParams.get("kategori") ?? "").trim();
  if (kategori && !DEMOGRAFI_SLUGS.has(kategori)) {
    return fail(["Kategori tidak dikenal"]);
  }

  const res = await prisma.demografiWilayah.deleteMany({
    where: kategori ? { kategori } : {},
  });

  await catatAktivitas(
    session,
    "HAPUS",
    "Demografi",
    kategori
      ? `Menghapus data demografi kategori ${kategori} (${res.count} baris)`
      : `Menghapus SEMUA data demografi (${res.count} baris)`,
    { entitasId: kategori || "semua", req },
  );

  return ok({ dihapus: res.count }, [
    kategori
      ? `Data kategori dihapus (${res.count} baris)`
      : `Semua data demografi dihapus (${res.count} baris)`,
  ]);
}
