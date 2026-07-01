'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView, LayoutGroup, easeInOut } from 'framer-motion';
import {
  Target,
  FileText,
  Users,
  CheckSquare,
  Network,
  ChevronRight,
  Quote,
  Shield,
  Clock,
  Award,
  Sparkles,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TABS: TabConfig[] = [
  { id: 'visi-misi',  label: 'Visi & Misi',    shortLabel: 'Visi',     icon: <Target className="w-4 h-4" />,      description: 'Arah dan komitmen organisasi' },
  { id: 'motto',      label: 'Motto & Tujuan',  shortLabel: 'Motto',    icon: <FileText className="w-4 h-4" />,    description: 'Nilai dan sasaran strategis' },
  { id: 'maklumat',   label: 'Maklumat',         shortLabel: 'Maklumat', icon: <Users className="w-4 h-4" />,       description: 'Janji pelayanan publik' },
  { id: 'tugas',      label: 'Tugas & Fungsi',   shortLabel: 'Tugas',    icon: <CheckSquare className="w-4 h-4" />, description: 'Wewenang dan tanggung jawab' },
  { id: 'struktur',   label: 'Struktur',          shortLabel: 'Struktur', icon: <Network className="w-4 h-4" />,     description: 'Susunan organisasi' },
];

const CONTENT: Record<string, any> = {
  'visi-misi': {
    visi: 'Terwujudnya Pusat Pelayanan Data Base Kependudukan yang Akurat dan Aktual Berbasis Sistem Informasi Administrasi Kependudukan',
    misi: [
      'Meningkatkan profesionalitas, efisiensi dan efektifitas organisasi',
      'Mengoptimalkan dan meningkatkan pengelolaan administrasi kependudukan',
      'Meningkatkan kualitas kinerja pelayanan administrasi kependudukan secara prima',
    ],
  },
  'motto': {
    motto: 'Profesional, Integritas, Prima',
    tujuan: [
      'Memberikan pelayanan kependudukan yang cepat, tepat, dan akurat',
      'Mewujudkan database kependudukan yang berkualitas dan terintegrasi',
      'Meningkatkan kepuasan masyarakat melalui pelayanan berbasis teknologi',
    ],
    sasaran: [
      'Tersedianya data kependudukan yang akurat dan mutakhir',
      'Terwujudnya pelayanan administrasi kependudukan yang prima',
      'Terbangunnya sistem informasi kependudukan yang terintegrasi',
    ],
  },
  'maklumat': {
    janji: [
      { title: 'Cepat',  desc: '15 menit',    icon: Clock },
      { title: 'Akurat', desc: 'Data valid',   icon: Shield },
      { title: 'Gratis', desc: 'Tanpa biaya',  icon: Award },
      { title: 'Ramah',  desc: 'Sikap prima',  icon: Sparkles },
    ],
    standar: 'Kami berkomitmen memberikan pelayanan terbaik sesuai Standar Pelayanan Publik',
  },
  'tugas': {
    utama: 'Melaksanakan urusan pemerintahan bidang kependudukan dan pencatatan sipil',
    fungsi: [
      'Penyelenggaraan administrasi kependudukan',
      'Pelayanan pencatatan sipil',
      'Pengelolaan data dan informasi kependudukan',
      'Pelaksanaan identifikasi kependudukan',
      'Fasilitasi perpindahan penduduk',
    ],
  },
  'struktur': {
    organisasi: [
      { jabatan: 'Kepala Dinas', nama: '-', status: 'Pimpinan' },
      { jabatan: 'Sekretaris', nama: '-', status: 'Pengawas' },
      { jabatan: 'Kabid Pelayanan Pendaftaran Penduduk', nama: '-', status: 'Pelaksana' },
      { jabatan: 'Kabid Pelayanan Pencatatan Sipil', nama: '-', status: 'Pelaksana' },
      { jabatan: 'Kabid Pengelolaan Informasi Administrasi Kependudukan', nama: '-', status: 'Pelaksana' },
    ],
  },
};

// ─── Animation presets ────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, stiffness: 320, damping: 30 };
const easeCustom = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: easeCustom },
});

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 block mb-3">
      {children}
    </span>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="h-px flex-1 bg-slate-100" />
      {label && <SectionLabel>{label}</SectionLabel>}
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function NumberedItem({ index, children }: { index: number; children: string }) {
  return (
    <motion.div
      {...fadeUp(0.35 + index * 0.08)}
      className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
    >
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-semibold group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {index + 1}
      </span>
      <p className="text-slate-600 leading-relaxed text-sm pt-0.5">{children}</p>
    </motion.div>
  );
}

function BulletItem({ index, children }: { index: number; children: string }) {
  return (
    <motion.div
      {...fadeUp(0.3 + index * 0.07)}
      className="group flex items-start gap-3 text-slate-600 text-sm leading-relaxed"
    >
      <ChevronRight className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
      {children}
    </motion.div>
  );
}

// ─── Tab content panels ───────────────────────────────────────────────────────

function VisiMisiPanel({ data }: { data: typeof CONTENT['visi-misi'] }) {
  return (
    <div className="space-y-10">
      {/* Visi */}
      <motion.div {...fadeUp(0.15)} className="relative pl-6 border-l-2 border-primary/30">
        <SectionLabel>Visi</SectionLabel>
        <p className="text-xl md:text-2xl font-light text-slate-800 leading-relaxed">
          {data.visi}
        </p>
      </motion.div>

      {/* Misi */}
      <motion.div {...fadeUp(0.25)}>
        <Divider label="Misi" />
        <div className="space-y-2 mt-4">
          {data.misi.map((item: string, i: number) => (
            <NumberedItem key={i} index={i}>{item}</NumberedItem>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function MottoPanel({ data }: { data: typeof CONTENT['motto'] }) {
  const words = data.motto.split(', ');
  return (
    <div className="space-y-10">
      {/* Motto hero */}
      <motion.div {...fadeUp(0.15)} className="text-center py-6">
        <SectionLabel>Motto</SectionLabel>
        <h4 className="text-3xl md:text-4xl font-light text-slate-900 tracking-wide">
          {words.map((word: string, i: number) => (
            <span key={i}>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                {word}
              </span>
              {i < words.length - 1 && <span className="text-slate-300 mx-3">/</span>}
            </span>
          ))}
        </h4>
      </motion.div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div {...fadeUp(0.3)}>
          <SectionLabel>Tujuan</SectionLabel>
          <div className="space-y-3">
            {data.tujuan.map((item: string, i: number) => (
              <BulletItem key={i} index={i}>{item}</BulletItem>
            ))}
          </div>
        </motion.div>
        <motion.div {...fadeUp(0.38)}>
          <SectionLabel>Sasaran</SectionLabel>
          <div className="space-y-3">
            {data.sasaran.map((item: string, i: number) => (
              <BulletItem key={i} index={i}>{item}</BulletItem>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MaklumatPanel({ data }: { data: typeof CONTENT['maklumat'] }) {
  return (
    <div className="space-y-8">
      {/* Promise cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.janji.map((item: any, i: number) => (
          <motion.div
            key={i}
            {...fadeUp(0.15 + i * 0.08)}
            whileHover={{ y: -4 }}
            className="group flex flex-col items-center text-center p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary mb-3 group-hover:scale-110 group-hover:border-primary/20 group-hover:shadow-primary/20 transition-all duration-300">
              <item.icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Commitment statement */}
      <motion.div
        {...fadeUp(0.55)}
        className="relative p-7 rounded-2xl bg-slate-900 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <Quote className="w-7 h-7 text-primary/40 mb-3" />
        <p className="text-base font-light leading-relaxed relative z-10 text-slate-200">
          {data.standar}
        </p>
      </motion.div>
    </div>
  );
}

function TugasPanel({ data }: { data: typeof CONTENT['tugas'] }) {
  return (
    <div className="space-y-8">
      <motion.div
        {...fadeUp(0.15)}
        className="p-5 rounded-2xl bg-primary/5 border border-primary/10"
      >
        <SectionLabel>Tugas Pokok</SectionLabel>
        <p className="text-base text-slate-800 font-light leading-relaxed">{data.utama}</p>
      </motion.div>

      <motion.div {...fadeUp(0.25)}>
        <SectionLabel>Fungsi</SectionLabel>
        <div className="space-y-1">
          {data.fungsi.map((item: string, i: number) => (
            <motion.div
              key={i}
              {...fadeUp(0.3 + i * 0.07)}
              className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary flex-shrink-0 transition-colors" />
              <span className="text-slate-700 text-sm">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StrukturPanel({ data }: { data: typeof CONTENT['struktur'] }) {
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {data.organisasi.map((item: any, i: number) => {
        const isPimpinan = item.status === 'Pimpinan';
        const hasNama = item.nama && item.nama !== '-';
        // Tanpa nama pejabat: avatar & judul utama pakai jabatan.
        const initials = (hasNama ? item.nama : item.jabatan)
          .split(' ')
          .slice(0, 2)
          .map((w: string) => w[0])
          .join('')
          .toUpperCase();

        return (
          <motion.div
            key={i}
            {...fadeUp(0.1 + i * 0.09)}
            className={cn(
              'group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300',
              isPimpinan
                ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-900/20'
                : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md',
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                isPimpinan
                  ? 'bg-white/10 text-white'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300',
              )}
            >
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {hasNama ? (
                <>
                  <p className={cn('font-semibold text-sm truncate', isPimpinan ? 'text-white' : 'text-slate-900')}>
                    {item.nama}
                  </p>
                  <p className={cn('text-xs mt-0.5', isPimpinan ? 'text-slate-400' : 'text-slate-500')}>
                    {item.jabatan}
                  </p>
                </>
              ) : (
                <p className={cn('font-semibold text-sm', isPimpinan ? 'text-white' : 'text-slate-900')}>
                  {item.jabatan}
                </p>
              )}
            </div>

            {/* Badge */}
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0',
                isPimpinan
                  ? 'bg-white/10 text-slate-300'
                  : 'bg-slate-100 text-slate-500',
              )}
            >
              {item.status}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState('visi-misi');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  const activeContent = CONTENT[activeTab];
  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;

  return (
    <section ref={containerRef} className="relative py-14 overflow-hidden bg-white border-t border-slate-100">
      {/* Subtle ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-slate-50/80 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10 max-w-5xl">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex flex-col items-center text-center"
        >
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Profil Instansi
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            Dinas Kependudukan & Pencatatan Sipil
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full origin-left"
          />
        </motion.div>

        <LayoutGroup>
          {/* ── Tab bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="flex flex-wrap justify-center gap-1.5 mb-6 p-1.5 bg-slate-100/70 backdrop-blur-md rounded-2xl max-w-fit mx-auto border border-slate-200/60"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200',
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/80"
                      transition={spring}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <span className={cn('transition-colors duration-200', isActive ? 'text-primary' : 'text-slate-400')}>
                      {tab.icon}
                    </span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* ── Content card ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden"
            >
              {/* Top accent line */}
              <div className="h-0.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

              <div className="p-7 md:p-10">
                {/* Card header */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                    {activeTabConfig.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{activeTabConfig.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{activeTabConfig.description}</p>
                  </div>
                </div>

                {/* Panel content */}
                <div className="min-h-[260px]">
                  {activeTab === 'visi-misi'  && <VisiMisiPanel  data={activeContent} />}
                  {activeTab === 'motto'       && <MottoPanel     data={activeContent} />}
                  {activeTab === 'maklumat'    && <MaklumatPanel  data={activeContent} />}
                  {activeTab === 'tugas'       && <TugasPanel     data={activeContent} />}
                  {activeTab === 'struktur'    && <StrukturPanel  data={activeContent} />}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}