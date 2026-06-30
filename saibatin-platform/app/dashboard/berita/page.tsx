import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminBerita } from './AdminBerita';

export const dynamic = 'force-dynamic';

export default async function DashboardBeritaPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level > 2) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Manajemen Berita</h1>
          <p className="text-sm text-slate-500">Tambah, ubah, dan hapus berita portal.</p>
        </div>
        <AdminBerita />
      </div>
    </div>
  );
}
