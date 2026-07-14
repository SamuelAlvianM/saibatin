import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { statsKunjungan } from '@/lib/kunjungan';
import {
  FileText,
  Users,
  UserCheck,
  Clock,
  ClipboardList,
  CheckCircle2,
  Hourglass,
  CalendarDays,
  MessageSquare,
  MessagesSquare,
  Gauge,
  Newspaper,
  Image as ImageIcon,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Eye,
  Wifi,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const fmt = (n: number) => n.toLocaleString('id-ID');
const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

// Warna status permohonan & pengaduan (kelas literal agar ter-scan Tailwind).
const STATUS_PERMOHONAN = [
  { key: 'MENUNGGU', label: 'Menunggu', bar: 'bg-amber-400', text: 'text-amber-600' },
  { key: 'DIPROSES', label: 'Diproses', bar: 'bg-sky-500', text: 'text-sky-600' },
  { key: 'SELESAI', label: 'Selesai', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  { key: 'DITOLAK', label: 'Ditolak', bar: 'bg-rose-500', text: 'text-rose-600' },
] as const;

const STATUS_PENGADUAN = [
  { key: 'BARU', label: 'Baru', bar: 'bg-amber-400', text: 'text-amber-600' },
  { key: 'DIPROSES', label: 'Diproses', bar: 'bg-sky-500', text: 'text-sky-600' },
  { key: 'SELESAI', label: 'Selesai', bar: 'bg-emerald-500', text: 'text-emerald-600' },
] as const;

/** Baris progress: label kiri, bar tengah, angka kanan. */
function ProgressRow({
  label,
  value,
  total,
  bar,
  text,
}: {
  label: string;
  value: number;
  total: number;
  bar: string;
  text: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className={`font-bold tabular-nums ${text}`}>
          {fmt(value)} <span className="font-medium text-slate-400">({pct(value, total)}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct(value, total)}%` }} />
      </div>
    </div>
  );
}

/** Kartu seksi dengan judul + ikon. */
function SectionCard({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level > 2) redirect('/user/pengajuan');

  const now = new Date();
  const startBulanIni = new Date(now.getFullYear(), now.getMonth(), 1);
  const start6Bulan = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    permohonanByStatus,
    permohonanBulanIni,
    permohonanRecent,
    topJenisGrouped,
    pengaduanByStatus,
    kritikTotal,
    kritikBulanIni,
    skmTotal,
    beritaPublish,
    beritaDraft,
    galeriTotal,
    produkTotal,
    usersByLevel,
    userAktif,
    userPending,
    pengunjung,
  ] = await Promise.all([
    prisma.permohonan.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.permohonan.count({ where: { createdAt: { gte: startBulanIni } } }),
    prisma.permohonan.findMany({
      where: { createdAt: { gte: start6Bulan } },
      select: { createdAt: true },
    }),
    prisma.permohonan.groupBy({
      by: ['jenisId'],
      _count: { _all: true },
      orderBy: { _count: { jenisId: 'desc' } },
      take: 5,
    }),
    prisma.pengaduan.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.kritikSaran.count(),
    prisma.kritikSaran.count({ where: { createdAt: { gte: startBulanIni } } }),
    prisma.skmJawaban.count(),
    prisma.news.count({ where: { publish: true } }),
    prisma.news.count({ where: { publish: false } }),
    prisma.gallery.count(),
    prisma.produk.count(),
    prisma.user.groupBy({ by: ['userlevelId'], _count: { _all: true } }),
    prisma.user.count({ where: { status: 1 } }),
    prisma.user.count({ where: { status: 0 } }),
    statsKunjungan(),
  ]);

  // ── Permohonan: total, per status, completion rate ──
  const statusCount = (key: string) =>
    permohonanByStatus.find((s) => s.status === key)?._count._all ?? 0;
  const totalPermohonan = permohonanByStatus.reduce((a, s) => a + s._count._all, 0);
  const selesai = statusCount('SELESAI');
  const berjalan = statusCount('MENUNGGU') + statusCount('DIPROSES');
  const completion = pct(selesai, totalPermohonan);

  // ── Tren 6 bulan (bucket per bulan) ──
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: BULAN_PENDEK[d.getMonth()], count: 0 };
  });
  const trendIndex = new Map(trend.map((t, i) => [t.key, i]));
  for (const r of permohonanRecent) {
    const d = new Date(r.createdAt);
    const idx = trendIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx !== undefined) trend[idx].count += 1;
  }
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));

  // ── Layanan terpopuler (nama jenis) ──
  const jenisIds = topJenisGrouped.map((g) => g.jenisId);
  const jenisList = jenisIds.length
    ? await prisma.jenisPermohonan.findMany({
        where: { id: { in: jenisIds } },
        select: { id: true, nama: true },
      })
    : [];
  const namaById = new Map(jenisList.map((j) => [j.id, j.nama]));
  const topJenis = topJenisGrouped.map((g) => ({
    nama: namaById.get(g.jenisId) ?? 'Lainnya',
    count: g._count._all,
  }));
  const maxJenis = Math.max(1, ...topJenis.map((t) => t.count));

  // ── Pengaduan & akun ──
  const pengaduanCount = (key: string) =>
    pengaduanByStatus.find((s) => s.status === key)?._count._all ?? 0;
  const totalPengaduan = pengaduanByStatus.reduce((a, s) => a + s._count._all, 0);

  const levelCount = (ids: number[]) =>
    usersByLevel.filter((u) => ids.includes(u.userlevelId)).reduce((a, u) => a + u._count._all, 0);
  const totalUser = usersByLevel.reduce((a, u) => a + u._count._all, 0);
  const akunGrup = [
    { label: 'Warga', value: levelCount([3]), icon: Users },
    { label: 'Operator OPD', value: levelCount([4]), icon: Landmark },
    { label: 'Staff Dinas', value: levelCount([1, 2]), icon: ShieldCheck },
  ];

  const kpi = [
    { label: 'Total Permohonan', value: totalPermohonan, icon: FileText, tint: 'bg-primary/10 text-primary' },
    { label: 'Selesai', value: selesai, icon: CheckCircle2, tint: 'bg-emerald-50 text-emerald-600', badge: `${completion}%` },
    { label: 'Sedang Berjalan', value: berjalan, icon: Hourglass, tint: 'bg-amber-50 text-amber-600' },
    { label: 'Bulan Ini', value: permohonanBulanIni, icon: CalendarDays, tint: 'bg-sky-50 text-sky-600' },
  ];

  const konten = [
    { label: 'Berita Terbit', value: beritaPublish, icon: Newspaper, href: '/dashboard/berita' },
    { label: 'Draf Berita', value: beritaDraft, icon: FileText, href: '/dashboard/berita' },
    { label: 'Foto Galeri', value: galeriTotal, icon: ImageIcon, href: '/dashboard/galeri' },
    { label: 'Dokumen Publikasi', value: produkTotal, icon: FolderOpen, href: '/dashboard/produk' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">
              {session.nama ?? session.userId} &middot; {session.level === 1 ? 'Super Admin' : 'Operator'} &middot;
              Ringkasan statistik &amp; progress pelayanan
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            {BULAN_PENDEK[now.getMonth()]} {now.getFullYear()}
          </span>
        </div>

        {/* ── KPI pelayanan ── */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpi.map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tint}`}>
                  <c.icon className="h-4.5 w-4.5" />
                </span>
                {'badge' in c && c.badge && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="mt-3 text-2xl font-bold leading-none text-slate-900">{fmt(c.value)}</p>
              <p className="mt-1.5 text-xs font-medium text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>

        {/* ── Progress permohonan + tren ── */}
        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Progress Permohonan"
            icon={ClipboardList}
            action={
              <Link href="/dashboard/permohonan" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80">
                Kelola <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            {totalPermohonan === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Belum ada permohonan.</p>
            ) : (
              <div className="space-y-3">
                {STATUS_PERMOHONAN.map((s) => (
                  <ProgressRow
                    key={s.key}
                    label={s.label}
                    value={statusCount(s.key)}
                    total={totalPermohonan}
                    bar={s.bar}
                    text={s.text}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Tren Permohonan · 6 Bulan" icon={TrendingUp}>
            <div className="flex h-36 items-end justify-between gap-2 pt-2">
              {trend.map((t) => (
                <div key={t.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[0.68rem] font-bold tabular-nums text-slate-600">{t.count}</span>
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-[26px] rounded-md bg-gradient-to-t from-[#1b4b72] to-[#6cb2eb]"
                      style={{ height: `${Math.max(4, (t.count / maxTrend) * 100)}%` }}
                      title={`${t.label}: ${t.count}`}
                    />
                  </div>
                  <span className="text-[0.62rem] font-medium text-slate-400">{t.label}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Layanan Terpopuler" icon={Gauge}>
            {topJenis.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Belum ada data.</p>
            ) : (
              <div className="space-y-3">
                {topJenis.map((t) => (
                  <div key={t.nama} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-slate-600">{t.nama}</span>
                      <span className="shrink-0 font-bold tabular-nums text-slate-900">{fmt(t.count)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1b4b72] to-[#6cb2eb]"
                        style={{ width: `${(t.count / maxJenis) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Aspirasi warga + akun + pengunjung + konten (2×2) ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Aspirasi Warga"
            icon={MessageSquare}
            action={
              <Link href="/dashboard/pengaduan" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80">
                Kelola <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <div className="space-y-3">
              {totalPengaduan === 0 ? (
                <p className="py-2 text-center text-sm text-slate-400">Belum ada pengaduan.</p>
              ) : (
                STATUS_PENGADUAN.map((s) => (
                  <ProgressRow
                    key={s.key}
                    label={`Pengaduan ${s.label}`}
                    value={pengaduanCount(s.key)}
                    total={totalPengaduan}
                    bar={s.bar}
                    text={s.text}
                  />
                ))
              )}
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <MessagesSquare className="mx-auto mb-1 h-4 w-4 text-violet-500" />
                  <p className="text-lg font-bold leading-none text-slate-900">{fmt(kritikTotal)}</p>
                  <p className="mt-1 text-[0.65rem] font-medium text-slate-500">
                    Kritik &amp; Saran{kritikBulanIni > 0 ? ` (+${kritikBulanIni} bln ini)` : ''}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <Gauge className="mx-auto mb-1 h-4 w-4 text-teal-500" />
                  <p className="text-lg font-bold leading-none text-slate-900">{fmt(skmTotal)}</p>
                  <p className="mt-1 text-[0.65rem] font-medium text-slate-500">Responden SKM</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Akun Pengguna"
            icon={Users}
            action={
              <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80">
                Kelola <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold leading-none text-slate-900">{fmt(totalUser)}</p>
                <p className="mt-1 text-[0.65rem] font-medium text-slate-500">Total</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <p className="flex items-center justify-center gap-1 text-lg font-bold leading-none text-emerald-600">
                  <UserCheck className="h-4 w-4" /> {fmt(userAktif)}
                </p>
                <p className="mt-1 text-[0.65rem] font-medium text-slate-500">Aktif</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center">
                <p className="flex items-center justify-center gap-1 text-lg font-bold leading-none text-amber-600">
                  <Clock className="h-4 w-4" /> {fmt(userPending)}
                </p>
                <p className="mt-1 text-[0.65rem] font-medium text-slate-500">Menunggu</p>
              </div>
            </div>
            <div className="space-y-2">
              {akunGrup.map((g) => (
                <div key={g.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <g.icon className="h-3.5 w-3.5 text-slate-400" /> {g.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-slate-900">{fmt(g.value)}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Pengunjung Situs" icon={Eye}>
            <p className="mb-3 text-sm leading-relaxed text-slate-600">
              Saat ini ada{' '}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600">
                <Wifi className="h-3.5 w-3.5" /> {fmt(pengunjung.online)}
              </span>{' '}
              pengunjung yang online.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold leading-none text-slate-900">
                  {fmt(pengunjung.hariIni)}
                </p>
                <p className="mt-1 text-[0.65rem] font-medium text-slate-500">
                  Pengunjung Hari Ini
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold leading-none text-slate-900">
                  {fmt(pengunjung.total)}
                </p>
                <p className="mt-1 text-[0.65rem] font-medium text-slate-500">
                  Total Kunjungan
                </p>
              </div>
            </div>
            <p className="mt-3 text-[0.68rem] leading-relaxed text-slate-400">
              Dihitung dari halaman publik (dashboard tidak ikut). Online = aktif
              dalam 5 menit terakhir.
            </p>
          </SectionCard>

          <SectionCard title="Konten Situs" icon={Newspaper}>
            <div className="grid grid-cols-2 gap-2">
              {konten.map((k) => (
                <Link
                  key={k.label}
                  href={k.href}
                  className="rounded-xl border border-slate-100 p-3 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <k.icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
                  <p className="text-lg font-bold leading-none text-slate-900">{fmt(k.value)}</p>
                  <p className="mt-1 text-[0.65rem] font-medium text-slate-500">{k.label}</p>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
