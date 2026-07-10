import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { PengajuanBaruClient } from './PengajuanBaruClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPengajuanBaruPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level > 2) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10">
        <PengajuanBaruClient />
      </div>
    </div>
  );
}
