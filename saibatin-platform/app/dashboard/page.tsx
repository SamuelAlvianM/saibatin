import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminUsers } from './AdminUsers';
import { FileText, Users, UserCheck, Clock, ClipboardList, FilePlus2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.level <= 2;

  // â”€â”€ Tampilan WARGA â”€â”€
  // Warga & Operator OPD tidak punya dashboard — langsung ke halaman pengajuan.
  if (!isAdmin) redirect('/user/pengajuan');

  // â”€â”€ Tampilan ADMIN/OPERATOR â”€â”€
  const [totalUser, userAktif, userPending, totalPermohonan] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 1 } }),
    prisma.user.count({ where: { status: 0 } }),
    prisma.permohonan.count(),
  ]);

  const cards = [
    { label: 'Total User', value: totalUser, icon: Users, color: 'text-slate-700' },
    { label: 'User Aktif', value: userAktif, icon: UserCheck, color: 'text-success' },
    { label: 'Menunggu Aktivasi', value: userPending, icon: Clock, color: 'text-warning' },
    { label: 'Total Permohonan', value: totalPermohonan, icon: FileText, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
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
              className="glass-card rounded-2xl p-5"
            >
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <p className="text-2xl font-semibold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Menu manajemen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/pengajuan-baru" className="rounded-2xl p-5 text-white shadow-lg transition-all hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #2176bd, #1b4b72)' }}>
            <FilePlus2 className="w-5 h-5 mb-2" />
            <p className="font-semibold">Pengajuan Baru</p>
            <p className="text-xs text-white/80 mt-0.5">Bantu warga ajukan dokumen</p>
          </Link>
          <Link href="/dashboard/permohonan" className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all">
            <ClipboardList className="w-5 h-5 text-primary mb-2" />
            <p className="font-semibold text-slate-900">Permohonan</p>
            <p className="text-xs text-slate-500 mt-0.5">Proses pengajuan warga</p>
          </Link>
          <Link href="/dashboard/berita" className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all">
            <FileText className="w-5 h-5 text-primary mb-2" />
            <p className="font-semibold text-slate-900">Berita</p>
            <p className="text-xs text-slate-500 mt-0.5">Kelola konten berita</p>
          </Link>
        </div>

        <AdminUsers />
      </div>
    </div>
  );
}
