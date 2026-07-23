import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import { getLayanan, LAYANAN_PERMOHONAN } from '@/lib/permohonan-layanan';
import { BackButton } from '@/components/shared/back-button';
import { FormPageClient } from './FormPageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ layanan: string }>;
}): Promise<Metadata> {
  const { layanan } = await params;
  const meta = getLayanan(layanan);
  return { title: meta ? `${meta.title} — Ajukan Permohonan` : 'Ajukan Permohonan' };
}

export function generateStaticParams() {
  return LAYANAN_PERMOHONAN.map((l) => ({ layanan: l.slug }));
}

export default async function AjukanPermohonanPage({
  params,
}: {
  params: Promise<{ layanan: string }>;
}) {
  const { layanan } = await params;
  const meta = getLayanan(layanan);
  if (!meta) notFound();

  const session = await getSession();
  if (!session) redirect(`/login?redirect=/user/pengajuan/baru/${layanan}`);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-8">
        <BackButton href="/user/pengajuan/baru" />
        <div className="mt-4">
          <FormPageClient slug={layanan} />
        </div>
      </div>
    </div>
  );
}
