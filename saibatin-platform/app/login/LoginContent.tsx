'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, UserPlus, KeyRound, ArrowRight } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'sonner';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
  });

  // reCAPTCHA hanya aktif jika site key diisi. Tanpa key (mis. saat dev),
  // anggap langsung siap supaya tombol tidak "memuat" selamanya.
  const recaptchaEnabled = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [recaptchaReady, setRecaptchaReady] = useState(!recaptchaEnabled);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const urlId = searchParams.get('id');
  // Tujuan setelah login — hanya terima path internal agar tidak jadi open redirect.
  const rawRedirect = searchParams.get('redirect');
  const redirectTo = rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
    ? rawRedirect
    : '/dashboard';

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

  // Redirect setelah Redux state terupdate (backup jika handleSubmit race)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

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
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.user_id.trim()) {
      errors.push('NIK/User ID harus diisi');
    }
    
    if (!formData.password.trim()) {
      errors.push('Password harus diisi');
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
        ? await executeRecaptcha('login_action')
        : undefined;

      await dispatch(loginUser({
        user_id: formData.user_id.trim(),
        password: formData.password,
        recaptchaToken,
      })).unwrap();

      // Biarkan useEffect di atas yang handle redirect setelah isAuthenticated = true
      toast.success('Login berhasil');
    } catch (err: any) {
      const msg = err?.error?.[0] ?? 'Login gagal. Periksa NIK & password Anda.';
      toast.error(msg);
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e8f0f9 0%, #dceaf7 40%, #c8dcf0 100%)' }}
    >
      {/* Subtle background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(33,118,189,0.12)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(33,118,189,0.08)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'rgba(255,237,74,0.05)' }} />
      </div>

      <Card
        className={`w-full max-w-[420px] relative z-10 transition-all duration-700 border-0 shadow-[0_8px_40px_rgba(33,118,189,0.18)] overflow-hidden ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' }}
      >
        {/* Top accent — biru dengan glow ke bawah */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: '#2176bd', boxShadow: '0 2px 12px 0 rgba(33,118,189,0.45)' }} />
        
        <CardHeader className="pt-8 pb-5 px-8 text-center space-y-3">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16 drop-shadow-md">
              <Image
                src="/logo-saibatin.png"
                alt="Logo Disdukcapil Pesisir Barat"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">
              Portal SAIBATIN — Disdukcapil Kab. Pesisir Barat
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-8">
            {/* reCAPTCHA Not Ready Warning */}
            {!recaptchaReady && (
              <Alert className="border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <AlertDescription className="text-primary">
                  Memuat reCAPTCHA...
                </AlertDescription>
              </Alert>
            )}

            {/* {recaptchaReady && !validationErrors.length && !error && (
              <Alert className="border-success/30 bg-success/10 dark:bg-success/20 dark:border-success/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Siap untuk login
                </AlertDescription>
              </Alert>
            )} */}

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

            {/* NIK/User ID Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="user_id" 
                className={`transition-colors duration-200 ${
                  focusedField === 'user_id' ? 'text-primary' : ''
                }`}
              >
                NIK / User ID
              </Label>
              <div className="relative group">
                <Input
                  id="user_id"
                  name="user_id"
                  type="text"
                  placeholder="NIK (warga) atau username (instansi/staff)"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('user_id')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading || !recaptchaReady}
                  className={`w-full transition-all duration-300 ${
                    focusedField === 'user_id' 
                      ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                      : ''
                  } ${formData.user_id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  autoComplete="username"
                />
                <div className={`absolute inset-0 rounded-md pointer-events-none transition-opacity duration-300 ${
                  focusedField === 'user_id' ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute inset-0 rounded-md bg-yellow-400/10" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="password"
                className={`transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-primary' : ''
                }`}
              >
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password Anda"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading || !recaptchaReady}
                  className={`w-full pr-10 transition-all duration-300 ${
                    focusedField === 'password' 
                      ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                      : ''
                  } ${formData.password ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <div className={`absolute inset-0 rounded-md pointer-events-none transition-opacity duration-300 ${
                  focusedField === 'password' ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute inset-0 rounded-md bg-yellow-400/10" />
                </div>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer select-none"
              >
                Remember Me
              </Label>
            </div>

            {/* Additional Info */}
            {urlId && (
              <p className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="font-medium">ID:</span> {urlId}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-2">
            <Button
              type="submit"
              className="w-full text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: 'linear-gradient(90deg, #ffed4a, #e77817)' }}
              disabled={isLoading || !recaptchaReady}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : !recaptchaReady ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat reCAPTCHA...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Daftar and Lupa Password Links */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <a 
                href="/register" 
                className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                <UserPlus className="h-4 w-4" />
                DAFTAR
              </a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a
                href="/forgot-password"
                className="text-destructive hover:text-destructive/80 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                <KeyRound className="h-4 w-4" />
                LUPA PASSWORD
              </a>
            </div>

            {/* Notes Section */}
            <div className="rounded-xl p-4 space-y-2.5 border" style={{ background: 'rgba(33,118,189,0.04)', borderColor: 'rgba(33,118,189,0.15)' }}>
              <h3 className="font-semibold text-primary text-xs uppercase tracking-wide">
                Catatan
              </h3>
              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <p>
                  - Kode Aktivasi (Password Sementara) dan notifikasi Pengajuan Online dikirim melalui WhatsApp dan E-Mail
                </p>
                <p>
                  - Gunakan nomor WhatsApp & E-Mail aktif saat pendaftaran. Jika belum, silahkan lengkapi akun profil pendaftaran anda dengan nomor WhatsApp dan E-Mail aktif.
                </p>
              </div>
            </div>

            <div className="relative w-full hidden">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">
                  Atau
                </span>
              </div>
            </div>

            <div className="text-center text-sm hidden">
              <span className="text-muted-foreground hidden">Belum punya akun?</span>{' '}
              <a 
                href="/register" 
                className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group hidden"
              >
                Daftar disini
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400">
        <p>SAIBATIN &mdash; Disdukcapil Kabupaten Pesisir Barat &copy; 2024</p>
      </div>
    </div>
  );
}