'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPassword, clearError, clearSuccess } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, success } = useAppSelector((state) => state.auth);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    pass1: '',
    pass2: '',
  });

  const recaptchaEnabled = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [recaptchaReady, setRecaptchaReady] = useState(!recaptchaEnabled);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [resetKey, setResetKey] = useState<string | null>(null);

  // Get reset key from URL
  useEffect(() => {
    const key = searchParams.get('key');
    if (key) {
      setResetKey(key);
    } else {
      setValidationErrors(['Link reset password tidak valid']);
    }
  }, [searchParams]);

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

  // Redirect to login after successful reset
  useEffect(() => {
    if (success && success.length > 0) {
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [success, router]);

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
    
    if (!formData.pass1.trim()) {
      errors.push('Password baru harus diisi');
    } else if (formData.pass1.length < 6) {
      errors.push('Password minimal 6 karakter');
    } else if (/^\d+$/.test(formData.pass1)) {
      errors.push('Password tidak boleh hanya berisi angka');
    }
    
    if (!formData.pass2.trim()) {
      errors.push('Konfirmasi password harus diisi');
    } else if (formData.pass1 !== formData.pass2) {
      errors.push('Password dan konfirmasi password tidak sama');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetKey) {
      setValidationErrors(['Link reset password tidak valid']);
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (recaptchaEnabled && !executeRecaptcha) {
      setValidationErrors(['reCAPTCHA belum siap. Silakan refresh halaman.']);
      return;
    }

    try {
      const recaptchaToken = recaptchaEnabled && executeRecaptcha
        ? await executeRecaptcha('reset_password_action')
        : undefined;

      await dispatch(resetPassword({
        pass1: formData.pass1,
        pass2: formData.pass2,
        key: resetKey,
        recaptchaToken,
      })).unwrap();
      
      // Success - will redirect after 3 seconds
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card 
        className={`w-full max-w-md shadow-2xl border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400 rounded-t-lg" />
        
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
  {/* Logo */}
  <div className="relative">
    <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-xl opacity-40" />
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
  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
    Selamat Datang
  </CardTitle>
</div>

          <CardDescription className="text-center text-base">
            Masukkan password baru untuk akun Anda
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* reCAPTCHA Status */}
            {!recaptchaReady && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  Memuat reCAPTCHA...
                </AlertDescription>
              </Alert>
            )}

            {recaptchaReady && !validationErrors.length && !error && !success && resetKey && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  Link reset password valid. Silakan buat password baru.
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
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  <ul className="list-disc list-inside space-y-1">
                    {success.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                  <p className="mt-2 font-semibold">Mengalihkan ke halaman login...</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Password 1 Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="pass1" 
                className={`transition-colors duration-200 ${
                  focusedField === 'pass1' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Password Baru
              </Label>
              <div className="relative group">
                <Input
                  id="pass1"
                  name="pass1"
                  type={showPassword1 ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={formData.pass1}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('pass1')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading || !recaptchaReady || !resetKey}
                  className={`w-full pr-10 transition-all duration-300 ${
                    focusedField === 'pass1' 
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20' 
                      : ''
                  } ${formData.pass1 ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password 2 Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="pass2" 
                className={`transition-colors duration-200 ${
                  focusedField === 'pass2' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Konfirmasi Password Baru
              </Label>
              <div className="relative group">
                <Input
                  id="pass2"
                  name="pass2"
                  type={showPassword2 ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={formData.pass2}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('pass2')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading || !recaptchaReady || !resetKey}
                  className={`w-full pr-10 transition-all duration-300 ${
                    focusedField === 'pass2' 
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20' 
                      : ''
                  } ${formData.pass2 ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
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

            {/* Info Section */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 space-y-3 border border-amber-200 dark:border-amber-900">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 italic flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Ketentuan Password
              </h3>
              <div className="space-y-2 text-xs text-amber-800 dark:text-amber-200 italic">
                <p>
                  - Password minimal 6 karakter
                </p>
                <p>
                  - Password tidak boleh hanya berisi angka
                </p>
                <p>
                  - Gunakan kombinasi huruf dan angka untuk keamanan lebih baik
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
              disabled={isLoading || !recaptchaReady || !resetKey}
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
              ) : !resetKey ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Link Tidak Valid
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Password akan dikirimkan ke email Anda setelah berhasil direset
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