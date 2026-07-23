"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  color: string;
}

// TODO: ganti `image` dengan foto asli SAIBATIN/Disdukcapil Pesisir Barat —
// masih placeholder karena akses jaringan ke situs live diblokir pada
// sesi pengerjaan ini.
const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    title: "Pelayanan Adminduk Online",
    subtitle: "Ajukan permohonan dokumen kependudukan kapan saja, di mana saja",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
    color: "#0d1b2a",
  },
  {
    id: 2,
    title: "Disdukcapil Pesisir Barat",
    subtitle: "Melayani masyarakat Kabupaten Pesisir Barat dengan profesional",
    image:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=800&fit=crop",
    color: "#0f1923",
  },
  {
    id: 3,
    title: "Mudah, Cepat, Tanpa Biaya",
    subtitle:
      "Seluruh layanan administrasi kependudukan gratis (tidak dipungut biaya)",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop",
    color: "#0a1628",
  },
  {
    id: 4,
    title: "SAIBATIN",
    subtitle: "Sistem Administrasi Informasi Berbasis Aplikasi Terintegrasi",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop",
    color: "#111827",
  },
];

interface ElegantCarouselProps {
  slides?: CarouselSlide[];
  autoPlayInterval?: number;
  height?: string;
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressRing({
  duration,
  resetKey,
}: {
  duration: number;
  resetKey: number;
}) {
  const progress = useMotionValue(0);
  const r = 10;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = useTransform(progress, [0, 1], [circumference, 0]);

  useEffect(() => {
    progress.set(0);
    const ctrl = animate(progress, 1, {
      duration: duration / 1000,
      ease: "linear",
    });
    return () => ctrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <svg width="44" height="44" className="absolute inset-0 -rotate-90">
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="2"
      />
      <motion.circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        style={{ strokeDashoffset }}
      />
    </svg>
  );
}

// ─── Text animation variants ──────────────────────────────────────────────────

const TEXT_VARIANTS = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, delay: d, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ElegantCarousel({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000,
  height = "h-screen",
}: ElegantCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Touch swipe
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);

  const paginate = useCallback(
    (dir: "next" | "prev") => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setCurrentIndex((prev) =>
        dir === "next"
          ? (prev + 1) % slides.length
          : (prev - 1 + slides.length) % slides.length,
      );
      setProgressKey((k) => k + 1);
    },
    [isAnimating, slides.length],
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex) return;
      setDirection(index > currentIndex ? "next" : "prev");
      setIsAnimating(true);
      setCurrentIndex(index);
      setProgressKey((k) => k + 1);
    },
    [isAnimating, currentIndex],
  );

  // Unlock after CSS animation completes (matches 0.7s in globals.css)
  useEffect(() => {
    const t = setTimeout(() => setIsAnimating(false), 750);
    return () => clearTimeout(t);
  }, [currentIndex]);

  // Autoplay
  useEffect(() => {
    if (autoPlayInterval <= 0 || paused) return;
    const t = setTimeout(() => paginate("next"), autoPlayInterval);
    return () => clearTimeout(t);
  }, [autoPlayInterval, paused, paginate, progressKey]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    setPaused(false);
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 50) return;
    paginate(dx < 0 ? "next" : "prev");
  };

  return (
    <div
      className={`relative w-full ${height} overflow-hidden bg-black select-none`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slides — CSS keyframe transitions from globals.css ── */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const isPrev =
            index === (currentIndex - 1 + slides.length) % slides.length;

          let slideClass = "absolute inset-0 opacity-0 pointer-events-none";
          if (isActive) {
            slideClass = `absolute inset-0 carousel-slide-enter-${direction}`;
          } else if (isPrev && isAnimating) {
            slideClass = `absolute inset-0 carousel-slide-exit-${direction}`;
          }

          return (
            <div key={slide.id} className={slideClass}>
              {/* Background image */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Latar buram: mengisi sisa bingkai kalau rasio foto tidak sama
                    dengan rasio kontainer, jadi tidak muncul bilah kosong. */}
                <div
                  className={`absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-70 ${isActive ? "carousel-image-scale" : ""}`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                  aria-hidden
                />
                {/* Foto utama: `contain` supaya SELURUH isi foto terlihat —
                    dulu `cover` sehingga sisi gambar terpotong. */}
                <div
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                {/* Gradient overlay — ringan agar foto terlihat; gelap hanya di
                    bawah (tempat judul) supaya teks tetap terbaca. */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(105deg, ${slide.color}80 0%, ${slide.color}40 35%, transparent 70%),
                                 linear-gradient(to top, ${slide.color}d9 0%, ${slide.color}59 32%, transparent 58%)`,
                  }}
                />
              </div>

              {/* Text — text-shadow menjaga keterbacaan di atas overlay ringan */}
              <div className="relative h-full flex flex-col justify-end pb-14 px-6 md:px-14 lg:px-20">
                <div className="max-w-xl">
                  <h2
                    className={`carousel-font-title text-4xl md:text-6xl lg:text-7xl font-light text-white mb-3 leading-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] ${isActive ? "carousel-text-enter" : "opacity-0"}`}
                  >
                    {slide.title}
                  </h2>
                  <p
                    className={`carousel-font-subtitle text-sm md:text-base text-white/80 font-light tracking-wide [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] ${isActive ? "carousel-subtitle-enter" : "opacity-0"}`}
                  >
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Arrows (hidden on mobile — swipe instead) ── */}
      <div className="hidden md:block">
        <motion.button
          onClick={() => paginate("prev")}
          disabled={isAnimating}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.93 }}
          className="carousel-nav-button absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.button
          onClick={() => paginate("next")}
          disabled={isAnimating}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.93 }}
          className="carousel-nav-button absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-5 left-6 md:left-14 lg:left-20 right-6 md:right-14 lg:right-20 z-20 flex items-center justify-between">
        {/* Dots */}
        <div className="flex items-center gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              disabled={isAnimating}
              aria-label={`Go to slide ${i + 1}`}
              className="carousel-nav-dot disabled:cursor-not-allowed"
            >
              <motion.div
                animate={{
                  width: i === currentIndex ? 26 : 6,
                  backgroundColor:
                    i === currentIndex
                      ? "rgba(255,255,255,1)"
                      : "rgba(255,255,255,0.35)",
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-1.5 rounded-full"
              />
            </button>
          ))}
        </div>

        {/* Autoplay ring / pause */}
        {autoPlayInterval > 0 && (
          <div className="relative w-11 h-11 flex items-center justify-center">
            {!paused ? (
              <ProgressRing
                key={progressKey}
                duration={autoPlayInterval}
                resetKey={progressKey}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                className="flex gap-1"
              >
                <div className="w-1 h-3.5 rounded-full bg-white" />
                <div className="w-1 h-3.5 rounded-full bg-white" />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── Top progress bar ── */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-white/10">
        <motion.div
          key={`bar-${progressKey}`}
          className="h-full bg-white/40"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
}
