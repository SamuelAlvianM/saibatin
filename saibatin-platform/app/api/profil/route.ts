import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Ambil biodata user yang sedang login. */
export async function GET() {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: {
      id: true,
      userId: true,
      userFullname: true,
      userNik: true,
      userNokk: true,
      userHp: true,
      userEmail: true,
      ket: true,
    },
  });
  if (!user) return fail(["Data user tidak ditemukan"], 404);

  return ok({ user });
}

/** Perbarui biodata user yang sedang login (nama, HP, email, alamat). */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const body = await req.json().catch(() => ({}));
  const { nama, hp, email, alamat } = body as Record<string, string>;

  if (!nama?.trim()) return fail(["Info: Nama wajib diisi"]);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return fail(["Info: Format email tidak valid"]);
  }
  if (hp && !/^[0-9+]{8,15}$/.test(hp)) {
    return fail(["Info: Nomor HP tidak valid (8-15 digit)"]);
  }

  // Pastikan email tidak dipakai akun aktif lain.
  if (email) {
    const dipakai = await prisma.user.count({
      where: { userEmail: email, status: 1, NOT: { id: session.uid } },
    });
    if (dipakai > 0) return fail(["Info: Email sudah dipakai akun lain"]);
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.uid },
      data: {
        userFullname: nama.trim(),
        userHp: hp ?? null,
        userEmail: email ?? null,
        ket: alamat ?? undefined,
        updatedBy: session.uid,
      },
      select: {
        id: true,
        userId: true,
        userFullname: true,
        userHp: true,
        userEmail: true,
        ket: true,
      },
    });
    return ok({ user }, ["Info: Profil berhasil diperbarui"]);
  } catch {
    return fail(["Info: Gagal memperbarui profil"], 500);
  }
}
