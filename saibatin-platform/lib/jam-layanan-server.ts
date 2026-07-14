import { prisma } from "@/lib/prisma";
import {
  JAM_LAYANAN_KEY,
  sanitizeJamLayanan,
  cekJamLayanan,
  type JamLayananConfig,
  type StatusJam,
} from "@/lib/jam-layanan";

/** Muat konfigurasi jam layanan dari DB (fallback default bila belum diatur). */
export async function loadJamLayanan(): Promise<JamLayananConfig> {
  const row = await prisma.staticContent.findUnique({
    where: { kunci: JAM_LAYANAN_KEY },
  });
  return sanitizeJamLayanan(row?.konten);
}

/**
 * Penegakan jam layanan untuk pembuatan permohonan (warga & staff).
 * Kembalikan StatusJam; pemanggil menolak request bila `open` false.
 */
export async function cekJamLayananSekarang(): Promise<StatusJam> {
  const cfg = await loadJamLayanan();
  return cekJamLayanan(cfg);
}
