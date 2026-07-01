'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Footer } from '@/components/shared/footer';
import { Images, X } from 'lucide-react';

interface GalleryItem {
  id: number;
  judul: string;
  gambar: string;
  kategori: string | null;
  createdAt: string;
}

export default function GaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState<string>('Semua');

  useEffect(() => {
    fetch('/api/galeri')
      .then((r) => r.json())
      .then((j) => setItems(j.data?.items ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['Semua', ...Array.from(new Set(items.map((i) => i.kategori ?? 'Umum')))];
  const filtered = filter === 'Semua' ? items : items.filter((i) => (i.kategori ?? 'Umum') === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl glass-card-blue flex items-center justify-center">
              <Images className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Galeri</h1>
              <p className="text-primary-foreground/80 mt-1">Dokumentasi kegiatan Disdukcapil Kabupaten Pesisir Barat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12">
        {/* Filter tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === cat
                    ? 'text-slate-900 shadow-md'
                    : 'bg-white/60 text-slate-600 border border-slate-200 hover:border-primary/40'
                }`}
                style={filter === cat ? { background: 'linear-gradient(90deg, #ffed4a, #e77817)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <Images className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada foto dalam galeri.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid glass-card rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                onClick={() => setSelected(item)}
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={item.gambar.startsWith('/') ? item.gambar : `/uploads/gallery/${item.gambar}`}
                    alt={item.judul}
                    width={400}
                    height={300}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-medium line-clamp-2">{item.judul}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setSelected(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-4xl w-full glass-card rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <Image
                src={selected.gambar.startsWith('/') ? selected.gambar : `/uploads/gallery/${selected.gambar}`}
                alt={selected.judul}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 bg-white/80">
              <h3 className="font-semibold text-slate-900">{selected.judul}</h3>
              {selected.kategori && (
                <span className="text-xs text-primary font-medium">{selected.kategori}</span>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {new Date(selected.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
