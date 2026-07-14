'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TimePicker } from '@/components/ui/time-picker';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Check, Clock, CalendarX2, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HARI_LABEL,
  defaultJamLayanan,
  type JamLayananConfig,
} from '@/lib/jam-layanan';

/** Urutan tampilan: Senin dulu (indeks data tetap 0=Minggu … 6=Sabtu). */
const URUTAN_HARI = [1, 2, 3, 4, 5, 6, 0];

/** Saklar kecil bergaya iOS (proyek belum punya komponen Switch). */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-success' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  );
}

/**
 * Pengaturan jam pembuatan permohonan (ala jam buka Google Maps):
 * master switch, per-hari buka/tutup + jam, terapkan massal, tanggal libur.
 * Berlaku untuk warga & staff; hanya admin (level 1) yang boleh mengubah.
 */
export function JamLayananEditor() {
  const [cfg, setCfg] = useState<JamLayananConfig>(defaultJamLayanan());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Bulk apply: hari-hari terpilih + jam yang akan diterapkan sekaligus.
  const [bulkDays, setBulkDays] = useState<Set<number>>(new Set());
  const [bulkMulai, setBulkMulai] = useState('08:00');
  const [bulkSelesai, setBulkSelesai] = useState('16:00');

  const [newHoliday, setNewHoliday] = useState('');

  useEffect(() => {
    fetch('/api/admin/jam-layanan')
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setCfg(j.data as JamLayananConfig);
      })
      .catch(() => toast.error('Gagal memuat jam layanan'))
      .finally(() => setLoading(false));
  }, []);

  const setDay = (idx: number, patch: Partial<JamLayananConfig['days'][number]>) =>
    setCfg((c) => ({
      ...c,
      days: c.days.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    }));

  const toggleBulkDay = (idx: number) =>
    setBulkDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  const applyBulk = () => {
    if (bulkDays.size === 0) {
      toast.error('Pilih dulu hari yang mau diterapkan');
      return;
    }
    setCfg((c) => ({
      ...c,
      days: c.days.map((d, i) =>
        bulkDays.has(i) ? { buka: true, mulai: bulkMulai, selesai: bulkSelesai } : d,
      ),
    }));
    toast.success(`Jam ${bulkMulai}–${bulkSelesai} diterapkan ke ${bulkDays.size} hari`);
  };

  const addHoliday = () => {
    if (!newHoliday) return;
    setCfg((c) => ({
      ...c,
      holidays: c.holidays.includes(newHoliday)
        ? c.holidays
        : [...c.holidays, newHoliday].sort(),
    }));
    setNewHoliday('');
  };

  const save = async () => {
    for (const [i, d] of cfg.days.entries()) {
      if (d.buka && d.mulai >= d.selesai) {
        toast.error(`Jam ${HARI_LABEL[i]} tidak valid: mulai harus sebelum selesai`);
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/jam-layanan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      toast.success('Jam layanan disimpan');
    } catch {
      toast.error('Gagal menyimpan jam layanan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Master switch */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Clock className="h-4 w-4 text-primary" /> Batasi jam pembuatan permohonan
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Saat aktif, permohonan baru (warga & staff) hanya bisa dibuat pada jam di
            bawah. Permohonan yang sudah ada tetap bisa diproses kapan pun.
          </p>
        </div>
        <Toggle
          checked={cfg.enabled}
          onChange={(v) => setCfg((c) => ({ ...c, enabled: v }))}
          label="Batasi jam pembuatan permohonan"
        />
      </div>

      <div className={cn('space-y-5', !cfg.enabled && 'pointer-events-none opacity-50')}>
        {/* Per-hari, urut Senin–Minggu */}
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {URUTAN_HARI.map((idx) => {
            const d = cfg.days[idx];
            return (
              <div key={idx} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <Toggle
                  checked={d.buka}
                  onChange={(v) => setDay(idx, { buka: v })}
                  label={`Buka hari ${HARI_LABEL[idx]}`}
                />
                <span className="w-16 text-sm font-medium text-slate-800">
                  {HARI_LABEL[idx]}
                </span>
                {d.buka ? (
                  <div className="flex items-center gap-2">
                    <TimePicker
                      value={d.mulai}
                      onChange={(v) => setDay(idx, { mulai: v })}
                      className="h-8 w-[92px]"
                    />
                    <span className="text-xs text-slate-400">s/d</span>
                    <TimePicker
                      value={d.selesai}
                      onChange={(v) => setDay(idx, { selesai: v })}
                      className="h-8 w-[92px]"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">Tutup</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Terapkan massal */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Copy className="h-3.5 w-3.5" /> Terapkan jam sekaligus
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {URUTAN_HARI.map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleBulkDay(idx)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  bulkDays.has(idx)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40',
                )}
              >
                {HARI_LABEL[idx].slice(0, 3)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TimePicker value={bulkMulai} onChange={setBulkMulai} className="h-8 w-[92px]" />
            <span className="text-xs text-slate-400">s/d</span>
            <TimePicker value={bulkSelesai} onChange={setBulkSelesai} className="h-8 w-[92px]" />
            <Button type="button" variant="outline" size="sm" onClick={applyBulk}>
              Terapkan
            </Button>
          </div>
        </div>

        {/* Tanggal libur khusus */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <CalendarX2 className="h-3.5 w-3.5" /> Tanggal libur khusus
          </p>
          <div className="mb-3 flex items-center gap-2">
            <DatePicker
              value={newHoliday}
              onChange={setNewHoliday}
              placeholder="Pilih tanggal libur"
              className="w-48"
            />
            <Button type="button" variant="outline" size="sm" onClick={addHoliday} disabled={!newHoliday}>
              Tambah
            </Button>
          </div>
          {cfg.holidays.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada tanggal libur khusus.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {cfg.holidays.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {h}
                  <button
                    type="button"
                    aria-label={`Hapus libur ${h}`}
                    onClick={() =>
                      setCfg((c) => ({
                        ...c,
                        holidays: c.holidays.filter((x) => x !== h),
                      }))
                    }
                    className="text-slate-400 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Simpan Jam Layanan
        </Button>
      </div>
    </div>
  );
}
