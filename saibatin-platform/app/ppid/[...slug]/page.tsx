import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { InfoPage, type InfoBerkas } from '@/components/shared/info-page';
import { ppidContent } from '@/lib/info-content';
import { dokumenJenisForPath } from '@/lib/dokumen-registry';

// Dinamis: menampilkan berkas unggahan dashboard (Dokumen Publikasi).
export const dynamic = 'force-dynamic';

export default async function PpidPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join('/');
  const content = ppidContent[path];
  if (!content) notFound();

  const jenis = dokumenJenisForPath(`/ppid/${path}`);
  const berkas: InfoBerkas[] = jenis.length
    ? (
        await prisma.produk.findMany({
          where: { jenis: { in: jenis }, file: { not: null } },
          orderBy: { createdAt: 'desc' },
          select: { id: true, judul: true, file: true, createdAt: true },
        })
      ).map((b) => ({
        id: b.id,
        judul: b.judul,
        file: b.file as string,
        createdAt: b.createdAt.toISOString(),
      }))
    : [];

  return <InfoPage content={content} berkas={berkas} />;
}
