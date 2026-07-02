import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { demografiData } from "@/lib/demografi-data";

const sum = (jenis: string) =>
  (demografiData[jenis]?.items ?? []).reduce((a, b) => a + b.value, 0);

const find = (jenis: string, label: string) =>
  demografiData[jenis]?.items.find((i) => i.label === label)?.value ?? 0;

/**
 * Statistik ringkas untuk dashboard publik.
 * Menggabungkan data kependudukan (demografi) dengan data pelayanan langsung dari DB.
 */
export async function GET() {
  const [totalPermohonan, selesai, dalamProses, totalBerita] = await Promise.all([
    prisma.permohonan.count(),
    prisma.permohonan.count({ where: { status: "SELESAI" } }),
    prisma.permohonan.count({ where: { status: { in: ["MENUNGGU", "DIPROSES"] } } }),
    prisma.news.count({ where: { publish: true } }),
  ]);

  const lakiLaki = find("jenis-kelamin", "Laki-laki");
  const perempuan = find("jenis-kelamin", "Perempuan");

  return ok({
    // pelayanan (live dari database)
    totalPermohonan,
    selesai,
    dalamProses,
    totalBerita,
    pelayananBaru: dalamProses,
    pelayananSelesai: selesai,
    // kependudukan (demografi)
    jumlahPenduduk: lakiLaki + perempuan,
    lakiLaki,
    perempuan,
    kepalaKeluarga: sum("kepala-keluarga"),
  });
}
