'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

export interface SearchSelectOption {
  value: string;
  label: string;
}

interface SearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Ikon kecil di kiri pemicu (mis. MapPin). */
  icon?: React.ReactNode;
  id?: string;
}

/** Buang aksen & rapikan spasi agar pencarian toleran terhadap ejaan. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Dropdown yang bisa dicari — pengganti Select bawaan untuk daftar yang panjang
 * (mis. kecamatan). Dibangun dari Popover + input pencarian; tidak memerlukan
 * pustaka command palette tambahan.
 *
 * Aksesibilitas: pola combobox — panah atas/bawah memindah sorotan, Enter
 * memilih, Esc menutup. Fokus langsung ke kotak pencarian saat dibuka.
 */
export function SearchSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Pilih…',
  searchPlaceholder = 'Cari…',
  emptyText = 'Tidak ditemukan.',
  disabled,
  className,
  icon,
  id,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [cari, setCari] = useState('');
  const [sorot, setSorot] = useState(0);
  const daftarRef = useRef<HTMLDivElement>(null);

  const terpilih = options.find((o) => o.value === value);

  const hasil = useMemo(() => {
    const q = norm(cari);
    if (!q) return options;
    return options.filter((o) => norm(o.label).includes(q));
  }, [options, cari]);

  // Reset pencarian & sorotan tiap kali dibuka/ditutup.
  useEffect(() => {
    if (!open) {
      setCari('');
      return;
    }
    setSorot(0);
  }, [open]);

  // Jaga sorotan tetap dalam rentang saat hasil menyusut.
  useEffect(() => {
    setSorot((s) => Math.min(s, Math.max(0, hasil.length - 1)));
  }, [hasil.length]);

  // Pastikan item tersorot selalu terlihat saat navigasi keyboard.
  useEffect(() => {
    const el = daftarRef.current?.querySelector<HTMLElement>(`[data-idx="${sorot}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [sorot]);

  const pilih = (v: string) => {
    onValueChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSorot((s) => Math.min(s + 1, hasil.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSorot((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = hasil[sorot];
      if (item) pilih(item.value);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-input/30 dark:hover:bg-input/50',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {icon}
            <span className={cn('truncate', !terpilih && 'text-muted-foreground')}>
              {terpilih?.label ?? placeholder}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] min-w-[12rem] p-0"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div ref={daftarRef} className="max-h-60 overflow-y-auto p-1">
          {hasil.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            hasil.map((o, i) => (
              <button
                key={o.value}
                type="button"
                data-idx={i}
                onMouseEnter={() => setSorot(i)}
                onClick={() => pilih(o.value)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none',
                  i === sorot && 'bg-accent text-accent-foreground',
                )}
              >
                <Check
                  className={cn(
                    'h-4 w-4 shrink-0',
                    o.value === value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="truncate">{o.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
