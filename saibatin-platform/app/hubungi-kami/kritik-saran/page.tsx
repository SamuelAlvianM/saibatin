'use client';

import { useState } from 'react';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, MessagesSquare, Loader2, Send } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function KritikSaranPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form, setForm] = useState({ nama: '', hp: '', email: '', pesan: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nama.trim() || !form.pesan.trim()) {
      setError('Nama dan pesan wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const recaptchaToken = executeRecaptcha ? await executeRecaptcha('kritik_saran') : undefined;
      const res = await fetch('/api/kritik-saran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.[0] ?? 'Gagal mengirim kritik & saran');
      setSuccess(true);
      setForm({ nama: '', hp: '', email: '', pesan: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl glass-card-blue flex items-center justify-center">
              <MessagesSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Kritik &amp; Saran</h1>
              <p className="text-primary-foreground/80 mt-1">
                Bantu kami meningkatkan kualitas pelayanan Disdukcapil Pesisir Barat
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 max-w-3xl">
        {success ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Terima Kasih!</h2>
            <p className="text-slate-500 mb-6">
              Kritik &amp; saran Anda telah kami terima dan menjadi masukan berharga untuk
              perbaikan pelayanan kami.
            </p>
            <Button
              onClick={() => setSuccess(false)}
              style={{ background: 'linear-gradient(90deg, #2176bd, #3490dc)' }}
              className="text-white"
            >
              Kirim Masukan Lain
            </Button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Formulir Kritik &amp; Saran</h2>
            <p className="text-sm text-slate-500 mb-6">
              Sampaikan masukan, kritik, atau saran Anda. Kontak boleh dikosongkan bila
              ingin anonim.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nama">Nama <span className="text-destructive">*</span></Label>
                  <Input id="nama" name="nama" value={form.nama} onChange={handleChange} placeholder="Nama Anda" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hp">No. WhatsApp / HP</Label>
                  <Input id="hp" name="hp" value={form.hp} onChange={handleChange} placeholder="08xx-xxxx-xxxx" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@contoh.com" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pesan">Kritik / Saran <span className="text-destructive">*</span></Label>
                <Textarea
                  id="pesan"
                  name="pesan"
                  value={form.pesan}
                  onChange={handleChange}
                  placeholder="Tuliskan kritik atau saran Anda untuk pelayanan kami..."
                  rows={6}
                  required
                />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-xs text-primary">
                Setiap masukan kami baca sebagai bahan evaluasi. Untuk laporan pelanggaran
                atau pengaduan resmi, gunakan menu <strong>Pengaduan Masyarakat</strong>.
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold"
                style={{ background: 'linear-gradient(90deg, #2176bd, #3490dc)' }}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Kirim Masukan</>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
