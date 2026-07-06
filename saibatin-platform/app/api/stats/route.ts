import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { demografiData } from "@/lib/demografi-data";

const sum = (jenis: string) =>
  (demografiData[jenis]?.items ?? []).reduce((a, b) => a + b.value, 0);

const find = (jenis: string, label: string) =>
  demografiData[jenis]?.items.find((i) => i.label === label)?.value ?? 0;

const BULAN_PENDEK = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/**
 * Statistik ringkas untuk beranda publik.
 * - Pelayanan: agregasi langsung dari tabel permohonan (real-time DB) —
 *   total, bulan ini, tren 6 bulan, dan layanan terpopuler.
 * - Kependudukan: rekap demografi (sumber DKB, placeholder di
 *   lib/demografi-data.ts sampai model rekap DB tersedia).
 */
export async function GET() {
  const now = new Date();
  const startBulanIni = new Date(now.getFullYear(), now.getMonth(), 1);
  const start6Bulan = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    total,
    selesai,
    aktif,
    bulanIni,
    totalBerita,
    grouped,
    recent,
  ] = await Promise.all([
    prisma.permohonan.count(),
    prisma.permohonan.count({ where: { status: "SELESAI" } }),
    prisma.permohonan.count({ where: { status: { in: ["MENUNGGU", "DIPROSES"] } } }),
    prisma.permohonan.count({ where: { createdAt: { gte: startBulanIni } } }),
    prisma.news.count({ where: { publish: true } }),
    prisma.permohonan.groupBy({
      by: ["jenisId"],
      _count: { _all: true },
      orderBy: { _count: { jenisId: "desc" } },
      take: 4,
    }),
    prisma.permohonan.findMany({
      where: { createdAt: { gte: start6Bulan } },
      select: { createdAt: true },
    }),
  ]);

  // Nama jenis untuk layanan terpopuler.
  const jenisIds = grouped.map((g) => g.jenisId);
  const jenisList = jenisIds.length
    ? await prisma.jenisPermohonan.findMany({
        where: { id: { in: jenisIds } },
        select: { id: true, nama: true },
      })
    : [];
  const namaById = new Map(jenisList.map((j) => [j.id, j.nama]));
  const topJenis = grouped.map((g) => ({
    nama: namaById.get(g.jenisId) ?? "Lainnya",
    count: g._count._all,
  }));

  // Tren 6 bulan terakhir (bucket per bulan).
  const trend6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: BULAN_PENDEK[d.getMonth()], count: 0 };
  });
  const trendIndex = new Map(trend6.map((t, i) => [t.key, i]));
  for (const r of recent) {
    const d = new Date(r.createdAt);
    const idx = trendIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx !== undefined) trend6[idx].count += 1;
  }

  const lakiLaki = find("jenis-kelamin", "Laki-laki");
  const perempuan = find("jenis-kelamin", "Perempuan");
  const sudahKtpEl = find("wajib-ktp", "Sudah Memiliki KTP-el");
  const belumKtpEl = find("wajib-ktp", "Belum Memiliki KTP-el");

  return ok({
    // ── Pelayanan (live dari database) ──
    pelayanan: {
      total,
      selesai,
      aktif,
      bulanIni,
      topJenis,
      trend6: trend6.map(({ label, count }) => ({ label, count })),
    },
    totalBerita,

    // ── Kependudukan (demografi / DKB) ──
    jumlahPenduduk: lakiLaki + perempuan,
    lakiLaki,
    perempuan,
    kepalaKeluarga: sum("kepala-keluarga"),
    wajibKtp: sudahKtpEl + belumKtpEl,
    sudahKtpEl,
    belumKtpEl,
    periodeKependudukan:
      process.env.NEXT_PUBLIC_DKB_PERIODE ?? "DKB Semester II 2024",
  });
}
