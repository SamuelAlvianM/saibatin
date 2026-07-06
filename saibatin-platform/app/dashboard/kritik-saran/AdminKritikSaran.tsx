'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Search, MessagesSquare, Mail, Phone, User, CalendarDays } from 'lucide-react';

interface Item {
  id: number;
  nama: string;
  email: string | null;
  hp: string | null;
  pesan: string;
  createdAt: string;
}

export function AdminKritikSaran() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/kritik-saran')
      .then((r) => r.json())
      .then((j) => setItems(j.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (i) =>
        i.nama.toLowerCase().includes(s) ||
        i.pesan.toLowerCase().includes(s) ||
        (i.email ?? '').toLowerCase().includes(s),
    );
  }, [items, q]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <MessagesSquare className="w-5 h-5 text-slate-700" />
          <h2 className="font-semibold text-slate-900">
            Daftar Masukan{' '}
            <span className="text-sm font-normal text-slate-400">({items.length})</span>
          </h2>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / isi pesan..."
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessagesSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {items.length === 0 ? 'Belum ada kritik & saran yang masuk.' : 'Tidak ada yang cocok dengan pencarian.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.nama}</p>
                    <p className="flex items-center gap-1 text-[0.7rem] text-slate-400">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mt-3 whitespace-pre-line">
                {item.pesan}
              </p>

              {(item.email || item.hp) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  {item.email && (
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-primary">
                      <Mail className="w-3.5 h-3.5" /> {item.email}
                    </a>
                  )}
                  {item.hp && (
                    <a href={`tel:${item.hp}`} className="flex items-center gap-1.5 hover:text-primary">
                      <Phone className="w-3.5 h-3.5" /> {item.hp}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
