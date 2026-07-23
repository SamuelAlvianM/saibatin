'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Search,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Filter,
  User as UserIcon,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterPeriode } from '@/components/shared/filter-periode';
import { tulisAcuan, type KodePeriode } from '@/lib/periode';

interface LogItem {
  id: number;
  aksi: string;
  entitas: string;
  entitasId: string | null;
  ringkasan: string;
  ip: string | null;
  createdAt: string;
  user: { userFullname: string | null; userId: string; userlevelId: number } | null;
}

interface Petugas {
  id: number;
  nama: string;
}

const AKSI_STYLE: Record<string, string> = {
  BUAT: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  UBAH: 'bg-sky-50 text-sky-700 ring-sky-100',
  HAPUS: 'bg-rose-50 text-rose-700 ring-rose-100',
  UNGGAH: 'bg-violet-50 text-violet-700 ring-violet-100',
  IMPOR: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  LAINNYA: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const SEMUA = '__all__';

function fmtWaktu(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LogAktivitasClient() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [petugas, setPetugas] = useState<Petugas[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState<string>(SEMUA);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<KodePeriode>('');
  const [acuan, setAcuan] = useState(() => new Date());

  // Debounce pencarian supaya tidak memanggil API tiap ketikan.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Kembali ke halaman 1 saat filter/pencarian berubah.
  useEffect(() => {
    setPage(1);
  }, [userId, debouncedQ]);

  useEffect(() => {
    let batal = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (userId !== SEMUA) params.set('userId', userId);
    if (debouncedQ) params.set('q', debouncedQ);
    if (periode) {
      params.set('periode', periode);
      params.set('acuan', tulisAcuan(acuan));
    }

    fetch(`/api/admin/log-aktivitas?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (batal) return;
        const d = j.data ?? {};
        setItems(d.items ?? []);
        setTotalPages(d.totalPages ?? 1);
        setTotal(d.total ?? 0);
        // Daftar petugas hanya perlu di-set sekali (tidak berubah karena filter).
        if (d.petugas?.length) setPetugas(d.petugas);
      })
      .finally(() => !batal && setLoading(false));

    return () => {
      batal = true;
    };
  }, [page, userId, debouncedQ, periode, acuan]);

  // Ganti periode/rentang → kembali ke halaman 1 supaya tidak terdampar kosong.
  useEffect(() => {
    setPage(1);
  }, [periode, acuan]);

  const namaPetugas = useMemo(
    () => new Map(petugas.map((p) => [String(p.id), p.nama])),
    [petugas],
  );
  const filterAktif = userId !== SEMUA || debouncedQ || periode;

  /**
   * Halaman tujuan untuk melihat data yang dicatat log ini.
   * `?sorot=<id>` membuat halaman tujuan membuka halaman yang memuat data
   * tersebut lalu menyorot barisnya — jadi admin tidak perlu mencari manual.
   */
  const tautanData = (it: LogItem): string | null => {
    if (!it.entitasId) return null;
    const id = encodeURIComponent(it.entitasId);
    switch (it.entitas) {
      case 'Permohonan':
        return `/dashboard/permohonan?sorot=${id}`;
      case 'Berita':
        return '/dashboard/berita';
      case 'Akun':
        return '/dashboard/users';
      case 'Pengaduan':
        return '/dashboard/pengaduan';
      case 'Media':
        return '/dashboard/media';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 sm:shrink-0">
          <Filter className="h-4 w-4" /> Filter
        </div>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Semua petugas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEMUA}>Semua petugas</SelectItem>
            {petugas.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari aktivitas (mis. status, berita, akun)..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter periode — dropdown + geser rentang (sama dgn halaman Permohonan) */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <FilterPeriode
          periode={periode}
          acuan={acuan}
          onPeriodeChange={setPeriode}
          onAcuanChange={setAcuan}
          disabled={loading}
        />
      </div>

      {/* Ringkasan jumlah */}
      <p className="px-1 text-xs text-slate-500">
        {loading ? 'Memuat…' : `${total.toLocaleString('id-ID')} aktivitas`}
        {filterAktif && !loading && ' (terfilter)'}
      </p>

      {/* Daftar */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Memuat log…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-400">
            <ScrollText className="h-10 w-10" />
            <p className="text-sm">
              {filterAktif ? 'Tidak ada aktivitas yang cocok.' : 'Belum ada aktivitas tercatat.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((it) => {
              const nama =
                it.user?.userFullname ??
                namaPetugas.get(String(it.user?.userId ?? '')) ??
                it.user?.userId ??
                'Petugas';
              return (
                <li key={it.id} className="flex gap-3 px-4 py-3 hover:bg-slate-50/60">
                  <span
                    className={cn(
                      'mt-0.5 h-fit shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide ring-1',
                      AKSI_STYLE[it.aksi] ?? AKSI_STYLE.LAINNYA,
                    )}
                  >
                    {it.aksi}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">{it.ringkasan}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.7rem] text-slate-400">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                        <UserIcon className="h-3 w-3" /> {nama}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
                        {it.entitas}
                      </span>
                      <span>{fmtWaktu(it.createdAt)}</span>
                      {it.ip && <span className="tabular-nums">IP {it.ip}</span>}
                      {/* Lompat ke data yang dicatat, lalu barisnya disorot. */}
                      {tautanData(it) && (
                        <Link
                          href={tautanData(it) as string}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          <Eye className="h-3 w-3" /> Lihat data
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Paginasi */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Berikutnya <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
