'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, BarChart3, ChevronRight, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DEMOGRAFI_KATEGORI, getDemografiKategori } from '@/lib/demografi-kategori';
import { DemografiEditor } from '@/components/dashboard/demografi-editor';

interface Row {
  kode: string;
  wilayah: string;
  data: Record<string, number>;
  /** Jumlah pekon/kelurahan di bawah kecamatan ini (dari API ringkasan). */
  jumlahPekon?: number;
}

// Label ramah untuk kode kolom singkat (jenis kelamin). Kolom lain sudah bernama lengkap.
const KOLOM_LABEL: Record<string, string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
  JML: 'Jumlah',
};
const labelKolom = (k: string) => KOLOM_LABEL[k] ?? k;
const fmt = (n: number) => (n ?? 0).toLocaleString('id-ID');

function sumKolom(rows: Row[], kolom: string[]) {
  const total: Record<string, number> = {};
  for (const k of kolom) total[k] = rows.reduce((a, r) => a + (r.data[k] ?? 0), 0);
  return total;
}

export function DemografiView({
  initialKategori = 'jenis-kelamin',
  editable = false,
  onDataChanged,
}: {
  initialKategori?: string;
  /** true → admin (mode edit beranda): tampilkan tombol edit data. */
  editable?: boolean;
  /** Dipanggil setelah data disimpan (agar pemanggil menyegarkan kartu). */
  onDataChanged?: () => void;
}) {
  const [kategori, setKategori] = useState(initialKategori);
  const [kolom, setKolom] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  // Popup detail pekon
  const [detail, setDetail] = useState<{ kode: string; wilayah: string } | null>(null);
  const [detailKolom, setDetailKolom] = useState<string[]>([]);
  const [detailRows, setDetailRows] = useState<Row[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadKecamatan = useCallback(() => {
    setLoading(true);
    return fetch(`/api/demografi?kategori=${encodeURIComponent(kategori)}`)
      .then((r) => r.json())
      .then((j) => {
        setKolom(j.data?.kolom ?? []);
        setRows(j.data?.items ?? []);
      })
      .catch(() => {
        setKolom([]);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [kategori]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/demografi?kategori=${encodeURIComponent(kategori)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setKolom(j.data?.kolom ?? []);
        setRows(j.data?.items ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setKolom([]);
          setRows([]);
        }
      })
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
        .then((j) => {
          setDetailKolom(j.data?.kolom ?? kolom);
          setDetailRows(j.data?.items ?? []);
        })
        .catch(() => setDetailRows([]))
        .finally(() => setDetailLoading(false));
    },
    [kategori, kolom],
  );

  const total = sumKolom(rows, kolom);
  const detailTotal = sumKolom(detailRows, detailKolom);

  return (
    <div className="space-y-5">
      {/* Pemilih kategori + tombol edit (mode admin) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {DEMOGRAFI_KATEGORI.map((k) => {
            const active = k.slug === kategori;
            return (
              <button
                key={k.slug}
                onClick={() => setKategori(k.slug)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {k.label}
              </button>
            );
          })}
        </div>
        {editable && (
          <Button
            size="sm"
            onClick={() => setEditorOpen(true)}
            className="ml-auto gap-1.5"
            title="Ubah data langsung dari sini"
          >
            <Pencil className="h-4 w-4" /> Edit data {getDemografiKategori(kategori)?.label}
          </Button>
        )}
      </div>

      {/* Tabel kecamatan */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <BarChart3 className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">Data kategori ini belum tersedia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Kecamatan</th>
                  {kolom.map((k) => (
                    <th key={k} className="px-4 py-3 text-right font-semibold">{labelKolom(k)}</th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.kode} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.wilayah}</td>
                    {kolom.map((k) => (
                      <td key={k} className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                        {fmt(r.data[k] ?? 0)}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => openDetail(r)}
                        title={`Lihat rincian ${r.jumlahPekon ?? ''} pekon/kelurahan`.replace('  ', ' ')}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        Detail{typeof r.jumlahPekon === 'number' && r.jumlahPekon > 0 ? ` (${r.jumlahPekon})` : ''}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-4 py-3">TOTAL</td>
                  {kolom.map((k) => (
                    <td key={k} className="px-4 py-3 text-right tabular-nums">{fmt(total[k])}</td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Popup detail per pekon */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Detail per Pekon — {detail?.wilayah}
            </DialogTitle>
            <DialogDescription>
              Rincian data {DEMOGRAFI_KATEGORI.find((k) => k.slug === kategori)?.label} per pekon/kelurahan.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
            {detailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : detailRows.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Tidak ada data pekon.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Kode</th>
                    <th className="px-4 py-3 font-semibold">Pekon / Kelurahan</th>
                    {detailKolom.map((k) => (
                      <th key={k} className="px-4 py-3 text-right font-semibold">{labelKolom(k)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailRows.map((r) => (
                    <tr key={r.kode} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{r.kode}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{r.wilayah}</td>
                      {detailKolom.map((k) => (
                        <td key={k} className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                          {fmt(r.data[k] ?? 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                    <td className="px-4 py-3" colSpan={2}>TOTAL</td>
                    {detailKolom.map((k) => (
                      <td key={k} className="px-4 py-3 text-right tabular-nums">{fmt(detailTotal[k])}</td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor manual (mode admin) — simpan lalu segarkan tabel & kartu beranda */}
      {editable && (
        <DemografiEditor
          kategori={kategori}
          label={getDemografiKategori(kategori)?.label ?? kategori}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          onSaved={() => {
            loadKecamatan();
            onDataChanged?.();
          }}
        />
      )}
    </div>
  );
}
