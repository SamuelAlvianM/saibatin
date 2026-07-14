'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, checkNikKk, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, UserPlus, Mail, Phone, CreditCard, Users, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Image from 'next/image';

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
  });

  // reCAPTCHA hanya aktif jika site key diisi. Tanpa key (mis. saat dev),
  // anggap langsung siap supaya tombol tidak "memuat" selamanya.
  const recaptchaEnabled = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [recaptchaReady, setRecaptchaReady] = useState(!recaptchaEnabled);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [nikChecked, setNikChecked] = useState(false);
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

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setInterval(() => setOtpCountdown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpCountdown]);

  const kirimOtp = async () => {
    setOtpSending(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp: formData.hp }),
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
      setOtpChallenge(j.data?.challenge ?? '');
      setOtpKode('');
      setOtpCountdown(60);
      setOtpDevKode(j.data?.devKode ?? '');
      toast.success('Kode OTP dikirim ke WhatsApp Anda');
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
        body: JSON.stringify({ hp: formData.hp, kode: otpKode, challenge: otpChallenge }),
      });
      const j = await res.json();
      if (j.error?.length) {
        toast.error(j.error[0]);
        setOtpKode(''); // kosongkan agar auto-verifikasi jalan lagi saat diketik ulang
        return;
      }
      setOtpBukti(j.data?.bukti ?? '');
      toast.success('Nomor WhatsApp terverifikasi');
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
    // Nomor HP berubah → verifikasi OTP sebelumnya tidak berlaku.
    if (name === 'hp') {
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
    
    if (!formData.hp.trim()) {
      errors.push('Nomor HP/WhatsApp harus diisi');
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.hp)) {
      errors.push('Format nomor HP tidak valid');
    } else if (!otpNonaktif && !otpBukti) {
      errors.push('Verifikasi nomor WhatsApp dengan kode OTP terlebih dahulu');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email harus diisi');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Format email tidak valid');
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
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleCheckNik = async () => {
    if (!formData.nik || !formData.kk) {
      setValidationErrors(['NIK dan Nomor KK harus diisi untuk pengecekan']);
      return;
    }

    if (formData.nik.length !== 16 || formData.kk.length !== 16) {
      setValidationErrors(['NIK dan Nomor KK harus 16 digit']);
      return;
    }

    try {
      await dispatch(checkNikKk({
        nik: formData.nik,
        kk: formData.kk
      })).unwrap();
      
      setNikChecked(true);
      setValidationErrors([]);
      toast.success('NIK & KK valid, silakan lanjutkan pendaftaran');
    } catch (err: any) {
      setNikChecked(false);
      const msg = err?.error?.[0] ?? 'Gagal memeriksa NIK. Silakan coba lagi.';
      setValidationErrors(err?.error || [msg]);
      toast.error(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!nikChecked) {
      setValidationErrors(['Silakan cek NIK dan KK terlebih dahulu']);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card 
        className={`w-full max-w-2xl shadow-2xl border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 relative z-10 transition-all duration-700 my-8 ${
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
        alt="Logo Dinas KTT"
        width={60}
        height={60}
        className="object-contain drop-shadow-lg"
        priority
      />
    </div>
  </div>

  {/* Title */}
  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
    Selamat Datang
  </CardTitle>
</div>

          <CardDescription className="text-center text-base">
            Lengkapi data berikut untuk membuat akun baru
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* reCAPTCHA Status */}
            {!recaptchaReady && (
              <Alert className="border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <AlertDescription className="text-primary">
                  Memuat reCAPTCHA...
                </AlertDescription>
              </Alert>
            )}

            {recaptchaReady && !validationErrors.length && !error && (
              <Alert className="border-success/30 bg-success/10 dark:bg-success/20 dark:border-success/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  {nikChecked ? 'Data NIK valid, silakan lengkapi form pendaftaran' : 'Siap untuk pendaftaran'}
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

            {/* NIK and KK Check Section */}
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 space-y-4">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Verifikasi Data Kependudukan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIK Input */}
                <div className="space-y-2">
                  <Label htmlFor="nik" className={`transition-colors duration-200 ${focusedField === 'nik' ? 'text-primary' : ''}`}>
                    NIK (16 Digit)
                  </Label>
                  <div className="relative group">
                    <Input
                      id="nik"
                      name="nik"
                      type="text"
                      placeholder="Nomor Induk Kependudukan"
                      value={formData.nik}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('nik')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading || !recaptchaReady}
                      maxLength={16}
                      className={`w-full transition-all duration-300 ${
                        focusedField === 'nik' 
                          ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                          : ''
                      } ${formData.nik ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    />
                  </div>
                </div>

                {/* KK Input */}
                <div className="space-y-2">
                  <Label htmlFor="kk" className={`transition-colors duration-200 ${focusedField === 'kk' ? 'text-primary' : ''}`}>
                    Nomor KK (16 Digit)
                  </Label>
                  <div className="relative group">
                    <Input
                      id="kk"
                      name="kk"
                      type="text"
                      placeholder="Nomor Kartu Keluarga"
                      value={formData.kk}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('kk')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading || !recaptchaReady}
                      maxLength={16}
                      className={`w-full transition-all duration-300 ${
                        focusedField === 'kk' 
                          ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                          : ''
                      } ${formData.kk ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleCheckNik}
                disabled={isLoading || !recaptchaReady || nikChecked}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {nikChecked ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Data Terverifikasi
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Cek NIK & KK
                  </>
                )}
              </Button>
            </div>

            {/* Personal Information */}
            {nikChecked && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                  <Label htmlFor="nama" className={`transition-colors duration-200 ${focusedField === 'nama' ? 'text-primary' : ''}`}>
                    Nama Lengkap
                  </Label>
                  <div className="relative group">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="nama"
                      name="nama"
                      type="text"
                      placeholder="Nama lengkap sesuai KTP"
                      value={formData.nama}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('nama')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading || !recaptchaReady}
                      className={`w-full pl-10 transition-all duration-300 ${
                        focusedField === 'nama' 
                          ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                          : ''
                      } ${formData.nama ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* HP/WhatsApp */}
                  <div className="space-y-2">
                    <Label htmlFor="hp" className={`transition-colors duration-200 ${focusedField === 'hp' ? 'text-primary' : ''}`}>
                      Nomor HP/WhatsApp
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                        className={`w-full pl-10 transition-all duration-300 ${
                          focusedField === 'hp' 
                            ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                            : ''
                        } ${formData.hp ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                      />
                    </div>

                    {/* Verifikasi OTP WhatsApp */}
                    {!otpNonaktif && (
                      otpBukti ? (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                          <ShieldCheck className="h-4 w-4" /> Nomor WhatsApp terverifikasi
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={kirimOtp}
                              disabled={
                                otpSending ||
                                otpCountdown > 0 ||
                                !/^(\+62|62|0)[0-9]{9,12}$/.test(formData.hp)
                              }
                              className="border-primary/40 text-primary hover:bg-primary/5"
                            >
                              {otpSending ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              {otpCountdown > 0
                                ? `Kirim ulang (${otpCountdown}s)`
                                : otpChallenge
                                  ? 'Kirim ulang OTP'
                                  : 'Kirim OTP WhatsApp'}
                            </Button>
                            {otpChallenge && (
                              <div className="relative flex-1">
                                <Input
                                  value={otpKode}
                                  onChange={(e) =>
                                    setOtpKode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                  }
                                  inputMode="numeric"
                                  placeholder="Masukkan 6 digit kode OTP"
                                  className="h-9 w-full pr-9 text-center tracking-widest"
                                />
                                {otpVerifying && (
                                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                                )}
                              </div>
                            )}
                          </div>
                          {otpDevKode && (
                            <p className="text-[0.7rem] text-slate-400">
                              Mode pengembangan — kode OTP: <b>{otpDevKode}</b>
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`transition-colors duration-200 ${focusedField === 'email' ? 'text-primary' : ''}`}>
                      Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading || !recaptchaReady}
                        className={`w-full pl-10 transition-all duration-300 ${
                          focusedField === 'email' 
                            ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                            : ''
                        } ${formData.email ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="pass" className={`transition-colors duration-200 ${focusedField === 'pass' ? 'text-primary' : ''}`}>
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="pass"
                        name="pass"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={formData.pass}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('pass')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading || !recaptchaReady}
                        className={`w-full pr-10 transition-all duration-300 ${
                          focusedField === 'pass' 
                            ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                            : ''
                        } ${formData.pass ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="pass2" className={`transition-colors duration-200 ${focusedField === 'pass2' ? 'text-primary' : ''}`}>
                      Konfirmasi Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="pass2"
                        name="pass2"
                        type={showPassword2 ? 'text' : 'password'}
                        placeholder="Ulangi password"
                        value={formData.pass2}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('pass2')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading || !recaptchaReady}
                        className={`w-full pr-10 transition-all duration-300 ${
                          focusedField === 'pass2' 
                            ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                            : ''
                        } ${formData.pass2 ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                        tabIndex={-1}
                      >
                        {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-3 border border-primary/25">
              <h3 className="font-semibold text-primary italic">
                Catatan :
              </h3>
              <div className="space-y-2 text-xs text-primary/90 italic">
                <p>
                  - Kode Aktivasi (Password Sementara) dan notifikasi Pengajuan Online dikirim melalui WhatsApp dan E-Mail
                </p>
                <p>
                  - Gunakan nomor WhatsApp & E-Mail aktif saat pendaftaran. Jika belum, silahkan lengkapi akun profil pendaftaran anda dengan nomor WhatsApp dan E-Mail aktif.
                </p>
                <p>
                  - Password tidak boleh hanya berisi angka dan minimal 6 karakter
                </p>
              </div>
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
              disabled={isLoading || !recaptchaReady || !nikChecked}
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
              ) : !nikChecked ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Cek NIK & KK Terlebih Dahulu
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Daftar Sekarang
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