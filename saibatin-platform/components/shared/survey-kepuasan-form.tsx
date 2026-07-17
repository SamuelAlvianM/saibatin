'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SKM_ASPEK, SKM_SKALA_MAX, SKM_SKALA_LABEL } from '@/lib/skm';

/**
 * Form Survey Kepuasan Masyarakat (SKM) internal — data tersimpan di DB
 * sendiri via /api/skm. Dipakai di halaman Hubungi Kami (seksi #survei).
 *
 * Aspek & skala WAJIB berasal dari lib/skm.ts (satu sumber kebenaran bersama
 * /api/skm dan dashboard); jangan menyalin daftarnya ke sini lagi.
 */

const ASPEK = SKM_ASPEK;
const NILAI = Array.from({ length: SKM_SKALA_MAX }, (_, i) => i + 1);

export function SurveyKepuasanForm() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [saran, setSaran] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setRating = (aspek: string, value: number) =>
    setRatings((prev) => ({ ...prev, [aspek]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nama || ASPEK.some((a) => !ratings[a])) {
      setError('Mohon isi nama dan beri nilai untuk semua aspek penilaian.');
      return;
    }

    setIsLoading(true);
    try {
      // jawaban dipetakan ke indeks aspek { "0": nilai, ... }
      const jawaban: Record<string, number> = {};
      ASPEK.forEach((a, i) => {
        jawaban[String(i)] = ratings[a];
      });

      const res = await fetch('/api/skm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, saran, jawaban }),
      });
      const json = await res.json();
      if (json.error?.length) {
        setError(json.error[0]);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Gagal mengirim survey. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="border-success/30 bg-success/10">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertDescription className="text-success">
          Terima kasih, survey Anda berhasil dikirim.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-slate-500">
        Berikan nilai 1 ({SKM_SKALA_LABEL[0].toLowerCase()}) sampai {SKM_SKALA_MAX} (
        {SKM_SKALA_LABEL[SKM_SKALA_MAX - 1].toLowerCase()}) untuk setiap unsur pelayanan.
        Penilaian Anda membantu kami meningkatkan kualitas pelayanan.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="skm-nama">Nama</Label>
          <Input id="skm-nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="skm-hp">No. HP</Label>
          <Input id="skm-hp" value={hp} onChange={(e) => setHp(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skm-email">Email</Label>
        <Input id="skm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="space-y-4 pt-2">
        {ASPEK.map((aspek) => (
          <div key={aspek}>
            <Label className="text-sm">{aspek}</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {NILAI.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(aspek, v)}
                  title={SKM_SKALA_LABEL[v - 1]}
                  aria-label={`${aspek}: ${v} — ${SKM_SKALA_LABEL[v - 1]}`}
                  aria-pressed={ratings[aspek] === v}
                  className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors ${
                    ratings[aspek] === v
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
                  }`}
                >
                  <span>{v}</span>
                  <span className="hidden text-xs font-normal opacity-80 sm:inline">
                    {SKM_SKALA_LABEL[v - 1]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="skm-saran">Saran (opsional)</Label>
        <Textarea id="skm-saran" value={saran} onChange={(e) => setSaran(e.target.value)} rows={3} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Kirim Survey
      </Button>
    </form>
  );
}
