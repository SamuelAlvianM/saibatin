'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Pencil, Trash2, X, Newspaper, Eye, EyeOff } from 'lucide-react';
import { slugify } from '@/lib/slug';
import { RichEditor } from '@/components/shared/rich-editor';
import { ImagePickerField } from '@/components/media/image-picker-field';

interface News {
  id: number;
  judul: string;
  slug: string;
  kategori: string | null;
  ringkasan: string | null;
  konten: string;
  gambar: string | null;
  publish: boolean;
  createdAt: string;
}

type FormState = {
  judul: string;
  kategori: string;
  ringkasan: string;
  konten: string;
  gambar: string;
  publish: boolean;
};

const EMPTY: FormState = { judul: '', kategori: '', ringkasan: '', konten: '', gambar: '', publish: false };

export function AdminBerita() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/berita');
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (n: News) => {
    setEditId(n.id);
    setForm({
      judul: n.judul,
      kategori: n.kategori ?? '',
      ringkasan: n.ringkasan ?? '',
      konten: n.konten,
      gambar: n.gambar ?? '',
      publish: n.publish,
    });
    setOpen(true);
  };

  const save = async () => {
    const kontenText = form.konten.replace(/<[^>]*>/g, '').trim();
    if (!form.judul.trim() || !kontenText) {
      toast.error('Judul dan isi berita wajib diisi');
      return;
    }
    setSaving(true);
    const url = editId ? `/api/admin/berita/${editId}` : '/api/admin/berita';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success(json.success?.[0] ?? 'Tersimpan');
      setOpen(false);
      load();
    }
  };

  const remove = async (n: News) => {
    if (!confirm(`Hapus berita "${n.judul}"?`)) return;
    setDeletingId(n.id);
    const res = await fetch(`/api/admin/berita/${n.id}`, { method: 'DELETE' });
    const json = await res.json();
    setDeletingId(null);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success(json.success?.[0] ?? 'Berita dihapus');
      setItems((prev) => prev.filter((i) => i.id !== n.id));
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-900">Daftar Berita</h2>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> <span className="ml-1">Tambah</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">Belum ada berita.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Judul</th>
                <th className="py-2 pr-4 font-medium">Kategori</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Tanggal</th>
                <th className="py-2 pr-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4">
                    <div className="font-medium text-slate-800">{n.judul}</div>
                    <div className="text-xs text-slate-400 font-mono">/{n.slug}</div>
                  </td>
                  <td className="py-2.5 pr-4">{n.kategori ?? '-'}</td>
                  <td className="py-2.5 pr-4">
                    {n.publish ? (
                      <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                        <Eye className="h-3.5 w-3.5" /> Publish
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <EyeOff className="h-3.5 w-3.5" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(n)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={deletingId === n.id}
                        onClick={() => remove(n)}
                      >
                        {deletingId === n.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">{editId ? 'Ubah Berita' : 'Tambah Berita'}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              {/* Rich editor di atas agar penulisan konten lebih nyaman */}
              <div className="space-y-1.5">
                <Label htmlFor="konten">Isi Berita</Label>
                <RichEditor
                  value={form.konten}
                  onChange={(html) => setForm((f) => ({ ...f, konten: html }))}
                  placeholder="Tulis isi berita di sini..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="judul">Judul</Label>
                  <Input id="judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
                  {form.judul && (
                    <p className="text-xs text-slate-400 font-mono">slug: /{slugify(form.judul) || '...'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kategori">Kategori</Label>
                  <Input id="kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="mis. Pengumuman" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gambar Utama</Label>
                  <ImagePickerField
                    label="Gambar Berita"
                    title="Pilih Gambar Berita"
                    value={form.gambar}
                    onChange={(url) => setForm((f) => ({ ...f, gambar: url }))}
                    aspect={16 / 9}
                    className="aspect-video w-full max-w-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ringkasan">Ringkasan</Label>
                <Textarea id="ringkasan" rows={2} value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} placeholder="Ringkasan singkat yang tampil di daftar berita" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.publish}
                  onCheckedChange={(c) => setForm({ ...form, publish: c === true })}
                />
                Publikasikan sekarang
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
