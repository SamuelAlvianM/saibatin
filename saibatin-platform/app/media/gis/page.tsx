import { Footer } from '@/components/shared/footer';
import { BackButton } from '@/components/shared/back-button';
import { Map as MapIcon } from 'lucide-react';
import PetaDemografiLoader from '@/components/landingpage/peta-demografi-loader';

export const metadata = {
  title: 'GIS Dukcapil — Peta Sebaran Penduduk',
  description: 'Peta sebaran penduduk per kecamatan Kabupaten Pesisir Barat.',
};

export default function GisPage() {
  return (
    <div className="relative min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-4 py-12 md:px-8 lg:px-16 lg:py-16">
        <BackButton href="/" />
        <div className="mb-6 mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <MapIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              GIS Dukcapil — Peta Sebaran Penduduk
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Persebaran jumlah penduduk per kecamatan di Kabupaten Pesisir Barat. Klik lingkaran
              untuk melihat rincian.
            </p>
          </div>
        </div>

        <PetaDemografiLoader />
      </div>
      <Footer />
    </div>
  );
}
