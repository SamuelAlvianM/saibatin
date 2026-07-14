import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BackButton } from '@/components/shared/back-button';
import { AdminUsers } from '../AdminUsers';

export const dynamic = 'force-dynamic';

/** Manajemen Akun — daftar user (warga), operator OPD, dan staff dinas. */
export default async function DashboardUsersPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.level > 2) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:px-6">
        <BackButton href="/dashboard" />
        <div className="mb-4 mt-1">
          <h1 className="text-2xl font-semibold text-slate-900">Manajemen Akun</h1>
          <p className="text-sm text-slate-500">
            Kelola akun <b>Warga</b>, <b>Operator OPD</b>, dan <b>Staff</b> dinas —
            aktivasi, penonaktifan, dan pembuatan akun baru.
          </p>
        </div>
        <AdminUsers />
      </div>
    </div>
  );
}
