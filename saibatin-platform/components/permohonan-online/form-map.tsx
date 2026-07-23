"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentType } from "react";

/**
 * Peta slug layanan → komponen form.
 *
 * Komponen yang sama dipakai oleh halaman lama (sebagai modal) dan halaman
 * baru di dashboard (sebagai halaman penuh) — bedanya hanya dibungkus
 * <FormPageMode> atau tidak. Lihat components/permohonan-online/form-shell.tsx.
 *
 * next/dynamic dipakai supaya satu rute hanya memuat form yang dibuka, bukan
 * seluruh 15 form (masing-masing ~700 baris).
 */

export interface FormPermohonanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

const memuat = () => (
  <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span className="text-sm">Memuat formulir…</span>
  </div>
);

const d = (loader: () => Promise<{ default: ComponentType<FormPermohonanProps> }>) =>
  dynamic(loader, { loading: memuat, ssr: false });

export const FORM_PERMOHONAN: Record<string, ComponentType<FormPermohonanProps>> = {
  "konsolidasi-update-data": d(() => import("./KonsolidasiUpdateDataModal")),
  "akta-kelahiran-belum-nik": d(() => import("./AktaKelahiranNikTidakAdaModal")),
  "akta-kelahiran-ada-nik": d(() => import("./AktaKelahiranNikAdaModal")),
  "kk-perubahan-biodata": d(() => import("./KKPerubahanBiodataModal")),
  "kk-pisah-kk": d(() => import("./KKPisahKKModal")),
  "kk-numpang-kk": d(() => import("./KKNumpangModal")),
  "kk-penambahan-anak": d(() => import("./KKTambahAnakModal")),
  "kk-cetak-ulang": d(() => import("./KKCetakUlangModal")),
  "akta-perceraian": d(() => import("./AktaPerceraianModal")),
  "akta-kematian": d(() => import("./AktaKematianModal")),
  "akta-perkawinan": d(() => import("./AktaNikahModal")),
  "kartu-identitas-anak": d(() => import("./KIAModal")),
  "perpindahan-penduduk": d(() => import("./PerpindahanPendudukModal")),
  "kedatangan-penduduk": d(() => import("./KedatanganPendudukModal")),
  "ktp-elektronik": d(() => import("./KTPELModal")),
};
