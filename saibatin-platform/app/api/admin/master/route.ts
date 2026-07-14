import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Halaman Master ("tuhan"-nya aplikasi): membuka kunci permohonan yang sudah
 * final (SELESAI/DITOLAK) agar bisa diproses ulang. Butuh sesi petugas DAN
 * password master (env MASTER_PASSWORD).
 */

const MASTER_PASSWORD =
  process.env.MASTER_PASSWORD ?? "tehgelas@gdingin:X79weko";

/** Bandingkan via HMAC agar timingSafeEqual aman untuk panjang berbeda. */
function passwordCocok(input: string) {
  const kunci = "master-cek";
  const a = createHmac("sha256", kunci).update(String(input ?? "")).digest();
  const b = createHmac("sha256", kunci).update(MASTER_PASSWORD).digest();
  return timingSafeEqual(a, b);
}

/** POST /api/admin/master { password, noregister } → buka kunci permohonan. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const body = (await req.json().catch(() => ({}))) as {
    password?: string;
    noregister?: string;
  };
  const noregister = String(body.noregister ?? "").trim();
  if (!body.password || !noregister) {
    return fail(["Info: Password master dan No. Register wajib diisi"]);
  }
  if (!passwordCocok(body.password)) {
    return fail(["Info: Password master salah"], 403);
  }

  try {
    const permohonan = await prisma.permohonan.findFirst({
      where: { noregister },
      select: { id: true, status: true, catatan: true },
    });
    if (!permohonan) return fail(["Permohonan tidak ditemukan"], 404);
    if (permohonan.status !== "SELESAI" && permohonan.status !== "DITOLAK") {
      return fail(["Info: Permohonan ini tidak terkunci (belum final)"]);
    }

    await prisma.permohonan.update({
      where: { id: permohonan.id },
      data: {
        status: "DIPROSES",
        catatan:
          `${permohonan.catatan ? `${permohonan.catatan}\n` : ""}` +
          `[Master] Kunci dibuka oleh ${session.nama ?? session.userId} — status dikembalikan ke Diproses.`,
      },
    });

    return ok(null, [
      `Info: Kunci permohonan ${noregister} dibuka — status kembali ke Diproses`,
    ]);
  } catch {
    return fail(["Info: Gagal membuka kunci permohonan"], 500);
  }
}
