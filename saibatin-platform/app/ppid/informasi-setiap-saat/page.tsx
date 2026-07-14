import { PpidInformasiIndex } from '@/components/ppid/informasi-index';
import { PPID_SETIAP_SAAT } from '@/lib/ppid-informasi';

export const metadata = {
  title: 'Informasi Wajib Tersedia Setiap Saat — PPID Disdukcapil Pesisir Barat',
  description: PPID_SETIAP_SAAT.deskripsi,
};

// Jumlah dokumen dihitung dari unggahan Dokumen Publikasi di DB.
export const dynamic = 'force-dynamic';

export default function InformasiSetiapSaatPage() {
  return <PpidInformasiIndex grup={PPID_SETIAP_SAAT} />;
}
