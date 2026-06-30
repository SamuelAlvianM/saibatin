import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Ganti password user yang sedang login. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const body = await req.json().catch(() => ({}));
  const { passwordLama, passwordBaru, konfirmasi } = body as Record<string, string>;

  if (!passwordLama || !passwordBaru || !konfirmasi) {
    return fail(["Info: Semua field wajib diisi"]);
  }
  if (passwordBaru.length < 6) {
    return fail(["Info: Password baru minimal 6 karakter"]);
  }
  if (/^\d+$/.test(passwordBaru)) {
    return fail(["Info: Password baru tidak boleh angka semua"]);
  }
  if (passwordBaru !== konfirmasi) {
    return fail(["Info: Konfirmasi password tidak sama"]);
  }

  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  if (!user) return fail(["Data user tidak ditemukan"], 404);

  const cocok = await bcrypt.compare(passwordLama, user.password);
  if (!cocok) return fail(["Info: Password lama salah"]);

  const sama = await bcrypt.compare(passwordBaru, user.password);
  if (sama) return fail(["Info: Password baru tidak boleh sama dengan password lama"]);

  try {
    const hash = await bcrypt.hash(passwordBaru, 12);
    await prisma.user.update({
      where: { id: session.uid },
      data: { password: hash, updatedBy: session.uid },
    });
    return ok(null, ["Info: Password berhasil diubah"]);
  } catch {
    return fail(["Info: Gagal mengubah password"], 500);
  }
}
