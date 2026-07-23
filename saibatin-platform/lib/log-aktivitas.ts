import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

/**
 * Audit ringan aktivitas petugas/admin.
 *
 * Dipakai di endpoint dashboard yang mengubah data. Prinsip:
 * - HANYA mencatat pelaku petugas (level 1/2). Warga/OPD (level > 2) diabaikan
 *   supaya log tetap soal "kegiatan admin".
 * - TIDAK PERNAH melempar. Audit tidak boleh menggagalkan aksi utama; kegagalan
 *   pencatatan cukup diabaikan.
 */

export type AksiLog = "BUAT" | "UBAH" | "HAPUS" | "UNGGAH" | "IMPOR" | "LAINNYA";

interface OpsiLog {
  /** id / kunci objek yang terpengaruh (opsional). */
  entitasId?: string | number | null;
  /** Request untuk mengambil IP pelaku (opsional). */
  req?: NextRequest | null;
}

/** Ambil IP pelaku dari header proxy (Nginx: X-Forwarded-For). */
function ipDari(req?: NextRequest | null): string | null {
  if (!req) return null;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip");
}

export async function catatAktivitas(
  pelaku: SessionPayload | null,
  aksi: AksiLog,
  entitas: string,
  ringkasan: string,
  opsi: OpsiLog = {},
): Promise<void> {
  try {
    // Hanya petugas/admin (level 1 & 2). Sesi lain diabaikan.
    if (!pelaku || (pelaku.level !== 1 && pelaku.level !== 2)) return;

    await prisma.logAktivitas.create({
      data: {
        userId: pelaku.uid,
        aksi,
        entitas,
        entitasId: opsi.entitasId != null ? String(opsi.entitasId) : null,
        ringkasan,
        ip: ipDari(opsi.req),
      },
    });
  } catch {
    // sengaja diabaikan — audit tidak boleh menggagalkan aksi utama
  }
}
