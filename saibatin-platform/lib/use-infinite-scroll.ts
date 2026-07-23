'use client';

import { useEffect, useRef } from 'react';

/**
 * Infinite scroll: kembalikan ref untuk elemen sentinel di bawah daftar.
 * `onMore` dipanggil saat sentinel mendekati viewport, HANYA bila `enabled`
 * (mis. masih ada halaman berikutnya & tidak sedang memuat).
 *
 * Callback disimpan di ref agar observer tidak perlu didaftar ulang tiap render
 * (cukup saat `enabled` berubah).
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onMore: () => void,
  enabled: boolean,
) {
  const sentinelRef = useRef<T | null>(null);
  const cbRef = useRef(onMore);
  cbRef.current = onMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) cbRef.current();
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  return sentinelRef;
}
