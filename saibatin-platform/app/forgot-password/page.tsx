'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { forgotPassword, clearError, clearSuccess } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, success } = useAppSelector((state) => state.auth);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const recaptchaEnabled = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [nik, setNik] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [recaptchaReady, setRecaptchaReady] = useState(!recaptchaEnabled);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNik(e.target.value);
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!nik.trim()) {
      errors.push('NIK harus diisi');
    } else if (nik.length !== 16) {
      errors.push('NIK harus 16 digit');
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
        ? await executeRecaptcha('forgot_password_action')
        : undefined;

      await dispatch(forgotPassword({
        nik,
        recaptchaToken,
      })).unwrap();
      
      // Success - form will show success message
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Animated background elements — tema biru brand */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-300/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card 
        className={`w-full max-w-md shadow-2xl border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1b4b72] to-[#2176bd] rounded-t-lg" />
        
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
  {/* Logo */}
  <div className="relative">
    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-40" />
    <div className="relative p-1">
      <Image
        src="/logo-saibatin.png"
        alt="Logo SAIBATIN"
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
            Masukkan NIK Anda untuk mengatur ulang password
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

            {recaptchaReady && !validationErrors.length && !error && !success && (
              <Alert className="border-success/30 bg-success/10 dark:bg-success/20 dark:border-success/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Siap untuk reset password
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
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {error.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
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

            {/* NIK Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="nik" 
                className={`transition-colors duration-200 ${
                  focusedField === 'nik' ? 'text-primary' : ''
                }`}
              >
                NIK (16 Digit)
              </Label>
              <div className="relative group">
                <Input
                  id="nik"
                  name="nik"
                  type="text"
                  placeholder="Masukkan NIK Anda"
                  value={nik}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('nik')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading || !recaptchaReady}
                  maxLength={16}
                  className={`w-full transition-all duration-300 ${
                    focusedField === 'nik' 
                      ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20' 
                      : ''
                  } ${nik ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  autoComplete="username"
                />
                <div className={`absolute inset-0 rounded-md pointer-events-none transition-opacity duration-300 ${
                  focusedField === 'nik' ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute inset-0 rounded-md bg-primary/10" />
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-primary/10 rounded-lg p-4 space-y-3 border border-primary/30">
              <h3 className="font-semibold text-primary italic flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Informasi
              </h3>
              <div className="space-y-2 text-xs text-primary italic">
                <p>
                  - Link reset password akan dikirim ke email yang terdaftar
                </p>
                <p>
                  - Link reset password berlaku selama 21 menit
                </p>
                <p>
                  - Pastikan NIK yang Anda masukkan sesuai dengan data pendaftaran
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#1b4b72] to-[#2176bd] text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                  <KeyRound className="mr-2 h-4 w-4" />
                  Kirim Link Reset Password
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
              <a 
                href="/" 
                className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                Kembali ke Login
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