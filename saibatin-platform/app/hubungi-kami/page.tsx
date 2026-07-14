import Link from 'next/link';
import { Footer } from '@/components/shared/footer';
import { siteConfig } from '@/lib/site-config';
import {
  ArrowRight,
  ClipboardCheck,
  Clock,
  Mail,
  MapPin,
  MessageSquareWarning,
  Phone,
} from 'lucide-react';
import { SurveyKepuasanForm } from '@/components/shared/survey-kepuasan-form';

export const metadata = {
  title: 'Hubungi Kami — Disdukcapil Pesisir Barat',
  description:
    'Alamat kantor, jam pelayanan, kontak, dan peta lokasi Disdukcapil Kabupaten Pesisir Barat.',
};

const INFO = [
  {
    icon: MapPin,
    judul: 'Alamat Kantor',
    gradasi: 'from-sky-400 to-sky-600',
    baris: [
      'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat',
      'Pasar Mulya Timur 01, Kelurahan Pasar Krui, Kecamatan Pesisir Tengah, Kabupaten Pesisir Barat, Lampung',
    ],
  },
  {
    icon: Clock,
    judul: 'Jam Pelayanan',
    gradasi: 'from-emerald-400 to-emerald-600',
    baris: ['Senin – Jumat: 08.00 – 16.00 WIB', 'Sabtu, Minggu & hari libur nasional: tutup'],
  },
  {
    icon: Phone,
    judul: 'Kontak',
    gradasi: 'from-amber-400 to-amber-600',
    baris: ['Telepon: (0728) 21XXX', 'Email: disdukcapil@pesisirbaratkab.go.id'],
  },
];

export default function HubungiKamiPage() {
  const embedUrl = siteConfig.maps.alamatEmbed;

  return (
    <div className="relative min-h-screen bg-slate-50/30">
      {/* Hero */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-primary/[0.07] via-slate-50 to-transparent">
        <div className="container mx-auto px-4 pt-12 pb-10 md:px-8 lg:px-16 lg:pt-16">
          <p className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-widest text-primary">
            Layanan Publik · Disdukcapil
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Hubungi Kami
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
            Informasi alamat kantor, jam pelayanan, dan kanal kontak resmi Dinas
            Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat.
          </p>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4 py-10 md:px-8 lg:px-16">
        {/* Kartu info: alamat, jam kerja, kontak */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {INFO.map((info) => {
            const Icon = info.icon;
            return (
              <div
                key={info.judul}
                className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${info.gradasi}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">
                  {info.judul}
                </h2>
                <div className="mt-1.5 space-y-1.5">
                  {info.baris.map((b) => (
                    <p key={b} className="text-sm leading-relaxed text-slate-500">
                      {b.startsWith('Email:') ? (
                        <>
                          Email:{' '}
                          <a
                            href={`mailto:${b.replace('Email: ', '')}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {b.replace('Email: ', '')}
                          </a>
                        </>
                      ) : (
                        b
                      )}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Peta lokasi kantor */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-slate-900">
              Peta Lokasi Kantor
            </h2>
          </div>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Peta lokasi kantor Disdukcapil Pesisir Barat"
              className="h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm text-slate-500">
              Peta belum dikonfigurasi. Set NEXT_PUBLIC_SITE_MAPS_ALAMAT_EMBED pada .env.
            </div>
          )}
        </div>

        {/* Survey kepuasan masyarakat — form SKM internal (dipindah dari menu
            Media Informasi; data tersimpan di DB via /api/skm) */}
        <div id="survei" className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-slate-900">
              Survey Kepuasan Masyarakat
            </h2>
          </div>
          <div className="mx-auto max-w-2xl px-6 py-6">
            <SurveyKepuasanForm />
          </div>
        </div>

        {/* Ajakan pengaduan */}
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-gradient-to-br from-[#2176bd] to-[#1b4b72] p-7 text-white shadow-lg md:flex-row md:items-center md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
              <MessageSquareWarning className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Punya keluhan atau masukan tentang layanan?
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/80">
                Sampaikan melalui fitur Pengaduan Masyarakat — setiap laporan
                ditindaklanjuti oleh petugas Disdukcapil Pesisir Barat.
              </p>
            </div>
          </div>
          <Link
            href="/pengaduan"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-md transition-all hover:gap-3 hover:shadow-lg"
          >
            Sampaikan Pengaduan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
