"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const [mounted, setMounted] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-accent/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          {/* Logo with animation */}
          <div
            className={cn(
              "flex justify-center transition-all duration-1000 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            )}
          >
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 animate-float">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
              <Image
                src="/LOGO-dinas_ktt.png"
                alt="DISDUKCAPIL Logo"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* 404 Text with staggered animation */}
          <div
            className={cn(
              "transition-all duration-1000 ease-out delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
              404
            </h1>
          </div>

          {/* Heading */}
          <div
            className={cn(
              "space-y-3 transition-all duration-1000 ease-out delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
            </p>
          </div>

          {/* Decorative divider */}
          <div
            className={cn(
              "flex justify-center transition-all duration-1000 ease-out delay-400",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}
          >
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </div>

          {/* Action buttons */}
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 ease-out delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <Button
              asChild
              size="lg"
              className={cn(
                "group relative overflow-hidden transition-all duration-300 ease-out",
                "hover:shadow-xl hover:scale-105 hover:-translate-y-1",
                "active:scale-95 active:translate-y-0"
              )}
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <span>Kembali ke Beranda</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                "group transition-all duration-300 ease-out",
                "hover:bg-accent hover:scale-105 hover:-translate-y-1",
                "active:scale-95 active:translate-y-0"
              )}
            >
              <Link href="/hubungi-kami" className="flex items-center gap-2">
                <Search className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <span>Hubungi Kami</span>
              </Link>
            </Button>
          </div>

          {/* Additional help text */}
          <div
            className={cn(
              "pt-8 transition-all duration-1000 ease-out delay-600",
              mounted ? "opacity-100" : "opacity-0"
            )}
          >
            <p className="text-sm text-muted-foreground">
              Atau gunakan tombol kembali di browser Anda
            </p>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}