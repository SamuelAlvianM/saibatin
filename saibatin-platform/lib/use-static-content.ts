"use client";

import { useEffect, useState } from "react";
import { getStaticDefaults } from "./static-content-registry";

// Pub/sub sederhana: dipanggil setelah sebuah blok konten disimpan (mode edit
// inline / dashboard) agar semua komponen yang memakai useStaticContent
// mengambil ulang data terbaru tanpa reload halaman.
let globalVersion = 0;
const listeners = new Set<() => void>();

export function refreshStaticContent() {
  globalVersion += 1;
  listeners.forEach((l) => l());
}

/**
 * Hook client: ambil konten statis (default registry + override DB).
 * Render pertama langsung memakai default agar tidak ada layout shift,
 * lalu diganti nilai DB begitu respons tiba. Re-fetch otomatis saat
 * refreshStaticContent() dipanggil.
 */
export function useStaticContent(keys: string[]): Record<string, Record<string, unknown>> {
  const keysJoined = keys.join(",");
  const [data, setData] = useState<Record<string, Record<string, unknown>>>(() => {
    const initial: Record<string, Record<string, unknown>> = {};
    for (const key of keys) initial[key] = getStaticDefaults(key);
    return initial;
  });
  const [version, setVersion] = useState(globalVersion);

  // Berlangganan sinyal refresh global.
  useEffect(() => {
    const l = () => setVersion(globalVersion);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/static-content?keys=${encodeURIComponent(keysJoined)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.data?.items) {
          setData(json.data.items);
        }
      })
      .catch(() => {
        // Gagal fetch → tetap pakai default, tanpa error UI.
      });
    return () => {
      cancelled = true;
    };
  }, [keysJoined, version]);

  return data;
}
