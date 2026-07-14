'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  Pencil,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { DEMOGRAFI_KATEGORI } from '@/lib/demografi-kategori';
import { DemografiEditor } from '@/components/dashboard/demografi-editor';
import { DemografiView } from '@/components/landingpage/demografi-view';

/** Unduh file dari endpoint (memicu dialog simpan browser). */
function downloadFile(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function AdminDemografi() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ slug: string; label: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const refresh = (slug: string) => {
    fetch(`/api/demografi?kategori=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j) => setCounts((c) => ({ ...c, [slug]: j.data?.items?.length ?? 0 })))
      .catch(() => setCounts((c) => ({ ...c, [slug]: 0 })));
  };

  const refreshAll = () => DEMOGRAFI_KATEGORI.forEach((k) => refresh(k.slug));

  useEffect(() => {
    refreshAll();
  }, []);

  const totalTersimpan = DEMOGRAFI_KATEGORI.reduce(
    (a, k) => a + (counts[k.slug] ?? 0),
    0,
  );

  const deleteAll = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/demografi', { method: 'DELETE' });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      toast.success(j.success?.[0] ?? 'Semua data demografi dihapus');
      setConfirmDelete(false);
      refreshAll();
    } catch {
      toast.error('Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
          Unggah file Excel agregat Dukcapil (format SIAK: kolom <b>IDEM, KODE, WILAYAH, …</b>) per kategori.
          Setiap unggahan <b>mengganti</b> data lama kategori tersebut. Klik <b>Edit / Import</b> untuk
          mengelola data kecamatan &amp; <b>detail pekon</b>-nya.
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadFile('/api/admin/demografi/export')}
            disabled={totalTersimpan === 0}
            title="Unduh semua kategori dalam satu file Excel"
          >
            <Download className="mr-1.5 h-4 w-4" /> Export Semua
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            disabled={totalTersimpan === 0}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Hapus seluruh data demografi (semua kategori)"
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Hapus Semua
          </Button>
        </div>
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
                variant="ghost"
                size="icon"
                disabled={busy || !count}
                onClick={() =>
                  downloadFile(`/api/admin/demografi/export?kategori=${encodeURIComponent(k.slug)}`)
                }
                className="flex-shrink-0"
                title="Unduh data kategori ini ke Excel"
              >
                <Download className="h-4 w-4" />
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

      {/* Konfirmasi hapus seluruh data demografi */}
      <Dialog open={confirmDelete} onOpenChange={(o) => !deleting && setConfirmDelete(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Hapus semua data demografi?
            </DialogTitle>
            <DialogDescription>
              Seluruh data <b>semua kategori</b> (kecamatan &amp; pekon) akan dihapus permanen —
              total <b>{totalTersimpan} kecamatan</b> tersimpan. Sebaiknya <b>Export Semua</b> dulu
              sebagai cadangan. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Batal
            </Button>
            <Button
              onClick={deleteAll}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              Ya, hapus semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
