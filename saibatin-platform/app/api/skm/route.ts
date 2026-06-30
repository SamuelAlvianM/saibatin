import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { SKM_ASPEK } from "@/lib/skm";

/** Simpan jawaban Survei Kepuasan Masyarakat (publik). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { nama, jenisKel, umur, pekerjaan, jawaban, saran } = body as {
    nama?: string;
    jenisKel?: string;
    umur?: number;
    pekerjaan?: string;
    jawaban?: Record<string, number>;
    saran?: string;
  };

  if (!nama?.trim()) return fail(["Info: Nama wajib diisi"]);
  if (!jawaban || typeof jawaban !== "object") {
    return fail(["Info: Jawaban tidak valid"]);
  }
  // Pastikan semua aspek dinilai 1-5.
  for (let i = 0; i < SKM_ASPEK.length; i++) {
    const v = Number(jawaban[String(i)]);
    if (!v || v < 1 || v > 5) {
      return fail(["Info: Mohon nilai semua aspek penilaian (1-5)"]);
    }
  }

  await prisma.skmJawaban.create({
    data: {
      nama: nama.trim(),
      jenisKel: jenisKel ?? null,
      umur: typeof umur === "number" ? umur : null,
      pekerjaan: pekerjaan ?? null,
      jawaban: jawaban as object,
      saran: saran ?? null,
    },
  });

  return ok(null, ["Info: Terima kasih, survei Anda berhasil dikirim"]);
}
