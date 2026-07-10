import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { autoCloseStaleTikets, isPetugas } from "@/lib/tiket";

export const dynamic = "force-dynamic";

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

async function findTiketFor(session: Session, id: number) {
  const tiket = await prisma.tiket.findUnique({ where: { id } });
  if (!tiket) return null;
  // Warga hanya boleh mengakses tiket miliknya.
  if (!isPetugas(session.level) && tiket.userId !== session.uid) return null;
  return tiket;
}

/** GET /api/tiket/[id] — detail tiket + seluruh pesan (untuk tampilan chat). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { id } = await params;
  await autoCloseStaleTikets();
  const tiket = await findTiketFor(session, Number(id));
  if (!tiket) return fail(["Tiket tidak ditemukan"], 404);

  const pesan = await prisma.tiketPesan.findMany({
    where: { tiketId: tiket.id },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, userFullname: true, userlevelId: true } },
    },
  });

  return ok({
    tiket: {
      id: tiket.id,
      nomor: tiket.nomor,
      subjek: tiket.subjek,
      kategori: tiket.kategori,
      status: tiket.status,
      pembuatId: tiket.userId,
      createdAt: tiket.createdAt,
      closedAt: tiket.closedAt,
    },
    pesan: pesan.map((p) => ({
      id: p.id,
      isi: p.isi,
      pengirimId: p.user.id,
      pengirim: p.user.userFullname ?? "Pengguna",
      petugas: isPetugas(p.user.userlevelId),
      createdAt: p.createdAt,
    })),
    meId: session.uid,
  });
}

/** POST /api/tiket/[id] — kirim pesan { isi } ke tiket TERBUKA. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { id } = await params;
  const tiket = await findTiketFor(session, Number(id));
  if (!tiket) return fail(["Tiket tidak ditemukan"], 404);
  if (tiket.status !== "TERBUKA") {
    return fail(["Tiket sudah ditutup. Buka kembali tiket untuk membalas."], 409);
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const isi = String(body.isi ?? "").trim();
  if (!isi) return fail(["Pesan tidak boleh kosong"], 422);
  if (isi.length > 4000) return fail(["Pesan maksimal 4000 karakter"], 422);

  const pesan = await prisma.tiketPesan.create({
    data: { tiketId: tiket.id, userId: session.uid, isi },
  });
  // Sentuh tiket agar updatedAt maju (dasar urutan daftar & auto-close).
  await prisma.tiket.update({
    where: { id: tiket.id },
    data: { updatedAt: new Date() },
  });

  return ok({ id: pesan.id }, ["Pesan terkirim"]);
}

/** PATCH /api/tiket/[id] — tutup / buka kembali tiket { status }. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { id } = await params;
  const tiket = await findTiketFor(session, Number(id));
  if (!tiket) return fail(["Tiket tidak ditemukan"], 404);

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const status = String(body.status ?? "").toUpperCase();
  if (!["TERBUKA", "TERTUTUP"].includes(status)) {
    return fail(["Status tidak valid"], 422);
  }

  await prisma.tiket.update({
    where: { id: tiket.id },
    data: {
      status,
      closedAt: status === "TERTUTUP" ? new Date() : null,
    },
  });

  return ok({ status }, [
    status === "TERTUTUP" ? "Tiket ditutup" : "Tiket dibuka kembali",
  ]);
}
