'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInlineEdit } from '@/components/konten/inline-edit';
import { Download, FileText, FileUp, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export interface InfoPageContent {
  title: string;
  description: string;
  body?: string[];
  list?: string[];
  /** Tautan lanjutan (mis. situs resmi eksternal). Dibuka di tab baru bila external. */
  links?: { label: string; href: string; external?: boolean }[];
  downloadLabel?: string;
}

export interface InfoBerkas {
  id: number;
  judul: string;
  file: string;
  createdAt: string;
}

export function InfoPage({
  content,
  berkas,
  dokumenJenis,
}: {
  content: InfoPageContent;
  /** Dokumen unggahan dashboard (Dokumen Publikasi) yang tampil di halaman ini. */
  berkas?: InfoBerkas[];
  /** Kategori dokumen (t_produk.jenis). Bila diisi, admin (mode edit) dapat
   *  mengunggah/menghapus dokumen langsung dari halaman ini. */
  dokumenJenis?: string;
}) {
  const { editMode } = useInlineEdit();
  const [items, setItems] = useState<InfoBerkas[]>(berkas ?? []);
  useEffect(() => {
    setItems(berkas ?? []);
  }, [berkas]);

  const canEditDocs = editMode && !!dokumenJenis;

  const removeDoc = async (b: InfoBerkas) => {
    if (!confirm(`Hapus dokumen "${b.judul}"?`)) return;
    const res = await fetch(`/api/admin/produk/${b.id}`, { method: 'DELETE' });
    const j = await res.json();
    if (j.error?.length) {
      toast.error(j.error[0]);
      return;
    }
    toast.success('Dokumen dihapus');
    setItems((prev) => prev.filter((x) => x.id !== b.id));
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/30">
      <div className="container mx-auto flex-1 px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              {content.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{content.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-4"
        >
          {content.body?.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-700">
              {p}
            </p>
          ))}

          {content.list && (
            <ul className="space-y-2 pt-2">
              {content.list.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {content.links && content.links.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {content.links.map((l) =>
                l.external ? (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="pt-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Berkas</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Nama Berkas</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">Tanggal Unggah</th>
                      {canEditDocs && <th className="px-4 py-3 font-semibold text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <a
                            href={b.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                          >
                            <Download className="h-4 w-4 flex-shrink-0" aria-hidden />
                            {b.judul}
                          </a>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                          {new Date(b.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        {canEditDocs && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeDoc(b)}
                              title={`Hapus ${b.judul}`}
                              className="text-slate-400 transition-colors hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mode edit + kategori dokumen tersedia → unggah PDF langsung dari sini */}
          {canEditDocs && dokumenJenis && (
            <TambahDokumen
              jenis={dokumenJenis}
              onAdded={(b) => setItems((prev) => [b, ...prev])}
            />
          )}

          {items.length === 0 && !canEditDocs && (
            <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
              Dokumen resmi belum tersedia secara digital di portal ini. Untuk informasi
              lengkap, silakan{' '}
              <Link href="/hubungi-kami/alamat" className="text-primary hover:underline">
                hubungi Disdukcapil Pesisir Barat
              </Link>{' '}
              secara langsung.
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

/**
 * Panel unggah dokumen (mode edit) — tampil di halaman publik yang punya
 * kategori dokumen. Alur sama dengan dashboard Dokumen Publikasi:
 * upload file → simpan ke t_produk dgn `jenis` kategori halaman ini.
 */
function TambahDokumen({
  jenis,
  onAdded,
}: {
  jenis: string;
  onAdded: (b: InfoBerkas) => void;
}) {
  const [judul, setJudul] = useState('');
  const [file, setFile] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', f);
    fd.append('folder', 'produk');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const j = await res.json();
    setUploading(false);
    if (j.error?.length) toast.error(j.error[0]);
    else {
      setFile(j.data.url);
      if (!judul.trim()) setJudul(f.name.replace(/\.[^.]+$/, ''));
      toast.success('File terunggah — beri nama lalu Simpan');
    }
  };

  const save = async () => {
    if (!judul.trim() || !file) {
      toast.error('Nama dokumen dan file wajib diisi');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/produk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jenis, judul, file }),
    });
    const j = await res.json();
    setSaving(false);
    if (j.error?.length) {
      toast.error(j.error[0]);
      return;
    }
    const item = j.data?.item;
    toast.success('Dokumen ditambahkan');
    if (item) {
      onAdded({
        id: item.id,
        judul: item.judul,
        file: item.file,
        createdAt: item.createdAt ?? new Date().toISOString(),
      });
    }
    setJudul('');
    setFile('');
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
        <FileUp className="h-3.5 w-3.5" /> Tambah Dokumen (PDF) — mode edit
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          placeholder="Nama dokumen (tampil sebagai Nama Berkas)"
          className="bg-white sm:flex-1"
        />
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            handleFile(e);
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-white"
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-1.5 h-4 w-4" />
          )}
          {file ? 'Ganti File' : 'Pilih File'}
        </Button>
        <Button type="button" onClick={save} disabled={saving || uploading || !file}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-1.5 h-4 w-4" />
          )}
          Simpan
        </Button>
      </div>
      {file && (
        <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-slate-500">
          <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
          {file.split('/').pop()}
        </p>
      )}
      <p className="mt-2 text-[0.7rem] text-slate-400">
        PDF/JPG/PNG maks 5MB. Dokumen tersimpan ke kategori yang sama dengan
        dashboard <b>Dokumen Publikasi</b> dan langsung tampil di halaman ini.
      </p>
    </div>
  );
}
