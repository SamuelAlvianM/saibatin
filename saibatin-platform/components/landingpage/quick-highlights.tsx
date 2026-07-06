'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { animate, stagger } from 'animejs';
import { Newspaper, ArrowRight, CalendarDays } from 'lucide-react';

interface News {
  id: number;
  judul: string;
  slug: string;
  kategori: string | null;
  ringkasan: string | null;
  gambar: string | null;
  createdAt: string;
}

function tglID(s: string) {
  return new Date(s).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function QuickHighlights() {
  const [news, setNews] = useState<News[] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/berita?page=1&limit=3')
      .then((r) => r.json())
      .then((j) => setNews(j.data?.items ?? []))
      .catch(() => setNews([]));
  }, []);

  // Animasi masuk berurutan setelah data tiba
  useEffect(() => {
    if (!gridRef.current || !news?.length) return;
    const items = gridRef.current.querySelectorAll('.js-news-card');
    if (!items.length) return;
    animate(items, {
      opacity: [0, 1],
      translateY: [22, 0],
      scale: [0.97, 1],
      delay: stagger(90),
      duration: 600,
      ease: 'out(3)',
    });
  }, [news]);

  // Jangan tampilkan section bila belum ada berita.
  if (news !== null && news.length === 0) return null;

  return (
    <div>
      {/* Header seksi */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-widest text-primary mb-1">
            Media Informasi
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Berita Terbaru
          </h2>
        </div>
        <Link
          href="/media/berita"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all shrink-0"
        >
          Lihat Semua <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid kartu */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news === null
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/70 bg-white overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-200 rounded mt-4" />
                </div>
              </div>
            ))
          : news.map((item) => (
              <Link
                key={item.id}
                href={`/media/berita/${item.slug}`}
                className="js-news-card group flex flex-col bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                style={{ opacity: 0 }}
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
                  <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.judul}
                  </h3>
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
            ))}
      </div>
    </div>
  );
}
