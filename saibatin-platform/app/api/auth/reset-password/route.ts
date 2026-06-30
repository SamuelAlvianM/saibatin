import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";

const MAX_AGE_MS = 60 * 60 * 1000; // 1 jam

/** Reset password memakai kode (key) dari permintaan lupa password. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { pass1, pass2, key, recaptchaToken } = body as {
    pass1?: string;
    pass2?: string;
    key?: string;
    recaptchaToken?: string;
  };

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return fail(["Info: Verifikasi reCAPTCHA gagal"]);
  }
  if (!key) return fail(["Info: Kode reset tidak valid"]);
  if (!pass1 || !pass2) return fail(["Info: Password wajib diisi"]);
  if (pass1.length < 6) return fail(["Info: Password minimal 6 karakter"]);
  if (/^\d+$/.test(pass1)) return fail(["Info: Password tidak boleh angka semua"]);
  if (pass1 !== pass2) return fail(["Info: Konfirmasi password tidak sama"]);

  const user = await prisma.user.findFirst({ where: { forgottenCode: key } });
  if (!user || !user.forgottenTime) {
    return fail(["Info: Kode reset tidak ditemukan atau sudah dipakai"]);
  }
  if (Date.now() - new Date(user.forgottenTime).getTime() > MAX_AGE_MS) {
    return fail(["Info: Kode reset sudah kedaluwarsa, silakan ajukan ulang"]);
  }

  try {
    const hash = await bcrypt.hash(pass1, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, forgottenCode: null, forgottenTime: null },
    });
    return ok({}, ["Info: Password berhasil direset, silakan login"]);
  } catch {
    return fail(["Info: Gagal mereset password"], 500);
  }
}
