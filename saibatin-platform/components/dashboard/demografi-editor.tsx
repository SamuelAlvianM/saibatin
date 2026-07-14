'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Plus,
  Trash2,
  Check,
  X,
  FileUp,
  Download,
  ChevronRight,
  ArrowLeft,
  Layers,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  KARTU_STATISTIK_KUNCI,
  labelKolom,
  normalizeKartu,
  warnaPreset,
  type KartuStatistik,
} from '@/lib/beranda-statistik';
import { getIcon } from '@/lib/icon-map';
import { IconColumnInput } from '@/components/konten/field-editor';

interface EditRow {
  _id: string;
  kode: string;
  wilayah: string;
  data: Record<string, number>;
}

interface ParsedRow {
  kode: string;
  wilayah: string;
  level: number;
  parentKode: string | null;
  data: Record<string, number>;
}
interface Conflict {
  kode: string;
  wilayah: string;
  level: number;
  parentKode: string | null;
  options: { label: string; data: Record<string, number> }[];
}

let seq = 0;
const nid = () => `r${Date.now().toString(36)}_${seq++}`;
const digits = (s: string) => s.replace(/\D/g, '');
const toEdit = (r: { kode: string; wilayah: string; data: Record<string, number> }): EditRow => ({
  _id: nid(),
  kode: r.kode,
  wilayah: r.wilayah,
  data: { ...r.data },
});

// ── Grid tabel editable (dipakai untuk kecamatan & pekon) ──────────────────
function EditGrid({
  rows,
  kolom,
  isJK,
  onKode,
  onWilayah,
  onCell,
  onRemove,
  onRenameCol,
  onRemoveCol,
  highlight,
  onToggleHighlight,
  detailCounts,
  onDetail,
  kodePlaceholder,
  emptyText,
}: {
  rows: EditRow[];
  kolom: string[];
  isJK: boolean;
  onKode: (id: string, v: string) => void;
  onWilayah: (id: string, v: string) => void;
  onCell: (id: string, col: string, v: string) => void;
  onRemove: (id: string) => void;
  /** Ganti nama kunci kolom (judul Excel). */
  onRenameCol: (oldKey: string, nextKey: string) => void;
  /** Hapus kolom. */
  onRemoveCol: (key: string) => void;
  /** Kolom yang di-highlight — SATU per kategori (kartu statistik beranda). */
  highlight: string | null;
  onToggleHighlight: (key: string) => void;
  /** Peta kode kecamatan → jumlah pekon (hanya untuk tabel kecamatan). */
  detailCounts?: Record<string, number>;
  onDetail?: (r: EditRow) => void;
  kodePlaceholder: string;
  emptyText: string;
}) {
  return (
    <div className="flex-1 overflow-auto rounded-xl border border-slate-300 bg-white">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b-2 border-slate-300 bg-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-700">
            <th className="px-2.5 py-2">Kode</th>
            <th className="px-2.5 py-2">Wilayah</th>
            {kolom.map((k) => (
              // Judul kolom dapat diganti nama (kunci Excel dinamis). Input
              // rata-kanan + padding sama dgn sel nilai agar sejajar; tombol
              // hapus (×) DI DALAM kotak input di sisi kiri agar rapi.
              <th key={k} className="px-2.5 py-2">
                <div className="flex items-center gap-1">
                  <div className="relative flex-1">
                    <input
                      defaultValue={k}
                      onBlur={(e) => onRenameCol(k, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      title="Klik untuk ganti nama kolom"
                      className={cn(
                        'h-8 w-full min-w-[5.5rem] rounded border bg-white pr-3 text-right text-xs font-bold uppercase tracking-wide text-slate-700 outline-none focus:border-primary',
                        highlight === k
                          ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                          : 'border-slate-300 hover:border-slate-400',
                        kolom.length > 1 ? 'pl-7' : 'pl-3',
                      )}
                    />
                    {kolom.length > 1 && (
                      <button
                        onClick={() => onRemoveCol(k)}
                        title={`Hapus kolom ${k}`}
                        className="absolute left-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-destructive hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => onToggleHighlight(k)}
                    title={
                      highlight === k
                        ? `Kolom ${k} tampil sebagai kartu statistik beranda — klik untuk melepas`
                        : `Highlight kolom ${k} sebagai kartu statistik beranda (hanya satu kolom)`
                    }
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded border transition-colors',
                      highlight === k
                        ? 'border-amber-400 bg-amber-100 text-amber-500 hover:bg-amber-200'
                        : 'border-slate-300 bg-white text-slate-300 hover:border-amber-300 hover:text-amber-400',
                    )}
                  >
                    <Star className={cn('h-4 w-4', highlight === k && 'fill-amber-400')} />
                  </button>
                </div>
              </th>
            ))}
            {onDetail && <th className="px-2.5 py-2 text-center">Detail</th>}
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const count = detailCounts?.[digits(r.kode)] ?? 0;
            return (
              <tr key={r._id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-2.5 py-1.5">
                  <Input
                    value={r.kode}
                    inputMode="numeric"
                    onChange={(e) => onKode(r._id, digits(e.target.value))}
                    placeholder={kodePlaceholder}
                    className="h-9 w-32 border-slate-300 bg-white font-mono text-xs font-semibold text-slate-900"
                  />
                </td>
                <td className="px-2.5 py-1.5">
                  <Input
                    value={r.wilayah}
                    onChange={(e) => onWilayah(r._id, e.target.value)}
                    placeholder="Nama wilayah"
                    className="h-9 min-w-44 border-slate-300 bg-white font-medium text-slate-900"
                  />
                </td>
                {kolom.map((k) => (
                  <td key={k} className="px-2.5 py-1.5">
                    <Input
                      value={String(r.data[k] ?? 0)}
                      inputMode="numeric"
                      readOnly={isJK && k === 'JML'}
                      onChange={(e) => onCell(r._id, k, e.target.value)}
                      className={cn(
                        'h-9 w-full min-w-[5.5rem] border-slate-300 bg-white text-right font-semibold tabular-nums text-slate-900',
                        isJK && k === 'JML' && 'bg-slate-100 font-bold text-slate-500',
                      )}
                    />
                  </td>
                ))}
                {onDetail && (
                  <td className="px-2.5 py-1.5 text-center">
                    <button
                      onClick={() => onDetail(r)}
                      title="Kelola / import data pekon kecamatan ini"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      Detail{count > 0 ? ` (${count})` : ''}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => onRemove(r._id)}
                    className="text-slate-400 hover:text-destructive"
                    title="Hapus baris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={kolom.length + (onDetail ? 4 : 3)} className="py-10 text-center text-sm text-slate-500">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DemografiEditor({
  kategori,
  label,
  open,
  onOpenChange,
  onSaved,
}: {
  kategori: string;
  label: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
}) {
  const [kolom, setKolom] = useState<string[]>([]);
  const [kecRows, setKecRows] = useState<EditRow[]>([]); // level 4 (kecamatan)
  const [pekonRows, setPekonRows] = useState<EditRow[]>([]); // level 5 (semua pekon)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Tampilan detail per kecamatan (null = tampilan utama/kecamatan).
  const [detail, setDetail] = useState<{ kode: string; wilayah: string } | null>(null);

  // SATU kolom highlight per kategori → jadi kartu statistik beranda
  // (judul = nama kolom, angka = total kolom). kartuRef menyimpan seluruh
  // konfigurasi kartu agar kartu kategori lain tidak tersentuh saat disimpan.
  const [highlight, setHighlight] = useState<string | null>(null);
  const [kartuIkon, setKartuIkon] = useState('Users');
  const [kartuWarna, setKartuWarna] = useState('biru');
  const kartuRef = useRef<KartuStatistik[]>([]);

  const mainFileRef = useRef<HTMLInputElement | null>(null);
  const detailFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/static-content?keys=${encodeURIComponent(KARTU_STATISTIK_KUNCI)}`)
      .then((r) => r.json())
      .then((j) => {
        const kartu = normalizeKartu(
          (j.data?.items?.[KARTU_STATISTIK_KUNCI] as { kartu?: unknown } | undefined)?.kartu,
        );
        kartuRef.current = kartu;
        const milik = kartu.find((c) => c.kategori === kategori);
        setHighlight(milik?.kolom ?? null);
        setKartuIkon(milik?.icon ?? 'Users');
        setKartuWarna(milik?.warna ?? 'biru');
      })
      .catch(() => {
        /* gagal memuat konfigurasi kartu → highlight kosong, kartu lama aman */
      });
  }, [open, kategori]);

  useEffect(() => {
    if (!open) return;
    setDetail(null);
    setLoading(true);
    fetch(`/api/admin/demografi?kategori=${encodeURIComponent(kategori)}`)
      .then((r) => r.json())
      .then((j) => {
        const k: string[] = j.data?.kolom?.length ? j.data.kolom : ['L', 'P', 'JML'];
        setKolom(k);
        const rows: { kode: string; wilayah: string; level: number; data: Record<string, number> }[] =
          j.data?.rows ?? [];
        setKecRows(rows.filter((r) => r.level !== 5).map(toEdit));
        setPekonRows(rows.filter((r) => r.level === 5).map(toEdit));
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [open, kategori]);

  const isJK = useMemo(
    () => kolom.length === 3 && kolom.includes('L') && kolom.includes('P') && kolom.includes('JML'),
    [kolom],
  );

  // Jumlah pekon per kecamatan (untuk badge tombol Detail).
  const detailCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of pekonRows) {
      const parent = digits(p.kode).slice(0, 6);
      if (parent.length === 6) m[parent] = (m[parent] ?? 0) + 1;
    }
    return m;
  }, [pekonRows]);

  // Pekon milik kecamatan yang sedang dibuka.
  const detailRows = useMemo(() => {
    if (!detail) return [];
    const parent = digits(detail.kode);
    return pekonRows.filter((p) => digits(p.kode).slice(0, 6) === parent);
  }, [detail, pekonRows]);

  // ── Editor sel (berlaku untuk kec & pekon via setter) ──
  const cellSetter =
    (setter: React.Dispatch<React.SetStateAction<EditRow[]>>) =>
    (id: string, col: string, v: string) =>
      setter((rs) =>
        rs.map((r) => {
          if (r._id !== id) return r;
          const data = { ...r.data, [col]: Number(digits(v)) || 0 };
          if (isJK && (col === 'L' || col === 'P')) data.JML = (data.L || 0) + (data.P || 0);
          return { ...r, data };
        }),
      );
  const kodeSetter =
    (setter: React.Dispatch<React.SetStateAction<EditRow[]>>) => (id: string, v: string) =>
      setter((rs) => rs.map((r) => (r._id === id ? { ...r, kode: v } : r)));
  const wilayahSetter =
    (setter: React.Dispatch<React.SetStateAction<EditRow[]>>) => (id: string, v: string) =>
      setter((rs) => rs.map((r) => (r._id === id ? { ...r, wilayah: v } : r)));
  const remover =
    (setter: React.Dispatch<React.SetStateAction<EditRow[]>>) => (id: string) =>
      setter((rs) => rs.filter((r) => r._id !== id));

  const setKecCell = cellSetter(setKecRows);
  const setPekonCell = cellSetter(setPekonRows);

  const addKec = () =>
    setKecRows((rs) => [
      ...rs,
      { _id: nid(), kode: '', wilayah: '', data: Object.fromEntries(kolom.map((k) => [k, 0])) },
    ]);
  const addPekon = () =>
    setPekonRows((rs) => [
      ...rs,
      {
        _id: nid(),
        kode: detail ? digits(detail.kode) : '',
        wilayah: '',
        data: Object.fromEntries(kolom.map((k) => [k, 0])),
      },
    ]);

  // ── Kelola kolom (kunci Excel dinamis): rename / tambah / hapus ──
  const renameKeyInRows = (oldKey: string, nextKey: string) =>
    (rs: EditRow[]) =>
      rs.map((r) => {
        if (!(oldKey in r.data)) return r;
        const data: Record<string, number> = {};
        for (const [k, v] of Object.entries(r.data)) data[k === oldKey ? nextKey : k] = v;
        return { ...r, data };
      });

  const renameCol = (oldKey: string, raw: string) => {
    const nextKey = raw.trim().toUpperCase();
    if (!nextKey || nextKey === oldKey) return;
    if (kolom.includes(nextKey)) {
      toast.error(`Kolom "${nextKey}" sudah ada`);
      return;
    }
    setKolom((ks) => ks.map((k) => (k === oldKey ? nextKey : k)));
    setKecRows(renameKeyInRows(oldKey, nextKey));
    setPekonRows(renameKeyInRows(oldKey, nextKey));
    // Highlight ikut nama kolom baru.
    setHighlight((h) => (h === oldKey ? nextKey : h));
  };

  // Hanya SATU kolom yang bisa di-highlight — klik kolom lain memindahkannya.
  const toggleHighlight = (key: string) =>
    setHighlight((h) => (h === key ? null : key));

  const addCol = () => {
    let n = kolom.length + 1;
    let name = `KOLOM${n}`;
    while (kolom.includes(name)) name = `KOLOM${++n}`;
    setKolom((ks) => [...ks, name]);
    const addKey = (rs: EditRow[]) => rs.map((r) => ({ ...r, data: { ...r.data, [name]: 0 } }));
    setKecRows(addKey);
    setPekonRows(addKey);
    toast.success(`Kolom "${name}" ditambahkan — klik judulnya untuk ganti nama`);
  };

  const removeCol = (key: string) => {
    if (kolom.length <= 1) return;
    setHighlight((h) => (h === key ? null : h));
    setKolom((ks) => ks.filter((k) => k !== key));
    const dropKey = (rs: EditRow[]) =>
      rs.map((r) => {
        const data = { ...r.data };
        delete data[key];
        return { ...r, data };
      });
    setKecRows(dropKey);
    setPekonRows(dropKey);
  };

  // ── Import Excel: gabung baris + auto-pilih opsi pertama bila ada konflik ──
  async function parseFiles(fileList: FileList): Promise<ParsedRow[] | null> {
    const form = new FormData();
    form.append('kategori', kategori);
    Array.from(fileList).forEach((f) => form.append('files', f));
    const res = await fetch('/api/admin/demografi/parse', { method: 'POST', body: form });
    const j = await res.json();
    if (j.error?.length) {
      toast.error(j.error[0]);
      return null;
    }
    const d = j.data as { kolom: string[]; rows: ParsedRow[]; conflicts: Conflict[] };
    if (d.kolom?.length) setKolom(d.kolom);
    const resolved: ParsedRow[] = (d.conflicts ?? []).map((c) => ({
      kode: c.kode,
      wilayah: c.wilayah,
      level: c.level,
      parentKode: c.parentKode,
      data: c.options[0].data,
    }));
    if (resolved.length) {
      toast.info(`${resolved.length} wilayah punya data berbeda antar file — dipakai nilai file pertama.`);
    }
    return [...d.rows, ...resolved];
  }

  const importMain = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setImporting(true);
    try {
      const rows = await parseFiles(fileList);
      if (!rows) return;
      setKecRows(rows.filter((r) => r.level !== 5).map(toEdit));
      setPekonRows(rows.filter((r) => r.level === 5).map(toEdit));
      const kec = rows.filter((r) => r.level !== 5).length;
      const pek = rows.filter((r) => r.level === 5).length;
      toast.success(`${kec} kecamatan & ${pek} pekon dimuat — periksa lalu Simpan`);
    } catch {
      toast.error('Gagal memproses file');
    } finally {
      setImporting(false);
    }
  };

  const importDetail = async (fileList: FileList | null) => {
    if (!fileList?.length || !detail) return;
    setImporting(true);
    try {
      const rows = await parseFiles(fileList);
      if (!rows) return;
      const parent = digits(detail.kode);
      const pekonForKec = rows.filter(
        (r) => r.level === 5 && digits(r.kode).slice(0, 6) === parent,
      );
      if (pekonForKec.length === 0) {
        toast.error(`File tidak memuat pekon untuk kecamatan ${detail.wilayah} (kode ${parent}).`);
        return;
      }
      // Ganti pekon kecamatan ini; pertahankan pekon kecamatan lain.
      setPekonRows((rs) => [
        ...rs.filter((p) => digits(p.kode).slice(0, 6) !== parent),
        ...pekonForKec.map(toEdit),
      ]);
      toast.success(`${pekonForKec.length} pekon dimuat untuk ${detail.wilayah} — periksa lalu Simpan`);
    } catch {
      toast.error('Gagal memproses file');
    } finally {
      setImporting(false);
    }
  };

  // Total kolom highlight untuk PREVIEW kartu — sama dengan hitungan beranda:
  // jumlahkan baris pekon bila ada, kalau belum pakai baris kecamatan.
  const previewTotal = useMemo(() => {
    if (!highlight) return 0;
    const sumber = pekonRows.length ? pekonRows : kecRows;
    return sumber.reduce((a, r) => a + (Number(r.data[highlight]) || 0), 0);
  }, [highlight, pekonRows, kecRows]);

  /**
   * Susun ulang kartu beranda: kartu kategori lain dipertahankan apa adanya;
   * kategori ini diwakili SATU kartu dari kolom yang di-highlight — judul =
   * nama kolom, ikon & warna sesuai pilihan di panel preview.
   */
  const simpanHighlight = async () => {
    const prev = kartuRef.current;
    const posisi = prev.findIndex((c) => c.kategori === kategori);
    const kartu = prev.filter((c) => c.kategori !== kategori);
    if (highlight) {
      const entri: KartuStatistik = {
        title: labelKolom(highlight),
        icon: kartuIkon,
        kategori,
        kolom: highlight,
        warna: kartuWarna,
      };
      kartu.splice(posisi >= 0 ? Math.min(posisi, kartu.length) : kartu.length, 0, entri);
    }
    const res = await fetch('/api/admin/static-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kunci: KARTU_STATISTIK_KUNCI, konten: { kartu } }),
    });
    const j = await res.json();
    if (j.error?.length) throw new Error(j.error[0]);
    kartuRef.current = kartu;
  };

  const save = async () => {
    setSaving(true);
    try {
      const all = [...kecRows, ...pekonRows]
        .filter((r) => r.wilayah.trim() && digits(r.kode))
        .map((r) => ({ kode: digits(r.kode), wilayah: r.wilayah.trim(), data: r.data }));
      const res = await fetch('/api/admin/demografi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kategori, rows: all }),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      try {
        await simpanHighlight();
        toast.success('Data demografi & kartu beranda disimpan');
      } catch {
        toast.warning('Data tersimpan, tetapi kartu beranda gagal diperbarui');
      }
      onSaved?.();
      onOpenChange(false);
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  // Halaman penuh: kunci scroll halaman di belakang selama editor terbuka.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Dirender sebagai HALAMAN penuh via portal ke <body> (bukan modal) supaya
  // area edit lega; tampilan Detail pekon juga jadi halaman tersendiri.
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex flex-col bg-slate-50">
      {/* ── Header halaman: judul kiri, aksi kanan — lebar sama dengan area
             tabel di bawah agar judul sejajar dengan ujung kiri tabel ── */}
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-3 lg:max-w-[95vw]">
        <div className="min-w-0">
          {detail ? (
            <>
              <button
                onClick={() => setDetail(null)}
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke daftar kecamatan
              </button>
              <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Layers className="h-5 w-5 text-primary" />
                Detail Pekon — {detail.wilayah}
              </h1>
              <p className="text-xs text-slate-500">
                Import Excel <b>detail distrik</b> (berisi pekon kecamatan ini) atau isi manual.
                Kode pekon = 10 digit (diawali {digits(detail.kode)}).
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold text-slate-900">Edit Data — {label}</h1>
              <p className="text-xs text-slate-500">
                <b>Import Excel</b> agregat (kecamatan). Klik <b>Detail</b> di kanan tiap kecamatan
                untuk mengelola / import data pekonnya di halaman tersendiri.{' '}
                {isJK && 'Kolom Jumlah dihitung otomatis. '}
                Kode 6 digit = kecamatan, 10 digit = pekon. Klik{' '}
                <Star className="inline h-3 w-3 fill-amber-400 text-amber-400" /> pada judul
                kolom untuk menampilkannya sebagai <b>kartu statistik beranda</b>.
              </p>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            asChild
            title={`Unduh data ${label} tersimpan sebagai Excel`}
          >
            <a
              href={`/api/admin/demografi/export?kategori=${encodeURIComponent(kategori)}`}
              download
            >
              <Download className="mr-1.5 h-4 w-4" /> Export Excel
            </a>
          </Button>
          {detail ? (
            <Button variant="outline" onClick={() => setDetail(null)} disabled={saving}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              <X className="mr-1.5 h-4 w-4" /> Batal
            </Button>
          )}
          <Button onClick={save} disabled={saving || loading}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" />
            )}
            Simpan
          </Button>
        </div>
        </div>
      </header>

      {/* ── Isi halaman: toolbar + tabel — nyaris selebar layar agar area edit lega ── */}
      <div className="mx-auto flex min-h-0 w-full flex-1 flex-col gap-3 px-4 py-4 sm:px-6 lg:max-w-[95vw]">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : detail ? (
          // ── Halaman DETAIL (pekon satu kecamatan) ──
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => detailFileRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-1.5 h-4 w-4" />
                  )}
                  Import Excel Detail
                </Button>
                <Button variant="outline" size="sm" onClick={addPekon}>
                  <Plus className="mr-1.5 h-4 w-4" /> Tambah Pekon
                </Button>
                <Button variant="outline" size="sm" onClick={addCol}>
                  <Plus className="mr-1.5 h-4 w-4" /> Kolom
                </Button>
                <input
                  ref={detailFileRef}
                  type="file"
                  accept=".xlsx"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    importDetail(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">{detailRows.length} pekon</span>
            </div>

            <EditGrid
              rows={detailRows}
              kolom={kolom}
              isJK={isJK}
              onKode={kodeSetter(setPekonRows)}
              onWilayah={wilayahSetter(setPekonRows)}
              onCell={setPekonCell}
              onRemove={remover(setPekonRows)}
              onRenameCol={renameCol}
              onRemoveCol={removeCol}
              highlight={highlight}
              onToggleHighlight={toggleHighlight}
              kodePlaceholder="10 digit"
              emptyText="Belum ada pekon. Import Excel detail atau klik “Tambah Pekon”."
            />
          </>
        ) : (
          // ── Halaman UTAMA (kecamatan) ──
          <>
            {/* ── Banner kartu statistik beranda: replika kartu putih di atas
                   latar biru (senada hero beranda) + pengaturan ikon ── */}
            <div
              className="relative flex flex-wrap items-center gap-x-6 gap-y-4 overflow-hidden rounded-2xl px-5 py-4 text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)' }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 80% 30%, white 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              {highlight ? (
                <>
                  {/* Replika kartu — persis tampilan di beranda */}
                  {(() => {
                    const IkonKartu = getIcon(kartuIkon);
                    return (
                      <div className="relative z-10 w-52 shrink-0 rounded-2xl bg-white p-4 shadow-xl">
                        <div
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md',
                            warnaPreset(kartuWarna).accentBg,
                          )}
                        >
                          <IkonKartu className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tabular-nums text-slate-900">
                          {previewTotal.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">
                          {labelKolom(highlight)}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Keterangan + pengaturan ikon */}
                  <div className="relative z-10 min-w-56 flex-1">
                    <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                      <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                      Kartu Statistik Beranda
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      Kolom “{labelKolom(highlight)}” tampil sebagai kartu di beranda
                    </p>
                    <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-white/70">
                      Angka kartu mengikuti total kolom di seluruh wilayah dan ikut
                      berubah saat data diedit. Perubahan diterapkan saat klik{' '}
                      <b>Simpan</b>.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-medium text-white/80">Ikon kartu:</span>
                      {/* text-slate-700: tanpa ini teks tombol mewarisi putih dari
                          banner dan hilang di atas latar putih tombol. */}
                      <div className="w-36 text-slate-700">
                        <IconColumnInput value={kartuIkon} onChange={setKartuIkon} elevated />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="relative z-10 text-sm leading-relaxed text-white/90">
                  Klik ikon{' '}
                  <Star className="inline h-3.5 w-3.5 fill-amber-300 text-amber-300" /> pada
                  judul kolom di tabel untuk memilih <b>satu</b> kolom yang tampil sebagai{' '}
                  <b>kartu statistik beranda</b> — pratinjau kartunya akan muncul di sini.
                </p>
              )}
            </div>

            {/* ── Toolbar aksi tabel ── */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mainFileRef.current?.click()}
                  disabled={importing}
                  title="Import satu atau beberapa file Excel (.xlsx)"
                >
                  {importing ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-1.5 h-4 w-4" />
                  )}
                  Import Excel
                </Button>
                <Button variant="outline" size="sm" onClick={addKec}>
                  <Plus className="mr-1.5 h-4 w-4" /> Tambah Kecamatan
                </Button>
                <Button variant="outline" size="sm" onClick={addCol}>
                  <Plus className="mr-1.5 h-4 w-4" /> Kolom
                </Button>
                <input
                  ref={mainFileRef}
                  type="file"
                  accept=".xlsx"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    importMain(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {kecRows.length} kecamatan · {pekonRows.length} pekon
              </span>
            </div>

            <EditGrid
              rows={kecRows}
              kolom={kolom}
              isJK={isJK}
              onKode={kodeSetter(setKecRows)}
              onWilayah={wilayahSetter(setKecRows)}
              onCell={setKecCell}
              onRemove={remover(setKecRows)}
              onRenameCol={renameCol}
              onRemoveCol={removeCol}
              highlight={highlight}
              onToggleHighlight={toggleHighlight}
              detailCounts={detailCounts}
              onDetail={(r) => setDetail({ kode: digits(r.kode), wilayah: r.wilayah || 'Kecamatan' })}
              kodePlaceholder="6 digit"
              emptyText="Belum ada kecamatan. Import Excel atau klik “Tambah Kecamatan”."
            />
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
