import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { type InfoBerkas } from '@/components/shared/info-page';
import { EditableInfoPage } from '@/components/shared/editable-info-page';
import { produkContent } from '@/lib/info-content';
import { dokumenJenisForPath } from '@/lib/dokumen-registry';
import { infoBlockKey } from '@/lib/static-content-registry';

// Dinamis: menampilkan berkas unggahan dashboard (Dokumen Publikasi).
export const dynamic = 'force-dynamic';

export default async function ProdukPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join('/');
  const content = produkContent[path];
  if (!content) notFound();

  const jenis = dokumenJenisForPath(`/produk/${path}`);
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

  return (
    <EditableInfoPage
      kunci={infoBlockKey('produk', path)}
      fallback={content}
      berkas={berkas}
      dokumenJenis={jenis[0]}
    />
  );
}
