import { notFound } from 'next/navigation';
import { InfoPage } from '@/components/shared/info-page';
import { ppidContent } from '@/lib/info-content';

export function generateStaticParams() {
  return Object.keys(ppidContent).map((slug) => ({ slug: [slug] }));
}

export default async function PpidPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const content = ppidContent[slug.join('/')];
  if (!content) notFound();
  return <InfoPage content={content} />;
}
