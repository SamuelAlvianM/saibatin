'use client';

import StoreProvider from "@/store/StoreProvider";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function Providers({ children }: { children: React.ReactNode }) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Tanpa site key, jangan render provider reCAPTCHA — memberi key kosong
  // membuat skrip Google gagal dimuat dan tombol "memuat" tanpa henti.
  if (!recaptchaKey) {
    return <StoreProvider>{children}</StoreProvider>;
  }

  return (
    <StoreProvider>
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
        {children}
      </GoogleReCaptchaProvider>
    </StoreProvider>
  );
}