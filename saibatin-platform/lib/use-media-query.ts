'use client';

import { useEffect, useState } from 'react';

/**
 * Apakah sebuah media query sedang cocok?
 *
 * Nilai awal selalu `false` supaya render di server dan render pertama di
 * klien sama — kalau ditebak dari `window`, React akan protes hydration
 * mismatch. Nilai sebenarnya masuk tepat setelah komponen terpasang.
 */
export function useMediaQuery(query: string): boolean {
  const [cocok, setCocok] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setCocok(mql.matches);

    const ubah = (e: MediaQueryListEvent) => setCocok(e.matches);
    mql.addEventListener('change', ubah);
    return () => mql.removeEventListener('change', ubah);
  }, [query]);

  return cocok;
}
