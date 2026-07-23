import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { MEDIA_STORAGE_ROOT } from "@/lib/media";
import { catatAktivitas } from "@/lib/log-aktivitas";

/** Hapus media: file fisik + record DB (admin/operator). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Tidak diizinkan"], 403);

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return fail(["Media tidak ditemukan"], 404);

  try {
    await unlink(join(MEDIA_STORAGE_ROOT, media.path)).catch(() => {
      // File sudah tidak ada di disk — tetap lanjut hapus record.
    });
    await prisma.media.delete({ where: { id } });
    await catatAktivitas(
      session,
      "HAPUS",
      "Media",
      `Menghapus media "${media.namaAsli ?? media.path}"`,
      { entitasId: id, req },
    );
    return ok(null, ["Media berhasil dihapus"]);
  } catch (err) {
    console.error("Media delete error:", err);
    return fail(["Gagal menghapus media"], 500);
  }
}
