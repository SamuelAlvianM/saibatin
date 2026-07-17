import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { mailEnabled } from "./mail";
import { fonnteAktif } from "./fonnte";

/**
 * OTP stateless (tanpa tabel DB): kode tidak disimpan di server, melainkan
 * dibuktikan lewat HMAC. Identifier bisa alamat email ATAU nomor HP —
 * kanal pengiriman ditentukan otpChannel().
 *
 * Alur:
 * 1. /api/otp/send   → buatOtp(id): kode dikirim via email/WA, klien menerima
 *    `challenge` (exp.signature — kode TIDAK terbaca dari challenge).
 * 2. /api/otp/verify → verifikasiOtp(id, kode, challenge): cocok → server
 *    menerbitkan `bukti` verifikasi (berlaku 30 menit).
 * 3. /api/auth/register → cekBukti(id, bukti) sebelum akun dibuat.
 */

const SECRET =
  process.env.AUTH_SECRET ?? "dev-secret-ganti-di-produksi-minimal-32-karakter";

const OTP_TTL_MS = 5 * 60_000; // kode berlaku 5 menit
const BUKTI_TTL_MS = 30 * 60_000; // bukti verifikasi berlaku 30 menit

const hmac = (s: string) => createHmac("sha256", SECRET).update(s).digest("hex");

function amanSama(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Normalisasi nomor HP Indonesia ke format 62…; null bila tidak valid. */
export function normalisasiHp(raw: string): string | null {
  const d = String(raw ?? "").replace(/\D/g, "");
  const inti = d.startsWith("62") ? d : d.startsWith("0") ? `62${d.slice(1)}` : null;
  if (!inti || inti.length < 10 || inti.length > 15) return null;
  return inti;
}

/** Normalisasi alamat email (trim + lowercase); null bila tidak valid. */
export function normalisasiEmail(raw: string): string | null {
  const e = String(raw ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 254) return null;
  return e;
}

/**
 * Kanal pengiriman OTP aktif.
 * - `OTP_CHANNEL=email|wa` memaksa kanal tertentu.
 * - Tanpa env: email bila MAIL_* terkonfigurasi, WA bila FONNTE_TOKEN ada,
 *   null bila keduanya kosong (OTP nonaktif di production / mode dev).
 */
export function otpChannel(): "email" | "wa" | null {
  const forced = (process.env.OTP_CHANNEL ?? "").toLowerCase();
  if (forced === "email") return "email";
  if (forced === "wa") return "wa";
  if (mailEnabled()) return "email";
  if (fonnteAktif()) return "wa";
  return null;
}

/** Buat kode OTP 6 digit + challenge terikat nomor HP. */
export function buatOtp(hp: string) {
  const kode = String(randomInt(100000, 1000000));
  const exp = Date.now() + OTP_TTL_MS;
  const challenge = `${exp}.${hmac(`otp.${hp}.${kode}.${exp}`)}`;
  return { kode, challenge };
}

export function verifikasiOtp(hp: string, kode: string, challenge: string) {
  const [expStr, sig] = String(challenge ?? "").split(".");
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  return amanSama(sig, hmac(`otp.${hp}.${kode}.${exp}`));
}

/** Bukti "nomor ini sudah lolos OTP" — dibawa klien ke endpoint register. */
export function buatBukti(hp: string) {
  const exp = Date.now() + BUKTI_TTL_MS;
  return `${exp}.${hmac(`bukti.${hp}.${exp}`)}`;
}

export function cekBukti(hp: string, bukti: string) {
  const [expStr, sig] = String(bukti ?? "").split(".");
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  return amanSama(sig, hmac(`bukti.${hp}.${exp}`));
}

/**
 * Apakah verifikasi OTP diwajibkan saat register?
 * - Ada kanal aktif (email/WA) → wajib.
 * - Development tanpa kanal → tetap wajib (kode dev dikembalikan API send).
 * - Production tanpa kanal → dilewati, agar pendaftaran tidak terkunci
 *   sebelum layanan OTP dikonfigurasi.
 */
export function otpWajib() {
  return otpChannel() !== null || process.env.NODE_ENV !== "production";
}
