"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ElegantCarousel from "./carousel";
import { useStaticContent } from "@/lib/use-static-content";
import { EditableBlock } from "@/components/konten/inline-edit";
import {
  Search,
  Baby,
  Users,
  IdCard,
  Zap,
  MapPin,
  FileText,
  ShieldCheck,
  Clock3,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Akta Kelahiran", icon: Baby },
  { label: "KTP Elektronik", icon: Zap },
  { label: "Kartu Keluarga", icon: Users },
  { label: "KIA", icon: IdCard },
  { label: "Pindah Datang", icon: MapPin },
  { label: "Semua Layanan", icon: FileText },
];

const TRUST_BADGES = [
  { label: "Resmi & Aman", icon: ShieldCheck },
  { label: "Proses Cepat", icon: Clock3 },
  { label: "Gratis", icon: BadgeCheck },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Hero beranda: headline editable (dashboard → Konten Halaman), pencarian
 *  layanan, quick actions, dan carousel foto di sisi kanan. */
export default function HeroSection() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const cms = useStaticContent(["beranda.hero", "beranda.carousel"]);
  const hero = cms["beranda.hero"] as {
    heading?: string;
    subheading?: string;
    searchPlaceholder?: string;
  };

  // Slide carousel dari dashboard (Konten → Carousel Hero). Hanya slide yang
  // punya gambar yang dipakai; jika belum ada, ElegantCarousel pakai bawaan.
  const DARK = ["#0d1b2a", "#0f1923", "#0a1628", "#111827"];
  type CmsSlide = { image?: string; title?: string; subtitle?: string };
  const rawSlides = (cms["beranda.carousel"]?.slides ?? []) as CmsSlide[];
  const cmsSlides = rawSlides.filter((s) => s.image);
  const slides =
    cmsSlides.length > 0
      ? cmsSlides.map((s, i) => ({
          id: i + 1,
          title: s.title ?? "",
          subtitle: s.subtitle ?? "",
          image: s.image as string,
          color: DARK[i % DARK.length],
        }))
      : undefined;

  const cari = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      q.trim()
        ? `/user/pengajuan/baru?q=${encodeURIComponent(q.trim())}`
        : "/user/pengajuan/baru",
    );
  };

  return (
    <section className="relative overflow-hidden">
      {/* Latar gradient brand */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #143a5c 0%, #1b4b72 45%, #2176bd 100%)",
        }}
      />
      {/* Pola titik halus */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow aksen */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl bg-sky-400/20 pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full blur-3xl bg-blue-300/10 pointer-events-none" />

      <div className="relative container mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Kiri: headline + search + quick actions */}
          <EditableBlock kunci="beranda.hero" label="Teks Hero" className="w-full lg:flex-1">
          <div className="w-full text-white">
            {/* <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Portal Resmi Disdukcapil Kabupaten Pesisir Barat
            </motion.p> */}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease }}
              className="mt-5 text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight"
            >
              {hero?.heading}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease }}
              className="mt-4 text-white/80 text-base md:text-lg max-w-xl leading-relaxed"
            >
              {hero?.subheading}
            </motion.p>

            {/* Search layanan */}
            <motion.form
              onSubmit={cari}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease }}
              className="mt-7 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-blue-950/30 max-w-xl"
            >
              <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  hero?.searchPlaceholder ?? "Mau mengurus apa hari ini?"
                }
                className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm md:text-base focus:outline-none min-w-0"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1b4b72] to-[#2176bd] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
              >
                Cari
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.form>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease }}
              className="mt-5 flex flex-wrap gap-2"
            >
              {QUICK_ACTIONS.map((a, i) => (
                <Link
                  key={a.label}
                  href={
                    a.label === "Semua Layanan"
                      ? "/user/pengajuan/baru"
                      : `/user/pengajuan/baru?q=${encodeURIComponent(a.label)}`
                  }
                  className="group inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm hover:bg-white hover:text-[#1b4b72] transition-all"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  <a.icon className="h-3.5 w-3.5" />
                  {a.label}
                </Link>
              ))}
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45, ease }}
              className="mt-8 flex flex-wrap items-center gap-5 text-white/70 text-xs"
            >
              {TRUST_BADGES.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5"
                >
                  <b.icon className="h-4 w-4 text-emerald-300" />
                  {b.label}
                </span>
              ))}
            </motion.div>
          </div>
          </EditableBlock>

          {/* Kanan: carousel foto */}
          <EditableBlock kunci="beranda.carousel" label="Carousel" className="w-full lg:w-[52%] shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="w-full"
          >
            <div className="rounded-3xl overflow-hidden h-[280px] sm:h-[380px] md:h-[460px] lg:h-[520px] shadow-2xl shadow-blue-950/40 ring-1 ring-white/20">
              <ElegantCarousel slides={slides} height="h-full" />
            </div>
          </motion.div>
          </EditableBlock>
        </div>
      </div>

      {/* Lengkung pemisah ke konten berikutnya */}
      <svg
        className="relative block w-full text-white"
        viewBox="0 0 1440 48"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" />
      </svg>
    </section>
  );
}
