import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BackButton } from '@/components/shared/back-button';
import { AdminKonten } from './AdminKonten';

export const dynamic = 'force-dynamic';

export default async function DashboardKontenPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level > 2) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:px-6">
        <BackButton href="/dashboard" />
        <div className="mb-4 mt-1">
          <h1 className="text-2xl font-semibold text-slate-900">Konten Halaman</h1>
          <p className="text-sm text-slate-500">
            Pilih halaman dari menu di kiri, lalu edit langsung pada pratinjau —
            klik tombol <b>pensil</b> pada bagian yang ingin diubah.
          </p>
        </div>
        <AdminKonten />
      </div>
    </div>
  );
}
