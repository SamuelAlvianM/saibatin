'use client';

import React, { useEffect, useState, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { useInView, animate as fmAnimate } from 'framer-motion';
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
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';

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

// ─── Animated Counter (framer-motion tween) ─────────────────────────────────────

function AnimatedNumber({ value, duration = 1.8 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const ctrl = fmAnimate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => ctrl.stop();
  }, [isInView, value, duration]);

  return <span ref={ref}>{display.toLocaleString('id-ID')}</span>;
}

// ─── Thin Progress Bar (anime.js) ───────────────────────────────────────────────

function ProgressBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    animate(el, { width: ['0%', `${pct}%`], duration: 1100, delay, ease: 'out(4)' });
  }, [pct, delay]);
  return (
    <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
      <div ref={ref} className={cn('h-full rounded-full', color)} style={{ width: 0 }} />
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardConfig {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  accentBar: string;
}

function StatCard({ title, value, icon, accent, accentBg, accentBar }: StatCardConfig) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="js-stat group relative flex flex-col gap-3 rounded-2xl bg-white p-4
                 border border-slate-200 hover:border-slate-300
                 shadow-sm hover:shadow-md
                 transition-shadow duration-300 cursor-default overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105', accentBg)}>
          <span className={accent}>{icon}</span>
        </div>
        <span
          className={cn(
            'text-xs font-semibold flex items-center gap-1 transition-all duration-200',
            accent,
            hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1'
          )}
        >
          Detail <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 leading-none mb-1">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400">{title}</p>
      </div>

      <ProgressBar pct={100} color={accentBar} delay={400} />
    </div>
  );
}

// ─── Map Card (embed peta asli) ─────────────────────────────────────────────────

function MapCard() {
  const embedUrl = siteConfig.maps.alamatEmbed;
  return (
    <div
      className="js-stat group relative flex flex-col rounded-2xl bg-white border border-slate-200
                 hover:border-slate-300 shadow-sm hover:shadow-md
                 transition-shadow duration-300 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Map className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-indigo-500">
              Wilayah Administrasi
            </p>
            <p className="text-sm font-semibold text-slate-800">Lokasi Kantor</p>
          </div>
        </div>
        <Link
          href="/media/peta"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Peta <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <Divider />

      {/* Peta asli dari halaman /media/peta */}
      <div className="relative mx-4 my-4 h-40 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Peta lokasi kantor Disdukcapil Pesisir Barat"
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] transition-all duration-500 group-hover:grayscale-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
            <Map className="h-6 w-6" />
            <span className="text-xs">Peta belum dikonfigurasi</span>
          </div>
        )}
      </div>

      <Divider />

      <div className="grid grid-cols-2 divide-x divide-slate-100 px-0 py-3">
        {[
          { label: 'Kecamatan', value: '11' },
          { label: 'Desa/Pekon', value: '118' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center py-1">
            <p className="text-base font-bold text-slate-800">{item.value}</p>
            <p className="text-[0.65rem] text-slate-400 font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Service Stats Card ─────────────────────────────────────────────────────────

function ServiceCard({ pelayananBaru, pelayananSelesai }: { pelayananBaru: number; pelayananSelesai: number }) {
  const total = pelayananBaru + pelayananSelesai;
  const newPct = total > 0 ? Math.round((pelayananBaru / total) * 100) : 0;
  const donePct = total > 0 ? Math.round((pelayananSelesai / total) * 100) : 0;

  const items = [
    { label: 'Sedang Diproses', value: pelayananBaru, pct: newPct, bar: 'bg-primary', icon: <Activity className="w-3.5 h-3.5 text-primary" /> },
    { label: 'Selesai Diproses', value: pelayananSelesai, pct: donePct, bar: 'bg-success', icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" /> },
  ];

  return (
    <div
      className="js-stat group relative flex flex-col rounded-2xl bg-white border border-slate-200
                 hover:border-slate-300 shadow-sm hover:shadow-md
                 transition-shadow duration-300 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <FileCheck className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-violet-500">
              Total Pelayanan
            </p>
            <p className="text-sm font-semibold text-slate-800">{total.toLocaleString('id-ID')} Permohonan</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{donePct}%</span>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-5 px-6 py-5">
        {items.map((item, i) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                {item.icon}
                {item.label}
              </span>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">{item.value.toLocaleString('id-ID')}</span>
                <span className="ml-1.5 text-xs text-slate-400">({item.pct}%)</span>
              </div>
            </div>
            <ProgressBar pct={item.pct} color={item.bar} delay={500 + i * 200} />
          </div>
        ))}
      </div>

      <Divider />

      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-xs text-slate-400">Data langsung dari sistem</p>
        <Link href="/permohonan-online" className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors">
          Ajukan <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const FALLBACK_DATA: Required<StatsData> = {
  jumlahPenduduk: 170207,
  kepalaKeluarga: 30200,
  lakiLaki: 86340,
  perempuan: 83867,
  pelayananBaru: 0,
  pelayananSelesai: 0,
};

const STAT_CARDS: Omit<StatCardConfig, 'value'>[] = [
  { title: 'Jumlah Penduduk', icon: <Users className="w-5 h-5" />, accent: 'text-primary', accentBg: 'bg-primary/10', accentBar: 'bg-primary' },
  { title: 'Kepala Keluarga', icon: <Home className="w-5 h-5" />, accent: 'text-amber-600', accentBg: 'bg-amber-50', accentBar: 'bg-amber-400' },
  { title: 'Laki-laki', icon: <User className="w-5 h-5" />, accent: 'text-sky-600', accentBg: 'bg-sky-50', accentBar: 'bg-sky-500' },
  { title: 'Perempuan', icon: <UserCircle className="w-5 h-5" />, accent: 'text-rose-500', accentBg: 'bg-rose-50', accentBar: 'bg-rose-400' },
];

export default function StatsGrid({ data }: StatsGridProps) {
  const [stats, setStats] = useState<Required<StatsData>>({ ...FALLBACK_DATA, ...data });
  const rootRef = useRef<HTMLDivElement>(null);

  // Integrasi database: ambil statistik terkini
  useEffect(() => {
    let alive = true;
    fetch('/api/stats')
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j?.data) return;
        setStats((prev) => ({ ...prev, ...j.data }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Animasi masuk anime.js (stagger seluruh kartu)
  useEffect(() => {
    if (!rootRef.current) return;
    const cards = rootRef.current.querySelectorAll('.js-stat');
    if (!cards.length) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      scale: [0.97, 1],
      delay: stagger(90),
      duration: 650,
      ease: 'out(3)',
    });
  }, []);

  const statValues = [stats.jumlahPenduduk, stats.kepalaKeluarga, stats.lakiLaki, stats.perempuan];

  return (
    <div className="space-y-4" ref={rootRef}>
      <div className="flex items-center justify-between">
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.title} {...card} value={statValues[i]} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <MapCard />
        <ServiceCard pelayananBaru={stats.pelayananBaru} pelayananSelesai={stats.pelayananSelesai} />
      </div>
    </div>
  );
}
