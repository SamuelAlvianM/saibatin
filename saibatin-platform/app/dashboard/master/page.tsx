'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound, Loader2, LockOpen, ShieldAlert } from 'lucide-react';

/**
 * Halaman MASTER — akses tertinggi aplikasi. Satu-satunya jalan membuka
 * kunci permohonan berstatus final (Selesai/Ditolak) agar bisa diproses
 * ulang. Butuh password master (env MASTER_PASSWORD) selain sesi petugas.
 * Sengaja tidak ditautkan dari sidebar — akses langsung via URL ini.
 */
export default function MasterPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [noregister, setNoregister] = useState('');
  const [busy, setBusy] = useState(false);
  const [riwayat, setRiwayat] = useState<string[]>([]);

  const bukaKunci = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, noregister }),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      const msg = j.success?.[0] ?? `Kunci ${noregister} dibuka`;
      toast.success(msg);
      setRiwayat((r) => [msg, ...r]);
      setNoregister('');
    } catch {
      toast.error('Gagal menghubungi server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-4 w-4" /> Halaman Master
        </p>
        <p className="mt-1 leading-relaxed">
          Akses tertinggi aplikasi. Gunakan HANYA untuk membuka kunci permohonan
          yang sudah final (Selesai/Ditolak) bila memang perlu diproses ulang.
          Setiap pembukaan kunci tercatat pada catatan permohonan.
        </p>
      </div>

      <form onSubmit={bukaKunci} className="glass-card space-y-4 rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-slate-900">Buka Kunci Permohonan</h1>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="master-pass">Password Master *</Label>
          <div className="relative">
            <Input
              id="master-pass"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password master aplikasi"
              className="pr-10"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="master-noreg">No. Register Permohonan *</Label>
          <Input
            id="master-noreg"
            value={noregister}
            onChange={(e) => setNoregister(e.target.value)}
            placeholder="No. register permohonan yang terkunci"
            className="font-mono"
            required
          />
          <p className="text-xs text-muted-foreground">
            Lihat kolom No. Register di menu Permohonan (baris berlabel “Terkunci”).
          </p>
        </div>

        <Button type="submit" disabled={busy || !password || !noregister} className="w-full">
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LockOpen className="mr-2 h-4 w-4" />
          )}
          Buka Kunci — kembalikan ke Diproses
        </Button>
      </form>

      {riwayat.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-sm font-semibold text-slate-800">Riwayat sesi ini</p>
          <ul className="space-y-1 text-xs text-slate-500">
            {riwayat.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
