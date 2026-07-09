"use client";

import { motion, Easing } from "framer-motion";
import HeroSection from "@/components/landingpage/hero-section";
import AlurLayanan from "@/components/landingpage/alur-layanan";
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
      {/* ── Hero: headline + pencarian layanan + carousel ── */}
      <HeroSection />

      {/* ── Statistik layanan (data DB) — bg putih menyatu ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: smoothEase }}
        className="relative bg-white pt-2 pb-10"
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <StatsGrid />
        </div>
      </motion.section>

      {/* ── Menu Layanan Populer ── */}
      {/* <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: smoothEase }}
      >
        <MenuPopuler />
      </motion.section> */}

      {/* ── Alur layanan 3 langkah ── */}
      <AlurLayanan />

      {/* ── Sorotan berita & info ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: smoothEase }}
        className="py-6"
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <QuickHighlights />
        </div>
      </motion.section>

      {/* ── Profil dinas (visi, misi, motto — editable dari dashboard) ── */}
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
