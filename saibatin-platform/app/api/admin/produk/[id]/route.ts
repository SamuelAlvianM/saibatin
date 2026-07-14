import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Hapus produk/dokumen (admin/operator). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  try {
    await prisma.produk.delete({ where: { id: Number(id) } });
    return ok(null, ["Info: Dokumen berhasil dihapus"]);
  } catch {
    return fail(["Info: Gagal menghapus dokumen"], 500);
  }
}
