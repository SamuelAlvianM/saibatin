import { notFound } from 'next/navigation';
import { Footer } from '@/components/shared/footer';
import { DemografiChart } from '@/components/shared/demografi-chart';
import { demografiData } from '@/lib/demografi-data';

export function generateStaticParams() {
  return Object.keys(demografiData).map((slug) => ({ slug }));
}

export default async function DemografiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dataset = demografiData[slug];
  if (!dataset) notFound();

  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <DemografiChart dataset={dataset} />
      </div>
      <Footer />
    </div>
  );
}
