import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";

/**
 * Registrasi warga — port dari RegisterController@postDatas (Laravel data-2).
 * Aturan dipertahankan: NIK 16 digit, password >= 6 karakter & tidak semua angka,
 * konfirmasi password cocok, cek NIK/email yang sudah aktif.
 * Perbedaan keamanan: TIDAK menyimpan password plaintext (passwordnote dibuang).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    nama,
    nik,
    kk,
    hp,
    email,
    pass,
    pass2,
    recaptchaToken,
  } = body as Record<string, string>;

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return fail(["Info: Verifikasi reCAPTCHA gagal, harap dicoba kembali (N-00)"]);
  }

  // Validasi wajib
  if (!nama || !nik || !kk || !hp || !email || !pass || !pass2) {
    return fail(["Info: Semua field wajib diisi (N-10)"]);
  }
  if (String(nik).length !== 16) {
    return fail(["Info: NIK Harus 16 Digit (N-15)"]);
  }
  if (/^\d+$/.test(pass)) {
    return fail(["Info: Password Tidak Boleh Angka Semua (N-07)"]);
  }
  if (pass.length < 6) {
    return fail(["Info: Password Minimal 6 Karakter (N-08)"]);
  }
  if (pass !== pass2) {
    return fail(["Info: Password Konfirmasi Tidak Sama (N-09)"]);
  }

  try {
    const aktifByNik = await prisma.user.count({
      where: { userId: nik, status: 1 },
    });
    if (aktifByNik > 0) {
      return fail([
        "Info: NIK sudah terdaftar, Gunakan NIK yg Berbeda atau Silahkan Login (N-03)",
      ]);
    }
    const aktifByEmail = await prisma.user.count({
      where: { userEmail: email, status: 1 },
    });
    if (aktifByEmail > 0) {
      return fail([
        "Info: Alamat Email sudah terdaftar, Gunakan Email yg Berbeda atau Silahkan Login (N-15)",
      ]);
    }

    const activationCode = String(Math.floor(1000 + Math.random() * 9000));
    const hashpass = await bcrypt.hash(pass, 10);
    const activationCodeUrl = await bcrypt.hash(nik + Date.now(), 10);

    await prisma.user.create({
      data: {
        userId: nik,
        password: hashpass,
        userlevelId: 3,
        userFullname: nama,
        userNik: nik,
        userNokk: kk,
        userHp: hp,
        userEmail: email,
        activationCode,
        activationCodeUrl,
        ipAddress: req.headers.get("x-forwarded-for") ?? "",
        status: 0,
        createdBy: 3,
      },
    });

    return ok(
      { nik, email, hp },
      [
        "Info: Permohonan akun Anda sedang diproses dan menunggu verifikasi/aktivasi",
      ]
    );
  } catch {
    return fail(["Info: Data tidak berhasil disimpan (N-02)"], 500);
  }
}
