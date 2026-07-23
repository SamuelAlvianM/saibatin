import { redirect } from 'next/navigation';

/**
 * Halaman publik "Pelayanan Online" (grid layanan + 15 form berupa MODAL)
 * sudah dipensiunkan: pembuatan permohonan kini hanya lewat dashboard dan
 * berupa halaman penuh, bukan modal.
 *
 * URL lama dipertahankan sebagai pengalihan supaya tautan/bookmark yang sudah
 * beredar tidak mati. Versi modalnya tetap ada di riwayat git bila sewaktu-waktu perlu dirujuk.
 */
export default async function PermohonanOnlineRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  redirect(q ? `/user/pengajuan/baru?q=${encodeURIComponent(q)}` : '/user/pengajuan/baru');
}
