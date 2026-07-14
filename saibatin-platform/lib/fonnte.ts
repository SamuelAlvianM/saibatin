/**
 * Pengiriman pesan WhatsApp via Fonnte (https://fonnte.com).
 *
 * Konfigurasi: set env `FONNTE_TOKEN` = token DEVICE dari dashboard Fonnte
 * (menu Devices → pilih device yang sudah scan QR WhatsApp → Token).
 * Tanpa token, pengiriman dilewati (return false) — pemanggil yang memutuskan
 * fallback-nya.
 */

export function fonnteAktif() {
  return !!process.env.FONNTE_TOKEN;
}

/** Kirim pesan WA ke satu nomor (format 62…). true = diterima antrean Fonnte. */
export async function kirimWa(target: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return false;

  try {
    const body = new URLSearchParams({ target, message, countryCode: "62" });
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token },
      body,
    });
    const j = (await res.json().catch(() => null)) as { status?: boolean } | null;
    return res.ok && !!j?.status;
  } catch {
    return false;
  }
}
