'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';

interface News {
  id: number;
  judul: string;
  slug: string;
  ringkasan: string | null;
  gambar: string | null;
}

interface CardData {
  key: string | number;
  title: string;
  desc: string;
  href: string;
  image: string;
}

const FALLBACK: CardData[] = [
  {
    key: 'permohonan-online',
    title: 'Permohonan Online',
    desc: 'Ajukan 15+ jenis dokumen kependudukan tanpa antre, kapan saja.',
    href: '/permohonan-online',
    image: '/highlights/layanan-online.jpg',
  },
  {
    key: 'pantau-status',
    title: 'Pantau Status Real-time',
    desc: 'Cek progres permohonan dari Menunggu hingga Selesai lewat Riwayat.',
    href: '/riwayat',
    image: '/highlights/pantau-status.png',
  },
  {
    key: 'unduh-bukti',
    title: 'Unduh Bukti Permohonan',
    desc: 'Download bukti pengajuan dalam format PDF langsung dari akun Anda.',
    href: '/riwayat',
    image: '/highlights/unduh-bukti.png',
  },
  {
    key: 'berita-info',
    title: 'Berita & Informasi',
    desc: 'Ikuti kabar terbaru seputar layanan Disdukcapil Pesisir Barat.',
    href: '/media/berita',
    image: '/highlights/berita-info.jpg',
  },
];

const PAGE_SIZE = 4;
const AUTO_ROTATE_MS = 6000;

export default function QuickHighlights() {
  const [news, setNews] = useState<News[] | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch('/api/berita?page=1&limit=12')
      .then((r) => r.json())
      .then((j) => setNews(j.data?.items ?? []))
      .catch(() => setNews([]));
  }, []);

  const cards: CardData[] =
    news && news.length > 0
      ? news.map((n) => ({
          key: n.id,
          title: n.judul,
          desc: n.ringkasan ?? '',
          href: `/media/berita/${n.slug}`,
          image: n.gambar ?? '',
        }))
      : FALLBACK;

  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  const currentCards = cards.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const next = () => setPage((p) => (p + 1) % totalPages);
  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  // Auto-rotate halaman kalau data lebih dari 1 halaman
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(next, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  return (
    <div className="relative flex-1 min-h-[220px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid grid-cols-2 auto-rows-fr gap-3 h-full"
        >
          {currentCards.map((item, i) => (
            <motion.div
              key={item.key}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              className="h-full w-full"
            >
              <Link
                href={item.href}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-1 ring-slate-200/70 transition-shadow hover:shadow-lg"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-300 text-slate-400">
                    <Newspaper className="h-6 w-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/0" />
                <div className="relative mt-auto p-3.5">
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1">{item.title}</h3>
                  {item.desc && (
                    <p className="mt-1 text-xs text-white/75 line-clamp-2 leading-relaxed">{item.desc}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Kontrol navigasi — hanya tampil bila lebih dari 1 halaman */}
      {totalPages > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Sebelumnya"
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/95 shadow-lg border border-slate-200 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button
            onClick={next}
            aria-label="Selanjutnya"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/95 shadow-lg border border-slate-200 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </button>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Halaman ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page ? 'w-6 bg-primary' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
