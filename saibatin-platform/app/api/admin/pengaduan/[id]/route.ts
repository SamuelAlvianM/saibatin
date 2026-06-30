import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

const STATUS_VALID = ["BARU", "DIPROSES", "SELESAI"];

/** Update status / balasan pengaduan (admin/operator). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, balasan } = body as { status?: string; balasan?: string };

  if (status && !STATUS_VALID.includes(status)) {
    return fail(["Info: Status tidak valid"]);
  }
  if (!status && balasan === undefined) {
    return fail(["Info: Tidak ada perubahan"]);
  }

  try {
    await prisma.pengaduan.update({
      where: { id: Number(id) },
      data: {
        ...(status ? { status } : {}),
        ...(balasan !== undefined ? { balasan } : {}),
      },
    });
    return ok(null, ["Info: Pengaduan berhasil diperbarui"]);
  } catch {
    return fail(["Info: Gagal memperbarui pengaduan"], 500);
  }
}
