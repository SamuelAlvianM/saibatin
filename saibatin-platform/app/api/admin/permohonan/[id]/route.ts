import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import {
  tplPermohonanSelesai,
  tplPermohonanDitolak,
} from "@/lib/mail-templates";
import { createNotifikasi, safeNotify } from "@/lib/notifikasi";

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

    // Status SELESAI/DITOLAK bersifat FINAL — data terkunci. Membuka kembali
    // hanya lewat halaman Master (/dashboard/master, POST /api/admin/master).
    if (sebelum.status === "SELESAI" || sebelum.status === "DITOLAK") {
      return fail([
        "Info: Permohonan sudah final (Selesai/Ditolak) dan terkunci — buka kunci lewat halaman Master",
      ], 423);
    }

    // Jejak petugas pemroses — dicatat saat status berubah.
    const gantiStatus = !!status && status !== sebelum.status;
    const updated = await prisma.permohonan.update({
      where: { id: Number(id) },
      data: {
        ...(status ? { status } : {}),
        ...(catatan !== undefined ? { catatan } : {}),
        ...(gantiStatus
          ? {
              prosesById: session.uid,
              prosesByName: session.nama ?? session.userId,
              prosesAt: new Date(),
            }
          : {}),
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

    // Notifikasi in-app ke warga saat status berubah (diproses/selesai/ditolak).
    if (status && status !== sebelum.status) {
      const labelStatus: Record<string, { judul: string; isi: string }> = {
        DIPROSES: {
          judul: "Permohonan sedang diproses",
          isi: `Permohonan ${updated.jenis.nama} (${updated.noregister}) Anda sedang diproses petugas.`,
        },
        SELESAI: {
          judul: "Permohonan selesai",
          isi: `Permohonan ${updated.jenis.nama} (${updated.noregister}) Anda telah SELESAI.`,
        },
        DITOLAK: {
          judul: "Permohonan ditolak",
          isi:
            `Permohonan ${updated.jenis.nama} (${updated.noregister}) Anda ditolak.` +
            (updated.catatan ? ` Catatan: ${updated.catatan}` : ""),
        },
      };
      const info = labelStatus[status];
      if (info) {
        await safeNotify(() =>
          createNotifikasi({
            userId: updated.userId,
            tipe: "PERMOHONAN_STATUS",
            judul: info.judul,
            isi: info.isi,
            link: "/user/pengajuan",
            refType: "Permohonan",
            refId: updated.id,
          }),
        );
      }
    }

    return ok(null, ["Info: Permohonan berhasil diperbarui"]);
  } catch {
    return fail(["Info: Gagal memperbarui permohonan"], 500);
  }
}
