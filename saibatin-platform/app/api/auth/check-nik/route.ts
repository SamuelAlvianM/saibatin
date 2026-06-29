import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

/**
 * Pra-pengecekan NIK & KK sebelum registrasi (dipakai tombol "Cek NIK & KK"
 * pada form daftar — store/slices/authSlice.ts: checkNikKk).
 *
 * Catatan: portal ini tidak memiliki tabel master kependudukan (dapduk),
 * sehingga pengecekan terbatas pada format 16 digit dan memastikan NIK
 * belum dipakai akun aktif. Aturan ini selaras dengan endpoint register.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { nik, kk } = body as Record<string, string>;

  if (!nik || !kk) {
    return fail(["Info: NIK dan Nomor KK wajib diisi (C-10)"]);
  }
  if (String(nik).length !== 16) {
    return fail(["Info: NIK Harus 16 Digit (C-15)"]);
  }
  if (String(kk).length !== 16) {
    return fail(["Info: Nomor KK Harus 16 Digit (C-16)"]);
  }
  if (!/^\d{16}$/.test(nik) || !/^\d{16}$/.test(kk)) {
    return fail(["Info: NIK dan KK hanya boleh berisi angka (C-17)"]);
  }

  const sudahAktif = await prisma.user.count({
    where: { userId: nik, status: 1 },
  });
  if (sudahAktif > 0) {
    return fail([
      "Info: NIK sudah terdaftar, silakan login atau gunakan NIK lain (C-03)",
    ]);
  }

  return ok(
    { nik, kk, eligible: true },
    ["Info: NIK & KK valid, silakan lanjutkan pendaftaran"]
  );
}
