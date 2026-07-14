'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Pencatat kunjungan situs publik (tanpa tampilan). Dipasang di root layout:
 * - setiap pindah halaman → ping pv=true (menambah hitungan tampilan);
 * - tiap 2 menit selama tab terbuka → ping pv=false (status "online" saja).
 * Halaman dashboard petugas tidak ikut dihitung.
 */
export function KunjunganPing() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/dashboard')) return;
    fetch('/api/kunjungan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pv: true }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const t = setInterval(() => {
      if (window.location.pathname.startsWith('/dashboard')) return;
      fetch('/api/kunjungan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pv: false }),
      }).catch(() => {});
    }, 120_000);
    return () => clearInterval(t);
  }, []);

  return null;
}
