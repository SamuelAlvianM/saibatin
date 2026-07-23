'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  PERIODE,
  geserAcuan,
  labelAcuan,
  labelRentang,
  type KodePeriode,
} from '@/lib/periode';

/**
 * Filter periode: pilih satuan waktu, lalu geser maju/mundur.
 *
 * Dipakai bersama halaman Permohonan & Log Aktivitas supaya perilakunya sama.
 * Tombol ‹ › menggeser titik acuan satu periode, jadi petugas bisa melihat
 * minggu lalu / bulan lalu — bukan hanya periode berjalan.
 */
export function FilterPeriode({
  periode,
  acuan,
  onPeriodeChange,
  onAcuanChange,
  disabled,
}: {
  periode: KodePeriode;
  acuan: Date;
  onPeriodeChange: (p: KodePeriode) => void;
  onAcuanChange: (d: Date) => void;
  disabled?: boolean;
}) {
  // "Semua waktu" tidak punya rentang, jadi navigasinya disembunyikan.
  const bisaGeser = periode !== '';
  const kini = new Date();
  // Cegah melompat ke periode yang belum terjadi.
  const diMasaKini =
    bisaGeser && geserAcuan(periode, acuan, 1) > kini && acuan <= kini;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Periode</span>
        <Select
          value={periode || 'semua'}
          onValueChange={(v) => onPeriodeChange((v === 'semua' ? '' : v) as KodePeriode)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODE.map(({ kode, label }) => (
              <SelectItem key={kode || 'semua'} value={kode || 'semua'}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {bisaGeser && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={disabled}
              aria-label="Periode sebelumnya"
              onClick={() => onAcuanChange(geserAcuan(periode, acuan, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="inline-flex h-9 min-w-44 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {labelAcuan(periode, acuan)}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={disabled || diMasaKini}
              aria-label="Periode berikutnya"
              title={diMasaKini ? 'Sudah di periode terkini' : undefined}
              onClick={() => onAcuanChange(geserAcuan(periode, acuan, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-[0.7rem] text-slate-500 sm:text-left sm:pl-11">
            <span className="font-medium text-slate-600">Rentang:</span>{' '}
            {labelRentang(periode, acuan)}
          </p>
        </div>
      )}
    </div>
  );
}
