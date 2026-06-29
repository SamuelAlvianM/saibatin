'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, Loader2, Newspaper } from 'lucide-react';

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

  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16 max-w-3xl">
        <Link
          href="/media/berita"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Berita
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : berita ? (
          <article className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="relative h-64 sm:h-80 bg-slate-100">
              {berita.gambar ? (
                <Image src={berita.gambar} alt={berita.judul} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Newspaper className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-6 md:p-8">
              {berita.kategori && (
                <span className="text-xs font-medium text-blue-600">{berita.kategori}</span>
              )}
              <h1 className="text-2xl font-semibold text-slate-900 mt-2 mb-2">{berita.judul}</h1>
              <p className="text-xs text-slate-400 mb-6">
                {new Date(berita.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {berita.penulis ? ` • ${berita.penulis}` : ''}
              </p>
              <div
                className="prose prose-slate prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: berita.konten }}
              />
            </div>
          </article>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
