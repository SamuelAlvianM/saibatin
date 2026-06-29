import { notFound } from 'next/navigation';
import { InfoPage } from '@/components/shared/info-page';
import { produkContent } from '@/lib/info-content';

export function generateStaticParams() {
  return Object.keys(produkContent).map((slug) => ({ slug: [slug] }));
}

export default async function ProdukPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const content = produkContent[slug.join('/')];
  if (!content) notFound();
  return <InfoPage content={content} />;
}
