'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/shared/footer';
import {
  Newspaper,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface News {
  id: number;
  judul: string;
  slug: string;
  kategori: string | null;
  ringkasan: string | null;
  gambar: string | null;
  createdAt: string;
}

const LIMIT = 9;

function tglID(s: string) {
  return new Date(s).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BeritaListPage() {
  const [items, setItems] = useState<News[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/berita?page=${page}&limit=${LIMIT}`)
      .then((res) => res.json())
      .then((json) => {
        setItems(json.data?.items ?? []);
        setTotalPages(json.data?.totalPages ?? 1);
      })
      .finally(() => setIsLoading(false));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const featured = page === 1 && items.length > 0 ? items[0] : null;
  const rest = featured ? items.slice(1) : items;

  return (
    <div className="relative bg-slate-50 min-h-screen">
      {/* Hero header brand */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #143a5c 0%, #1b4b72 55%, #2176bd 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '26px 26px' }}
        />
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-14 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0">
              <Newspaper className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-white/70 mb-1">
                Media Informasi
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Berita &amp; Informasi
              </h1>
              <p className="text-sm text-white/75 mt-1 max-w-xl">
                Kabar dan informasi terkini seputar layanan Disdukcapil Kabupaten Pesisir Barat.
              </p>
            </div>
          </div>
        </div>
        <svg className="relative block w-full text-slate-50" viewBox="0 0 1440 40" fill="currentColor" preserveAspectRatio="none" aria-hidden>
          <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 pb-16 -mt-2">
        {isLoading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Newspaper className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">Belum ada berita</p>
            <p className="text-sm text-slate-400 mt-1">Berita yang dipublikasikan akan tampil di sini.</p>
          </div>
        ) : (
          <>
            {/* Artikel unggulan */}
            {featured && (
              <Link
                href={`/media/berita/${featured.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-white border border-slate-200/70 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 mb-8"
              >
                <div className="relative aspect-video lg:aspect-auto lg:min-h-[320px] bg-slate-100 overflow-hidden">
                  {featured.gambar ? (
                    <Image
                      src={featured.gambar}
                      alt={featured.judul}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Newspaper className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full bg-primary text-white shadow-lg">
                    Terbaru
                  </span>
                </div>
                <div className="flex flex-col justify-center p-6 md:p-9">
                  {featured.kategori && (
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                      {featured.kategori}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-[1.75rem] font-bold text-slate-900 leading-tight tracking-tight text-balance line-clamp-3 group-hover:text-primary transition-colors">
                    {featured.judul}
                  </h2>
                  {featured.ringkasan && (
                    <p className="text-slate-500 mt-3 leading-relaxed line-clamp-3">
                      {featured.ringkasan}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-5">
                    <CalendarDays className="w-4 h-4" />
                    {tglID(featured.createdAt)}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-5 group-hover:gap-2.5 transition-all">
                    Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            )}

            {/* Grid berita lainnya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((item) => (
                <ArticleCard key={item.id} item={item} />
              ))}
            </div>

            {/* Paginasi */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-slate-600 border border-slate-200 hover:border-primary/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-9 h-9 px-3 rounded-xl text-sm font-semibold transition-colors ${
                      p === page
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-slate-600 border border-slate-200 hover:border-primary/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ─── Kartu berita ────────────────────────────────────────────────────────────

function ArticleCard({ item }: { item: News }) {
  return (
    <Link
      href={`/media/berita/${item.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {item.gambar ? (
          <Image
            src={item.gambar}
            alt={item.judul}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Newspaper className="w-9 h-9" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        {item.kategori && (
          <span className="text-[0.66rem] font-bold uppercase tracking-widest text-primary mb-1.5">
            {item.kategori}
          </span>
        )}
        <h2 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.judul}
        </h2>
        {item.ringkasan && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-1">
            {item.ringkasan}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays className="w-3.5 h-3.5" />
            {tglID(item.createdAt)}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton loading ────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-white border border-slate-200/70 mb-8">
        <div className="aspect-video lg:min-h-[320px] bg-slate-200" />
        <div className="p-9 space-y-4">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-7 w-4/5 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
            <div className="aspect-[16/10] bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-200 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
