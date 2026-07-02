'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, X, ImageIcon, Upload } from 'lucide-react';

interface Foto {
  id: number;
  judul: string;
  kategori: string;
  gambar: string;
  createdAt: string;
}

const KATEGORI = ['PELAYANAN', 'BUPATI'];

export function AdminGaleri() {
  const [items, setItems] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('PELAYANAN');
  const [gambar, setGambar] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/galeri?limit=50');
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'galeri');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      setGambar(json.data.url);
      toast.success('Foto terunggah');
    }
  };

  const openNew = () => {
    setJudul('');
    setKategori('PELAYANAN');
    setGambar('');
    setOpen(true);
  };

  const save = async () => {
    if (!judul.trim() || !gambar) {
      toast.error('Judul dan foto wajib diisi');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/galeri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judul, kategori, gambar }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success(json.success?.[0] ?? 'Foto ditambahkan');
      setOpen(false);
      load();
    }
  };

  const remove = async (f: Foto) => {
    if (!confirm(`Hapus foto "${f.judul}"?`)) return;
    setDeletingId(f.id);
    const res = await fetch(`/api/admin/galeri/${f.id}`, { method: 'DELETE' });
    const json = await res.json();
    setDeletingId(null);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success(json.success?.[0] ?? 'Foto dihapus');
      setItems((prev) => prev.filter((i) => i.id !== f.id));
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-900">Daftar Foto</h2>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> <span className="ml-1">Upload Foto</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">Belum ada foto.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-xl border border-slate-200">
              <div className="relative aspect-square bg-slate-50">
                <Image src={f.gambar} alt={f.judul} fill className="object-contain p-1" />
              </div>
              <div className="p-2">
                <p className="truncate text-sm font-medium text-slate-800">{f.judul}</p>
                <p className="text-xs text-slate-400">{f.kategori}</p>
              </div>
              <button
                onClick={() => remove(f)}
                disabled={deletingId === f.id}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                {deletingId === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal upload */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Upload Foto</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="judul">Judul</Label>
                <Input id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <div className="flex gap-2">
                  {KATEGORI.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKategori(k)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        kategori === k ? 'bg-primary text-primary-foreground border-transparent' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Foto</Label>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
                {gambar ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <Image src={gambar} alt="preview" fill className="object-contain p-1" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-8 text-slate-400 hover:border-primary/40 hover:text-primary"
                  >
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                    <span className="text-sm">{uploading ? 'Mengunggah...' : 'Pilih foto (JPG/PNG, maks 5MB)'}</span>
                  </button>
                )}
                {gambar && (
                  <button type="button" onClick={() => setGambar('')} className="text-xs text-destructive hover:underline">
                    Ganti foto
                  </button>
                )}
              </div>

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
