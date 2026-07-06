'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditRow {
  _id: string;
  kode: string;
  wilayah: string;
  data: Record<string, number>;
}

let seq = 0;
const nid = () => `r${Date.now().toString(36)}_${seq++}`;

// Level dari panjang kode (sama seperti importer): 6=kecamatan, 10=pekon.
function levelLabel(kode: string): { text: string; cls: string } {
  const d = kode.replace(/\D/g, '');
  if (d.length === 6) return { text: 'Kecamatan', cls: 'bg-primary/10 text-primary' };
  if (d.length === 10) return { text: 'Pekon', cls: 'bg-emerald-50 text-emerald-600' };
  return { text: '—', cls: 'bg-slate-100 text-slate-400' };
}

export function DemografiEditor({
  kategori,
  label,
  open,
  onOpenChange,
  onSaved,
}: {
  kategori: string;
  label: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
}) {
  const [kolom, setKolom] = useState<string[]>([]);
  const [rows, setRows] = useState<EditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/admin/demografi?kategori=${encodeURIComponent(kategori)}`)
      .then((r) => r.json())
      .then((j) => {
        const k: string[] = j.data?.kolom?.length ? j.data.kolom : ['L', 'P', 'JML'];
        setKolom(k);
        setRows(
          (j.data?.rows ?? []).map((r: EditRow) => ({
            _id: nid(),
            kode: r.kode,
            wilayah: r.wilayah,
            data: { ...r.data },
          })),
        );
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [open, kategori]);

  const isJK = useMemo(
    () => kolom.length === 3 && kolom.includes('L') && kolom.includes('P') && kolom.includes('JML'),
    [kolom],
  );

  const patch = (id: string, part: Partial<EditRow>) =>
    setRows((rs) => rs.map((r) => (r._id === id ? { ...r, ...part } : r)));

  const setVal = (id: string, col: string, v: string) => {
    setRows((rs) =>
      rs.map((r) => {
        if (r._id !== id) return r;
        const data = { ...r.data, [col]: Number(v.replace(/\D/g, '')) || 0 };
        // Jenis kelamin: JML otomatis = L + P.
        if (isJK && (col === 'L' || col === 'P')) data.JML = (data.L || 0) + (data.P || 0);
        return { ...r, data };
      }),
    );
  };

  const addRow = () =>
    setRows((rs) => [...rs, { _id: nid(), kode: '', wilayah: '', data: Object.fromEntries(kolom.map((k) => [k, 0])) }]);

  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r._id !== id));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        kategori,
        rows: rows
          .filter((r) => r.wilayah.trim() && r.kode.replace(/\D/g, ''))
          .map((r) => ({ kode: r.kode.replace(/\D/g, ''), wilayah: r.wilayah.trim(), data: r.data })),
      };
      const res = await fetch('/api/admin/demografi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      toast.success('Data demografi disimpan');
      onSaved?.();
      onOpenChange(false);
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Manual — {label}</DialogTitle>
          <DialogDescription>
            Isi seperti Excel. <b>Kode</b> 6 digit = kecamatan, 10 digit = pekon (otomatis jadi turunan
            kecamatan berkode 6 digit pertamanya). {isJK && 'Kolom Jumlah dihitung otomatis.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2 font-semibold">Kode</th>
                  <th className="px-2 py-2 font-semibold">Level</th>
                  <th className="px-2 py-2 font-semibold">Wilayah</th>
                  {kolom.map((k) => (
                    <th key={k} className="px-2 py-2 text-right font-semibold">{k}</th>
                  ))}
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const lv = levelLabel(r.kode);
                  return (
                    <tr key={r._id} className="border-b border-slate-100">
                      <td className="px-2 py-1.5">
                        <Input
                          value={r.kode}
                          inputMode="numeric"
                          onChange={(e) => patch(r._id, { kode: e.target.value.replace(/\D/g, '') })}
                          placeholder="6 / 10 digit"
                          className="h-8 w-28 font-mono text-xs"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-semibold', lv.cls)}>
                          {lv.text}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          value={r.wilayah}
                          onChange={(e) => patch(r._id, { wilayah: e.target.value })}
                          placeholder="Nama wilayah"
                          className="h-8 min-w-40"
                        />
                      </td>
                      {kolom.map((k) => (
                        <td key={k} className="px-2 py-1.5">
                          <Input
                            value={String(r.data[k] ?? 0)}
                            inputMode="numeric"
                            readOnly={isJK && k === 'JML'}
                            onChange={(e) => setVal(r._id, k, e.target.value)}
                            className={cn('h-8 w-20 text-right tabular-nums', isJK && k === 'JML' && 'bg-slate-50 text-slate-500')}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => removeRow(r._id)}
                          className="text-slate-400 hover:text-destructive"
                          title="Hapus baris"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={kolom.length + 4} className="py-8 text-center text-sm text-slate-400">
                      Belum ada baris. Klik “Tambah Baris”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button variant="outline" size="sm" onClick={addRow} disabled={loading}>
            <Plus className="h-4 w-4 mr-1.5" /> Tambah Baris
          </Button>
          <span className="text-xs text-slate-400">{rows.length} baris</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            <X className="h-4 w-4 mr-1.5" /> Batal
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
