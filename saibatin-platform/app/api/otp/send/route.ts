import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { fonnteAktif, kirimWa } from "@/lib/fonnte";
import { mailEnabled, sendMail } from "@/lib/mail";
import { tplOtpEmail } from "@/lib/mail-templates";
import {
  buatOtp,
  normalisasiEmail,
  normalisasiHp,
  otpChannel,
  otpWajib,
} from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pembatas kirim ulang per identifier (in-memory, cukup untuk satu instance).
const terakhirKirim = new Map<string, number>();
const JEDA_KIRIM_MS = 60_000;

/**
 * Kirim kode OTP pendaftaran — kanal mengikuti otpChannel():
 * email (SMTP/Brevo) atau WhatsApp (Fonnte).
 * POST /api/otp/send { email, hp } → { kanal, challenge, ttlDetik, devKode? }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    hp?: string;
  };

  // Production tanpa kanal OTP: dinonaktifkan agar pendaftaran tetap jalan.
  if (!otpWajib()) return ok({ dinonaktifkan: true });

  const kanal = otpChannel() ?? "email"; // dev tanpa kanal → uji alur email
  const id =
    kanal === "email"
      ? normalisasiEmail(body.email ?? "")
      : normalisasiHp(body.hp ?? "");
  if (!id) {
    return fail([
      kanal === "email"
        ? "Alamat email tidak valid"
        : "Nomor HP tidak valid — gunakan format 08xx/62xx",
    ]);
  }

  const last = terakhirKirim.get(id) ?? 0;
  const sisa = Math.ceil((last + JEDA_KIRIM_MS - Date.now()) / 1000);
  if (sisa > 0) {
    return fail([`Tunggu ${sisa} detik sebelum meminta kode baru`], 429);
  }

  const { kode, challenge } = buatOtp(id);
  let terkirim = false;

  if (kanal === "email" && mailEnabled()) {
    terkirim = await sendMail({ to: id, ...tplOtpEmail(kode) });
    if (!terkirim) {
      return fail(["Gagal mengirim email OTP. Periksa alamat atau coba lagi."], 502);
    }
  } else if (kanal === "wa" && fonnteAktif()) {
    terkirim = await kirimWa(
      id,
      `*${kode}* adalah kode verifikasi pendaftaran akun SAIBATIN Disdukcapil Pesisir Barat Anda. Kode berlaku 5 menit. JANGAN berikan kode ini kepada siapa pun.`,
    );
    if (!terkirim) {
      return fail(["Gagal mengirim OTP WhatsApp. Periksa nomor atau coba lagi."], 502);
    }
  } else if (process.env.NODE_ENV === "production") {
    return fail(["Layanan OTP belum dikonfigurasi (MAIL_* / FONNTE_TOKEN)"], 503);
  }

  terakhirKirim.set(id, Date.now());

  return ok({
    kanal,
    challenge,
    ttlDetik: 300,
    // Mode dev tanpa layanan kirim: tampilkan kode agar alur bisa diuji.
    ...(terkirim ? {} : { devKode: kode }),
  });
}
