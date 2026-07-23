import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { createSession } from "@/lib/auth";

/**
 * Login — port dari LoginController (Laravel data-2).
 * Identitas: user_id (NIK warga, atau USERNAME untuk OPD/staff).
 * Hanya akun status=1 (aktif) yang boleh masuk.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { user_id, password, recaptchaToken } = body as Record<string, string>;

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return fail(["Info: Verifikasi reCAPTCHA gagal (L-00)"]);
  }
  // Username OPD sering tersalin dengan spasi berlebih dari catatan/WA —
  // normalisasi dulu supaya lookup tidak gagal karena whitespace.
  const identitas = (user_id ?? "").trim();

  if (!identitas || !password) {
    return fail(["Info: NIK/Username dan Password wajib diisi (L-01)"]);
  }

  try {
    const user = await prisma.user.findFirst({
      where: { userId: identitas },
      orderBy: { id: "desc" },
    });

    if (!user) return fail(["Info: NIK/Username belum terdaftar (L-02)"]);
    if (user.status !== 1) {
      return fail(["Info: Akun belum aktif. Silakan aktivasi terlebih dahulu (L-03)"]);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail(["Info: Password salah (L-04)"]);

    // Dibaca SEBELUM loginLast ditimpa di bawah: warga yang baru pertama kali
    // masuk dan belum punya foto diarahkan melengkapinya di Pengaturan Akun.
    // Sifatnya anjuran — halaman tujuan tetap bisa ditinggalkan.
    const lengkapiFoto =
      user.userlevelId === 3 && !user.userFoto && user.loginLast === null;

    await prisma.user.update({
      where: { id: user.id },
      data: { loginLast: new Date(), ipAddress: req.headers.get("x-forwarded-for") ?? "" },
    });

    await createSession({
      uid: user.id,
      userId: user.userId,
      nama: user.userFullname,
      level: user.userlevelId,
    });

    return ok(
      {
        user: {
          id: user.id,
          user_id: user.userId,
          name: user.userFullname,
          email: user.userEmail,
          level: user.userlevelId,
        },
        lengkapiFoto,
      },
      ["Info: Login berhasil"]
    );
  } catch {
    return fail(["Info: Terjadi kesalahan pada server (L-99)"], 500);
  }
}
