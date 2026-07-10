'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PELAYANAN_LIST,
  PELAYANAN_KATEGORI,
} from '@/lib/pelayanan-list';

/**
 * Pengaturan layanan mana yang boleh tampil di halaman Permohonan Online publik.
 * Menyimpan daftar modalType yang DISEMBUNYIKAN ke StaticContent via API admin.
 */
export function PengaturanPelayanan() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pelayanan-visibilitas')
      .then((r) => r.json())
      .then((j) => {
        const h = j.data?.hidden;
        if (Array.isArray(h)) setHidden(new Set(h));
      })
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, typeof PELAYANAN_LIST> = {};
    for (const item of PELAYANAN_LIST) {
      (g[item.category] ??= []).push(item);
    }
    return g;
  }, []);

  const visibleCount = PELAYANAN_LIST.length - hidden.size;

  const toggle = (modalType: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(modalType)) next.delete(modalType);
      else next.add(modalType);
      return next;
    });
  };

  const setAll = (show: boolean) => {
    setHidden(show ? new Set() : new Set(PELAYANAN_LIST.map((p) => p.modalType)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pelayanan-visibilitas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: [...hidden] }),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      toast.success('Pengaturan pelayanan disimpan');
    } catch {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Ringkasan + aksi massal */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-sm text-slate-700">
          <b>{visibleCount}</b> dari {PELAYANAN_LIST.length} layanan tampil di{' '}
          <b>Permohonan Online</b>. Hilangkan centang untuk menyembunyikan.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAll(true)}>
            <Eye className="h-4 w-4 mr-1.5" /> Tampilkan semua
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAll(false)}>
            <EyeOff className="h-4 w-4 mr-1.5" /> Sembunyikan semua
          </Button>
        </div>
      </div>

      {/* Daftar per kategori */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {PELAYANAN_KATEGORI[cat] ?? cat}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => {
                const shown = !hidden.has(item.modalType);
                return (
                  <label
                    key={item.modalType}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                      shown
                        ? 'border-slate-200 hover:border-primary/40'
                        : 'border-dashed border-slate-200 bg-slate-50 opacity-70',
                    )}
                  >
                    <Checkbox
                      checked={shown}
                      onCheckedChange={() => toggle(item.modalType)}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        shown ? 'text-slate-800' : 'text-slate-400 line-through',
                      )}
                    >
                      {item.title}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
