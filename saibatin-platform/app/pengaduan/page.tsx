'use client';

import { useState } from 'react';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, ShieldAlert, Loader2, Send, ExternalLink, FileSpreadsheet, PenLine } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { cn } from '@/lib/utils';

const JENIS = [
  'Pelayanan Dokumen Kependudukan',
  'Pelayanan Akta Sipil',
  'Sikap & Perilaku Petugas',
  'Fasilitas & Sarana',
  'Prosedur yang Tidak Jelas',
  'Lainnya',
];

/** Google Form pengaduan & konsultasi Disdukcapil Kabupaten Pesisir Barat (SAIBATIN). */
const GFORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe7I03TvorCYJ-_nY7WtiBROSFT_Xwd8zEgI3OtReuBf7QqYg/viewform';

export default function PengaduanPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  // Dua kanal pengisian: Google Form (bawaan/default) atau form web internal.
  const [kanal, setKanal] = useState<'gform' | 'web'>('gform');
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
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pengaduan Masyarakat</h1>
              <p className="text-primary-foreground/80 mt-1">Sampaikan pengaduan layanan maupun laporan dugaan pelanggaran (WBS) kepada Disdukcapil Pesisir Barat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 max-w-3xl">
        {/* Penjelasan kanal — pengaduan layanan sekaligus WBS (whistle blowing) */}
        <div className="mb-6 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div className="text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Kanal Pengaduan &amp; Whistle Blowing System (WBS)</p>
            <p className="mt-1">
              Kanal ini melayani pengaduan pelayanan administrasi kependudukan sekaligus berfungsi sebagai{' '}
              <b>Whistle Blowing System (WBS)</b> — sarana pelaporan dugaan pelanggaran/tindak pidana korupsi di
              lingkungan Disdukcapil Kabupaten Pesisir Barat. <b>Identitas pelapor dijamin kerahasiaannya</b> dan setiap
              laporan ditindaklanjuti sesuai ketentuan.
            </p>
          </div>
        </div>

        {/* Pilihan kanal pengisian */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {(
            [
              ['gform', 'Isi lewat Google Form', FileSpreadsheet],
              ['web', 'Isi di web langsung', PenLine],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setKanal(key)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                kanal === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-600 hover:bg-primary/5 hover:text-primary',
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {kanal === 'gform' ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Formulir Layanan Pengaduan (Google Form)
                </h2>
                <p className="text-xs text-slate-500">
                  Pengaduan &amp; konsultasi pengguna layanan adminduk Disdukcapil Pesisir Barat.
                </p>
              </div>
              <a
                href={GFORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                Buka di tab baru <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <iframe
              src={GFORM_URL}
              title="Formulir pengaduan masyarakat (Google Form)"
              className="h-[720px] w-full border-0"
              loading="lazy"
            >
              Memuat formulir…
            </iframe>
          </div>
        ) : success ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Pengaduan Terkirim</h2>
            <p className="text-slate-500 mb-6">
              Terima kasih atas pengaduan Anda. Kami akan segera menindaklanjuti dan menghubungi Anda bila diperlukan.
            </p>
            <Button
              onClick={() => setSuccess(false)}
              style={{ background: 'linear-gradient(90deg, #1b4b72, #2176bd)' }}
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
                  <Label htmlFor="nama">Nama Lengkap <span className="text-destructive">*</span></Label>
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
                <Select
                  value={form.jenis}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, jenis: v }))}
                >
                  <SelectTrigger id="jenis" className="w-full">
                    <SelectValue placeholder="-- Pilih jenis pengaduan --" />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS.map((j) => (
                      <SelectItem key={j} value={j}>{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="isi">Isi Pengaduan <span className="text-destructive">*</span></Label>
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

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-xs text-primary">
                <strong>Catatan:</strong> Pengaduan yang disampaikan akan ditindaklanjuti dalam 3-5 hari kerja.
                Untuk urusan mendesak, hubungi kami langsung di kantor Disdukcapil Kabupaten Pesisir Barat.
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold"
                style={{ background: 'linear-gradient(90deg, #1b4b72, #2176bd)' }}
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
            <p>📍 Kantor Disdukcapil Kab. Pesisir Barat, Tideng Pale, Kec. Sesayap</p>
            <p>📞 Telp: (0553) 2022XXX</p>
            <p>✉️ Email: disdukcapil@saibatinkab.go.id</p>
            <p>⏰ Senin–Jumat, 08.00–16.00 WITA</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
