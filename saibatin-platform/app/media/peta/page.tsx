import { Footer } from '@/components/shared/footer';
import { siteConfig } from '@/lib/site-config';
import { MapPin } from 'lucide-react';

export default function PetaPage() {
  const embedUrl = siteConfig.maps.alamatEmbed;

  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <div className="mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              Peta Wilayah Administrasi
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Peta lokasi kantor Disdukcapil Kabupaten Pesisir Barat.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-[480px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="h-[480px] flex items-center justify-center text-sm text-slate-500">
              Peta belum dikonfigurasi. Set NEXT_PUBLIC_SITE_MAPS_ALAMAT_EMBED pada .env.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
