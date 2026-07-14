import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { getSession } from "@/lib/auth";
import { notifyPetugas, safeNotify } from "@/lib/notifikasi";

/** Kirim pengaduan masyarakat (port pengaduan/postdata). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { nama, nik, email, hp, subjek, isi, recaptchaToken } = body as Record<string, string>;

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return fail(["Info: Verifikasi reCAPTCHA gagal"]);
  }
  if (!nama || !isi) return fail(["Info: Nama dan isi pengaduan wajib diisi"]);

  const pengaduan = await prisma.pengaduan.create({
    data: { nama, nik, email, hp, subjek, isi },
  });

  await safeNotify(() =>
    notifyPetugas({
      tipe: "PENGADUAN_BARU",
      judul: "Pengaduan masyarakat baru",
      isi: `${nama}${subjek ? ` — ${subjek}` : ""}`,
      link: "/dashboard/pengaduan",
      refType: "Pengaduan",
      refId: pengaduan.id,
    }),
  );

  return ok(null, ["Info: Pengaduan berhasil dikirim"]);
}

/** Daftar pengaduan — hanya operator/admin (level 1/2). */
export async function GET() {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  const items = await prisma.pengaduan.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ items });
}
