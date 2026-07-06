import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { appUrl, sendMail } from "@/lib/mail";
import { tplResetPassword } from "@/lib/mail-templates";

/**
 * Permintaan reset password berbasis NIK.
 * Membuat kode reset (forgottenCode), menyimpan waktunya, lalu mengirim
 * tautan reset ke email terdaftar (jika MAIL_* terkonfigurasi).
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
    if (user.userEmail) {
      const mail = tplResetPassword(
        user.userFullname ?? user.userId,
        appUrl(`/reset-password?key=${code}`),
      );
      await sendMail({ to: user.userEmail, ...mail });
    }
  }

  return ok({}, [
    "Info: Jika NIK terdaftar, instruksi reset password telah dikirim ke kontak terdaftar.",
  ]);
}
