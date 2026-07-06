import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import {
  tplPermohonanSelesai,
  tplPermohonanDitolak,
} from "@/lib/mail-templates";

const STATUS_VALID = ["MENUNGGU", "DIPROSES", "SELESAI", "DITOLAK"];

/** Detail satu permohonan (admin). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  const permohonan = await prisma.permohonan.findUnique({
    where: { id: Number(id) },
    include: {
      jenis: true,
      user: { select: { userId: true, userFullname: true, userHp: true, userEmail: true } },
      berkas: true,
    },
  });
  if (!permohonan) return fail(["Permohonan tidak ditemukan"], 404);

  return ok({ permohonan });
}

/** Ubah status & catatan petugas (admin/operator). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, catatan } = body as { status?: string; catatan?: string };

  if (status && !STATUS_VALID.includes(status)) {
    return fail(["Info: Status tidak valid"]);
  }
  if (!status && catatan === undefined) {
    return fail(["Info: Tidak ada perubahan"]);
  }

  try {
    const sebelum = await prisma.permohonan.findUnique({
      where: { id: Number(id) },
      select: { status: true },
    });
    if (!sebelum) return fail(["Permohonan tidak ditemukan"], 404);

    const updated = await prisma.permohonan.update({
      where: { id: Number(id) },
      data: {
        ...(status ? { status } : {}),
        ...(catatan !== undefined ? { catatan } : {}),
      },
      include: {
        jenis: { select: { nama: true } },
        user: { select: { userFullname: true, userId: true, userEmail: true } },
      },
    });

    // Email notifikasi ke warga saat status berubah menjadi SELESAI / DITOLAK.
    if (
      status &&
      status !== sebelum.status &&
      (status === "SELESAI" || status === "DITOLAK") &&
      updated.user.userEmail
    ) {
      const nama = updated.user.userFullname ?? updated.user.userId;
      const mail =
        status === "SELESAI"
          ? tplPermohonanSelesai(
              nama,
              updated.noregister,
              updated.jenis.nama,
              updated.catatan ?? undefined,
            )
          : tplPermohonanDitolak(
              nama,
              updated.noregister,
              updated.jenis.nama,
              updated.catatan ?? undefined,
            );
      await sendMail({ to: updated.user.userEmail, ...mail });
    }

    return ok(null, ["Info: Permohonan berhasil diperbarui"]);
  } catch {
    return fail(["Info: Gagal memperbarui permohonan"], 500);
  }
}
