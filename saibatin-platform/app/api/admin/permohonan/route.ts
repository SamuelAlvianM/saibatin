import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Daftar SEMUA permohonan untuk panel admin (filter status & pencarian). */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // MENUNGGU | DIPROSES | SELESAI | DITOLAK
  const q = searchParams.get("q")?.trim();

  const rawItems = await prisma.permohonan.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { noregister: { contains: q } },
              { user: { userFullname: { contains: q } } },
              { user: { userId: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      jenis: { select: { nama: true, kategori: true } },
      user: { select: { userId: true, userFullname: true, userHp: true } },
      _count: { select: { berkas: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const items = rawItems.map((i) => ({
    id: i.id,
    noregister: i.noregister,
    status: i.status,
    catatan: i.catatan,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    jenisNama: i.jenis?.nama ?? "-",
    kategori: i.jenis?.kategori ?? "-",
    pemohon: i.user?.userFullname ?? i.user?.userId ?? "-",
    pemohonId: i.user?.userId ?? "-",
    hp: i.user?.userHp ?? "-",
    jumlahBerkas: i._count.berkas,
  }));

  // Jumlah per status (global, untuk chip filter) — independen dari filter aktif.
  const grouped = await prisma.permohonan.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  let total = 0;
  for (const g of grouped) {
    counts[g.status] = g._count._all;
    total += g._count._all;
  }
  counts[""] = total; // "Semua"

  return ok({ items, counts });
}
