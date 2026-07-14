'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, Lock } from 'lucide-react';

export function ChangePasswordForm() {
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setPasswordLama('');
    setPasswordBaru('');
    setKonfirmasi('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordBaru !== konfirmasi) {
      toast.error('Konfirmasi password tidak sama');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/profil/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordLama, passwordBaru, konfirmasi }),
      });
      const json = await res.json();
      if (json.error?.length) {
        toast.error(json.error[0]);
      } else {
        toast.success(json.success?.[0] ?? 'Password berhasil diubah');
        reset();
      }
    } catch {
      toast.error('Gagal mengubah password, coba lagi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 mt-6">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200/60">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, #2176bd, #1b4b72)' }}
        >
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Ganti Password</h2>
          <p className="text-xs text-slate-500">Demi keamanan, gunakan kombinasi yang sulit ditebak.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="passwordLama" className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Password Lama
          </Label>
          <PasswordInput
            id="passwordLama"
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="passwordBaru">Password Baru</Label>
            <PasswordInput
              id="passwordBaru"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="konfirmasi">Konfirmasi Password</Label>
            <PasswordInput
              id="konfirmasi"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={saving}
            className="text-white"
            style={{ background: 'linear-gradient(135deg, #2176bd, #1b4b72)' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            <span className="ml-1.5">Ubah Password</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
