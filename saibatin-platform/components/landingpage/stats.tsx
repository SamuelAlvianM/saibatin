'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate, AnimatePresence, Variants } from 'framer-motion';
import {
  Users,
  Home,
  User,
  UserCircle,
  Map,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsData {
  jumlahPenduduk: number;
  kepalaKeluarga: number;
  lakiLaki: number;
  perempuan: number;
  pelayananBaru?: number;
  pelayananSelesai?: number;
}

interface StatsGridProps {
  data?: StatsData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIMATION = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: i * 0.08, ease: [0.42, 0, 0.58, 1] },
    }),
  },
} satisfies Record<string, Variants>;

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1.8 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => ctrl.stop();
  }, [isInView, value, duration]);

  return <span ref={ref}>{display.toLocaleString('id-ID')}</span>;
}

// ─── Thin Progress Bar ────────────────────────────────────────────────────────

function ProgressBar({
  pct,
  color,
  delay = 0,
}: {
  pct: number;
  color: string;
  delay?: number;
}) {
  return (
    <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', color)}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardConfig {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;       // tailwind text color
  accentBg: string;     // tailwind bg color (light)
  accentBar: string;    // tailwind bg color for bar
  index: number;
}

function StatCard({ title, value, icon, accent, accentBg, accentBar, index }: StatCardConfig) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      custom={index}
      variants={ANIMATION.fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col gap-3 rounded-2xl bg-white p-4
                 border border-slate-200 hover:border-slate-300
                 shadow-sm hover:shadow-md
                 transition-shadow duration-300 cursor-default overflow-hidden"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105', accentBg)}>
          <span className={accent}>{icon}</span>
        </div>
        <motion.span
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 4 }}
          transition={{ duration: 0.2 }}
          className={cn('text-xs font-semibold flex items-center gap-1', accent)}
        >
          Detail <ArrowRight className="w-3 h-3" />
        </motion.span>
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 leading-none mb-1">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400">{title}</p>
      </div>

      {/* Bottom accent bar */}
      <ProgressBar pct={100} color={accentBar} delay={index * 0.1 + 0.4} />
    </motion.div>
  );
}

function MapCard({ index }: { index: number }) {
  return (
    <motion.div
      custom={index}
      variants={ANIMATION.fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="group relative flex flex-col rounded-2xl bg-white border border-slate-200
                 hover:border-slate-300 shadow-sm hover:shadow-md
                 transition-shadow duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <Map className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-indigo-500">
            Wilayah Administrasi
          </p>
          <p className="text-sm font-semibold text-slate-800">Peta Kecamatan</p>
        </div>
      </div>

      <Divider />

      {/* Map visual */}
      <div className="relative mx-4 my-4 h-36 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-100">
        <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-60">
          <defs>
            <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <motion.path
            d="M30,120 Q80,70 140,110 T240,90 T340,120 T380,100"
            fill="none" stroke="#6366f1" strokeWidth="32" strokeLinecap="round" strokeOpacity="0.15"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
          <motion.path
            d="M60,150 Q120,110 180,140 T290,130 T370,150"
            fill="none" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round" strokeOpacity="0.12"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
            transition={{ duration: 2.2, delay: 0.3, ease: 'easeInOut' }}
          />
          {[{ cx: 200, cy: 100, r: 7, fill: '#6366f1', delay: 1.4 },
            { cx: 290, cy: 130, r: 5, fill: '#3b82f6', delay: 1.6 },
            { cx: 130, cy: 115, r: 4, fill: '#818cf8', delay: 1.8 }].map((pin, i) => (
            <motion.circle key={i} {...pin}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: pin.delay, type: 'spring', stiffness: 300 }}
            />
          ))}
        </svg>
      </div>

      <Divider />

      {/* Footer stats */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 px-0 py-3">
        {[
          { label: 'Desa / Kelurahan', value: '5' },
          { label: 'Luas Wilayah', value: '45.2 km²' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center py-1">
            <p className="text-base font-bold text-slate-800">{item.value}</p>
            <p className="text-[0.65rem] text-slate-400 font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Service Stats Card ───────────────────────────────────────────────────────

function ServiceCard({
  pelayananBaru,
  pelayananSelesai,
  index,
}: {
  pelayananBaru: number;
  pelayananSelesai: number;
  index: number;
}) {
  const total = pelayananBaru + pelayananSelesai;
  const newPct = Math.round((pelayananBaru / total) * 100);
  const donePct = Math.round((pelayananSelesai / total) * 100);

  const items = [
    {
      label: 'Pelayanan Baru',
      value: pelayananBaru,
      pct: newPct,
      bar: 'bg-primary',
      icon: <Activity className="w-3.5 h-3.5 text-primary" />,
    },
    {
      label: 'Selesai Diproses',
      value: pelayananSelesai,
      pct: donePct,
      bar: 'bg-success',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
    },
  ];

  return (
    <motion.div
      custom={index}
      variants={ANIMATION.fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="group relative flex flex-col rounded-2xl bg-white border border-slate-200
                 hover:border-slate-300 shadow-sm hover:shadow-md
                 transition-shadow duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <FileCheck className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-violet-500">
              Total Pelayanan
            </p>
            <p className="text-sm font-semibold text-slate-800">Statistik Bulan Ini</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">+12%</span>
        </div>
      </div>

      <Divider />

      {/* Progress items */}
      <div className="flex flex-col gap-5 px-6 py-5">
        {items.map((item, i) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                {item.icon}
                {item.label}
              </span>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">
                  {item.value.toLocaleString('id-ID')}
                </span>
                <span className="ml-1.5 text-xs text-slate-400">({item.pct}%)</span>
              </div>
            </div>
            <ProgressBar pct={item.pct} color={item.bar} delay={0.5 + i * 0.2} />
          </div>
        ))}
      </div>

      <Divider />

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-xs text-slate-400">Update terakhir: hari ini</p>
        <button className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors">
          Lihat detail <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_DATA: Required<StatsData> = {
  jumlahPenduduk: 30036,
  kepalaKeluarga: 9950,
  lakiLaki: 15762,
  perempuan: 14274,
  pelayananBaru: 1234,
  pelayananSelesai: 9876,
};

const STAT_CARDS: Omit<StatCardConfig, 'value' | 'index'>[] = [
  {
    title: 'Jumlah Penduduk',
    icon: <Users className="w-5 h-5" />,
    accent: 'text-primary',
    accentBg: 'bg-primary/10',
    accentBar: 'bg-primary',
  },
  {
    title: 'Kepala Keluarga',
    icon: <Home className="w-5 h-5" />,
    accent: 'text-amber-600',
    accentBg: 'bg-amber-50',
    accentBar: 'bg-amber-400',
  },
  {
    title: 'Laki-laki',
    icon: <User className="w-5 h-5" />,
    accent: 'text-sky-600',
    accentBg: 'bg-sky-50',
    accentBar: 'bg-sky-500',
  },
  {
    title: 'Perempuan',
    icon: <UserCircle className="w-5 h-5" />,
    accent: 'text-rose-500',
    accentBg: 'bg-rose-50',
    accentBar: 'bg-rose-400',
  },
];

export default function StatsGrid({ data }: StatsGridProps) {
  const stats: Required<StatsData> = { ...DEFAULT_DATA, ...data };

  const statValues = [
    stats.jumlahPenduduk,
    stats.kepalaKeluarga,
    stats.lakiLaki,
    stats.perempuan,
  ];

  return (
    <div className="space-y-4">

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
            Data Kependudukan
          </p>
          <h2 className="text-lg font-bold text-slate-900">Statistik Demografi</h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Realtime
        </span>
      </motion.div>

      {/* Primary stat cards — 2×2 grid to fit sidebar width */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.title} {...card} value={statValues[i]} index={i} />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-3">
        <MapCard index={5} />
        <ServiceCard
          pelayananBaru={stats.pelayananBaru}
          pelayananSelesai={stats.pelayananSelesai}
          index={6}
        />
      </div>
    </div>
  );
}