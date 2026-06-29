import { notFound } from 'next/navigation';
import { InfoPage } from '@/components/shared/info-page';
import { hubungiKamiContent } from '@/lib/info-content';

export function generateStaticParams() {
  return Object.keys(hubungiKamiContent).map((slug) => ({ slug: [slug] }));
}

export default async function HubungiKamiPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const content = hubungiKamiContent[slug.join('/')];
  if (!content) notFound();
  return <InfoPage content={content} />;
}
