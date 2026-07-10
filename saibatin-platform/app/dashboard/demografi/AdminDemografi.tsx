'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle2, FileSpreadsheet, Pencil } from 'lucide-react';
import { DEMOGRAFI_KATEGORI } from '@/lib/demografi-kategori';
import { DemografiEditor } from '@/components/dashboard/demografi-editor';
import { DemografiView } from '@/components/landingpage/demografi-view';

export function AdminDemografi() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ slug: string; label: string } | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const refresh = (slug: string) => {
    fetch(`/api/demografi?kategori=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j) => setCounts((c) => ({ ...c, [slug]: j.data?.items?.length ?? 0 })))
      .catch(() => setCounts((c) => ({ ...c, [slug]: 0 })));
  };

  useEffect(() => {
    DEMOGRAFI_KATEGORI.forEach((k) => refresh(k.slug));
  }, []);

  const upload = async (slug: string, file: File | undefined) => {
    if (!file) return;
    setUploading(slug);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('kategori', slug);
      const res = await fetch('/api/admin/demografi/import', { method: 'POST', body: form });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      toast.success(j.success?.[0] ?? 'Import berhasil');
      refresh(slug);
    } catch {
      toast.error('Gagal mengunggah file');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
        Unggah file Excel agregat Dukcapil (format SIAK: kolom <b>IDEM, KODE, WILAYAH, …</b>) per kategori.
        Setiap unggahan <b>mengganti</b> data lama kategori tersebut. Data yang sama juga bisa diedit
        <b> langsung dari beranda</b> (klik kartu Statistik Demografi saat Mode Edit admin aktif).
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DEMOGRAFI_KATEGORI.map((k) => {
          const count = counts[k.slug];
          const busy = uploading === k.slug;
          return (
            <div key={k.slug} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{k.label}</p>
                <p className="truncate text-xs text-slate-400">File: {k.fileHint}</p>
                <p className="mt-0.5 text-xs">
                  {count == null ? (
                    <span className="text-slate-400">memeriksa…</span>
                  ) : count > 0 ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {count} kecamatan tersimpan
                    </span>
                  ) : (
                    <span className="text-slate-400">Belum ada data</span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setEditing({ slug: k.slug, label: k.label })}
                className="flex-shrink-0"
                title="Edit / import (bisa banyak file) dengan pemeriksaan data berbeda"
              >
                <Pencil className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">Edit / Import</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => inputs.current[k.slug]?.click()}
                className="flex-shrink-0"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className="ml-1.5">{count ? 'Ganti' : 'Unggah'}</span>
              </Button>
              <input
                ref={(el) => {
                  inputs.current[k.slug] = el;
                }}
                type="file"
                accept=".xlsx"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  upload(k.slug, e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
          );
        })}
      </div>

      {editing && (
        <DemografiEditor
          kategori={editing.slug}
          label={editing.label}
          open
          onOpenChange={(o) => !o && setEditing(null)}
          onSaved={() => refresh(editing.slug)}
        />
      )}

      {/* Pratinjau data tersimpan — sama persis dengan tampilan publik:
          tabel ringkasan per kecamatan (jumlah seluruh pekon) + tombol Detail. */}
      <div className="pt-2">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Data Tersimpan</h2>
        <p className="mb-4 text-sm text-slate-500">
          Angka per kecamatan = <b>jumlah seluruh pekon</b> di bawahnya. Klik <b>Detail</b> untuk
          rincian per pekon, atau <b>Edit data</b> untuk mengubah langsung.
        </p>
        <DemografiView editable onDataChanged={() => DEMOGRAFI_KATEGORI.forEach((k) => refresh(k.slug))} />
      </div>
    </div>
  );
}
