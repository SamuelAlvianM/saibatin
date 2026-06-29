import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminUsers } from './AdminUsers';
import { FileText, Users, UserCheck, Clock, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.level <= 2;

  // ── Tampilan WARGA ──
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Halo, {session.nama ?? session.userId}
              </h1>
              <p className="text-sm text-slate-500">Selamat datang di portal SAIBATIN.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/permohonan-online"
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md hover:border-yellow-300 transition-all"
            >
              <FileText className="w-6 h-6 text-yellow-600 mb-2" />
              <h2 className="font-semibold text-slate-900">Permohonan Online</h2>
              <p className="text-sm text-slate-500 mt-1">Ajukan dokumen kependudukan.</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-yellow-700">
                Mulai <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Tampilan ADMIN/OPERATOR ──
  const [totalUser, userAktif, userPending, totalPermohonan] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 1 } }),
    prisma.user.count({ where: { status: 0 } }),
    prisma.permohonan.count(),
  ]);

  const cards = [
    { label: 'Total User', value: totalUser, icon: Users, color: 'text-slate-700' },
    { label: 'User Aktif', value: userAktif, icon: UserCheck, color: 'text-green-600' },
    { label: 'Menunggu Aktivasi', value: userPending, icon: Clock, color: 'text-amber-600' },
    { label: 'Total Permohonan', value: totalPermohonan, icon: FileText, color: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard Admin</h1>
            <p className="text-sm text-slate-500">
              {session.nama ?? session.userId} &middot; {session.level === 1 ? 'Super Admin' : 'Operator'}
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5"
            >
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <p className="text-2xl font-semibold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>

        <AdminUsers />
      </div>
    </div>
  );
}
