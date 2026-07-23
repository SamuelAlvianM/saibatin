import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BackButton } from '@/components/shared/back-button';
import { SkmDashboard } from './SkmDashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardSkmPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level > 2) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-dashboard">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10">
        <BackButton href="/dashboard" />
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Survei Kepuasan Masyarakat (SKM)</h1>
          <p className="text-sm text-slate-500">Rekap penilaian masyarakat &amp; Indeks Kepuasan Masyarakat (IKM).</p>
        </div>
        <SkmDashboard />
      </div>
    </div>
  );
}
