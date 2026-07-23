'use client';

import * as React from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Penampil gambar layar penuh: zoom, putar, geser, dan pindah antar-berkas.
 *
 * Dipakai di dua tempat yang sama-sama menampilkan berkas permohonan —
 * halaman detail (petugas memeriksa) dan formulir pengajuan (warga memastikan
 * unggahannya terbaca). Keduanya memakai komponen ini agar perilakunya sama.
 */

export interface GambarItem {
  src: string;
  judul: string;
}

export function ImageViewer({
  items,
  indexAwal = 0,
  onClose,
}: {
  items: GambarItem[];
  indexAwal?: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = React.useState(indexAwal);
  const [skala, setSkala] = React.useState(1);
  const [putar, setPutar] = React.useState(0);
  const [geser, setGeser] = React.useState({ x: 0, y: 0 });
  const seret = React.useRef<{ x: number; y: number } | null>(null);

  const item = items[idx];

  const reset = React.useCallback(() => {
    setSkala(1);
    setPutar(0);
    setGeser({ x: 0, y: 0 });
  }, []);

  const pindah = React.useCallback(
    (arah: 1 | -1) => {
      setIdx((p) => (p + arah + items.length) % items.length);
      reset();
    },
    [items.length, reset],
  );

  // Pintasan papan ketik — penting saat petugas memeriksa banyak berkas.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && items.length > 1) pindah(1);
      else if (e.key === 'ArrowLeft' && items.length > 1) pindah(-1);
      else if (e.key === '+' || e.key === '=') setSkala((s) => Math.min(6, s + 0.25));
      else if (e.key === '-') setSkala((s) => Math.max(0.25, s - 0.25));
      else if (e.key.toLowerCase() === 'r') setPutar((r) => (r + 90) % 360);
      else if (e.key === '0') reset();
    };
    window.addEventListener('keydown', onKey);
    // Kunci scroll latar selama penampil terbuka.
    const asal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = asal;
    };
  }, [onClose, pindah, reset, items.length]);

  if (!item) return null;

  const tombol =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/25 disabled:opacity-30';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
      // Klik latar menutup; klik gambar/toolbar tidak.
      onClick={onClose}
    >
      {/* Bilah alat */}
      <div
        className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{item.judul}</p>
          {items.length > 1 && (
            <p className="text-xs text-white/50">
              Berkas {idx + 1} dari {items.length}
            </p>
          )}
        </div>

        <button className={tombol} title="Perkecil (−)" onClick={() => setSkala((s) => Math.max(0.25, s - 0.25))}>
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs tabular-nums text-white/70">
          {Math.round(skala * 100)}%
        </span>
        <button className={tombol} title="Perbesar (+)" onClick={() => setSkala((s) => Math.min(6, s + 0.25))}>
          <ZoomIn className="h-4 w-4" />
        </button>
        <button className={tombol} title="Putar kiri" onClick={() => setPutar((r) => (r - 90 + 360) % 360)}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button className={tombol} title="Putar kanan (R)" onClick={() => setPutar((r) => (r + 90) % 360)}>
          <RotateCw className="h-4 w-4" />
        </button>
        <button className={tombol} title="Kembalikan ukuran (0)" onClick={reset}>
          <Maximize2 className="h-4 w-4" />
        </button>
        <a
          className={tombol}
          href={item.src}
          download
          target="_blank"
          rel="noreferrer"
          title="Unduh berkas"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-4 w-4" />
        </a>
        <button className={cn(tombol, 'hover:bg-red-500/70')} title="Tutup (Esc)" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Area gambar */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          // Zoom mengikuti arah gulir — kebiasaan umum penampil gambar.
          setSkala((s) => Math.min(6, Math.max(0.25, s + (e.deltaY < 0 ? 0.2 : -0.2))));
        }}
        onMouseDown={(e) => {
          seret.current = { x: e.clientX - geser.x, y: e.clientY - geser.y };
        }}
        onMouseMove={(e) => {
          if (!seret.current) return;
          setGeser({ x: e.clientX - seret.current.x, y: e.clientY - seret.current.y });
        }}
        onMouseUp={() => (seret.current = null)}
        onMouseLeave={() => (seret.current = null)}
        style={{ cursor: skala > 1 ? 'grab' : 'default' }}
      >
        {items.length > 1 && (
          <>
            <button
              onClick={() => pindah(-1)}
              aria-label="Berkas sebelumnya"
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => pindah(1)}
              aria-label="Berkas berikutnya"
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element -- berkas unggahan
            berukuran & berformat bebas; next/image tidak memberi manfaat di
            penampil yang memang menampilkan berkas aslinya. */}
        <img
          src={item.src}
          alt={item.judul}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
          style={{
            transform: `translate(${geser.x}px, ${geser.y}px) scale(${skala}) rotate(${putar}deg)`,
          }}
        />
      </div>

      <p className="border-t border-white/10 px-4 py-2 text-center text-[0.7rem] text-white/40">
        Gulir untuk zoom · seret untuk menggeser · R putar · 0 kembalikan · Esc tutup
      </p>
    </div>
  );
}

/** Hook pendamping: kelola berkas mana yang sedang dibuka. */
export function useImageViewer() {
  const [buka, setBuka] = React.useState<{ items: GambarItem[]; idx: number } | null>(null);
  return {
    viewer: buka,
    bukaGambar: (items: GambarItem[], idx = 0) => setBuka({ items, idx }),
    tutupGambar: () => setBuka(null),
  };
}
