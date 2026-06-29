'use client';

import { motion, Easing } from "framer-motion";
import ElegantCarousel from "@/components/landingpage/carousel";
import StatsGrid from "@/components/landingpage/stats";
import MenuPopuler from "@/components/landingpage/menu-populer";
import ProfileTabs from "@/components/landingpage/profile-tabs";
import { Phone, Clock } from "lucide-react";
import { Footer } from "@/components/shared/footer";

const smoothEase: Easing = [0.25, 0.1, 0.25, 1];

export default function Home() {
  return (
    <div className="relative bg-slate-50/30">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: smoothEase }}
        className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0"
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                D
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Disdukcapil KTT
                </h1>
                <p className="text-xs text-slate-500">Dinas Kependudukan & Pencatatan Sipil</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden md:flex items-center gap-6 text-sm text-slate-600"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Senin - Jumat: 08.00 - 16.00</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Call Center: 1500-567</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className="relative py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-5 items-stretch">

            {/* Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: smoothEase }}
              className="w-full lg:flex-1 rounded-3xl shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/60"
              style={{ isolation: 'isolate' }}
            >
              <div className="rounded-3xl overflow-hidden w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px]">
                <ElegantCarousel height="h-full" />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: smoothEase }}
              className="w-full lg:w-[420px] shrink-0"
            >
              <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/30 border border-slate-100">
                <StatsGrid />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Menu Populer ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: smoothEase }}
      >
        <MenuPopuler />
      </motion.section>

      {/* ── Profile Tabs ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: smoothEase }}
      >
        <ProfileTabs />
      </motion.section>

      <Footer />
    </div>
  );
}