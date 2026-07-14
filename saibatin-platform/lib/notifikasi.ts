import { prisma } from "@/lib/prisma";

/**
 * Helper pembuatan notifikasi in-app (lonceng navbar/dashboard).
 *
 * Semua fungsi di sini "best-effort": kegagalan menulis notifikasi TIDAK boleh
 * menggagalkan aksi utama (buat permohonan, ubah status, dll). Pemanggil
 * membungkusnya agar error ditelan (lihat `safeNotify`).
 */

export type NotifTipe =
  | "PERMOHONAN_STATUS" // ke warga: status permohonannya berubah / terkirim
  | "PERMOHONAN_BARU" // ke petugas: ada permohonan masuk
  | "PENGADUAN_BARU" // ke petugas: ada pengaduan masuk
  | "PENGADUAN_BALASAN" // ke pelapor (bila punya akun): pengaduan dibalas/diproses
  | "KRITIK_BARU" // ke petugas: ada kritik & saran masuk
  | "SKM_BARU" // ke petugas: ada responden survei kepuasan baru
  | "AKUN_BARU" // ke petugas: ada pendaftaran akun menunggu aktivasi
  | "AKUN_STATUS"; // ke pemilik akun: akunnya diaktifkan petugas

/** Level pengguna yang dianggap "petugas" (menerima notifikasi kerja). */
const PETUGAS_LEVELS = [1, 2];

interface NotifInput {
  userId: number;
  tipe: NotifTipe;
  judul: string;
  isi: string;
  link?: string;
  refType?: string;
  refId?: number;
}

/** Buat satu notifikasi untuk satu penerima. */
export async function createNotifikasi(input: NotifInput) {
  await prisma.notifikasi.create({
    data: {
      userId: input.userId,
      tipe: input.tipe,
      judul: input.judul,
      isi: input.isi,
      link: input.link ?? null,
      refType: input.refType ?? null,
      refId: input.refId ?? null,
    },
  });
}

/** Buat notifikasi yang sama untuk SEMUA petugas (level 1/2). */
export async function notifyPetugas(
  input: Omit<NotifInput, "userId"> & { kecualiUserId?: number },
) {
  const petugas = await prisma.user.findMany({
    where: {
      userlevelId: { in: PETUGAS_LEVELS },
      status: 1,
      ...(input.kecualiUserId ? { id: { not: input.kecualiUserId } } : {}),
    },
    select: { id: true },
  });
  if (!petugas.length) return;

  await prisma.notifikasi.createMany({
    data: petugas.map((p) => ({
      userId: p.id,
      tipe: input.tipe,
      judul: input.judul,
      isi: input.isi,
      link: input.link ?? null,
      refType: input.refType ?? null,
      refId: input.refId ?? null,
    })),
  });
}

/**
 * Bungkus pemanggilan notifikasi agar aman: error di-log tapi tidak dilempar,
 * sehingga alur utama (mis. simpan permohonan) tetap sukses.
 */
export async function safeNotify(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (err) {
    console.error("[notifikasi] gagal membuat notifikasi:", err);
  }
}
