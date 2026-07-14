import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { buatBukti, normalisasiHp, verifikasiOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifikasi kode OTP.
 * POST /api/otp/verify { hp, kode, challenge } → { bukti }
 * `bukti` dilampirkan ke /api/auth/register sebagai tanda nomor terverifikasi.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    hp?: string;
    kode?: string;
    challenge?: string;
  };
  const hp = normalisasiHp(body.hp ?? "");
  const kode = String(body.kode ?? "").replace(/\D/g, "");
  if (!hp || kode.length !== 6 || !body.challenge) {
    return fail(["Kode OTP tidak valid"]);
  }

  if (!verifikasiOtp(hp, kode, body.challenge)) {
    return fail(["Kode OTP salah atau sudah kedaluwarsa"]);
  }

  return ok({ bukti: buatBukti(hp) }, ["Nomor WhatsApp terverifikasi"]);
}
