import Link from 'next/link';
import { Footer } from '@/components/shared/footer';
import { produkContent, ppidContent, hubungiKamiContent } from '@/lib/info-content';

const sections: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Pelayanan Online',
    links: [{ label: 'Permohonan Online', href: '/permohonan-online' }],
  },
  {
    title: 'Produk',
    links: Object.entries(produkContent).map(([slug, c]) => ({
      label: c.title,
      href: `/produk/${slug}`,
    })),
  },
  {
    title: 'Media Informasi',
    links: [
      { label: 'Berita', href: '/media/berita' },
      { label: 'Peta', href: '/media/peta' },
      { label: 'Survey Kepuasan Masyarakat', href: '/hubungi-kami#survei' },
      { label: 'GIS Dukcapil', href: '/media/gis' },
      { label: 'Laporan Data Demografi', href: '/media/demografi' },
      { label: 'Demografi - Agama', href: '/media/demografi/agama' },
      { label: 'Demografi - Golongan Darah', href: '/media/demografi/gol-darah' },
      { label: 'Demografi - Jenis Kelamin', href: '/media/demografi/jenis-kelamin' },
      { label: 'Demografi - Pekerjaan', href: '/media/demografi/pekerjaan' },
      { label: 'Demografi - Kartu Keluarga', href: '/media/demografi/kk' },
      { label: 'Demografi - Pendidikan', href: '/media/demografi/pendidikan' },
      { label: 'Demografi - Status Perkawinan', href: '/media/demografi/status-kawin' },
      { label: 'Demografi - Wajib KTP', href: '/media/demografi/wajib-ktp' },
    ],
  },
  {
    title: 'PPID',
    links: Object.entries(ppidContent).map(([slug, c]) => ({
      label: c.title,
      href: `/ppid/${slug}`,
    })),
  },
  {
    title: 'Pengaduan',
    links: [
      { label: 'Pengaduan Masyarakat & WBS', href: '/pengaduan' },
      { label: 'Kritik & Saran', href: '/hubungi-kami/kritik-saran' },
    ],
  },
  {
    title: 'Hubungi Kami',
    links: Object.entries(hubungiKamiContent).map(([slug, c]) => ({
      label: c.title,
      href: `/hubungi-kami/${slug}`,
    })),
  },
  {
    title: 'Lainnya',
    links: [
      { label: 'Kebijakan & Privasi', href: '/kebijakan-privasi' },
      { label: 'Privasi', href: '/privasi' },
      { label: 'Syarat & Ketentuan', href: '/syarat' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-2">
          Sitemap
        </h1>
        <p className="text-sm text-slate-500 mb-8">Peta seluruh halaman portal SAIBATIN.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5"
            >
              <h2 className="font-semibold text-slate-900 mb-3">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-primary hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
