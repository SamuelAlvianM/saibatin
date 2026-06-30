'use client';

import { useState } from 'react';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, MessageSquareWarning, Loader2, Send } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const JENIS = [
  'Pelayanan Dokumen Kependudukan',
  'Pelayanan Akta Sipil',
  'Sikap & Perilaku Petugas',
  'Fasilitas & Sarana',
  'Prosedur yang Tidak Jelas',
  'Lainnya',
];

export default function PengaduanPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form, setForm] = useState({ nama: '', hp: '', email: '', jenis: '', isi: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nama.trim() || !form.isi.trim()) {
      setError('Nama dan isi pengaduan wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const recaptchaToken = executeRecaptcha ? await executeRecaptcha('pengaduan') : undefined;
      const res = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.[0] ?? 'Gagal mengirim pengaduan');
      setSuccess(true);
      setForm({ nama: '', hp: '', email: '', jenis: '', isi: '' });
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
              <MessageSquareWarning className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pengaduan Masyarakat</h1>
              <p className="text-blue-200 mt-1">Sampaikan pengaduan Anda terkait layanan Disdukcapil Pesisir Barat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 max-w-3xl">
        {success ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Pengaduan Terkirim</h2>
            <p className="text-slate-500 mb-6">
              Terima kasih atas pengaduan Anda. Kami akan segera menindaklanjuti dan menghubungi Anda bila diperlukan.
            </p>
            <Button
              onClick={() => setSuccess(false)}
              style={{ background: 'linear-gradient(90deg, #2176bd, #3490dc)' }}
              className="text-white"
            >
              Kirim Pengaduan Lain
            </Button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Formulir Pengaduan</h2>
            <p className="text-sm text-slate-500 mb-6">
              Pastikan data Anda benar agar kami dapat merespons dengan tepat.
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
                  <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="jenis">Jenis Pengaduan</Label>
                <select
                  id="jenis"
                  name="jenis"
                  value={form.jenis}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Pilih jenis pengaduan --</option>
                  {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="isi">Isi Pengaduan <span className="text-red-500">*</span></Label>
                <Textarea
                  id="isi"
                  name="isi"
                  value={form.isi}
                  onChange={handleChange}
                  placeholder="Jelaskan pengaduan Anda secara detail..."
                  rows={6}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-700">
                <strong>Catatan:</strong> Pengaduan yang disampaikan akan ditindaklanjuti dalam 3-5 hari kerja.
                Untuk urusan mendesak, hubungi kami langsung di kantor Disdukcapil Kabupaten Pesisir Barat.
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
                  <><Send className="w-4 h-4 mr-2" /> Kirim Pengaduan</>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 glass-card-blue rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Saluran Pengaduan Lainnya</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>📍 Kantor Disdukcapil Kab. Pesisir Barat, Jl. Raya Krui, Pesisir Tengah</p>
            <p>📞 Telp: (0728) 21xxx</p>
            <p>✉️ Email: disdukcapil@pesisirbaratkab.go.id</p>
            <p>⏰ Senin–Jumat, 08.00–16.00 WIB</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
