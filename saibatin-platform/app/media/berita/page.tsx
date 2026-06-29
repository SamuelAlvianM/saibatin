'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/shared/footer';
import { Newspaper, Loader2 } from 'lucide-react';

interface News {
  id: number;
  judul: string;
  slug: string;
  kategori: string | null;
  ringkasan: string | null;
  gambar: string | null;
  createdAt: string;
}

export default function BeritaListPage() {
  const [items, setItems] = useState<News[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/berita?page=${page}&limit=9`)
      .then((res) => res.json())
      .then((json) => {
        setItems(json.data?.items ?? []);
        setTotalPages(json.data?.totalPages ?? 1);
      })
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <div className="mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              Berita & Informasi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Berita dan informasi terkini dari Disdukcapil Pesisir Barat.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-sm text-slate-500">
            Belum ada berita yang dipublikasikan.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/media/berita/${item.slug}`}
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="relative h-44 bg-slate-100">
                    {item.gambar ? (
                      <Image
                        src={item.gambar}
                        alt={item.judul}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Newspaper className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {item.kategori && (
                      <span className="text-xs font-medium text-blue-600">{item.kategori}</span>
                    )}
                    <h2 className="font-semibold text-slate-900 mt-1 line-clamp-2">{item.judul}</h2>
                    {item.ringkasan && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.ringkasan}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
