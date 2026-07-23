import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BackButton } from '@/components/shared/back-button';
import { AdminProduk } from './AdminProduk';

export const dynamic = 'force-dynamic';

export default async function DashboardProdukPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level !== 1) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-dashboard">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10">
        <BackButton href="/dashboard" />
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dokumen Publikasi</h1>
          <p className="text-sm text-slate-500">
            Unggah PDF/berkas publikasi (formulir, produk hukum, SOP, LHKPN, LKJIP, dsb). Setiap
            kategori menampilkan di halaman publik mana berkas akan muncul.
          </p>
        </div>
        <AdminProduk />
      </div>
    </div>
  );
}
