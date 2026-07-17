import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { SKM_ASPEK, SKM_SKALA_MAX } from "@/lib/skm";
import { notifyPetugas, safeNotify } from "@/lib/notifikasi";

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
  // Pastikan semua unsur dinilai pada skala yang berlaku (lihat lib/skm.ts).
  for (let i = 0; i < SKM_ASPEK.length; i++) {
    const v = Number(jawaban[String(i)]);
    if (!v || v < 1 || v > SKM_SKALA_MAX) {
      return fail([`Info: Mohon nilai semua unsur pelayanan (1-${SKM_SKALA_MAX})`]);
    }
  }

  const jawabanBaru = await prisma.skmJawaban.create({
    data: {
      nama: nama.trim(),
      jenisKel: jenisKel ?? null,
      umur: typeof umur === "number" ? umur : null,
      pekerjaan: pekerjaan ?? null,
      jawaban: jawaban as object,
      saran: saran ?? null,
    },
  });

  // Notifikasi ke petugas: ada responden survei kepuasan baru.
  await safeNotify(() =>
    notifyPetugas({
      tipe: "SKM_BARU",
      judul: "Responden SKM baru",
      isi: `${nama.trim()} mengisi Survei Kepuasan Masyarakat${saran?.trim() ? ` — saran: "${saran.trim().slice(0, 120)}"` : ""}.`,
      link: "/dashboard/skm",
      refType: "SkmJawaban",
      refId: jawabanBaru.id,
    }),
  );

  return ok(null, ["Info: Terima kasih, survei Anda berhasil dikirim"]);
}
