'use client';

/**
 * Grafik permohonan per tanggal (30 hari) — client component supaya kolomnya
 * bisa di-hover: crosshair + titik + chip nilai mengikuti kursor. Server page
 * cukup mengirim agregat `daily`; seluruh geometri SVG dihitung di sini.
 */

import { useMemo, useState } from 'react';

export interface TitikHarian {
  key: string;
  label: string;
  count: number;
}

function smoothPath(pts: { x: number; y: number }[], t = 0.16): string {
  if (pts.length < 2) return pts.length ? `M${pts[0].x},${pts[0].y}` : '';
  const seg: string[] = [`M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    seg.push(
      `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`,
    );
  }
  return seg.join(' ');
}

// Koordinat SVG (viewBox 600×150): garis mulus + area di bawahnya. Padding
// atas 14 / bawah 16 supaya puncak & lembah tidak menempel di tepi.
const CW = 600;
const CH = 150;
const PAD_T = 14;
const PAD_B = 16;

export default function ChartHarian({ daily }: { daily: TitikHarian[] }) {
  const HARI = daily.length;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const g = useMemo(() => {
    const maxDaily = Math.max(1, ...daily.map((t) => t.count));
    const totalDaily = daily.reduce((a, t) => a + t.count, 0);
    const avgDaily = totalDaily / Math.max(1, HARI);
    const yOf = (count: number) =>
      CH - PAD_B - (count / maxDaily) * (CH - PAD_T - PAD_B);
    const pts = daily.map((t, i) => ({ x: (i / (HARI - 1)) * CW, y: yOf(t.count) }));
    const line = smoothPath(pts);
    return {
      maxDaily,
      avgDaily,
      yOf,
      pts,
      line,
      area: `${line} L${CW},${CH} L0,${CH} Z`,
      lastYpct: (yOf(daily[HARI - 1].count) / CH) * 100,
      avgYpct: (yOf(avgDaily) / CH) * 100,
    };
  }, [daily, HARI]);

  const hover = hoverIdx === null ? null : daily[hoverIdx];
  const hoverXpct = hoverIdx === null ? 0 : (hoverIdx / (HARI - 1)) * 100;
  const hoverYpct = hover === null ? 0 : (g.yOf(hover.count) / CH) * 100;

  return (
    <div>
      <div className="relative" onMouseLeave={() => setHoverIdx(null)}>
        <svg
          viewBox={`0 0 ${CW} ${CH}`}
          preserveAspectRatio="none"
          className="h-40 w-full overflow-visible"
          role="img"
          aria-label="Grafik jumlah permohonan per tanggal, 30 hari terakhir"
        >
          <defs>
            <linearGradient id="areaPermohonan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2176bd" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2176bd" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Garis bantu horizontal — samar, hanya penanda tinggi */}
          {[0.5, 1].map((f) => (
            <line
              key={f}
              x1="0"
              x2={CW}
              y1={g.yOf(g.maxDaily * f)}
              y2={g.yOf(g.maxDaily * f)}
              stroke="#eef2f6"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* Garis rata-rata (putus-putus) */}
          <line
            x1="0"
            x2={CW}
            y1={g.yOf(g.avgDaily)}
            y2={g.yOf(g.avgDaily)}
            stroke="#2176bd"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
            opacity="0.6"
          />
          <path d={g.area} fill="url(#areaPermohonan)" />
          <path
            d={g.line}
            fill="none"
            stroke="#1b4b72"
            strokeWidth="2.25"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Garis dasar */}
          <line
            x1="0"
            x2={CW}
            y1={CH - PAD_B}
            y2={CH - PAD_B}
            stroke="#e2e8f0"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* Kolom hover: satu rect transparan per tanggal */}
          {daily.map((t, i) => (
            <rect
              key={t.key}
              x={(i - 0.5) * (CW / (HARI - 1))}
              y="0"
              width={CW / (HARI - 1)}
              height={CH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
          ))}
        </svg>

        {/* Crosshair + titik + chip nilai (HTML overlay agar tidak gepeng
            karena viewBox di-stretch) */}
        {hover !== null && (
          <>
            <span
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-[#2176bd]/30"
              style={{ left: `${hoverXpct}%` }}
            />
            <span
              className="pointer-events-none absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#2176bd] shadow"
              style={{ left: `${hoverXpct}%`, top: `${hoverYpct}%` }}
            />
            <span
              className="pointer-events-none absolute z-20 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[0.68rem] font-semibold text-white shadow-lg"
              style={{
                left: `${hoverXpct}%`,
                top: `calc(${Math.min(hoverYpct, 80)}% - 10px)`,
                transform: `translate(${
                  hoverXpct < 12 ? '0%' : hoverXpct > 88 ? '-100%' : '-50%'
                }, -100%)`,
              }}
            >
              {hover.label} · {hover.count} permohonan
            </span>
          </>
        )}

        {/* Penanda "hari ini" */}
        <span
          className="pointer-events-none absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#2176bd] shadow-sm"
          style={{ left: '100%', top: `${g.lastYpct}%` }}
        />
        {/* Label rata-rata */}
        <span
          className="pointer-events-none absolute -translate-y-1/2 rounded bg-blue-50 px-1.5 py-0.5 text-[0.6rem] font-semibold text-blue-700"
          style={{ right: 0, top: `${g.avgYpct}%` }}
        >
          rata²&nbsp;{g.avgDaily.toFixed(1)}
        </span>
      </div>
      {/* Label tanggal (tiap ±5 hari) */}
      <div className="mt-1.5 flex justify-between text-[0.62rem] font-medium text-slate-400">
        {daily
          .filter((_, i) => i % 5 === 0 || i === HARI - 1)
          .map((t) => (
            <span key={t.key}>{t.label}</span>
          ))}
      </div>
    </div>
  );
}
