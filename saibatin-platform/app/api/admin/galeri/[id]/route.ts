import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { catatAktivitas } from "@/lib/log-aktivitas";

/** Hapus foto galeri (admin/operator). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  try {
    await prisma.gallery.delete({ where: { id: Number(id) } });
    await catatAktivitas(session, "HAPUS", "Galeri", `Menghapus foto galeri #${id}`, {
      entitasId: id,
      req,
    });
    return ok(null, ["Info: Foto berhasil dihapus"]);
  } catch {
    return fail(["Info: Gagal menghapus foto"], 500);
  }
}
