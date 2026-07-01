'use client';

import { motion, Easing } from "framer-motion";
import ElegantCarousel from "@/components/landingpage/carousel";
import StatsGrid from "@/components/landingpage/stats";
import MenuPopuler from "@/components/landingpage/menu-populer";
import QuickHighlights from "@/components/landingpage/quick-highlights";
import RelasiTerkait from "@/components/landingpage/relasi-terkait";
import ProfileTabs from "@/components/landingpage/profile-tabs";
import { Footer } from "@/components/shared/footer";

const smoothEase: Easing = [0.25, 0.1, 0.25, 1];

export default function Home() {
  return (
    <div className="relative bg-slate-50/30">

      {/* ── Hero ── */}
      <section className="relative py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-5 items-stretch">

            {/* Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: smoothEase }}
              className="w-full lg:flex-1 flex flex-col gap-4 rounded-3xl"
              style={{ isolation: 'isolate' }}
            >
              <div className="rounded-3xl overflow-hidden w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[420px] shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/60 flex-shrink-0">
                <ElegantCarousel height="h-full" />
              </div>
              <QuickHighlights />
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

      {/* ── Relasi Terkait ── */}
      <RelasiTerkait />

      <Footer />
    </div>
  );
}