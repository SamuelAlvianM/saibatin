import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Footer } from '@/components/shared/footer';
import { BerkasGallery, PermohonanJourney } from '@/components/shared/permohonan-detail';
import { labelField, payloadDataEntries, payloadBerkasEntries } from '@/lib/permohonan-display';
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, FileText, Download, AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  MENUNGGU: { label: 'Menunggu Verifikasi', color: 'text-amber-700 bg-amber-50 border-amber-300', icon: Clock },
  DIPROSES: { label: 'Sedang Diproses',     color: 'text-primary bg-primary/10 border-primary/30',   icon: Clock },
  SELESAI:  { label: 'Selesai',             color: 'text-success bg-success/10 border-success/30', icon: CheckCircle2 },
  DITOLAK:  { label: 'Ditolak',             color: 'text-destructive bg-destructive/10 border-destructive/30',       icon: XCircle },
};

export default async function RiwayatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login?redirect=/riwayat');

  const item = await prisma.permohonan.findUnique({
    where: { id: parseInt(id) },
    include: { jenis: true, berkas: true },
  });

  if (!item || (session.level > 2 && item.userId !== session.uid)) notFound();

  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['MENUNGGU'];
  const Icon = cfg.icon;
  const payload: Record<string, unknown> =
    item.payload && typeof item.payload === 'object'
      ? (item.payload as Record<string, unknown>)
      : {};

  // Semua isi form yang pernah diisi pemohon — tampil apa pun statusnya.
  const dataEntries = payloadDataEntries(payload);

  // Berkas: gabungan t_berkas + berkas yang hanya tercatat di payload.
  const berkasPaths = new Set(item.berkas.map((b) => b.path));
  const berkasView = [
    ...item.berkas.map((b) => ({ label: b.namaFile, path: b.path })),
    ...payloadBerkasEntries(payload).filter((b) => !berkasPaths.has(b.path)),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)' }}>
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/riwayat" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat
          </Link>
          <h1 className="text-2xl font-bold text-white">{item.jenis?.nama ?? 'Permohonan'}</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">No. Registrasi: <span className="font-mono font-semibold">{item.noregister}</span></p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10 max-w-3xl space-y-5">
        {/* Status + journey */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Perjalanan Permohonan</h2>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-medium text-xs ${cfg.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </div>
          <PermohonanJourney
            status={item.status}
            createdAt={item.createdAt}
            prosesAt={item.prosesAt}
            updatedAt={item.updatedAt}
          />
        </div>

        {/* Alasan penolakan / catatan petugas */}
        {item.status === 'DITOLAK' && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="text-sm font-semibold">Permohonan Ditolak</h2>
            </div>
            <p className="text-sm text-slate-700">
              {item.catatan?.trim()
                ? item.catatan
                : 'Silakan hubungi petugas Disdukcapil untuk informasi alasan penolakan.'}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Anda dapat memperbaiki data/berkas sesuai catatan di atas lalu mengajukan permohonan baru.
            </p>
          </div>
        )}
        {item.status !== 'DITOLAK' && item.catatan && (
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Catatan dari Petugas</h2>
            <p className="text-sm text-slate-700">{item.catatan}</p>
          </div>
        )}

        {/* Data permohonan — SEMUA isian form, apa pun statusnya */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
            Data Permohonan ({dataEntries.length} isian)
          </h2>
          {dataEntries.length === 0 ? (
            <p className="text-sm text-slate-400">Tidak ada data isian.</p>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dataEntries.map(([k, v]) => (
                <div key={k} className="bg-slate-50/80 rounded-lg px-3 py-2">
                  <dt className="text-xs text-slate-400">{labelField(k)}</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-0.5 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Berkas lampiran — preview gambar */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
            Berkas Lampiran ({berkasView.length})
          </h2>
          <BerkasGallery items={berkasView} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`/api/permohonan/${item.id}/pdf`}
            className={
              item.status === 'SELESAI'
                ? 'inline-flex items-center gap-2 text-sm font-medium text-white px-5 py-2.5 rounded-xl shadow-md bg-success hover:bg-success/90'
                : 'inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-5 py-2.5 rounded-xl border border-slate-300 bg-white shadow-sm hover:bg-slate-50'
            }
          >
            <Download className="w-4 h-4" />
            {item.status === 'SELESAI' ? 'Unduh Dokumen (PDF)' : 'Download Bukti Pengajuan'}
          </a>
          <Link
            href="/permohonan-online"
            className="inline-flex items-center gap-2 text-sm font-medium text-white px-5 py-2.5 rounded-xl shadow-md"
            style={{ background: 'linear-gradient(90deg, #2176bd, #3490dc)' }}
          >
            <FileText className="w-4 h-4" />
            Ajukan Permohonan Baru
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
