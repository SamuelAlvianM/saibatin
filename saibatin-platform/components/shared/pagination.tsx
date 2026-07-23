'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Paginasi bernomor untuk tabel dashboard.
 *
 * Menggantikan load-on-scroll: petugas perlu tahu total data dan bisa melompat
 * ke halaman tertentu. Pencarian & filter dijalankan di server, jadi hasilnya
 * mencakup seluruh data — bukan hanya baris di halaman yang sedang tampil.
 */

/**
 * Deret nomor halaman dengan elipsis, mis. 1 … 3 4 [5] 6 7 … 20.
 * Jangkauan 2 halaman ke kiri & kanan supaya bisa melompat lebih jauh
 * dalam sekali klik.
 */
const JANGKAUAN = 2;

function deretHalaman(aktif: number, total: number): (number | '…')[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);

  const sisi: (number | '…')[] = [1];
  const mulai = Math.max(2, aktif - JANGKAUAN);
  const akhir = Math.min(total - 1, aktif + JANGKAUAN);

  if (mulai > 2) sisi.push('…');
  for (let i = mulai; i <= akhir; i++) sisi.push(i);
  if (akhir < total - 1) sisi.push('…');
  sisi.push(total);

  return sisi;
}

export function Pagination({
  page,
  totalHalaman,
  total,
  limit,
  onChange,
  disabled,
}: {
  page: number;
  totalHalaman: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
  disabled?: boolean;
}) {
  if (total === 0) return null;

  const dari = (page - 1) * limit + 1;
  const sampai = Math.min(page * limit, total);

  const tombol =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
      <p className="text-xs text-slate-500">
        Menampilkan <span className="font-medium text-slate-700">{dari}</span>–
        <span className="font-medium text-slate-700">{sampai}</span> dari{' '}
        <span className="font-medium text-slate-700">{total}</span> data
      </p>

      {totalHalaman > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(page - 1)}
            disabled={disabled || page <= 1}
            aria-label="Halaman sebelumnya"
            className={cn(tombol, 'border-slate-200 bg-white hover:border-primary/40')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {deretHalaman(page, totalHalaman).map((n, i) =>
            n === '…' ? (
              <span key={`sela-${i}`} className="px-1 text-sm text-slate-400">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => onChange(n)}
                disabled={disabled}
                aria-current={n === page ? 'page' : undefined}
                className={cn(
                  tombol,
                  n === page
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40',
                )}
              >
                {n}
              </button>
            ),
          )}

          <button
            onClick={() => onChange(page + 1)}
            disabled={disabled || page >= totalHalaman}
            aria-label="Halaman berikutnya"
            className={cn(tombol, 'border-slate-200 bg-white hover:border-primary/40')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
