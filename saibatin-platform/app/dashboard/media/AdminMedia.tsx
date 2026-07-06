'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MediaUpload, type MediaItem } from '@/components/media/media-upload';
import {
  Search,
  Loader2,
  ImageIcon,
  Trash2,
  FileText,
  Copy,
  CloudUpload,
  X,
} from 'lucide-react';

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const perPage = 24;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set('q', q);
      const res = await fetch(`/api/media?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const hapus = async (m: MediaItem) => {
    if (!window.confirm(`Hapus "${m.namaAsli}" dari pustaka media?`)) return;
    const res = await fetch(`/api/media/${m.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success('Media dihapus');
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      setTotal((t) => Math.max(0, t - 1));
    }
  };

  const copyUrl = (m: MediaItem) => {
    const full = `${window.location.origin}${m.url}`;
    navigator.clipboard?.writeText(full);
    toast.success('URL disalin');
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-slate-700" />
          <h2 className="font-semibold text-slate-900">
            Semua Media <span className="text-sm font-normal text-slate-400">({total})</span>
          </h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama file..."
              className="pl-9"
            />
          </div>
          <Button onClick={() => setShowUpload((s) => !s)}>
            {showUpload ? <X className="h-4 w-4 mr-1.5" /> : <CloudUpload className="h-4 w-4 mr-1.5" />}
            {showUpload ? 'Tutup' : 'Unggah'}
          </Button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-5">
          <MediaUpload
            imageOnly={false}
            onUploaded={(m) => {
              setItems((prev) => [m, ...prev]);
              setTotal((t) => t + 1);
              toast.success('Berhasil ditambahkan ke pustaka');
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Belum ada media. Klik &quot;Unggah&quot; untuk menambah.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((m) => (
            <div
              key={m.id}
              className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
            >
              <div className="relative aspect-square">
                {m.mimeType.startsWith('image/') ? (
                  <Image src={m.url} alt={m.namaAsli} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1 text-slate-400">
                    <FileText className="h-7 w-7" />
                    <span className="text-[10px]">{m.namaFile.split('.').pop()?.toUpperCase()}</span>
                  </div>
                )}
                {/* Overlay aksi */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(m)}
                    title="Salin URL"
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => hapus(m)}
                    title="Hapus"
                    className="w-8 h-8 rounded-lg bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-[0.7rem] font-medium text-slate-700 truncate" title={m.namaAsli}>
                  {m.namaAsli}
                </p>
                <p className="text-[0.62rem] text-slate-400">{fmtSize(m.ukuran)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-slate-400">Halaman {page} dari {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
