'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, X, CheckCircle2, Clock, Mail, Phone, User } from 'lucide-react';

interface Item {
  id: number;
  nama: string;
  nik: string | null;
  email: string | null;
  hp: string | null;
  subjek: string | null;
  isi: string;
  status: string;
  balasan: string | null;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'SELESAI') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" /> Selesai
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
      <Clock className="h-3 w-3" /> {status === 'DIPROSES' ? 'Diproses' : 'Belum ditangani'}
    </span>
  );
}

const FILTERS: [string, string][] = [
  ['', 'Semua'],
  ['belum', 'Belum Ditangani'],
  ['selesai', 'Sudah Ditangani'],
];

export function AdminPengaduan() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Item | null>(null);
  const [balasan, setBalasan] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    const res = await fetch(`/api/admin/pengaduan?${params.toString()}`);
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = (it: Item) => {
    setDetail(it);
    setBalasan(it.balasan ?? '');
  };

  const update = async (status?: string) => {
    if (!detail) return;
    setSaving(true);
    const res = await fetch(`/api/admin/pengaduan/${detail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, balasan }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success(json.success?.[0] ?? 'Tersimpan');
      const newStatus = status ?? detail.status;
      setItems((prev) => prev.map((p) => (p.id === detail.id ? { ...p, status: newStatus, balasan } : p)));
      setDetail(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-slate-700" />
        <h2 className="font-semibold text-slate-900">Daftar Pengaduan</h2>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {FILTERS.map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === val ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}
            style={filter === val ? { background: '#2176bd' } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">Tidak ada pengaduan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Nama</th>
                <th className="py-2 pr-4 font-medium">Subjek</th>
                <th className="py-2 pr-4 font-medium">Isi</th>
                <th className="py-2 pr-4 font-medium">Tanggal</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100 cursor-pointer hover:bg-slate-50/60" onClick={() => openDetail(it)}>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">{it.nama}</td>
                  <td className="py-2.5 pr-4">{it.subjek ?? '-'}</td>
                  <td className="py-2.5 pr-4 max-w-xs truncate text-slate-500">{it.isi}</td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {new Date(it.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 pr-4"><StatusBadge status={it.status} /></td>
                  <td className="py-2.5 pr-4">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openDetail(it); }}>
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detail */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{detail.subjek ?? 'Pengaduan'}</h3>
                <div className="mt-1"><StatusBadge status={detail.status} /></div>
              </div>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> {detail.nama}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {detail.hp ?? '-'}</p>
                <p className="flex items-center gap-2 sm:col-span-2"><Mail className="h-4 w-4 text-slate-400" /> {detail.email ?? '-'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Isi Pengaduan</p>
                <p className="text-slate-700 whitespace-pre-wrap">{detail.isi}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Balasan / Catatan</label>
                <Textarea className="mt-1.5" rows={3} value={balasan} onChange={(e) => setBalasan(e.target.value)} placeholder="Tanggapan untuk pengadu (opsional)..." />
              </div>
              <p className="text-xs text-slate-400">
                Dibuat: {new Date(detail.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </p>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => update('DIPROSES')} disabled={saving}>
                  Tandai Diproses
                </Button>
                <Button onClick={() => update('SELESAI')} disabled={saving} className="text-white" style={{ background: '#16a34a' }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span className="ml-1.5">Tandai Selesai</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
