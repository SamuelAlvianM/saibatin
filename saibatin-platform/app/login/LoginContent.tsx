'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const urlId = searchParams.get('id');

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

    if (!executeRecaptcha) {
      setValidationErrors(['reCAPTCHA belum siap. Silakan refresh halaman.']);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('login_action');
      
      await dispatch(loginUser({
        user_id: formData.user_id,
        password: formData.password,
        recaptchaToken,
      })).unwrap();
      
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card 
        className={`w-full max-w-md shadow-2xl border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-lg" />
        
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
  {/* Logo */}
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
    <div className="relative p-1">
      <Image
        src="/LOGO-dinas_ktt.png"
        alt="Logo Dinas KTT"
        width={60}
        height={60}
        className="object-contain drop-shadow-lg"
        priority
      />
    </div>
  </div>

  {/* Title */}
  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
    Selamat Datang
  </CardTitle>
</div>

          <CardDescription className="text-center text-base">
            Masukkan kredensial Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* reCAPTCHA Not Ready Warning */}
            {!recaptchaReady && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  Memuat reCAPTCHA...
                </AlertDescription>
              </Alert>
            )}

            {/* {recaptchaReady && !validationErrors.length && !error && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
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
                  focusedField === 'user_id' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                NIK / User ID
              </Label>
              <div className="relative group">
                <Input
                  id="user_id"
                  name="user_id"
                  type="text"
                  placeholder="Masukkan NIK Anda"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('user_id')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading || !recaptchaReady}
                  className={`w-full transition-all duration-300 ${
                    focusedField === 'user_id' 
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20' 
                      : ''
                  } ${formData.user_id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                  autoComplete="username"
                />
                <div className={`absolute inset-0 rounded-md pointer-events-none transition-opacity duration-300 ${
                  focusedField === 'user_id' ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="password"
                className={`transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-blue-600 dark:text-blue-400' : ''
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
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20' 
                      : ''
                  } ${formData.password ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
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
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />
                </div>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
              />
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

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
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
                  <div className="ml-2 inline-flex items-center justify-center">
                    <span className="animate-pulse">→</span>
                  </div>
                </>
              )}
            </Button>

            {/* Daftar and Lupa Password Links */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <a 
                href="/register" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                <span className="text-xl">👤</span>
                DAFTAR
              </a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a 
                href="/forgot-password" 
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                <span className="text-xl">🔑</span>
                LUPA PASSWORD
              </a>
            </div>

            {/* Notes Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 italic">
                Catatan :
              </h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 italic">
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
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group hidden"
              >
                Daftar disini
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
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