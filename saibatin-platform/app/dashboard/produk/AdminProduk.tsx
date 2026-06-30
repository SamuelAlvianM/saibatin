'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, X, FileText, Upload, ExternalLink } from 'lucide-react';

interface Produk {
  id: number;
  jenis: string;
  judul: string;
  file: string | null;
  konten: string | null;
  createdAt: string;
}

const TABS: { key: string; label: string }[] = [
  { key: 'PERSYARATAN', label: 'Formulir Persyaratan' },
  { key: 'HUKUM', label: 'Produk Hukum' },
  { key: 'SOP', label: 'SOP' },
  { key: 'STANDAR_PELAYANAN', label: 'Standar Pelayanan' },
];

export function AdminProduk() {
  const [tab, setTab] = useState('PERSYARATAN');
  const [items, setItems] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [judul, setJudul] = useState('');
  const [file, setFile] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/produk?jenis=${tab}`);
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', f);
    fd.append('folder', 'produk');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.error?.length) toast.error(json.error[0]);
    else {
      setFile(json.data.url);
      toast.success('File terunggah');
    }
  };

  const openNew = () => {
    setJudul('');
    setFile('');
    setOpen(true);
  };

  const save = async () => {
    if (!judul.trim() || !file) {
      toast.error('Judul dan file wajib diisi');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/produk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jenis: tab, judul, file }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error?.length) toast.error(json.error[0]);
    else {
      toast.success(json.success?.[0] ?? 'Tersimpan');
      setOpen(false);
      load();
    }
  };

  const remove = async (p: Produk) => {
    if (!confirm(`Hapus "${p.judul}"?`)) return;
    setDeletingId(p.id);
    const res = await fetch(`/api/admin/produk/${p.id}`, { method: 'DELETE' });
    const json = await res.json();
    setDeletingId(null);
    if (json.error?.length) toast.error(json.error[0]);
    else {
      toast.success(json.success?.[0] ?? 'Dihapus');
      setItems((prev) => prev.filter((i) => i.id !== p.id));
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4 border-b border-slate-200/60 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            style={tab === t.key ? { background: '#2176bd' } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="text-white" style={{ background: '#2176bd' }}>
          <Plus className="h-4 w-4" /> <span className="ml-1">Tambah Dokumen</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">Belum ada dokumen pada kategori ini.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Nama Dokumen</th>
                <th className="py-2 pr-4 font-medium">File</th>
                <th className="py-2 pr-4 font-medium">Tanggal</th>
                <th className="py-2 pr-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" /> {p.judul}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    {p.file ? (
                      <a href={p.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        Lihat <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" disabled={deletingId === p.id} onClick={() => remove(p)}>
                        {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tambah */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Tambah Dokumen — {TABS.find((t) => t.key === tab)?.label}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="judul">Nama Dokumen</Label>
                <Input id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>File (PDF/JPG/PNG, maks 5MB)</Label>
                <input ref={fileRef} type="file" accept=".pdf,image/png,image/jpeg" className="hidden" onChange={handleFile} />
                {file ? (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                    <a href={file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline truncate">
                      <FileText className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{file.split('/').pop()}</span>
                    </a>
                    <button type="button" onClick={() => setFile('')} className="text-xs text-red-500 hover:underline">Ganti</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-6 text-slate-400 hover:border-blue-300 hover:text-blue-500"
                  >
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                    <span className="text-sm">{uploading ? 'Mengunggah...' : 'Pilih file'}</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button onClick={save} disabled={saving || uploading} className="text-white" style={{ background: '#2176bd' }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span className={saving ? 'ml-1.5' : ''}>Simpan</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
