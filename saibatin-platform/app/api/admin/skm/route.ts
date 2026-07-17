import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { SKM_ASPEK, SKM_SKALA_MAX } from "@/lib/skm";

/** Rekap Survei Kepuasan Masyarakat (admin/operator). */
export async function GET() {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const rows = await prisma.skmJawaban.findMany({ orderBy: { createdAt: "desc" } });
  const totalResponden = rows.length;

  // Rata-rata per aspek.
  const sum = SKM_ASPEK.map(() => 0);
  const cnt = SKM_ASPEK.map(() => 0);

  for (const r of rows) {
    const jawaban = (r.jawaban ?? {}) as Record<string, number>;
    SKM_ASPEK.forEach((_, i) => {
      const v = Number(jawaban[String(i)]);
      if (v >= 1 && v <= SKM_SKALA_MAX) {
        sum[i] += v;
        cnt[i] += 1;
      }
    });
  }

  const rataPerAspek = SKM_ASPEK.map((aspek, i) => ({
    aspek,
    rata: cnt[i] ? Number((sum[i] / cnt[i]).toFixed(2)) : 0,
  }));

  const rataKeseluruhan = rataPerAspek.length
    ? rataPerAspek.reduce((a, b) => a + b.rata, 0) / rataPerAspek.length
    : 0;
  // Konversi rata-rata ke Nilai IKM skala 0-100 (Permenpan RB 14/2017).
  const nilaiIKM = Number(((rataKeseluruhan / SKM_SKALA_MAX) * 100).toFixed(2));

  const respondenTerbaru = rows.slice(0, 15).map((r) => {
    const jawaban = (r.jawaban ?? {}) as Record<string, number>;
    const vals = SKM_ASPEK.map((_, i) => Number(jawaban[String(i)]) || 0);
    const rata = vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
    return {
      id: r.id,
      nama: r.nama ?? "Anonim",
      rataSkor: rata,
      saran: r.saran,
      createdAt: r.createdAt,
    };
  });

  return ok({
    totalResponden,
    rataPerAspek,
    rataKeseluruhan: Number(rataKeseluruhan.toFixed(2)),
    nilaiIKM,
    skalaMax: SKM_SKALA_MAX,
    respondenTerbaru,
  });
}
