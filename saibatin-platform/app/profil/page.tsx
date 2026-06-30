import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfilForm } from './ProfilForm';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: {
      userId: true,
      userFullname: true,
      userNik: true,
      userNokk: true,
      userHp: true,
      userEmail: true,
      ket: true,
      level: { select: { nama: true } },
    },
  });
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Profil Saya</h1>
          <p className="text-sm text-slate-500">Perbarui biodata akun Anda.</p>
        </div>
        <ProfilForm
          initial={{
            userId: user.userId,
            nama: user.userFullname ?? '',
            nik: user.userNik ?? '',
            nokk: user.userNokk ?? '',
            hp: user.userHp ?? '',
            email: user.userEmail ?? '',
            alamat: user.ket ?? '',
            levelNama: user.level?.nama ?? '',
          }}
        />
      </div>
    </div>
  );
}
