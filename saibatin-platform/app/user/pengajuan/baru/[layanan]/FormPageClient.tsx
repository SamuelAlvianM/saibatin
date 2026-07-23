"use client";

import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getLayananForm } from "@/lib/layanan-forms";
import { ROUTE_KE_FORM_SLUG } from "@/lib/permohonan-layanan";
import { StaffPengajuanForm } from "@/components/dashboard/staff-pengajuan-form";

/**
 * Form permohonan warga/OPD sebagai HALAMAN PENUH — satu halaman bersegmen
 * (bukan modal step-by-step). Memakai renderer & skema yang SAMA dengan form
 * "Pengajuan Baru" petugas (components/dashboard/staff-pengajuan-form.tsx +
 * lib/layanan-forms.ts), hanya dalam mode `mandiri`: pengaju mengisi untuk
 * dirinya sendiri, jadi data miliknya diisi otomatis lebih dulu.
 *
 * Slug rute publik (mis. "ktp-elektronik") dipetakan ke slug skema form
 * (mis. "ktpel") lewat ROUTE_KE_FORM_SLUG. Keduanya menuju endpoint catch-all
 * /api/<layanan>/(upload|create) yang sudah mengatribusikan permohonan ke
 * pengguna yang login.
 */
export function FormPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);

  const formSlug = ROUTE_KE_FORM_SLUG[slug];
  const layanan = formSlug ? getLayananForm(formSlug) : undefined;
  if (!layanan) return null;

  // Isi awal data pemohon dari akun yang login. NIK hanya diisi bila user_id
  // memang 16 digit (warga); akun OPD yang user_id-nya bukan NIK dibiarkan kosong.
  const prefill: Record<string, string> = {};
  if (user?.user_id && /^\d{16}$/.test(user.user_id)) prefill.pemohonnik = user.user_id;
  if (user?.name) prefill.pemohonnama = user.name;
  if (user?.email) prefill.pemohonemail = user.email;

  return (
    <StaffPengajuanForm
      layanan={layanan}
      mandiri
      prefill={prefill}
      hideHeaderBack
      onBack={() => router.push("/user/pengajuan")}
    />
  );
}
