'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { RichEditor } from '@/components/shared/rich-editor';
import { ImagePickerField } from '@/components/media/image-picker-field';
import { Plus, Trash2, Search, Shapes, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICON_MAP, ICON_NAMES } from '@/lib/icon-map';
import type { StaticField } from '@/lib/static-content-registry';

/** Satu field form sesuai tipe di registry konten statis.
 *  Dipakai bersama oleh editor dashboard dan editor inline (mode edit). */
export function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: StaticField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === 'text') {
    return (
      <div className="space-y-1.5">
        <Label>{field.label}</Label>
        <Input
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <Label>{field.label}</Label>
        <Textarea
          rows={3}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  if (field.type === 'list') {
    // Tiap poin = satu input terpisah (lebih jelas daripada satu textarea).
    const list = Array.isArray(value) ? (value as string[]) : [];
    const setItem = (idx: number, v: string) =>
      onChange(list.map((s, i) => (i === idx ? v : s)));
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <div className="space-y-2">
          {list.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 text-center text-xs font-bold text-slate-400 shrink-0">
                {idx + 1}
              </span>
              <Input
                value={item}
                onChange={(e) => setItem(idx, e.target.value)}
                placeholder={`Poin ${idx + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
                title="Hapus poin"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-xs text-muted-foreground pl-7">Belum ada poin.</p>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, ''])}>
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Poin
        </Button>
      </div>
    );
  }

  if (field.type === 'richtext') {
    return (
      <div className="space-y-1.5">
        <Label>{field.label}</Label>
        <RichEditor
          value={String(value ?? '')}
          onChange={onChange}
          placeholder="Tulis konten di sini..."
        />
      </div>
    );
  }

  // items — tiap baris jadi KARTU: gambar/ikon di kiri, kolom teks bertumpuk
  // lebar penuh di kanan (bukan lagi grid sempit sejajar), supaya area ketik
  // lega — termasuk saat diedit langsung dari halaman utama (mode edit).
  const rows = Array.isArray(value) ? (value as Record<string, string>[]) : [];
  const cols = field.itemFields ?? [];
  const imageCol = cols.find((c) => c.type === 'image');
  const catatan = field.catatan;
  const textCols = cols.filter((c) => c.type !== 'image');
  // Kolom bernuansa deskripsi → textarea yang bisa memanjang.
  const isLongText = (name: string) => /desc|ket|penjelasan|subtitle|isi/i.test(name);
  const setRow = (idx: number, name: string, v: string) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [name]: v } : r));
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      {catatan && (
        <p className="flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800 ring-1 ring-blue-100">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{catatan}</span>
        </p>
      )}
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-primary">
                Baris {idx + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-destructive hover:text-destructive"
                onClick={() => onChange(rows.filter((_, i) => i !== idx))}
                title="Hapus baris"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {imageCol && (
                <div className="w-full shrink-0 sm:w-36">
                  <ImageColumnInput
                    label={imageCol.label}
                    value={row[imageCol.name] ?? ''}
                    onChange={(v) => setRow(idx, imageCol.name, v)}
                    aspect={imageCol.aspect}
                    hint={imageCol.hint}
                  />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-2.5">
                {textCols.map((col) => (
                  <div key={col.name} className="space-y-1">
                    <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
                      {col.label}
                    </p>
                    {col.type === 'icon' ? (
                      <IconColumnInput
                        value={row[col.name] ?? ''}
                        onChange={(v) => setRow(idx, col.name, v)}
                      />
                    ) : col.type === 'parent' ? (
                      // SelectItem Radix tak boleh bernilai "" — pakai sentinel
                      // untuk pilihan "Paling atas" (tanpa induk).
                      <Select
                        value={(row[col.name] ?? '') || '__root__'}
                        onValueChange={(v) =>
                          setRow(idx, col.name, v === '__root__' ? '' : v)
                        }
                      >
                        <SelectTrigger className="w-full bg-white" title={col.label}>
                          <SelectValue placeholder="— Paling atas —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__root__">— Paling atas —</SelectItem>
                          {rows.map((r, ri) =>
                            ri !== idx && r.jabatan ? (
                              <SelectItem key={ri} value={r.jabatan}>
                                {r.jabatan}
                              </SelectItem>
                            ) : null,
                          )}
                        </SelectContent>
                      </Select>
                    ) : isLongText(col.name) ? (
                      <Textarea
                        rows={3}
                        value={row[col.name] ?? ''}
                        onChange={(e) => setRow(idx, col.name, e.target.value)}
                        placeholder={col.label}
                        className="bg-white"
                      />
                    ) : (
                      <Input
                        value={row[col.name] ?? ''}
                        onChange={(e) => setRow(idx, col.name, e.target.value)}
                        placeholder={col.label}
                        className="bg-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...rows, Object.fromEntries(cols.map((c) => [c.name, '']))])
        }
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Tambah Baris
      </Button>
    </div>
  );
}

/** Kolom gambar dalam editor "items": satu tile preview-sekaligus-tombol.
 *  `aspect` mengunci rasio crop saat unggah (agar seragam); `hint` = keterangan
 *  ukuran singkat di bawah tile. */
function ImageColumnInput({
  label,
  value,
  onChange,
  aspect,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspect?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <ImagePickerField
        label={label}
        value={value}
        onChange={onChange}
        aspect={aspect}
        // Bila rasio disarankan diketahui, tile ikut memakainya supaya pratinjau
        // di editor mencerminkan bentuk akhir di carousel.
        className={cn('w-full', aspect ? '' : 'aspect-[4/3]')}
        style={aspect ? { aspectRatio: String(aspect) } : undefined}
      />
      {hint && (
        <p className="text-center text-[0.65rem] font-medium text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Kolom pemilih ikon: tombol menampilkan ikon terpilih + dialog grid ikon.
 * Diekspor — dipakai juga editor demografi (ikon kartu statistik beranda). */
export function IconColumnInput({
  value,
  onChange,
  /** true → dialog dibuka di atas panel/portal ber-z-index tinggi
   *  (mis. editor demografi layar penuh di z-[120]). */
  elevated = false,
}: {
  value: string;
  onChange: (v: string) => void;
  elevated?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const Selected = value ? ICON_MAP[value] : null;
  const filtered = ICON_NAMES.filter((n) =>
    n.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="justify-start gap-2 h-9 w-full"
        title="Pilih ikon"
      >
        {Selected ? (
          <Selected className="h-4 w-4 text-primary shrink-0" />
        ) : (
          <Shapes className="h-4 w-4 text-slate-300 shrink-0" />
        )}
        <span className="truncate text-xs">{value || 'Pilih ikon'}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn('sm:max-w-md', elevated && 'z-[130]')}
          overlayClassName={elevated ? 'z-[130]' : undefined}
        >
          <DialogHeader>
            <DialogTitle>Pilih Ikon</DialogTitle>
            <DialogDescription>
              Klik salah satu ikon di bawah untuk kartu ini.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari ikon (mis. shield, clock, gift)..."
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-6 gap-2 max-h-72 overflow-y-auto py-1">
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
                    'aspect-square rounded-xl border flex items-center justify-center transition-colors',
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
              <p className="col-span-6 text-center text-sm text-slate-400 py-6">
                Ikon tidak ditemukan.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
