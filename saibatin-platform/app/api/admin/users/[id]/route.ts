import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { catatAktivitas } from "@/lib/log-aktivitas";
import { hapusFotoProfil } from "@/lib/foto-profil";

export const dynamic = "force-dynamic";

/**
 * Detail satu akun untuk panel samping di Manajemen Akun.
 *
 * Dipisah dari daftar supaya tabel tetap ringan: kolom seperti riwayat login,
 * IP, dan permohonan terakhir hanya diambil saat barisnya benar-benar dibuka.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  const { id } = await params;
  const uid = Number(id);
  if (!Number.isInteger(uid)) return fail(["Id akun tidak valid"], 400);

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true,
      userId: true,
      userlevelId: true,
      userFullname: true,
      userNik: true,
      userNokk: true,
      userHp: true,
      userEmail: true,
      userKecamatan: true,
      userFoto: true,
      status: true,
      ket: true,
      ipAddress: true,
      loginLast: true,
      activationTime: true,
      createdAt: true,
      updatedAt: true,
      level: { select: { nama: true } },
      _count: { select: { permohonans: true } },
    },
  });

  if (!user) return fail(["Akun tidak ditemukan"], 404);

  // Beberapa permohonan terakhir — konteks cepat sebelum petugas memutuskan
  // mengaktifkan atau menolak sebuah akun.
  const permohonanTerakhir = await prisma.permohonan.findMany({
    where: { userId: uid },
    orderBy: { id: "desc" },
    take: 5,
    select: {
      id: true,
      noregister: true,
      status: true,
      createdAt: true,
      jenis: { select: { nama: true } },
    },
  });

  return ok({
    ...user,
    jumlahPermohonan: user._count.permohonans,
    permohonanTerakhir: permohonanTerakhir.map((p) => ({
      id: p.id,
      noregister: p.noregister,
      status: p.status,
      createdAt: p.createdAt,
      jenisNama: p.jenis?.nama ?? "-",
    })),
  });
}

/**
 * Hapus akun secara PERMANEN — hanya Super Admin (level 1).
 *
 * Akun yang pernah dipakai TIDAK boleh dihapus: permohonan dan tiket adalah
 * arsip pelayanan yang harus tetap bisa ditelusuri pemiliknya (relasinya pun
 * restrict di DB, jadi penghapusan akan gagal di tengah jalan). Untuk kasus
 * itu petugas diarahkan menonaktifkan akun, yang efeknya sama bagi pengguna
 * tetapi arsipnya utuh.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (session?.level !== 1) {
    return fail(["Info: Hanya Super Admin yang dapat menghapus akun"], 403);
  }

  const { id } = await params;
  const uid = Number(id);
  if (!Number.isInteger(uid)) return fail(["Id akun tidak valid"], 400);
  if (uid === session.uid) {
    return fail(["Info: Anda tidak dapat menghapus akun Anda sendiri"]);
  }

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true,
      userId: true,
      userFullname: true,
      userlevelId: true,
      userFoto: true,
      _count: { select: { permohonans: true, tikets: true, tiketPesan: true } },
    },
  });
  if (!user) return fail(["Info: Akun tidak ditemukan"], 404);

  const jejak =
    user._count.permohonans + user._count.tikets + user._count.tiketPesan;
  if (jejak > 0) {
    return fail([
      `Info: Akun ini punya ${user._count.permohonans} permohonan dan tidak bisa dihapus. ` +
        `Nonaktifkan saja agar riwayat pelayanan tetap tersimpan.`,
    ]);
  }

  const nama = user.userFullname ?? user.userId;
  try {
    // Notifikasi & log milik akun ini ikut terhapus lewat cascade di skema.
    await prisma.user.delete({ where: { id: uid } });
    await hapusFotoProfil(user.userFoto);

    await catatAktivitas(
      session,
      "HAPUS",
      "Akun",
      `Menghapus akun ${nama} (${user.userId})`,
      { entitasId: uid, req },
    );

    return ok(null, [`Info: Akun ${nama} telah dihapus permanen`]);
  } catch {
    return fail(["Info: Gagal menghapus akun"], 500);
  }
}
