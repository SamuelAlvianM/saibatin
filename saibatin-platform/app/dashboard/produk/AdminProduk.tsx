'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, X, FileText, Upload, ExternalLink, Search, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DOKUMEN_KATEGORI, getDokumenKategori } from '@/lib/dokumen-registry';

interface Produk {
  id: number;
  jenis: string;
  judul: string;
  file: string | null;
  konten: string | null;
  createdAt: string;
  uploadedByName?: string | null;
}

const GROUPS = ['Produk Layanan', 'PPID / Transparansi'] as const;

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
  const [q, setQ] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = q.trim()
    ? items.filter((p) => p.judul.toLowerCase().includes(q.trim().toLowerCase()))
    : items;

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

  const kategori = getDokumenKategori(tab);

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      {/* Pemilih kategori (dikelompokkan) */}
      <div className="mb-4 grid gap-3 lg:grid-cols-[320px_1fr]">
        <div className="space-y-1.5">
          <Label>Kategori Dokumen</Label>
          <Select value={tab} onValueChange={(v) => { setTab(v); setQ(''); }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROUPS.map((g) => (
                <SelectGroup key={g}>
                  <SelectLabel>{g}</SelectLabel>
                  {DOKUMEN_KATEGORI.filter((k) => k.group === g).map((k) => (
                    <SelectItem key={k.key} value={k.key}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info: dokumen kategori ini tampil di halaman publik mana */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
          <p className="flex items-center gap-1.5 font-medium text-slate-800">
            <Globe className="h-4 w-4 text-primary" aria-hidden />
            Berkas kategori ini otomatis tampil di halaman publik:
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {kategori?.halaman.map((h) => (
              <a
                key={h.href}
                href={h.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/10"
              >
                {h.label} <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Cari nama dokumen..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
          <Plus className="h-4 w-4" /> <span className="ml-1">Tambah Dokumen</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">
          {q.trim() ? `Tidak ada dokumen cocok "${q}".` : 'Belum ada dokumen pada kategori ini.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Nama Dokumen</th>
                <th className="py-2 pr-4 font-medium">File</th>
                <th className="py-2 pr-4 font-medium">Diunggah oleh</th>
                <th className="py-2 pr-4 font-medium">Tanggal</th>
                <th className="py-2 pr-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> {p.judul}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    {p.file ? (
                      <a href={p.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                        Lihat <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {p.uploadedByName ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={deletingId === p.id} onClick={() => remove(p)}>
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
              <h3 className="font-semibold text-slate-900">Tambah Dokumen — {kategori?.label}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="judul">Nama Dokumen</Label>
                <Input
                  id="judul"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder={`Contoh: ${kategori?.label ?? 'Dokumen'} ${new Date().getFullYear()}`}
                />
                <p className="text-xs text-slate-400">
                  Nama ini tampil sebagai &quot;Nama Berkas&quot; di halaman publik.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>File (PDF/JPG/PNG, maks 5MB)</Label>
                <input ref={fileRef} type="file" accept=".pdf,image/png,image/jpeg" className="hidden" onChange={handleFile} />
                {file ? (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                    <a href={file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline truncate">
                      <FileText className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{file.split('/').pop()}</span>
                    </a>
                    <button type="button" onClick={() => setFile('')} className="text-xs text-destructive hover:underline">Ganti</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-6 text-slate-400 hover:border-primary/40 hover:text-primary"
                  >
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                    <span className="text-sm">{uploading ? 'Mengunggah...' : 'Pilih file'}</span>
                  </button>
                )}
              </div>

              <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-slate-600">
                Setelah disimpan, dokumen langsung tampil di:{' '}
                <b>{kategori?.halaman.map((h) => h.label).join(', ')}</b>
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button onClick={save} disabled={saving || uploading} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
