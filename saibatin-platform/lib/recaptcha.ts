/**
 * Verifikasi token reCAPTCHA v3 di sisi server.
 * Mengembalikan true jika lolos (atau jika secret belum diisi saat dev).
 */
export async function verifyRecaptcha(token?: string, minScore = 0.5): Promise<boolean> {
  const secret = process.env.RECAPTCHA_V3_SECRET_KEY;
  // Saat dev tanpa secret, jangan blokir alur.
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean; score?: number };
    return Boolean(data.success && (data.score ?? 0) >= minScore);
  } catch {
    return false;
  }
}
