'use client';

import StoreProvider from "@/store/StoreProvider";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      >
        {children}
      </GoogleReCaptchaProvider>
    </StoreProvider>
  );
}