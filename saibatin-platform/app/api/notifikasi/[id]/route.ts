import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Tandai satu notifikasi sebagai sudah dibaca (hanya milik sendiri). */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { id } = await params;
  const result = await prisma.notifikasi.updateMany({
    where: { id: Number(id), userId: session.uid },
    data: { dibaca: true },
  });
  if (result.count === 0) return fail(["Notifikasi tidak ditemukan"], 404);

  return ok(null);
}
