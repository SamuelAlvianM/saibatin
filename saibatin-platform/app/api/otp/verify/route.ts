import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import {
  buatBukti,
  normalisasiEmail,
  normalisasiHp,
  otpChannel,
  verifikasiOtp,
} from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifikasi kode OTP (identifier mengikuti kanal aktif: email atau HP).
 * POST /api/otp/verify { email, hp, kode, challenge } → { bukti }
 * `bukti` dilampirkan ke /api/auth/register sebagai tanda identifier terverifikasi.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    hp?: string;
    kode?: string;
    challenge?: string;
  };
  const kanal = otpChannel() ?? "email";
  const id =
    kanal === "email"
      ? normalisasiEmail(body.email ?? "")
      : normalisasiHp(body.hp ?? "");
  const kode = String(body.kode ?? "").replace(/\D/g, "");
  if (!id || kode.length !== 6 || !body.challenge) {
    return fail(["Kode OTP tidak valid"]);
  }

  if (!verifikasiOtp(id, kode, body.challenge)) {
    return fail(["Kode OTP salah atau sudah kedaluwarsa"]);
  }

  return ok(
    { bukti: buatBukti(id) },
    [kanal === "email" ? "Alamat email terverifikasi" : "Nomor WhatsApp terverifikasi"],
  );
}
