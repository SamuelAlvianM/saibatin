'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserPlus, FileEdit, PackageCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Daftar / Masuk',
    desc: 'Buat akun dengan NIK & nomor KK Anda, lalu tunggu verifikasi petugas.',
  },
  {
    icon: FileEdit,
    title: 'Ajukan Permohonan',
    desc: 'Pilih layanan, isi formulir online, dan unggah berkas persyaratan.',
  },
  {
    icon: PackageCheck,
    title: 'Pantau & Terima Hasil',
    desc: 'Cek status di halaman riwayat — pemberitahuan dikirim ke email Anda.',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Seksi "cara kerja" 3 langkah dengan garis penghubung & reveal berurutan. */
export default function AlurLayanan() {
  return (
    <section className="relative py-14 bg-slate-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-[0.7rem] font-bold uppercase tracking-widest text-primary">
            Cara Kerja
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
            Urus Dokumen dalam 3 Langkah
          </h2>
          <p className="mt-3 text-slate-500 text-sm md:text-base">
            Tanpa antre di kantor — semua proses permohonan dilakukan online dan
            dapat dipantau kapan saja.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Garis penghubung (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12, ease }}
              className="relative bg-white rounded-2xl border border-slate-200/70 p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative inline-flex">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b4b72] to-[#2176bd] text-white shadow-lg shadow-blue-900/20">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-[#1b4b72] text-xs font-bold shadow">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            href="/permohonan-online"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1b4b72] to-[#2176bd] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            Mulai Ajukan Permohonan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
