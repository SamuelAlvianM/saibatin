import { notFound } from 'next/navigation';
import { InfoPage } from '@/components/shared/info-page';
import { wbsContent } from '@/lib/info-content';

export function generateStaticParams() {
  return Object.keys(wbsContent).map((slug) => ({ slug: [slug] }));
}

export default async function WbsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const content = wbsContent[slug.join('/')];
  if (!content) notFound();
  return <InfoPage content={content} />;
}
