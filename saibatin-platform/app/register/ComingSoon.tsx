import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowLeft, Info } from "lucide-react";

/**
 * Tampilan "segera hadir" untuk pendaftaran mandiri. Dipakai saat
 * NEXT_PUBLIC_REGISTER_OPEN !== "true" (mis. verifikasi OTP masih disiapkan).
 * Form pendaftaran penuh tetap ada di RegisterContent — tinggal aktifkan flag.
 */
export default function RegisterComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Aksen dekoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-lg relative z-10 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="h-1 bg-primary" />
        <div className="p-8 sm:p-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/logo-saibatin.png"
              alt="Logo SAIBATIN"
              width={56}
              height={56}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Pendaftaran Segera Hadir
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
            Fitur pendaftaran akun mandiri sedang kami siapkan agar lebih aman
            dan nyaman. Silakan cek kembali dalam waktu dekat.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
            <Info className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sudah punya akun? Anda tetap dapat masuk seperti biasa. Untuk
              bantuan pembuatan akun, hubungi petugas Disdukcapil melalui menu{" "}
              <Link href="/hubungi-kami" className="font-medium text-primary hover:underline">
                Hubungi Kami
              </Link>
              .
            </p>
          </div>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Halaman Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
