'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3, ChevronRight, Pencil } from 'lucide-react';
import { DemografiEditor } from '@/components/dashboard/demografi-editor';
import { getDemografiKategori } from '@/lib/demografi-kategori';

interface Row {
  kode: string;
  wilayah: string;
  data: Record<string, number>;
}

const fmt = (n: number) => (n ?? 0).toLocaleString('id-ID');

/**
 * Tampilan terfokus SATU metrik (mis. "Jumlah Penduduk") per kecamatan,
 * dengan drill-down ke desa/kelurahan. Dibuka saat kartu statistik diklik.
 */
export function DemografiMetric({
  kategori,
  kolom,
  title,
  editable = false,
  onDataChanged,
}: {
  kategori: string;
  /** Nama kolom nilai yang ditampilkan (mis. 'JML', 'L', 'KK_JML'). */
  kolom: string;
  /** Judul metrik (mis. 'Jumlah Penduduk'). */
  title: string;
  editable?: boolean;
  onDataChanged?: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  const [detail, setDetail] = useState<{ kode: string; wilayah: string } | null>(null);
  const [detailRows, setDetailRows] = useState<Row[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    return fetch(`/api/demografi?kategori=${encodeURIComponent(kategori)}`)
      .then((r) => r.json())
      .then((j) => setRows(j.data?.items ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [kategori]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/demografi?kategori=${encodeURIComponent(kategori)}`)
      .then((r) => r.json())
      .then((j) => !cancelled && setRows(j.data?.items ?? []))
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [kategori]);

  const openDetail = useCallback(
    (kec: { kode: string; wilayah: string }) => {
      setDetail(kec);
      setDetailLoading(true);
      setDetailRows([]);
      fetch(`/api/demografi?kategori=${encodeURIComponent(kategori)}&parent=${encodeURIComponent(kec.kode)}`)
        .then((r) => r.json())
        .then((j) => setDetailRows(j.data?.items ?? []))
        .catch(() => setDetailRows([]))
        .finally(() => setDetailLoading(false));
    },
    [kategori],
  );

  const val = (r: Row) => r.data[kolom] ?? 0;
  const total = rows.reduce((a, r) => a + val(r), 0);
  const detailTotal = detailRows.reduce((a, r) => a + val(r), 0);

  return (
    <div className="space-y-4">
      {/* Header ringkas: total kabupaten + tombol edit (admin) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] px-5 py-4">
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-widest text-primary">
            {title} · Kabupaten Pesisir Barat
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {loading ? '—' : fmt(total)}
          </p>
        </div>
        {editable && (
          <Button size="sm" onClick={() => setEditorOpen(true)} className="gap-1.5">
            <Pencil className="h-4 w-4" /> Edit data
          </Button>
        )}
      </div>

      {/* Tabel per kecamatan */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <BarChart3 className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">Data belum tersedia.</p>
            {editable && <p className="text-xs text-slate-400">Klik “Edit data” untuk mengisi.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Kecamatan</th>
                  <th className="px-4 py-3 text-right font-semibold">{title}</th>
                  <th className="px-4 py-3 text-center font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.kode} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.wilayah}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{fmt(val(r))}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => openDetail(r)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        Desa/Kelurahan <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Popup detail per desa/kelurahan */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {title} — {detail?.wilayah}
            </DialogTitle>
            <DialogDescription>Rincian {title.toLowerCase()} per desa/kelurahan.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
            {detailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : detailRows.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Tidak ada data desa/kelurahan.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Desa / Kelurahan</th>
                    <th className="px-4 py-3 text-right font-semibold">{title}</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRows.map((r) => (
                    <tr key={r.kode} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{r.wilayah}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{fmt(val(r))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmt(detailTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor manual (admin) — edit seluruh kolom kategori, lalu segarkan. */}
      {editable && (
        <DemografiEditor
          kategori={kategori}
          label={getDemografiKategori(kategori)?.label ?? kategori}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          onSaved={() => {
            load();
            onDataChanged?.();
          }}
        />
      )}
    </div>
  );
}
