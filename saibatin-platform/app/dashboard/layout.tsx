import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Warga (level 3) tidak memakai sidebar admin.
  if (session.level > 2) return <>{children}</>;

  return (
    <div className="min-h-screen bg-dashboard lg:flex">
      <DashboardSidebar />
      {/* pb-20: ruang untuk bottom-nav mobile */}
      <div className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</div>
    </div>
  );
}
