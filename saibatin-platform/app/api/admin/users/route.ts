import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Pastikan pemanggil adalah operator/admin (level 1 atau 2). */
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.level > 2) return null;
  return session;
}

/** Daftar user untuk panel admin (filter status & pencarian). */
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Tidak diizinkan"], 403);

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status"); // "0" | "1" | null
  const q = searchParams.get("q")?.trim();

  const items = await prisma.user.findMany({
    where: {
      ...(statusParam === "0" || statusParam === "1"
        ? { status: Number(statusParam) }
        : {}),
      ...(q
        ? {
            OR: [
              { userId: { contains: q } },
              { userFullname: { contains: q } },
              { userEmail: { contains: q } },
              { userNik: { contains: q } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      userId: true,
      userlevelId: true,
      userFullname: true,
      userNik: true,
      userNokk: true,
      userHp: true,
      userEmail: true,
      status: true,
      createdAt: true,
      level: { select: { nama: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return ok({ items });
}

/** Ubah status aktif/nonaktif user (aktivasi akun). */
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Tidak diizinkan"], 403);

  const body = await req.json().catch(() => ({}));
  const { id, status } = body as { id?: number; status?: number };

  if (typeof id !== "number" || (status !== 0 && status !== 1)) {
    return fail(["Info: Parameter id/status tidak valid"]);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        status,
        updatedBy: typeof session.uid === "number" ? session.uid : undefined,
        ...(status === 1 ? { activationTime: new Date() } : {}),
      },
    });
    return ok(null, [
      status === 1 ? "Info: Akun berhasil diaktifkan" : "Info: Akun dinonaktifkan",
    ]);
  } catch {
    return fail(["Info: Gagal memperbarui status user"], 500);
  }
}
