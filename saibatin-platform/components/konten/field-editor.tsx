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
import { RichEditor } from '@/components/shared/rich-editor';
import { ImagePickerField } from '@/components/media/image-picker-field';
import { Plus, Trash2, Search, Shapes } from 'lucide-react';
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

  // items — daftar baris dengan kolom dinamis
  const rows = Array.isArray(value) ? (value as Record<string, string>[]) : [];
  const cols = field.itemFields ?? [];
  const setRow = (idx: number, name: string, v: string) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [name]: v } : r));
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
              {cols.map((col) =>
                col.type === 'image' ? (
                  <ImageColumnInput
                    key={col.name}
                    label={col.label}
                    value={row[col.name] ?? ''}
                    onChange={(v) => setRow(idx, col.name, v)}
                  />
                ) : col.type === 'icon' ? (
                  <IconColumnInput
                    key={col.name}
                    value={row[col.name] ?? ''}
                    onChange={(v) => setRow(idx, col.name, v)}
                  />
                ) : col.type === 'parent' ? (
                  <select
                    key={col.name}
                    value={row[col.name] ?? ''}
                    onChange={(e) => setRow(idx, col.name, e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    title={col.label}
                  >
                    <option value="">— Paling atas —</option>
                    {rows.map((r, ri) =>
                      ri !== idx && r.jabatan ? (
                        <option key={ri} value={r.jabatan}>
                          {r.jabatan}
                        </option>
                      ) : null,
                    )}
                  </select>
                ) : (
                  <Input
                    key={col.name}
                    value={row[col.name] ?? ''}
                    onChange={(e) => setRow(idx, col.name, e.target.value)}
                    placeholder={col.label}
                  />
                ),
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={() => onChange(rows.filter((_, i) => i !== idx))}
              title="Hapus baris"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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

/** Kolom gambar dalam editor "items": satu tile preview-sekaligus-tombol. */
function ImageColumnInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ImagePickerField
      label={label}
      value={value}
      onChange={onChange}
      className="aspect-[4/3] w-full"
    />
  );
}

/** Kolom pemilih ikon: tombol menampilkan ikon terpilih + dialog grid ikon. */
function IconColumnInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
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
        <DialogContent className="sm:max-w-md">
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
