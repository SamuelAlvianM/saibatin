import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BackButton } from '@/components/shared/back-button';
import { AdminDemografi } from './AdminDemografi';

export const dynamic = 'force-dynamic';

export default async function DashboardDemografiPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level !== 1) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-dashboard">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10">
        <BackButton href="/dashboard" />
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Data Demografi</h1>
          <p className="text-sm text-slate-500">
            Import data kependudukan agregat (Excel Dukcapil) untuk ditampilkan di halaman publik.
          </p>
        </div>
        <AdminDemografi />
      </div>
    </div>
  );
}
