import { notFound } from 'next/navigation';
import { EditableInfoPage } from '@/components/shared/editable-info-page';
import { hubungiKamiContent } from '@/lib/info-content';
import { infoBlockKey } from '@/lib/static-content-registry';

export function generateStaticParams() {
  return Object.keys(hubungiKamiContent).map((slug) => ({ slug: [slug] }));
}

export default async function HubungiKamiPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join('/');
  const content = hubungiKamiContent[path];
  if (!content) notFound();
  return (
    <EditableInfoPage kunci={infoBlockKey('hubungi-kami', path)} fallback={content} />
  );
}
