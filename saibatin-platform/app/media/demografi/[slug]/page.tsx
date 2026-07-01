'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Footer } from '@/components/shared/footer';
import { DemografiChart } from '@/components/shared/demografi-chart';
import { Loader2 } from 'lucide-react';
import type { DemografiDataset } from '@/lib/demografi-data';

interface ApiResp {
  title: string;
  description: string;
  labels: string[];
  data: number[];
  satuan: string;
}

export default function DemografiPage() {
  const params = useParams<{ slug: string }>();
  const [dataset, setDataset] = useState<DemografiDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/demografi/${params.slug}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error?.length) {
          setMissing(true);
          return;
        }
        const d = j.data as ApiResp;
        setDataset({
          title: d.title,
          description: d.description,
          unit: d.satuan,
          items: d.labels.map((label, i) => ({ label, value: d.data[i] })),
        });
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (missing) notFound();

  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        {loading || !dataset ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <DemografiChart dataset={dataset} />
        )}
      </div>
      <Footer />
    </div>
  );
}
