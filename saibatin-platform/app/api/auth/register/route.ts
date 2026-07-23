import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendMail } from "@/lib/mail";
import { tplRegistrasiDiterima } from "@/lib/mail-templates";
import { cekBukti, normalisasiEmail, normalisasiHp, otpChannel, otpWajib } from "@/lib/otp";
import { notifyPetugas, safeNotify } from "@/lib/notifikasi";
import { simpanFotoProfil } from "@/lib/foto-profil";

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
    kecamatan,
    foto,
    recaptchaToken,
    otpBukti,
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
  if (!kecamatan?.trim()) {
    return fail(["Info: Kecamatan domisili wajib dipilih (N-17)"]);
  }
  if (!foto?.trim()) {
    return fail(["Info: Foto wajah/selfie wajib dilampirkan (N-18)"]);
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

  // Identifier (email/nomor WA sesuai kanal aktif) wajib lolos OTP — kecuali
  // layanan OTP belum dikonfigurasi di production (lihat lib/otp.ts otpWajib()).
  if (otpWajib()) {
    const kanal = otpChannel() ?? "email";
    const idNormal =
      kanal === "email" ? normalisasiEmail(email) : normalisasiHp(hp);
    if (!idNormal || !cekBukti(idNormal, otpBukti ?? "")) {
      return fail([
        kanal === "email"
          ? "Info: Alamat email belum diverifikasi OTP (N-16)"
          : "Info: Nomor WhatsApp belum diverifikasi OTP (N-16)",
      ]);
    }
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

    const userBaru = await prisma.user.create({
      data: {
        userId: nik,
        password: hashpass,
        userlevelId: 3,
        userFullname: nama,
        userNik: nik,
        userNokk: kk,
        userHp: hp,
        userEmail: email,
        userKecamatan: kecamatan.trim(),
        activationCode,
        activationCodeUrl,
        ipAddress: req.headers.get("x-forwarded-for") ?? "",
        status: 0,
        createdBy: 3,
      },
    });

    // Foto baru bisa disimpan setelah akun ada — nama berkasnya diawali id
    // pemilik, dan itulah dasar kontrol akses di app/uploads/[...path].
    const urlFoto = await simpanFotoProfil(foto, userBaru.id);
    if (urlFoto) {
      await prisma.user.update({
        where: { id: userBaru.id },
        data: { userFoto: urlFoto },
      });
    }

    // Email konfirmasi — kegagalan kirim tidak menggagalkan pendaftaran.
    const konfirmasi = tplRegistrasiDiterima(nama);
    await sendMail({ to: email, ...konfirmasi });

    // Notifikasi ke petugas: ada akun baru yang menunggu aktivasi.
    await safeNotify(() =>
      notifyPetugas({
        tipe: "AKUN_BARU",
        judul: "Pendaftaran akun baru",
        isi: `${nama} (NIK ${nik}) mendaftar dan menunggu aktivasi akun.`,
        link: "/dashboard/users",
        refType: "User",
        refId: userBaru.id,
      }),
    );

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
