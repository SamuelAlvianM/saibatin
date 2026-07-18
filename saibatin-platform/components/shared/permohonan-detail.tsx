'use client';

import { useState } from 'react';
import {
  X, ZoomIn, Paperclip, Clock, CheckCircle2, XCircle, Send, Hourglass,
} from 'lucide-react';

export interface BerkasView {
  label: string;
  path: string;
}

function isImagePath(path: string) {
  return /\.(png|jpe?g|webp|gif)$/i.test(path);
}

/** Galeri berkas permohonan: thumbnail gambar (klik = perbesar) / tautan file. */
export function BerkasGallery({ items }: { items: BerkasView[] }) {
  const [lightbox, setLightbox] = useState<BerkasView | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">Tidak ada berkas.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((b, i) =>
          isImagePath(b.path) ? (
            <button
              key={`${b.path}-${i}`}
              type="button"
              onClick={() => setLightbox(b)}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left hover:border-primary/50 transition-colors"
              title="Klik untuk perbesar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.path}
                alt={b.label}
                loading="lazy"
                className="h-32 w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="block truncate px-2 py-1.5 text-xs text-slate-600 bg-white">{b.label}</span>
            </button>
          ) : (
            <a
              key={`${b.path}-${i}`}
              href={b.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-primary/50 transition-colors"
            >
              <Paperclip className="h-6 w-6 text-primary" />
              <span className="w-full truncate text-center text-xs text-slate-600">{b.label}</span>
            </a>
          )
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
          >
            <X className="h-7 w-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.path}
            alt={lightbox.label}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-3 text-sm text-white/80">{lightbox.label}</p>
        </div>
      )}
    </>
  );
}

interface JourneyProps {
  status: string; // MENUNGGU | DIPROSES | SELESAI | DITOLAK
  createdAt: string | Date;
  prosesAt?: string | Date | null;
  updatedAt: string | Date;
}

const fmtTanggal = (d: string | Date) =>
  new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

/** Journey status permohonan: Diajukan → Diverifikasi → Diproses → Hasil. */
export function PermohonanJourney({ status, createdAt, prosesAt, updatedAt }: JourneyProps) {
  const ditolak = status === 'DITOLAK';
  const selesai = status === 'SELESAI';
  const final = ditolak || selesai;
  const diproses = status === 'DIPROSES' || final;

  const steps = [
    {
      label: 'Diajukan',
      desc: fmtTanggal(createdAt),
      icon: Send,
      done: true,
      active: status === 'MENUNGGU',
    },
    {
      label: 'Diproses Petugas',
      desc: diproses
        ? prosesAt
          ? fmtTanggal(prosesAt)
          : 'Sedang ditangani'
        : 'Menunggu verifikasi',
      icon: Hourglass,
      done: diproses,
      active: status === 'DIPROSES',
    },
    {
      label: ditolak ? 'Ditolak' : 'Selesai',
      desc: final ? fmtTanggal(updatedAt) : 'Menunggu hasil',
      icon: ditolak ? XCircle : selesai ? CheckCircle2 : Clock,
      done: final,
      active: final,
      danger: ditolak,
    },
  ];

  return (
    <ol className="relative flex flex-col gap-0 sm:flex-row sm:gap-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const color = s.done
          ? s.danger
            ? 'bg-destructive text-white border-destructive'
            : 'bg-success text-white border-success'
          : 'bg-white text-slate-400 border-slate-300';
        const line = steps[i + 1]?.done
          ? steps[i + 1].danger
            ? 'bg-destructive'
            : 'bg-success'
          : 'bg-slate-200';
        return (
          <li key={s.label} className="relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
            {/* garis penghubung */}
            {i < steps.length - 1 && (
              <>
                <span className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 sm:hidden ${line}`} />
                <span className={`absolute top-[15px] left-[calc(50%+20px)] hidden h-0.5 w-[calc(100%-40px)] sm:block ${line}`} />
              </>
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${color} ${
                s.active ? 'ring-4 ring-primary/15' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="pb-6 sm:pb-0">
              <p className={`text-sm font-semibold ${s.done ? (s.danger ? 'text-destructive' : 'text-slate-900') : 'text-slate-400'}`}>
                {s.label}
              </p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
