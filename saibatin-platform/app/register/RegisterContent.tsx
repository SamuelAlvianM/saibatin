'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CameraCapture } from '@/components/shared/camera-capture';
import { SearchSelect } from '@/components/shared/search-select';
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  UserPlus,
  Mail,
  Phone,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  UserRound,
  KeyRound,
  Camera,
  MapPin,
} from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Image from 'next/image';

interface Kecamatan {
  id: number;
  kode: string;
  nama: string;
}

/** Kotak satu bagian formulir (Informasi Personal / Akun / Foto). */
function Bagian({
  judul,
  ikon: Ikon,
  children,
}: {
  judul: string;
  ikon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40">
      <header className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
        <Ikon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{judul}</h3>
      </header>
      <div className="space-y-5 p-4 md:p-5">{children}</div>
    </section>
  );
}

/** Daftar petunjuk kecil di bawah kolom isian — mengikuti pola situs Bantul. */
function Petunjuk({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[0.72rem] leading-relaxed text-slate-500 dark:text-slate-400">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

/** Label kolom + penanda wajib. */
function LabelWajib({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-slate-700 dark:text-slate-200">
      {children} <span className="text-destructive">*</span>
    </Label>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, success } = useAppSelector((state) => state.auth);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    kk: '',
    hp: '',
    email: '',
    pass: '',
    pass2: '',
    kecamatan: '',
  });
  const [foto, setFoto] = useState('');

  // reCAPTCHA hanya aktif jika site key diisi. Tanpa key (mis. saat dev),
  // anggap langsung siap supaya tombol tidak "memuat" selamanya.
  const recaptchaEnabled = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [recaptchaReady, setRecaptchaReady] = useState(!recaptchaEnabled);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const urlId = searchParams.get('id');

  // ── OTP WhatsApp (Fonnte) ──
  const [otpChallenge, setOtpChallenge] = useState('');
  const [otpKode, setOtpKode] = useState('');
  const [otpBukti, setOtpBukti] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpDevKode, setOtpDevKode] = useState('');
  const [otpNonaktif, setOtpNonaktif] = useState(false); // server: layanan OTP belum dikonfigurasi
  // Kanal OTP ditentukan SERVER (env OTP_CHANNEL / konfigurasi mail & Fonnte),
  // jadi klien baru tahu tujuannya setelah kode dikirim.
  const [otpKanal, setOtpKanal] = useState<'email' | 'wa' | null>(null);

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setInterval(() => setOtpCountdown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpCountdown]);

  // Daftar kecamatan untuk dropdown domisili.
  useEffect(() => {
    fetch('/api/wilayah?jenis=KECAMATAN')
      .then((r) => r.json())
      .then((j) => setKecamatanList(j.data?.items ?? []))
      .catch(() => setKecamatanList([]));
  }, []);

  const kirimOtp = async () => {
    setOtpSending(true);
    try {
      // Kedua identitas selalu dikirim; server memakai yang sesuai kanalnya.
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: formData.hp, email: formData.email }),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        return;
      }
      if (j.data?.dinonaktifkan) {
        setOtpNonaktif(true);
        return;
      }
      const kanal = j.data?.kanal === 'wa' ? 'wa' : 'email';
      setOtpKanal(kanal);
      setOtpChallenge(j.data?.challenge ?? '');
      setOtpKode('');
      setOtpCountdown(60);
      setOtpDevKode(j.data?.devKode ?? '');
      toast.success(
        kanal === 'wa'
          ? 'Kode OTP dikirim ke WhatsApp Anda'
          : 'Kode OTP dikirim ke email Anda',
      );
    } catch {
      toast.error('Gagal mengirim OTP. Coba lagi.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verifikasi berjalan OTOMATIS begitu 6 digit kode terisi (tanpa tombol).
  useEffect(() => {
    if (otpKode.length === 6 && otpChallenge && !otpBukti && !otpVerifying) {
      verifikasiOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpKode]);

  const verifikasiOtp = async () => {
    setOtpVerifying(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hp: formData.hp,
          email: formData.email,
          kode: otpKode,
          challenge: otpChallenge,
        }),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        setOtpKode(''); // kosongkan agar auto-verifikasi jalan lagi saat diketik ulang
        return;
      }
      setOtpBukti(j.data?.bukti ?? '');
      toast.success(
        otpKanal === 'wa' ? 'Nomor WhatsApp terverifikasi' : 'Alamat email terverifikasi',
      );
    } catch {
      toast.error('Gagal memverifikasi OTP. Coba lagi.');
      setOtpKode('');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if reCAPTCHA is ready
  useEffect(() => {
    if (executeRecaptcha) {
      setRecaptchaReady(true);
    }
  }, [executeRecaptcha]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    // Identitas tujuan OTP berubah → bukti verifikasi sebelumnya tidak berlaku.
    // Email ikut dihitung karena kanal OTP bisa email, bukan hanya WhatsApp.
    if (name === 'hp' || name === 'email') {
      setOtpChallenge('');
      setOtpKode('');
      setOtpBukti('');
      setOtpDevKode('');
      setOtpCountdown(0);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.nama.trim()) {
      errors.push('Nama Lengkap harus diisi');
    }

    if (!formData.nik.trim()) {
      errors.push('NIK harus diisi');
    } else if (formData.nik.length !== 16) {
      errors.push('NIK harus 16 digit');
    }

    if (!formData.kk.trim()) {
      errors.push('Nomor KK harus diisi');
    } else if (formData.kk.length !== 16) {
      errors.push('Nomor KK harus 16 digit');
    }

    if (!formData.kecamatan) {
      errors.push('Kecamatan domisili harus dipilih');
    }

    if (!formData.hp.trim()) {
      errors.push('Nomor HP/WhatsApp harus diisi');
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.hp)) {
      errors.push('Format nomor HP tidak valid');
    }

    if (!formData.email.trim()) {
      errors.push('Email harus diisi');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Format email tidak valid');
    }

    // Syarat OTP berdiri sendiri: tujuannya email atau WhatsApp tergantung
    // konfigurasi server, jadi jangan ditempelkan ke salah satu kolom.
    if (!otpNonaktif && !otpBukti) {
      errors.push('Verifikasi kode OTP terlebih dahulu');
    }

    if (!formData.pass.trim()) {
      errors.push('Password harus diisi');
    } else if (formData.pass.length < 6) {
      errors.push('Password minimal 6 karakter');
    } else if (/^\d+$/.test(formData.pass)) {
      errors.push('Password tidak boleh hanya berisi angka');
    }

    if (!formData.pass2.trim()) {
      errors.push('Konfirmasi password harus diisi');
    } else if (formData.pass !== formData.pass2) {
      errors.push('Password dan konfirmasi password tidak sama');
    }

    if (!foto) {
      errors.push('Foto wajah/selfie harus diambil');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (recaptchaEnabled && !executeRecaptcha) {
      setValidationErrors(['reCAPTCHA belum siap. Silakan refresh halaman.']);
      return;
    }

    try {
      const recaptchaToken = recaptchaEnabled && executeRecaptcha
        ? await executeRecaptcha('register_action')
        : undefined;

      await dispatch(registerUser({
        ...formData,
        foto,
        recaptchaToken,
        otpBukti: otpBukti || undefined,
      })).unwrap();

      toast.success('Pendaftaran berhasil! Akun menunggu verifikasi/aktivasi oleh admin.');
      // Success - redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      const msg = err?.error?.[0] ?? 'Pendaftaran gagal. Silakan coba lagi.';
      toast.error(msg);
      console.error('Registration error:', err);
    }
  };

  /** Kelas isian yang bereaksi saat difokus / sudah terisi. */
  const kelasInput = (nama: string, terisi: boolean, extra = '') =>
    `w-full transition-all duration-300 ${extra} ${
      focusedField === nama ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' : ''
    } ${terisi ? 'bg-primary/5 dark:bg-primary/10' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card
        className={`w-full max-w-3xl shadow-2xl border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 relative z-10 transition-all duration-700 my-8 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-lg" />

        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-40" />
              <div className="relative p-1">
                <Image
                  src="/logo-saibatin.png"
                  alt="Logo Dinas SAIBATIN"
                  width={60}
                  height={60}
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>

            {/* Title */}
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Pendaftaran Akun
            </CardTitle>
          </div>

          <CardDescription className="text-center text-base">
            Lengkapi data berikut untuk membuat akun layanan administrasi kependudukan
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* Ketentuan pendaftaran */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <li>
                  <b className="text-primary">Pastikan Anda sudah memiliki Kartu Keluarga Pesisir Barat.</b>{' '}
                  Untuk KK luar daerah yang hendak menjadi warga Pesisir Barat, silakan gunakan
                  layanan <b>Pindah Datang</b>.
                </li>
                <li>
                  Isi data pendaftaran dengan lengkap dan jelas sesuai petunjuk yang tertera.
                  Petugas berhak menolak atau memblokir akun jika data tidak sesuai dengan data
                  kependudukan.
                </li>
                <li>
                  Akun kepala keluarga dapat digunakan untuk pengajuan seluruh anggota dalam satu
                  Kartu Keluarga.
                </li>
                <li>
                  Untuk permohonan administrasi kependudukan anak di bawah umur (mis. Akta
                  Kelahiran dan KIA), gunakan akun orang tua. Anak tidak perlu membuat akun.
                </li>
              </ul>

              <div className="mt-4 border-t border-slate-200 pt-3 text-center dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> Perhatian
                </span>
                <p className="mt-2 text-[0.72rem] italic leading-relaxed text-slate-500 dark:text-slate-400">
                  &ldquo;Barang siapa dengan sengaja melakukan pemalsuan identitas diri atau dokumen
                  terhadap instansi pelaksana, maka dapat terancam hukuman pidana 6 tahun atau denda
                  sebesar lima puluh juta rupiah&rdquo; — Undang-Undang No. 23 Tahun 2006 Bab 12
                </p>
              </div>
            </div>

            {/* reCAPTCHA Status */}
            {!recaptchaReady && (
              <Alert className="border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <AlertDescription className="text-primary">
                  Memuat reCAPTCHA...
                </AlertDescription>
              </Alert>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Redux Error */}
            {error && !validationErrors.length && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {success && !error && !validationErrors.length && (
              <Alert className="border-success/30 bg-success/10 dark:bg-success/20 dark:border-success/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  <ul className="list-disc list-inside space-y-1">
                    {success.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-5">
                {/* ── Informasi Personal ── */}
                <Bagian judul="Informasi Personal" ikon={UserRound}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <LabelWajib htmlFor="nik">NIK</LabelWajib>
                      <Input
                        id="nik"
                        name="nik"
                        type="text"
                        inputMode="numeric"
                        placeholder="Nomor Induk Kependudukan"
                        value={formData.nik}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('nik')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading || !recaptchaReady}
                        maxLength={16}
                        className={kelasInput('nik', !!formData.nik)}
                      />
                      <Petunjuk
                        items={[
                          'Masukkan 16 digit nomor NIK',
                          'Wajib berupa angka sejumlah 16 digit',
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <LabelWajib htmlFor="kk">Nomor Kartu Keluarga</LabelWajib>
                      <Input
                        id="kk"
                        name="kk"
                        type="text"
                        inputMode="numeric"
                        placeholder="Nomor Kartu Keluarga"
                        value={formData.kk}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('kk')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading || !recaptchaReady}
                        maxLength={16}
                        className={kelasInput('kk', !!formData.kk)}
                      />
                      <Petunjuk
                        items={[
                          'Masukkan 16 digit nomor Kartu Keluarga',
                          'Wajib berupa angka sejumlah 16 digit',
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <LabelWajib htmlFor="nama">Nama Lengkap</LabelWajib>
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="nama"
                          name="nama"
                          type="text"
                          placeholder="NAMA LENGKAP"
                          value={formData.nama}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('nama')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isLoading || !recaptchaReady}
                          className={kelasInput('nama', !!formData.nama, 'pl-10')}
                        />
                      </div>
                      <Petunjuk
                        items={[
                          'Nama lengkap sesuai dengan KTP',
                          'Tidak perlu menuliskan gelar',
                          'Tulis dengan huruf kapital',
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <LabelWajib>Kecamatan</LabelWajib>
                      <SearchSelect
                        value={formData.kecamatan}
                        onValueChange={(v) => setFormData((f) => ({ ...f, kecamatan: v }))}
                        options={kecamatanList.map((k) => ({ value: k.nama, label: k.nama }))}
                        placeholder="Pilih Kecamatan"
                        searchPlaceholder="Cari kecamatan…"
                        emptyText="Kecamatan tidak ditemukan."
                        disabled={isLoading || !recaptchaReady}
                        icon={<MapPin className="h-4 w-4 shrink-0 text-slate-400" />}
                      />
                      <p className="mt-1.5 text-[0.72rem] leading-relaxed text-slate-500 dark:text-slate-400">
                        Pilih kecamatan sesuai domisili dan alamat pada Kartu Keluarga Anda saat ini
                      </p>
                    </div>
                  </div>
                </Bagian>

                {/* ── Informasi Akun ── */}
                <Bagian judul="Informasi Akun" ikon={KeyRound}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* HP/WhatsApp */}
                    <div className="space-y-2">
                      <LabelWajib htmlFor="hp">Nomor WhatsApp</LabelWajib>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="hp"
                          name="hp"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          value={formData.hp}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('hp')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isLoading || !recaptchaReady}
                          className={kelasInput('hp', !!formData.hp, 'pl-10')}
                        />
                      </div>

                      <Petunjuk
                        items={[
                          'Isi dengan dimulai angka 0',
                          'Wajib berupa angka maksimal 15 digit',
                          'Pastikan nomor WhatsApp aktif dan dapat dihubungi',
                        ]}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <LabelWajib htmlFor="email">Alamat Email</LabelWajib>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="nama@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isLoading || !recaptchaReady}
                          className={kelasInput('email', !!formData.email, 'pl-10')}
                        />
                      </div>
                      <Petunjuk
                        items={[
                          <span key="a" className="font-medium text-destructive">
                            Pastikan email aktif, tidak penuh, dan dapat diakses
                          </span>,
                          'Email dipakai untuk notifikasi dan pengiriman dokumen yang telah selesai diproses',
                        ]}
                      />
                    </div>
                  </div>

                  {/* Verifikasi OTP — tujuannya email ATAU WhatsApp, ditentukan
                      server, jadi diletakkan terpisah dari kedua kolom di atas. */}
                  {!otpNonaktif && (
                    <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5">
                      {otpBukti ? (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                          <ShieldCheck className="h-4 w-4" />
                          {otpKanal === 'wa'
                            ? 'Nomor WhatsApp terverifikasi'
                            : 'Alamat email terverifikasi'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                            Verifikasi kontak <span className="text-destructive">*</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={kirimOtp}
                              disabled={
                                otpSending ||
                                otpCountdown > 0 ||
                                // Kanal belum tentu WhatsApp, jadi cukup salah
                                // satu identitas yang valid untuk mulai mengirim.
                                (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.hp) &&
                                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                              }
                              className="border-primary/40 bg-white text-primary hover:bg-primary/5"
                            >
                              {otpSending ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              {otpCountdown > 0
                                ? `Kirim ulang (${otpCountdown}s)`
                                : otpChallenge
                                  ? 'Kirim ulang kode'
                                  : 'Kirim Kode OTP'}
                            </Button>
                            {otpChallenge && (
                              <div className="relative min-w-[12rem] flex-1">
                                <Input
                                  value={otpKode}
                                  onChange={(e) =>
                                    setOtpKode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                  }
                                  inputMode="numeric"
                                  placeholder="Masukkan 6 digit kode OTP"
                                  className="h-9 w-full bg-white pr-9 text-center tracking-widest"
                                />
                                {otpVerifying && (
                                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                            {otpChallenge
                              ? otpKanal === 'wa'
                                ? 'Kode dikirim ke nomor WhatsApp di atas. Kode berlaku 5 menit.'
                                : 'Kode dikirim ke alamat email di atas. Cek juga folder spam. Kode berlaku 5 menit.'
                              : 'Kode verifikasi akan dikirim ke WhatsApp atau email Anda.'}
                          </p>
                          {otpDevKode && (
                            <p className="text-[0.7rem] text-slate-400">
                              Mode pengembangan — kode OTP: <b>{otpDevKode}</b>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Password */}
                    <div className="space-y-2">
                      <LabelWajib htmlFor="pass">Kata Sandi</LabelWajib>
                      <div className="relative">
                        <Input
                          id="pass"
                          name="pass"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Kata sandi"
                          value={formData.pass}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('pass')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isLoading || !recaptchaReady}
                          className={kelasInput('pass', !!formData.pass, 'pr-10')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Petunjuk
                        items={[
                          'Minimal terdiri dari 6 karakter',
                          'Tidak boleh hanya berisi angka',
                          'Disarankan memuat kombinasi huruf besar, huruf kecil, angka, dan tanda baca',
                        ]}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <LabelWajib htmlFor="pass2">Ulangi Kata Sandi</LabelWajib>
                      <div className="relative">
                        <Input
                          id="pass2"
                          name="pass2"
                          type={showPassword2 ? 'text' : 'password'}
                          placeholder="Ulangi kata sandi"
                          value={formData.pass2}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('pass2')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isLoading || !recaptchaReady}
                          className={kelasInput('pass2', !!formData.pass2, 'pr-10')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword2(!showPassword2)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          tabIndex={-1}
                          aria-label={showPassword2 ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Petunjuk
                        items={[
                          'Disarankan tidak memuat data yang mudah ditebak (nama, tanggal lahir) atau urutan huruf/angka (qwerty, 12345)',
                        ]}
                      />
                    </div>
                  </div>
                </Bagian>

                {/* ── Foto Wajah/Selfie ── */}
                <Bagian judul="Foto Wajah / Selfie" ikon={Camera}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <LabelWajib>Lampirkan Foto Selfie</LabelWajib>
                      {/* Wajib dipotret saat itu juga — unggah berkas sengaja
                          ditutup supaya fotonya benar-benar wajah pendaftar,
                          bukan gambar lama yang diambil dari galeri. */}
                      <CameraCapture
                        value={foto}
                        onChange={setFoto}
                        disabled={isLoading || !recaptchaReady}
                        tanpaUnggah
                      />
                      <Petunjuk
                        items={[
                          'Perangkat wajib memiliki kamera/webcam',
                          'Foto harus diambil langsung saat mendaftar — tidak bisa mengunggah berkas',
                          'Aktifkan izin kamera jika kamera tidak muncul',
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-200">Perhatian</Label>
                      <ul className="list-disc space-y-1 pl-4 text-[0.72rem] leading-relaxed text-slate-500 dark:text-slate-400">
                        <li>
                          Pastikan foto wajah terlihat jelas dan merupakan wajah pemohon yang
                          bersangkutan, bukan orang lain
                        </li>
                        <li>Cukup foto bagian wajah, tidak perlu memegang KTP atau dokumen apa pun</li>
                        <li>Tidak menggunakan masker atau kacamata hitam</li>
                        <li>Mohon mengenakan pakaian yang rapi &amp; sopan</li>
                        <li>Foto selfie akan disandingkan dengan foto KTP oleh petugas</li>
                        <li>Lakukan foto ulang jika hasil foto belum sesuai</li>
                        <li>
                          Foto hanya digunakan untuk verifikasi, keamanan, dan foto profil akun —
                          bukan untuk memperbarui foto KTP
                        </li>
                        <li>
                          Jika tidak memungkinkan berfoto selfie, ajukan dengan akun ahli waris
                          terdekat
                        </li>
                        <li>
                          Petugas berhak menolak pendaftaran atau memblokir akun jika foto tidak
                          sesuai prosedur atau tidak jelas
                        </li>
                      </ul>
                    </div>
                  </div>
                </Bagian>
            </div>

            {/* Additional Info */}
            {urlId && (
              <p className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="font-medium">ID:</span> {urlId}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading || !recaptchaReady}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses Pendaftaran...
                </>
              ) : !recaptchaReady ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat reCAPTCHA...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Buat Akun Baru
                </>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">
                  Atau
                </span>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Sudah punya akun?</span>{' '}
              <a
                href="/"
                className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                Login disini
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        <p className="opacity-60">Protected by reCAPTCHA</p>
      </div>
    </div>
  );
}
