'use client';

import { useState } from 'react';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, ClipboardCheck, Loader2 } from 'lucide-react';

const ASPEK = [
  'Kemudahan prosedur pelayanan',
  'Kesesuaian persyaratan',
  'Kecepatan waktu pelayanan',
  'Kewajaran biaya/tarif',
  'Kompetensi & sikap petugas',
  'Kenyamanan & keamanan lingkungan',
];

export default function SurveyKepuasanPage() {
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

  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16 max-w-2xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              Survey Kepuasan Masyarakat
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Penilaian Anda membantu kami meningkatkan kualitas pelayanan Disdukcapil Pesisir Barat.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Survey</CardTitle>
            <CardDescription>Berikan nilai 1 (sangat kurang) - 5 (sangat baik) untuk setiap aspek.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert className="border-success/30 bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Terima kasih, survey Anda berhasil dikirim.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama</Label>
                    <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hp">No. HP</Label>
                    <Input id="hp" value={hp} onChange={(e) => setHp(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="space-y-4 pt-2">
                  {ASPEK.map((aspek) => (
                    <div key={aspek}>
                      <Label className="text-sm">{aspek}</Label>
                      <div className="flex gap-2 mt-1.5">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setRating(aspek, v)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                              ratings[aspek] === v
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saran">Saran (opsional)</Label>
                  <Textarea id="saran" value={saran} onChange={(e) => setSaran(e.target.value)} rows={3} />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Kirim Survey
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
