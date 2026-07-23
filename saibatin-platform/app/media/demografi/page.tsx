import { Footer } from '@/components/shared/footer';
import { BackButton } from '@/components/shared/back-button';
import { DemografiView } from '@/components/landingpage/demografi-view';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Data Demografi — Disdukcapil',
  description: 'Data kependudukan agregat per kecamatan dan desa.',
};

export default function DemografiPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="container relative z-10 mx-auto px-4 py-12 md:px-8 md:py-14 lg:px-16">
          <BackButton href="/" />
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Data Demografi
              </h1>
              <p className="text-sm text-slate-500">
                Data kependudukan agregat per kecamatan — klik <b>Detail</b> untuk rincian tiap desa/kelurahan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="container mx-auto px-4 py-10 md:px-8 lg:px-16">
        <DemografiView />
      </div>

      <Footer />
    </>
  );
}
