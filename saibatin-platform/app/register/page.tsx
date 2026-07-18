import { Suspense } from "react";
import RegisterContent from "./RegisterContent";
import RegisterComingSoon from "./ComingSoon";

// Pendaftaran mandiri hanya aktif bila NEXT_PUBLIC_REGISTER_OPEN === "true"
// (verifikasi OTP email/WA sedang disiapkan). Selain itu → "segera hadir".
const REGISTER_OPEN = process.env.NEXT_PUBLIC_REGISTER_OPEN === "true";

export default function RegisterPage() {
  if (!REGISTER_OPEN) {
    return <RegisterComingSoon />;
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
