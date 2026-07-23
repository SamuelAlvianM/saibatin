import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BackButton } from '@/components/shared/back-button';
import { PilihLayananClient } from './PilihLayananClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Ajukan Permohonan' };

export default async function PilihLayananPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // Pencarian & tombol cepat di beranda mengirim ?q= ke sini.
  const { q } = await searchParams;
  const session = await getSession();
  if (!session) {
    const tujuan = q
      ? `/user/pengajuan/baru?q=${encodeURIComponent(q)}`
      : '/user/pengajuan/baru';
    redirect(`/login?redirect=${encodeURIComponent(tujuan)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8 md:px-8">
        <BackButton href="/user/pengajuan" />
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            Ajukan Permohonan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih layanan yang ingin Anda ajukan. Formulir akan terbuka sebagai
            halaman penuh sehingga lebih leluasa diisi.
          </p>
        </div>
        <PilihLayananClient kataKunciAwal={q ?? ''} />
      </div>
    </div>
  );
}
