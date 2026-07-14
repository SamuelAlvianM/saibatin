import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { fonnteAktif, kirimWa } from "@/lib/fonnte";
import { buatOtp, normalisasiHp, otpWajib } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pembatas kirim ulang per nomor (in-memory, cukup untuk satu instance).
const terakhirKirim = new Map<string, number>();
const JEDA_KIRIM_MS = 60_000;

/**
 * Kirim kode OTP pendaftaran via WhatsApp (Fonnte).
 * POST /api/otp/send { hp } → { challenge, ttlDetik, devKode? }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const hp = normalisasiHp((body as { hp?: string }).hp ?? "");
  if (!hp) return fail(["Nomor HP tidak valid — gunakan format 08xx/62xx"]);

  // Production tanpa FONNTE_TOKEN: OTP dinonaktifkan agar pendaftaran tetap jalan.
  if (!otpWajib()) return ok({ dinonaktifkan: true });

  const last = terakhirKirim.get(hp) ?? 0;
  const sisa = Math.ceil((last + JEDA_KIRIM_MS - Date.now()) / 1000);
  if (sisa > 0) {
    return fail([`Tunggu ${sisa} detik sebelum meminta kode baru`], 429);
  }

  const { kode, challenge } = buatOtp(hp);

  if (fonnteAktif()) {
    const terkirim = await kirimWa(
      hp,
      `*${kode}* adalah kode verifikasi pendaftaran akun SAIBATIN Disdukcapil Pesisir Barat Anda. Kode berlaku 5 menit. JANGAN berikan kode ini kepada siapa pun.`,
    );
    if (!terkirim) {
      return fail(["Gagal mengirim OTP WhatsApp. Periksa nomor atau coba lagi."], 502);
    }
  } else if (process.env.NODE_ENV === "production") {
    return fail(["Layanan OTP belum dikonfigurasi (FONNTE_TOKEN)"], 503);
  }

  terakhirKirim.set(hp, Date.now());

  return ok({
    challenge,
    ttlDetik: 300,
    // Mode dev tanpa Fonnte: tampilkan kode agar alur bisa diuji.
    ...(fonnteAktif() ? {} : { devKode: kode }),
  });
}
