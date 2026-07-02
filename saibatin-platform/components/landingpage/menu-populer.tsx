'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ClipboardList, 
  FileText, 
  FileCheck, 
  BarChart3, 
  FileEdit, 
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <ClipboardList className="w-10 h-10" />,
    title: "Survei Kepuasan Masyarakat",
    description: "Bantu tingkatkan pelayanan publik",
    href: "/skm",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20"
  },
  {
    icon: <FileText className="w-10 h-10" />,
    title: "Pengaduan Online",
    description: "Laporkan masalah secara digital",
    href: "/pengaduan",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-200"
  },
  {
    icon: <FileCheck className="w-10 h-10" />,
    title: "Standar Operasional",
    description: "Panduan prosedur pelayanan",
    href: "/sop",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20"
  },
  {
    icon: <BarChart3 className="w-10 h-10" />,
    title: "Data Demografi",
    description: "Statistik per wilayah",
    href: "/demografi",
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-200"
  },
  {
    icon: <FileEdit className="w-10 h-10" />,
    title: "Permohonan Online",
    description: "Ajukan tanpa antre",
    href: "/permohonan",
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-200"
  },
  {
    icon: <Users className="w-10 h-10" />,
    title: "Maklumat Pelayanan",
    description: "Hak & kewajiban pemohon",
    href: "/maklumat",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-200"
  }
];

export default function MenuPopuler() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundaries
  const checkScrollBounds = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  // Manual scroll with pause
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const scrollAmount = direction === 'left' ? -300 : 300;
    
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    
    // Pause auto-scroll temporarily
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);
  }, []);

  // Auto-scroll effect (PRESERVED)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let lastTime = 0;
    const speed = 0.6; // pixels per frame - smooth and readable

    const autoScroll = (currentTime: number) => {
      // Only scroll if not hovered and not manually paused
      if (!container || isHovered || isPaused) {
        animationFrameRef.current = requestAnimationFrame(autoScroll);
        lastTime = currentTime;
        return;
      }

      const deltaTime = currentTime - lastTime;
      
      // Throttle to ~60fps for smooth performance
      if (deltaTime >= 16) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;

        // Seamless infinite scroll logic
        if (currentScroll >= maxScroll - 2) {
          // Instant jump to start for infinite loop effect
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = 0;
          container.style.scrollBehavior = 'smooth';
        } else {
          // Incremental smooth scroll
          container.scrollLeft += speed;
        }

        checkScrollBounds();
        lastTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(autoScroll);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(autoScroll);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, isPaused, checkScrollBounds]);

  // Track scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => checkScrollBounds();
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    checkScrollBounds();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkScrollBounds]);

  return (
    <section className="relative py-16 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Layanan Unggulan
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Menu Populer
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Akses layanan favorit masyarakat dengan cepat dan mudah
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Arrows - Show on hover */}
          <button
            onClick={() => scroll('left')}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full",
              "bg-white/95 backdrop-blur shadow-lg border border-slate-200",
              "flex items-center justify-center transition-all duration-300",
              "hover:scale-110 hover:shadow-xl hover:bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0",
              canScrollLeft ? "pointer-events-auto" : "pointer-events-none opacity-0"
            )}
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>

          <button
            onClick={() => scroll('right')}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full",
              "bg-white/95 backdrop-blur shadow-lg border border-slate-200",
              "flex items-center justify-center transition-all duration-300",
              "hover:scale-110 hover:shadow-xl hover:bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0",
              canScrollRight ? "pointer-events-auto" : "pointer-events-none opacity-0"
            )}
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide py-4 px-1"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'auto' // Controlled manually for smooth auto-scroll
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Tripled items for seamless infinite scroll */}
            {[...menuItems, ...menuItems, ...menuItems].map((item, index) => (
              <a
                key={`${item.title}-${index}`}
                href={item.href}
                className="shrink-0 w-[280px] group/card"
              >
                <Card className={cn(
                  "h-full border-2 transition-all duration-300 ease-out",
                  "hover:shadow-2xl hover:-translate-y-2",
                  "bg-white/80 backdrop-blur-sm",
                  item.borderColor,
                  "hover:border-transparent"
                )}>
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Icon Header */}
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                      "transition-all duration-300",
                      "group-hover/card:scale-110 group-hover/card:rotate-6",
                      item.bgColor,
                      item.color
                    )}>
                      {item.icon}
                    </div>

                    {/* Text Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
                      {item.description}
                    </p>

                    {/* Action Link */}
                    <div className={cn(
                      "flex items-center text-sm font-semibold transition-all duration-300",
                      "group-hover/card:gap-2",
                      item.color
                    )}>
                      <span>Selengkapnya</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover/card:translate-x-1 group-hover/card:-translate-y-1" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          {/* Gradient Fades */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none transition-opacity duration-300",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )} />
          <div className={cn(
            "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none transition-opacity duration-300",
            canScrollRight ? "opacity-100" : "opacity-0"
          )} />
        </div>

        {/* Auto-scroll indicator */}
        <div className="flex justify-center mt-6">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300",
            isHovered || isPaused ? "bg-slate-100 text-slate-500" : "bg-primary/10 text-primary"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              isHovered || isPaused ? "bg-slate-400" : "bg-primary animate-pulse"
            )} />
            {isHovered || isPaused ? "Auto-scroll dijeda" : "Auto-scroll aktif"}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}