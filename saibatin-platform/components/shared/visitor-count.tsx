'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface Stats {
  online: number;
  hariIni: number;
  total: number;
}

/**
 * Penghitung pengunjung untuk footer (teks saja). Mengambil { online, hariIni,
 * total } dari /api/kunjungan. Angka diformat dengan pemisah ribuan Indonesia.
 */
export function VisitorCount() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let aktif = true;
    fetch('/api/kunjungan')
      .then((r) => r.json())
      .then((j) => {
        if (aktif && j?.data) setStats(j.data as Stats);
      })
      .catch(() => {});
    return () => {
      aktif = false;
    };
  }, []);

  if (!stats) return null;
  const fmt = (n: number) => n.toLocaleString('id-ID');

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
      <Users className="h-3.5 w-3.5 text-yellow-400" />
      <span>
        Total pengunjung:{' '}
        <span className="font-semibold text-slate-300">{fmt(stats.total)}</span>
      </span>
      <span className="text-slate-700">&middot;</span>
      <span>Hari ini: <span className="text-slate-400">{fmt(stats.hariIni)}</span></span>
      <span className="text-slate-700">&middot;</span>
      <span>Online: <span className="text-slate-400">{fmt(stats.online)}</span></span>
    </p>
  );
}
