'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Loader2, Search, ClipboardList, X, Clock, CheckCircle2, XCircle, FileText, Eye, Lock, AlertTriangle } from 'lucide-react';

/** Status final — data terkunci, hanya bisa dibuka lewat halaman Master. */
const FINAL_STATUS = ['SELESAI', 'DITOLAK'];

interface Item {
  id: number;
  noregister: string;
  status: string;
  catatan: string | null;
  createdAt: string;
  jenisNama: string;
  kategori: string;
  pemohon: string;
  pemohonId: string;
  hp: string;
  jumlahBerkas: number;
}

const STATUS: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  MENUNGGU: { label: 'Menunggu', cls: 'text-warning bg-warning/10 border-warning/20', icon: Clock },
  DIPROSES: { label: 'Diproses', cls: 'text-primary bg-primary/10 border-primary/20', icon: Clock },
  SELESAI: { label: 'Selesai', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
  DITOLAK: { label: 'Ditolak', cls: 'text-destructive bg-destructive/10 border-destructive/20', icon: XCircle },
};
const STATUS_KEYS = ['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK'];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS[status] ?? { label: status, cls: 'text-slate-600 bg-slate-50 border-slate-200', icon: FileText };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

export function AdminPermohonan() {
  const [items, setItems] = useState<Item[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [saving, setSaving] = useState(false);
  // Konfirmasi ekstra sebelum status dijadikan final (Selesai/Ditolak).
  const [confirmFinal, setConfirmFinal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (q.trim()) params.set('q', q.trim());
    const res = await fetch(`/api/admin/permohonan?${params.toString()}`);
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setLoading(false);
  }, [statusFilter, q]);

  useEffect(() => {
    load();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (it: Item) => {
    setEditing(it);
    setEditStatus(it.status);
    setEditCatatan(it.catatan ?? '');
    setConfirmFinal(false);
  };

  const closeEdit = () => {
    setEditing(null);
    setConfirmFinal(false);
  };

  /** Klik Simpan: status final butuh konfirmasi ekstra dulu. */
  const save = async () => {
    if (!editing) return;
    if (FINAL_STATUS.includes(editStatus) && !confirmFinal) {
      setConfirmFinal(true);
      return;
    }
    setConfirmFinal(false);
    setSaving(true);
    const res = await fetch(`/api/admin/permohonan/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: editStatus, catatan: editCatatan }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success(json.success?.[0] ?? 'Tersimpan');
      setItems((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, status: editStatus, catatan: editCatatan } : p))
      );
      setEditing(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-slate-700" />
        <h2 className="font-semibold text-slate-900">Daftar Permohonan</h2>
        {!loading && (
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {items.length} data
          </span>
        )}
      </div>

      {/* Filter & search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-1">
          {[['', 'Semua'], ...STATUS_KEYS.map((k) => [k, STATUS[k].label])].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                statusFilter === val
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex gap-2 flex-1"
        >
          <Input placeholder="Cari no. register / nama / NIK..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">Tidak ada permohonan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">No. Register</th>
                <th className="py-2 pr-4 font-medium">Pemohon</th>
                <th className="py-2 pr-4 font-medium">Jenis</th>
                <th className="py-2 pr-4 font-medium">Tanggal</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100 align-top">
                  <td className="py-2.5 pr-4 font-mono text-xs">{it.noregister}</td>
                  <td className="py-2.5 pr-4">
                    <div>{it.pemohon}</div>
                    <div className="text-xs text-slate-400 font-mono">{it.pemohonId}</div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div>{it.jenisNama}</div>
                    <div className="text-xs text-slate-400">{it.kategori} &middot; {it.jumlahBerkas} berkas</div>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {new Date(it.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 pr-4"><StatusBadge status={it.status} /></td>
                  <td className="py-2.5 pr-4">
                    <div className="flex gap-2">
                      <Link href={`/riwayat/${it.id}`} target="_blank">
                        <Button size="sm" variant="outline" title="Lihat detail & berkas">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {FINAL_STATUS.includes(it.status) ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-400"
                          title="Permohonan final — buka kunci lewat halaman Master"
                        >
                          <Lock className="h-3.5 w-3.5" /> Terkunci
                        </span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => openEdit(it)}>
                          Proses
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal edit status */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeEdit}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Proses Permohonan</h3>
                <p className="text-xs text-slate-500 font-mono">{editing.noregister}</p>
              </div>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p><span className="text-slate-500">Pemohon:</span> {editing.pemohon}</p>
                <p><span className="text-slate-500">Jenis:</span> {editing.jenisNama}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {STATUS_KEYS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setEditStatus(k)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        editStatus === k ? STATUS[k].cls : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {STATUS[k].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Catatan Petugas</label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  placeholder="Catatan untuk pemohon (opsional)..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeEdit}>Batal</Button>
                <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span className={saving ? 'ml-1.5' : ''}>Simpan</span>
                </Button>
              </div>
            </div>

            {/* Konfirmasi ekstra: status final mengunci data */}
            {confirmFinal && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50 p-4"
                onClick={() => setConfirmFinal(false)}
              >
                <div
                  className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-3 flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    <h4 className="font-semibold text-slate-900">
                      Jadikan {STATUS[editStatus]?.label ?? editStatus}?
                    </h4>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Setelah status diubah menjadi <b>{STATUS[editStatus]?.label}</b>,
                    permohonan ini <b>terkunci dan tidak dapat diubah lagi</b> —
                    tombol Proses akan hilang dari tabel. Membuka kunci hanya bisa
                    dilakukan lewat <b>halaman Master</b>.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setConfirmFinal(false)}>
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={save}
                      disabled={saving}
                      className={
                        editStatus === 'DITOLAK'
                          ? 'bg-destructive text-white hover:bg-destructive/90'
                          : 'bg-success text-white hover:bg-success/90'
                      }
                    >
                      {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                      Ya, saya mengerti
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
