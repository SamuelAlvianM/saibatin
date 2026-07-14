import { redirect } from 'next/navigation';

/**
 * Halaman indeks kartu demografi dihapus — fungsinya sama dengan halaman
 * data ber-tab kategori. Redirect dipertahankan untuk tautan/bookmark lama.
 */
export default function LaporanDemografiPage() {
  redirect('/media/demografi');
}
