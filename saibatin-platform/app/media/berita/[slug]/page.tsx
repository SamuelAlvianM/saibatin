'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, Loader2, Newspaper, CalendarDays } from 'lucide-react';

interface News {
  id: number;
  judul: string;
  slug: string;
  kategori: string | null;
  konten: string;
  gambar: string | null;
  penulis: string | null;
  createdAt: string;
}

export default function BeritaDetailPage() {
  const params = useParams<{ slug: string }>();
  const [berita, setBerita] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    fetch(`/api/berita/${params.slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error?.length) {
          setNotFoundFlag(true);
        } else {
          setBerita(json.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  if (notFoundFlag) notFound();

  const tgl = berita
    ? new Date(berita.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="relative bg-white min-h-screen">
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : berita ? (
        <>
          <article className="container mx-auto px-4 md:px-8 lg:px-16 pt-8 pb-14 max-w-4xl">
            <Link
              href="/media/berita"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Berita
            </Link>

            {/* Header — rata tengah */}
            <header className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-[2.6rem] font-bold text-slate-900 leading-[1.15] tracking-tight text-balance">
                {berita.judul}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  {tgl}
                </span>
                {berita.kategori && (
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {berita.kategori}
                  </span>
                )}
              </div>
            </header>

            {/* Gambar utama */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 mt-9 ring-1 ring-slate-200/70">
              {berita.gambar ? (
                <Image
                  src={berita.gambar}
                  alt={berita.judul}
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Newspaper className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Konten */}
            <div
              className="prose prose-slate prose-lg max-w-3xl mx-auto mt-10
                         prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-img:rounded-xl prose-blockquote:border-primary
                         prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: berita.konten }}
            />

            {/* Footer artikel */}
            <div className="max-w-3xl mx-auto mt-12 pt-6 border-t border-slate-100">
              <Link
                href="/media/berita"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Lihat berita lainnya
              </Link>
            </div>
          </article>
        </>
      ) : null}
      <Footer />
    </div>
  );
}
