'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Gauge, Star, ClipboardCheck } from 'lucide-react';

interface AspekRata {
  aspek: string;
  rata: number;
}
interface Responden {
  id: number;
  nama: string;
  rataSkor: number;
  saran: string | null;
  createdAt: string;
}
interface Data {
  totalResponden: number;
  rataPerAspek: AspekRata[];
  rataKeseluruhan: number;
  nilaiIKM: number;
  skalaMax: number;
  respondenTerbaru: Responden[];
}

function mutu(ikm: number): { label: string; color: string } {
  if (ikm >= 88.31) return { label: 'A — Sangat Baik', color: 'text-success' };
  if (ikm >= 76.61) return { label: 'B — Baik', color: 'text-primary' };
  if (ikm >= 65.0) return { label: 'C — Kurang Baik', color: 'text-warning' };
  return { label: 'D — Tidak Baik', color: 'text-destructive' };
}

export function SkmDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/skm')
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return <div className="text-sm text-slate-500">Gagal memuat data.</div>;

  const m = mutu(data.nilaiIKM);
  const cards = [
    { label: 'Total Responden', value: data.totalResponden, icon: Users, color: 'text-primary' },
    { label: 'Rata-rata Skor', value: `${data.rataKeseluruhan} / ${data.skalaMax}`, icon: Star, color: 'text-warning' },
    { label: 'Nilai IKM', value: data.nilaiIKM, icon: Gauge, color: 'text-success' },
    { label: 'Mutu Pelayanan', value: m.label, icon: ClipboardCheck, color: m.color, small: true },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-card rounded-2xl p-5">
            <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
            <p className={`font-semibold text-slate-900 ${c.small ? 'text-base' : 'text-2xl'}`}>{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart per aspek */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Rata-rata Nilai per Aspek</h2>
        <p className="text-xs text-slate-500 mb-5">Skala 1 (sangat kurang) - {data.skalaMax} (sangat baik)</p>
        {data.totalResponden === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">Belum ada responden.</p>
        ) : (
          <div className="space-y-4">
            {data.rataPerAspek.map((a) => (
              <div key={a.aspek}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{a.aspek}</span>
                  <span className="text-slate-500">{a.rata.toFixed(2)}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(a.rata / data.skalaMax) * 100}%`, background: 'linear-gradient(90deg, #2176bd, #6cb2eb)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responden terbaru */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Responden Terbaru</h2>
        {data.respondenTerbaru.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">Belum ada responden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">Tanggal</th>
                  <th className="py-2 pr-4 font-medium">Rata Skor</th>
                  <th className="py-2 pr-4 font-medium">Saran</th>
                </tr>
              </thead>
              <tbody>
                {data.respondenTerbaru.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{r.nama}</td>
                    <td className="py-2.5 pr-4 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 pr-4">{r.rataSkor.toFixed(2)}</td>
                    <td className="py-2.5 pr-4 max-w-xs truncate text-slate-500">{r.saran ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
