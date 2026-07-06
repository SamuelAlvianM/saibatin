'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  FileText,
} from 'lucide-react';

interface Permohonan {
  id: number;
  noregister: string;
  jenisNama: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  MENUNGGU: { label: 'Menunggu', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  DIPROSES: { label: 'Diproses', color: 'text-primary bg-primary/10 border-primary/20', icon: Clock },
  SELESAI: { label: 'Selesai', color: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
  DITOLAK: { label: 'Ditolak', color: 'text-destructive bg-destructive/10 border-destructive/20', icon: XCircle },
};

const TABS = [
  { key: 'semua', label: 'Semua' },
  { key: 'MENUNGGU', label: 'Menunggu' },
  { key: 'DIPROSES', label: 'Diproses' },
  { key: 'SELESAI', label: 'Selesai' },
  { key: 'DITOLAK', label: 'Ditolak' },
];

/** Daftar riwayat permohonan user (tab status + kartu) — dipakai di
 *  /riwayat dan /user/pengajuan. */
export function RiwayatList() {
  const [items, setItems] = useState<Permohonan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('semua');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/permohonan')
      .then((r) => r.json())
      .then((j) => {
        if (j.error?.length) { setError(j.error[0]); return; }
        setItems(j.data?.items ?? []);
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = tab === 'semua' ? items : items.filter((i) => i.status === tab);

  return (
    <>
      {/* Tab filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === t.key
                ? 'text-white shadow-md'
                : 'bg-white/60 text-slate-600 border border-slate-200 hover:border-primary/40'
            }`}
            style={tab === t.key ? { background: 'linear-gradient(90deg, #2176bd, #3490dc)' } : {}}
          >
            {t.label}
            {t.key !== 'semua' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({items.filter((i) => i.status === t.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-slate-500">{error}</p>
          <Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
            Login untuk melihat riwayat
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">Belum ada permohonan</p>
          <p className="text-sm text-slate-400 mt-1">
            {tab === 'semua'
              ? 'Ajukan permohonan dokumen melalui halaman Permohonan Online.'
              : `Tidak ada permohonan dengan status "${TABS.find((t) => t.key === tab)?.label}".`}
          </p>
          {tab === 'semua' && (
            <Link
              href="/permohonan-online"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2 rounded-lg"
              style={{ background: 'linear-gradient(90deg, #2176bd, #3490dc)' }}
            >
              Ajukan Permohonan <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['MENUNGGU'];
            const Icon = cfg.icon;
            return (
              <Link
                key={item.id}
                href={`/riwayat/${item.id}`}
                className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(33,118,189,0.08)' }}>
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{item.jenisNama}</p>
                      <p className="text-xs text-slate-400 mt-0.5">No. {item.noregister}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 flex items-center gap-1 ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Diajukan {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
