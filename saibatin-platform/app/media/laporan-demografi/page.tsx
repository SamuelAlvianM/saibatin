import Link from 'next/link';
import { Footer } from '@/components/shared/footer';
import { demografiData } from '@/lib/demografi-data';

export default function LaporanDemografiPage() {
  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-2">
          Laporan Data Demografi
        </h1>
        <p className="text-sm text-slate-500 mb-8 max-w-2xl">
          Ringkasan laporan demografi penduduk Kabupaten Pesisir Barat. Pilih kategori
          untuk melihat rincian data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(demografiData).map(([slug, dataset]) => (
            <Link
              key={slug}
              href={`/media/demografi/${slug}`}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <h2 className="font-semibold text-slate-900">{dataset.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{dataset.description}</p>
              <span className="inline-block mt-3 text-xs font-medium text-blue-600">
                Lihat detail &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
