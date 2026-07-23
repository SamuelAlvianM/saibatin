import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { adalahDataUrlGambar, hapusFotoProfil, simpanFotoProfil } from "@/lib/foto-profil";

export const dynamic = "force-dynamic";

/**
 * Foto profil milik akun yang sedang login.
 *
 * Dipisah dari PUT /api/profil karena datanya berupa data URL yang jauh lebih
 * besar daripada biodata — menyatukannya membuat setiap penyimpanan nama/HP
 * ikut mengirim ulang fotonya.
 */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { foto } = (await req.json().catch(() => ({}))) as { foto?: string };
  if (!adalahDataUrlGambar(foto)) {
    return fail(["Info: Foto tidak valid. Ambil ulang foto Anda."]);
  }

  const sebelum = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { userFoto: true },
  });

  const url = await simpanFotoProfil(foto, session.uid);
  if (!url) return fail(["Info: Gagal memproses foto. Coba ambil ulang."], 500);

  await prisma.user.update({
    where: { id: session.uid },
    data: { userFoto: url, updatedBy: session.uid },
  });

  // Berkas lama dibuang setelah yang baru tersimpan — kalau urutannya dibalik
  // dan penyimpanan gagal, pengguna kehilangan foto tanpa penggantinya.
  await hapusFotoProfil(sebelum?.userFoto);

  return ok({ foto: url }, ["Info: Foto profil berhasil disimpan"]);
}

/** Hapus foto profil sendiri. */
export async function DELETE() {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const sebelum = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { userFoto: true },
  });

  await prisma.user.update({
    where: { id: session.uid },
    data: { userFoto: null, updatedBy: session.uid },
  });
  await hapusFotoProfil(sebelum?.userFoto);

  return ok(null, ["Info: Foto profil dihapus"]);
}
