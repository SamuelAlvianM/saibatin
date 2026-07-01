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
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16 max-w-7xl">
        <Link
          href="/media/berita"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Berita
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : berita ? (
          <article className="mx-auto max-w-3xl">
            {/* Gambar di tengah */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 mx-auto">
              {berita.gambar ? (
                <Image src={berita.gambar} alt={berita.judul} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Newspaper className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* Judul di bawah gambar */}
            <div className="text-center mt-8">
              {berita.kategori && (
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {berita.kategori}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-3 text-balance">
                {berita.judul}
              </h1>
              <p className="text-sm text-slate-400">
                {new Date(berita.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {berita.penulis ? ` • ${berita.penulis}` : ''}
              </p>
            </div>

            {/* Deskripsi/konten di bawah judul */}
            <div
              className="prose prose-slate prose-lg max-w-none mt-10"
              dangerouslySetInnerHTML={{ __html: berita.konten }}
            />
          </article>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
