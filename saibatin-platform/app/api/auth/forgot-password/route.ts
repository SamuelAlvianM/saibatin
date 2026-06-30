import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";

/**
 * Permintaan reset password berbasis NIK.
 * Membuat kode reset (forgottenCode) dan menyimpan waktunya. Pengiriman email
 * belum dikonfigurasi — kode dapat diambil petugas dari DB. Tidak crash.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { nik, recaptchaToken } = body as { nik?: string; recaptchaToken?: string };

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return fail(["Info: Verifikasi reCAPTCHA gagal"]);
  }
  if (!nik) return fail(["Info: NIK wajib diisi"]);

  const user = await prisma.user.findFirst({
    where: { OR: [{ userId: nik }, { userNik: nik }], status: 1 },
    orderBy: { id: "desc" },
  });

  // Selalu balas sukses (hindari kebocoran apakah NIK terdaftar).
  if (user) {
    const code = `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { forgottenCode: code, forgottenTime: new Date() },
    });
    // TODO: kirim email berisi tautan /reset-password?key=<code> saat MAIL_* terkonfigurasi.
  }

  return ok({}, [
    "Info: Jika NIK terdaftar, instruksi reset password telah dikirim ke kontak terdaftar.",
  ]);
}
