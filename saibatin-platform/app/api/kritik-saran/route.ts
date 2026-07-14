import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { getSession } from "@/lib/auth";
import { notifyPetugas, safeNotify } from "@/lib/notifikasi";

/** Kirim kritik & saran (port frtHubungiKamiKritikSaran/postdata). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { nama, email, hp, pesan, recaptchaToken } = body as Record<string, string>;

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return fail(["Info: Verifikasi reCAPTCHA gagal"]);
  }
  if (!nama?.trim() || !pesan?.trim()) {
    return fail(["Info: Nama dan pesan wajib diisi"]);
  }

  const kritik = await prisma.kritikSaran.create({
    data: {
      nama: nama.trim(),
      email: email?.trim() || null,
      hp: hp?.trim() || null,
      pesan: pesan.trim(),
    },
  });

  await safeNotify(() =>
    notifyPetugas({
      tipe: "KRITIK_BARU",
      judul: "Kritik & saran baru",
      isi: `${nama.trim()} mengirim kritik & saran.`,
      link: "/dashboard/kritik-saran",
      refType: "KritikSaran",
      refId: kritik.id,
    }),
  );

  return ok(null, ["Info: Kritik & saran berhasil dikirim"]);
}

/** Daftar kritik & saran — hanya operator/admin (level 1/2). */
export async function GET() {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  const items = await prisma.kritikSaran.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return ok({ items });
}
