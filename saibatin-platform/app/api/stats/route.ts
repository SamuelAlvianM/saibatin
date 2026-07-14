import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import {
  KARTU_STATISTIK_KUNCI,
  normalizeKartu,
  warnaPreset,
} from "@/lib/beranda-statistik";

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

  // Konfigurasi kartu beranda (judul, ikon, warna, kategori + kolom sumber
  // data). Menentukan kategori demografi mana yang perlu diambil dari DB.
  const kartuRow = await prisma.staticContent.findUnique({
    where: { kunci: KARTU_STATISTIK_KUNCI },
    select: { konten: true },
  });
  const kartuKonfig = normalizeKartu(
    (kartuRow?.konten as { kartu?: unknown } | null)?.kartu,
  );
  const kategoriSet = [
    ...new Set(kartuKonfig.map((k) => k.kategori).filter(Boolean)),
  ];

  const [
    total,
    selesai,
    aktif,
    bulanIni,
    totalBerita,
    grouped,
    recent,
    demografiRows,
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
    // Rekap demografi hasil import Excel untuk kategori yang dipakai kartu.
    // Angka per kategori dihitung dari data pekon (level 5) bila ada — konsisten
    // dengan tabel publik yang menjumlahkan pekon; fallback ke baris kecamatan.
    prisma.demografiWilayah.findMany({
      where: {
        level: { in: [4, 5] },
        kategori: { in: kategoriSet.length ? kategoriSet : ["__none__"] },
      },
      select: { kategori: true, level: true, data: true },
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

  // Agregasi demografi (import Excel). Angka per kategori dari baris pekon
  // (level 5) bila ada agar sama dengan tabel ringkasan; kalau belum, baris
  // kecamatan (level 4).
  const rowsFor = (kat: string) => {
    const pekon = demografiRows.filter((d) => d.kategori === kat && d.level === 5);
    return pekon.length ? pekon : demografiRows.filter((d) => d.kategori === kat);
  };
  const sumCol = (kat: string, col: string) =>
    rowsFor(kat).reduce((a, d) => a + (Number((d.data as Record<string, unknown>)?.[col]) || 0), 0);

  // Nilai tiap kartu mengikuti kolom yang dipilih admin; badge = persentase
  // terhadap total kolom acuan (badgeKolom) bila diset.
  const kartuDemografi = kartuKonfig.map((k) => {
    const value = k.kategori && k.kolom ? sumCol(k.kategori, k.kolom) : 0;
    const preset = warnaPreset(k.warna);
    let badge: string | undefined;
    if (k.badgeKolom) {
      const base = sumCol(k.kategori, k.badgeKolom);
      badge = base > 0 ? `${Math.round((value / base) * 100)}%` : undefined;
    }
    return {
      title: k.title,
      icon: k.icon,
      kategori: k.kategori,
      kolom: k.kolom,
      accent: preset.accent,
      accentBg: preset.accentBg,
      badge,
      value,
    };
  });

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

    // ── Kependudukan (demografi / DKB) — kartu dinamis sesuai konfigurasi ──
    kartuDemografi,
    periodeKependudukan:
      process.env.NEXT_PUBLIC_DKB_PERIODE ?? "DKB Semester II 2024",
  });
}
