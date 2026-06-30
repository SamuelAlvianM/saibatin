'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, CreditCard, Phone, Mail, MapPin, Save } from 'lucide-react';

interface ProfilInitial {
  userId: string;
  nama: string;
  nik: string;
  nokk: string;
  hp: string;
  email: string;
  alamat: string;
  levelNama: string;
}

export function ProfilForm({ initial }: { initial: ProfilInitial }) {
  const router = useRouter();
  const [nama, setNama] = useState(initial.nama);
  const [hp, setHp] = useState(initial.hp);
  const [email, setEmail] = useState(initial.email);
  const [alamat, setAlamat] = useState(initial.alamat);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, hp, email, alamat }),
      });
      const json = await res.json();
      if (json.error?.length) {
        toast.error(json.error[0]);
      } else {
        toast.success(json.success?.[0] ?? 'Profil diperbarui');
        router.refresh();
      }
    } catch {
      toast.error('Gagal menyimpan, coba lagi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      {/* Header identitas (read-only) */}
      <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-200/60">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, #2176bd, #1b4b72)' }}
        >
          <User className="h-7 w-7" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{initial.nama || initial.userId}</p>
          <p className="text-xs text-slate-500">
            {initial.levelNama} &middot; User ID: <span className="font-mono">{initial.userId}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NIK & KK — read only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <CreditCard className="h-3.5 w-3.5" /> NIK
            </Label>
            <Input value={initial.nik || '-'} disabled className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <CreditCard className="h-3.5 w-3.5" /> No. KK
            </Label>
            <Input value={initial.nokk || '-'} disabled className="font-mono" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nama" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Nama Lengkap
          </Label>
          <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hp" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> No. HP / WhatsApp
            </Label>
            <Input id="hp" value={hp} onChange={(e) => setHp(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="alamat" className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Alamat
          </Label>
          <Textarea id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} rows={3} />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #2176bd, #1b4b72)' }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="ml-1.5">Simpan Perubahan</span>
        </Button>
      </form>
    </div>
  );
}
