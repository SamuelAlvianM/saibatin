import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import {
  TIKET_AUTO_CLOSE_DAYS,
  autoCloseStaleTikets,
  isPetugas,
} from "@/lib/tiket";

export const dynamic = "force-dynamic";

/** GET /api/tiket — daftar tiket (warga: milik sendiri; petugas: semua). */
export async function GET() {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  await autoCloseStaleTikets();

  const where = isPetugas(session.level) ? {} : { userId: session.uid };
  const tikets = await prisma.tiket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, userFullname: true, userlevelId: true } },
      pesan: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { isi: true, createdAt: true, userId: true },
      },
      _count: { select: { pesan: true } },
    },
  });

  return ok({
    tikets: tikets.map((t) => ({
      id: t.id,
      nomor: t.nomor,
      subjek: t.subjek,
      kategori: t.kategori,
      status: t.status,
      pembuat: t.user.userFullname ?? "Pengguna",
      pembuatId: t.user.id,
      jumlahPesan: t._count.pesan,
      pesanTerakhir: t.pesan[0]?.isi ?? null,
      updatedAt: t.updatedAt,
      createdAt: t.createdAt,
    })),
    autoCloseDays: TIKET_AUTO_CLOSE_DAYS,
  });
}

/** POST /api/tiket — buka tiket baru { subjek, kategori?, pesan }. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const subjek = String(body.subjek ?? "").trim();
  const pesan = String(body.pesan ?? "").trim();
  let kategori = String(body.kategori ?? "LAYANAN").toUpperCase();

  const errors: string[] = [];
  if (!subjek) errors.push("Subjek tiket wajib diisi");
  if (subjek.length > 150) errors.push("Subjek maksimal 150 karakter");
  if (!pesan) errors.push("Pesan awal wajib diisi");
  if (!["LAYANAN", "TEKNIS", "INTERNAL"].includes(kategori)) {
    kategori = "LAYANAN";
  }
  // Kategori INTERNAL khusus komunikasi antar petugas.
  if (kategori === "INTERNAL" && !isPetugas(session.level)) {
    errors.push("Kategori internal hanya untuk petugas");
  }
  if (errors.length > 0) return fail(errors, 422);

  const tiket = await prisma.tiket.create({
    data: {
      nomor: `TKT${Date.now()}`,
      userId: session.uid,
      subjek,
      kategori,
      pesan: { create: { userId: session.uid, isi: pesan } },
    },
  });

  return ok({ id: tiket.id, nomor: tiket.nomor }, [
    `Tiket ${tiket.nomor} berhasil dibuka`,
  ]);
}
