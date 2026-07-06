import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/**
 * Deteksi NIK pada form permohonan: apakah NIK sudah terdaftar sebagai akun
 * di database atau dianggap pemohon baru.
 *
 * Privasi: data pribadi (nama, KK, HP, email) HANYA dikembalikan bila NIK
 * yang dicek adalah milik user yang sedang login — untuk NIK orang lain
 * respons hanya berisi status terdaftar/baru tanpa data apa pun.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const body = await req.json().catch(() => ({}));
  const nik = String((body as Record<string, unknown>).nik ?? "");

  if (!/^\d{16}$/.test(nik)) {
    return fail(["NIK harus 16 digit angka"]);
  }

  const pemilik = await prisma.user.findFirst({
    where: {
      OR: [{ userNik: nik }, { userId: nik }],
      status: 1,
    },
    select: {
      id: true,
      userFullname: true,
      userNokk: true,
      userHp: true,
      userEmail: true,
    },
  });

  const terdaftar = !!pemilik;
  const miliksendiri = pemilik?.id === session.uid;

  return ok(
    {
      nik,
      terdaftar,
      autofill: miliksendiri
        ? {
            nama: pemilik?.userFullname ?? "",
            nokk: pemilik?.userNokk ?? "",
            hp: pemilik?.userHp ?? "",
            email: pemilik?.userEmail ?? "",
          }
        : null,
    },
    [
      terdaftar
        ? "NIK sudah terdaftar di database"
        : "NIK belum terdaftar — dianggap pemohon baru",
    ],
  );
}
