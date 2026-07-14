import { notFound } from 'next/navigation';
import { EditableInfoPage } from '@/components/shared/editable-info-page';
import { wbsContent } from '@/lib/info-content';
import { infoBlockKey } from '@/lib/static-content-registry';

export function generateStaticParams() {
  return Object.keys(wbsContent).map((slug) => ({ slug: [slug] }));
}

export default async function WbsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join('/');
  const content = wbsContent[path];
  if (!content) notFound();
  return <EditableInfoPage kunci={infoBlockKey('wbs', path)} fallback={content} />;
}
