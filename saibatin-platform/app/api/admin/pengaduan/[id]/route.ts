import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { createNotifikasi, safeNotify } from "@/lib/notifikasi";

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
    const sebelum = await prisma.pengaduan.findUnique({
      where: { id: Number(id) },
      select: { status: true, balasan: true },
    });
    const pengaduan = await prisma.pengaduan.update({
      where: { id: Number(id) },
      data: {
        ...(status ? { status } : {}),
        ...(balasan !== undefined ? { balasan } : {}),
      },
    });

    // Notifikasi in-app ke pelapor BILA ia punya akun (pengaduan publik hanya
    // menyimpan nama/NIK/email — dicocokkan best-effort ke tabel users).
    const statusBerubah = !!status && status !== sebelum?.status;
    const balasanBaru =
      balasan !== undefined &&
      !!balasan.trim() &&
      balasan.trim() !== (sebelum?.balasan ?? "").trim();
    if (statusBerubah || balasanBaru) {
      await safeNotify(async () => {
        const cocok: object[] = [];
        if (pengaduan.nik) {
          cocok.push({ userNik: pengaduan.nik }, { userId: pengaduan.nik });
        }
        if (pengaduan.email) cocok.push({ userEmail: pengaduan.email });
        if (!cocok.length) return;

        const pelapor = await prisma.user.findFirst({
          where: { status: 1, OR: cocok },
          orderBy: { id: "desc" },
          select: { id: true },
        });
        if (!pelapor) return;

        const subjek = pengaduan.subjek?.trim() || "Pengaduan Anda";
        const judul = balasanBaru
          ? "Pengaduan Anda dibalas petugas"
          : status === "SELESAI"
            ? "Pengaduan Anda selesai ditangani"
            : "Pengaduan Anda sedang diproses";
        const isi = balasanBaru
          ? `${subjek}: "${balasan!.trim().slice(0, 160)}"`
          : `${subjek} kini berstatus ${status}.`;

        await createNotifikasi({
          userId: pelapor.id,
          tipe: "PENGADUAN_BALASAN",
          judul,
          isi,
          refType: "Pengaduan",
          refId: pengaduan.id,
        });
      });
    }

    return ok(null, ["Info: Pengaduan berhasil diperbarui"]);
  } catch {
    return fail(["Info: Gagal memperbarui pengaduan"], 500);
  }
}
