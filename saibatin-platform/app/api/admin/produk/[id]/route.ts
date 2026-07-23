import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { catatAktivitas } from "@/lib/log-aktivitas";

/** Hapus produk/dokumen (admin/operator). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  try {
    const existing = await prisma.produk.findUnique({
      where: { id: Number(id) },
      select: { judul: true },
    });
    await prisma.produk.delete({ where: { id: Number(id) } });
    await catatAktivitas(
      session,
      "HAPUS",
      "Dokumen",
      `Menghapus dokumen "${existing?.judul ?? id}"`,
      { entitasId: id, req },
    );
    return ok(null, ["Info: Dokumen berhasil dihapus"]);
  } catch {
    return fail(["Info: Gagal menghapus dokumen"], 500);
  }
}
