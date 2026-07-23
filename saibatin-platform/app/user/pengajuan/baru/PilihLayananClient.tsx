'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';
import { getIcon } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import {
  LAYANAN_PERMOHONAN,
  KATEGORI_LAYANAN,
} from '@/lib/permohonan-layanan';

/**
 * Pemilih layanan permohonan untuk warga/OPD di dashboard.
 * Menggantikan grid kartu di halaman publik /permohonan-online — bedanya tiap
 * kartu kini menuju HALAMAN sendiri, bukan membuka modal.
 */
export function PilihLayananClient({
  kataKunciAwal = '',
}: {
  kataKunciAwal?: string;
}) {
  const [q, setQ] = useState(kataKunciAwal);
  const [kategori, setKategori] = useState('all');
  // Admin bisa menyembunyikan layanan tertentu (dashboard → Pengaturan
  // Pelayanan). Perilaku ini dipertahankan dari halaman lama.
  const [tersembunyi, setTersembunyi] = useState<Set<string>>(new Set());

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const res = await fetch('/api/static-content?keys=pelayanan.visibilitas');
        const j = await res.json();
        const hidden = j.data?.items?.['pelayanan.visibilitas']?.hidden;
        if (!batal && Array.isArray(hidden)) setTersembunyi(new Set(hidden));
      } catch {
        // Gagal memuat = tampilkan semua layanan; bukan kondisi fatal.
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  const hasil = useMemo(() => {
    const cari = q.trim().toLowerCase();
    return LAYANAN_PERMOHONAN.filter((l) => {
      if (tersembunyi.has(l.slug) || tersembunyi.has(l.title)) return false;
      if (kategori !== 'all' && l.category !== kategori) return false;
      if (!cari) return true;
      return (
        l.title.toLowerCase().includes(cari) ||
        l.description.toLowerCase().includes(cari)
      );
    });
  }, [q, kategori, tersembunyi]);

  return (
    <>
      {/* Pencarian */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari layanan — misalnya KTP, akta kelahiran, kartu keluarga…"
          className="h-11 pl-10"
        />
      </div>

      {/* Filter kategori */}
      <div className="mb-6 flex flex-wrap gap-2">
        {KATEGORI_LAYANAN.map((k) => {
          const Ikon = getIcon(k.icon);
          const aktif = kategori === k.id;
          return (
            <button
              key={k.id}
              onClick={() => setKategori(k.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                aktif
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {Ikon && <Ikon className="h-3.5 w-3.5" />}
              {k.name}
            </button>
          );
        })}
      </div>

      {hasil.length === 0 ? (
        <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Tidak ada layanan yang cocok dengan pencarian Anda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((l) => {
            const Ikon = getIcon(l.icon);
            return (
              <Link
                key={l.slug}
                href={`/user/pengajuan/baru/${l.slug}`}
                className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div
                  className={cn(
                    'mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                    l.color,
                  )}
                >
                  {Ikon && <Ikon className="h-5 w-5" />}
                </div>
                <h3 className="font-semibold leading-snug text-foreground">
                  {l.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {l.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Ajukan
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
