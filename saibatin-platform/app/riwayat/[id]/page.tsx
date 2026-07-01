import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, Clock, CheckCircle2, XCircle, FileText, Paperclip, Download } from 'lucide-react';

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
  // payload bertipe Json di Prisma — sudah berupa objek (bukan string).
  const payload: Record<string, unknown> =
    item.payload && typeof item.payload === 'object'
      ? (item.payload as Record<string, unknown>)
      : typeof item.payload === 'string'
      ? (() => {
          try {
            return JSON.parse(item.payload as string);
          } catch {
            return {};
          }
        })()
      : {};

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
        {/* Status */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Status Permohonan</h2>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${cfg.color}`}>
            <Icon className="w-4 h-4" />
            {cfg.label}
          </span>
          {item.catatan && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-1">Catatan dari petugas:</p>
              <p className="text-sm text-slate-700">{item.catatan}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-slate-500">
            <div>
              <span className="font-medium block text-slate-700">Tanggal Pengajuan</span>
              {new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </div>
            <div>
              <span className="font-medium block text-slate-700">Terakhir Diperbarui</span>
              {new Date(item.updatedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </div>
          </div>
        </div>

        {/* Data permohonan dari payload */}
        {Object.keys(payload).length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Data Permohonan</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(payload).map(([k, v]) => (
                <div key={k} className="bg-slate-50/80 rounded-lg px-3 py-2">
                  <dt className="text-xs text-slate-400 capitalize">{k.replace(/_/g, ' ')}</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-0.5">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Berkas lampiran */}
        {item.berkas.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Berkas Lampiran</h2>
            <div className="space-y-2">
              {item.berkas.map((b) => (
                <a
                  key={b.id}
                  href={b.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                >
                  <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-slate-700 group-hover:text-primary truncate">{b.namaFile}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`/api/permohonan/${item.id}/pdf`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-5 py-2.5 rounded-xl border border-slate-300 bg-white shadow-sm hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Download Bukti
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
