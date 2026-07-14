'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Check, X, Search, Shapes, Pencil, TableProperties } from 'lucide-react';
import { ICON_MAP, ICON_NAMES, getIcon } from '@/lib/icon-map';
import { DEMOGRAFI_KATEGORI, getDemografiKategori } from '@/lib/demografi-kategori';
import {
  KARTU_STATISTIK_KUNCI,
  DEFAULT_KARTU,
  WARNA_PRESET,
  warnaPreset,
  labelKolom,
  normalizeKartu,
  type KartuStatistik,
} from '@/lib/beranda-statistik';
import { refreshStaticContent } from '@/lib/use-static-content';
import { DemografiEditor } from '@/components/dashboard/demografi-editor';

const fmt = (n: number) => (n ?? 0).toLocaleString('id-ID');

interface KategoriData {
  kolom: string[];
  /** Total tiap kolom se-kabupaten (untuk pratinjau angka & badge). */
  total: Record<string, number>;
}

/**
 * Editor layar penuh untuk 6 kartu "Statistik Demografi" di beranda.
 * Admin mengubah judul, ikon, warna, dan sumber data (kategori + kolom) tiap
 * kartu — angka kartu mengikuti kolom yang dipilih. Dibuka dari mode edit beranda.
 */
export function StatistikKartuEditor({
  open,
  initialIndex,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Kartu yang diklik — di-scroll & disorot saat editor dibuka. */
  initialIndex?: number;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [draft, setDraft] = useState<KartuStatistik[]>(DEFAULT_KARTU);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cache, setCache] = useState<Record<string, KategoriData>>({});
  // Editor angka demografi (kategori tertentu) — dibuka dari tombol per kartu.
  const [angkaKategori, setAngkaKategori] = useState<string | null>(null);

  // Muat konfigurasi kartu tersimpan (default + override DB).
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/static-content?keys=${encodeURIComponent(KARTU_STATISTIK_KUNCI)}`)
      .then((r) => r.json())
      .then((j) => {
        const konten = j.data?.items?.[KARTU_STATISTIK_KUNCI] as { kartu?: unknown } | undefined;
        setDraft(normalizeKartu(konten?.kartu));
      })
      .catch(() => setDraft(DEFAULT_KARTU))
      .finally(() => setLoading(false));
  }, [open]);

  // Ambil kolom + total tiap kategori yang dipakai (untuk dropdown & pratinjau).
  const ensureKategori = useCallback(
    (kategori: string) => {
      if (!kategori || cache[kategori]) return;
      setCache((c) => ({ ...c, [kategori]: { kolom: [], total: {} } })); // tandai loading
      fetch(`/api/demografi?kategori=${encodeURIComponent(kategori)}`)
        .then((r) => r.json())
        .then((j) => {
          const kolom: string[] = j.data?.kolom ?? [];
          const items: { data: Record<string, number> }[] = j.data?.items ?? [];
          const total: Record<string, number> = {};
          for (const k of kolom) total[k] = items.reduce((a, r) => a + (Number(r.data?.[k]) || 0), 0);
          setCache((c) => ({ ...c, [kategori]: { kolom, total } }));
        })
        .catch(() => setCache((c) => ({ ...c, [kategori]: { kolom: [], total: {} } })));
    },
    [cache],
  );

  useEffect(() => {
    if (loading) return;
    for (const k of new Set(draft.map((d) => d.kategori))) ensureKategori(k);
  }, [loading, draft, ensureKategori]);

  // Scroll ke kartu yang diklik saat editor terbuka.
  useEffect(() => {
    if (loading || initialIndex == null) return;
    const el = document.getElementById(`kartu-editor-${initialIndex}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [loading, initialIndex]);

  // Kunci scroll halaman di belakang selama editor terbuka.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const setCard = (idx: number, patch: Partial<KartuStatistik>) =>
    setDraft((d) => d.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const previewValue = (c: KartuStatistik) => cache[c.kategori]?.total?.[c.kolom] ?? 0;
  const previewBadge = (c: KartuStatistik) => {
    if (!c.badgeKolom) return undefined;
    const base = cache[c.kategori]?.total?.[c.badgeKolom] ?? 0;
    return base > 0 ? `${Math.round((previewValue(c) / base) * 100)}%` : undefined;
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/static-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kunci: KARTU_STATISTIK_KUNCI, konten: { kartu: draft } }),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      toast.success('Kartu statistik disimpan');
      refreshStaticContent();
      onSaved?.();
      onClose();
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  // Dirender via portal ke <body> agar `fixed` benar-benar relatif ke viewport
  // (bukan terjebak transform framer-motion section beranda) & stacking rapi.
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Overlay editor — disembunyikan saat modal "Edit angka" terbuka supaya
          tabelnya tidak tertutup editor ini. */}
      <div className={cn('fixed inset-0 z-[100] flex flex-col bg-slate-50', angkaKategori && 'hidden')}>
        {/* Header lengket */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-slate-900">Atur Kartu Statistik Demografi</h1>
          <p className="truncate text-xs text-slate-500">
            Ubah judul, ikon, warna, dan sumber data tiap kartu di beranda.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="mr-1.5 h-4 w-4" /> Tutup
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
            Simpan
          </Button>
        </div>
      </header>

      {/* Isi */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {draft.map((card, idx) => (
              <CardEditor
                key={idx}
                idx={idx}
                card={card}
                highlight={idx === initialIndex}
                kolomOptions={cache[card.kategori]?.kolom ?? []}
                previewValue={previewValue(card)}
                previewBadge={previewBadge(card)}
                onChange={(patch) => setCard(idx, patch)}
                onEditAngka={() => setAngkaKategori(card.kategori)}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Editor angka demografi (import/manual) untuk kategori kartu tertentu.
          Di luar overlay agar tetap tampil saat overlay disembunyikan. */}
      {angkaKategori && (
        <DemografiEditor
          kategori={angkaKategori}
          label={getDemografiKategori(angkaKategori)?.label ?? angkaKategori}
          open
          onOpenChange={(o) => {
            if (!o) setAngkaKategori(null);
          }}
          onSaved={() => {
            // Segarkan pratinjau angka kartu (invalidasi cache kategori).
            setCache((c) => {
              const next = { ...c };
              delete next[angkaKategori];
              return next;
            });
            ensureKategori(angkaKategori);
            onSaved?.();
          }}
        />
      )}
    </>,
    document.body,
  );
}

/** Satu blok editor kartu: pratinjau di kiri, form di kanan. */
function CardEditor({
  idx,
  card,
  highlight,
  kolomOptions,
  previewValue,
  previewBadge,
  onChange,
  onEditAngka,
}: {
  idx: number;
  card: KartuStatistik;
  highlight: boolean;
  kolomOptions: string[];
  previewValue: number;
  previewBadge?: string;
  onChange: (patch: Partial<KartuStatistik>) => void;
  onEditAngka: () => void;
}) {
  const preset = warnaPreset(card.warna);
  const Icon = getIcon(card.icon);
  // Pastikan nilai kolom/badge yang tersimpan tetap muncul walau belum ter-load.
  const kolomList = useMemo(() => {
    const s = new Set(kolomOptions);
    if (card.kolom) s.add(card.kolom);
    if (card.badgeKolom) s.add(card.badgeKolom);
    return [...s];
  }, [kolomOptions, card.kolom, card.badgeKolom]);

  return (
    <section
      id={`kartu-editor-${idx}`}
      className={cn(
        'rounded-2xl border bg-white p-4 transition-colors',
        highlight ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200',
      )}
    >
      {/* Pratinjau kartu (mirip tampilan beranda) */}
      <div className="mb-4 flex items-center gap-4 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-transparent p-4">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm', preset.accentBg)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[1.4rem] font-bold leading-none text-slate-900">{fmt(previewValue)}</p>
          <p className="mt-1 truncate text-[0.66rem] font-semibold uppercase tracking-widest text-slate-500">
            {card.title || 'Tanpa Judul'}
          </p>
        </div>
        {previewBadge && (
          <span className={cn('ml-auto rounded-full border border-primary/10 bg-white px-2.5 py-1 text-xs font-bold shadow-sm', preset.accent)}>
            {previewBadge}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Judul */}
        <div className="space-y-1.5">
          <Label>Judul kartu</Label>
          <Input
            value={card.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="mis. Jumlah Penduduk"
          />
        </div>

        {/* Ikon + Warna */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Ikon</Label>
            <IconPicker value={card.icon} onChange={(v) => onChange({ icon: v })} />
          </div>
          <div className="space-y-1.5">
            <Label>Warna</Label>
            <WarnaPicker value={card.warna} onChange={(v) => onChange({ warna: v })} />
          </div>
        </div>

        {/* Sumber data: kategori + kolom */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Kategori data</Label>
            <SelectBox
              value={card.kategori}
              onChange={(v) => onChange({ kategori: v, kolom: '', badgeKolom: undefined })}
              placeholder="— Pilih kategori —"
              options={DEMOGRAFI_KATEGORI.map((k) => ({ value: k.slug, label: k.label }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Kolom (angka)</Label>
            <SelectBox
              value={card.kolom}
              onChange={(v) => onChange({ kolom: v })}
              placeholder="— Pilih kolom —"
              options={kolomList.map((k) => ({ value: k, label: labelKolom(k) }))}
            />
          </div>
        </div>

        {/* Badge persentase (opsional) */}
        <div className="space-y-1.5">
          <Label>Badge persentase (opsional)</Label>
          <SelectBox
            value={card.badgeKolom ?? ''}
            onChange={(v) => onChange({ badgeKolom: v || undefined })}
            placeholder="— Tanpa badge —"
            options={kolomList.map((k) => ({ value: k, label: `Persen dari ${labelKolom(k)}` }))}
          />
          <p className="text-[0.7rem] text-slate-400">
            Menampilkan persentase = nilai kolom ÷ total kolom acuan (mis. Laki-laki dari Jumlah).
          </p>
        </div>

        {/* Edit angka data demografi kategori ini */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <TableProperties className="h-3.5 w-3.5" /> Angka diambil dari data demografi
          </span>
          <Button variant="outline" size="sm" onClick={onEditAngka} disabled={!card.kategori}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit angka
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Dropdown bergaya konsisten dengan input lain (Radix Select).
 *  Pilihan kosong diwakili sentinel karena SelectItem tak boleh bernilai "". */
const SELECT_NONE = '__none__';
function SelectBox({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Label untuk pilihan kosong, mis. "— Pilih kategori —". */
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select
      value={value || SELECT_NONE}
      onValueChange={(v) => onChange(v === SELECT_NONE ? '' : v)}
    >
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={SELECT_NONE}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Pemilih warna preset (swatch). */
function WarnaPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(WARNA_PRESET).map(([key, p]) => (
        <button
          key={key}
          type="button"
          title={p.label}
          onClick={() => onChange(key)}
          className={cn(
            'h-8 w-8 rounded-lg shadow-sm ring-offset-2 transition-transform hover:scale-105',
            p.accentBg,
            value === key && 'ring-2 ring-slate-900',
          )}
        />
      ))}
    </div>
  );
}

/** Pemilih ikon: tombol + dialog grid ikon dengan pencarian. */
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const Selected = value ? ICON_MAP[value] : null;
  const filtered = ICON_NAMES.filter((n) => n.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-full justify-start gap-2"
        title="Pilih ikon"
      >
        {Selected ? (
          <Selected className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <Shapes className="h-4 w-4 shrink-0 text-slate-300" />
        )}
        <span className="truncate text-xs">{value || 'Pilih ikon'}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih Ikon</DialogTitle>
            <DialogDescription>Klik salah satu ikon untuk kartu ini.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari ikon (mis. users, home, id)..."
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="grid max-h-72 grid-cols-6 gap-2 overflow-y-auto py-1">
            {filtered.map((name) => {
              const Icon = ICON_MAP[name];
              const active = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-xl border transition-colors',
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-6 py-6 text-center text-sm text-slate-400">Ikon tidak ditemukan.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
