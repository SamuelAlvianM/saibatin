'use client';

import { useEffect } from "react";
import { Toaster } from "sonner";
import StoreProvider from "@/store/StoreProvider";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useAppDispatch } from "@/store/hooks";
import { verifySession } from "@/store/slices/authSlice";
import { InlineEditProvider } from "@/components/konten/inline-edit";
import { AccessibilityWidget } from "@/components/shared/accessibility-widget";

/** Hydrasi status login dari cookie sesi saat aplikasi dimuat. */
function SessionHydrator() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(verifySession());
  }, [dispatch]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const inner = (
    <>
      <SessionHydrator />
      <InlineEditProvider>{children}</InlineEditProvider>
      <AccessibilityWidget />
      <Toaster
        richColors
        closeButton
        position="top-center"
        duration={5000}
        toastOptions={{ classNames: { toast: "!items-start" } }}
      />
    </>
  );

  // Tanpa site key, jangan render provider reCAPTCHA — memberi key kosong
  // membuat skrip Google gagal dimuat dan tombol "memuat" tanpa henti.
  if (!recaptchaKey) {
    return <StoreProvider>{inner}</StoreProvider>;
  }

  return (
    <StoreProvider>
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
        {inner}
      </GoogleReCaptchaProvider>
    </StoreProvider>
  );
}