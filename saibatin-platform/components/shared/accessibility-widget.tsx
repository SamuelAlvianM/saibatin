"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Accessibility,
  AArrowUp,
  AArrowDown,
  Contrast,
  Link2,
  PauseOctagon,
  RotateCcw,
  Volume2,
  Square,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Widget aksesibilitas (tombol melayang kiri-bawah) untuk membantu pengguna
 * berkebutuhan khusus:
 * - Tunanetra / low vision: perbesar teks, kontras tinggi, baca halaman
 *   dengan suara (Web Speech API bahasa Indonesia), fokus keyboard jelas.
 * - Disleksia / gangguan kognitif: garis bawah tautan, hentikan animasi.
 * Preferensi disimpan di localStorage dan diterapkan sebagai kelas di <html>.
 */

const STORAGE_KEY = "saibatin-a11y";

interface A11yPrefs {
  fontScale: number; // 0 = normal, 1..3 = langkah pembesaran
  contrast: boolean;
  grayscale: boolean;
  underline: boolean;
  noMotion: boolean;
}

const DEFAULT_PREFS: A11yPrefs = {
  fontScale: 0,
  contrast: false,
  grayscale: false,
  underline: false,
  noMotion: false,
};

const FONT_STEPS = [100, 112.5, 125, 137.5]; // persen ukuran dasar html

function applyPrefs(p: A11yPrefs) {
  const root = document.documentElement;
  root.style.fontSize = p.fontScale > 0 ? `${FONT_STEPS[p.fontScale]}%` : "";
  root.classList.toggle("a11y-contrast", p.contrast);
  root.classList.toggle("a11y-grayscale", p.grayscale);
  root.classList.toggle("a11y-underline", p.underline);
  root.classList.toggle("a11y-no-motion", p.noMotion);
}

export function AccessibilityWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);
  const [speaking, setSpeaking] = useState(false);
  const loaded = useRef(false);

  // Muat preferensi tersimpan sekali di awal.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = { ...DEFAULT_PREFS, ...JSON.parse(raw) } as A11yPrefs;
        setPrefs(saved);
        applyPrefs(saved);
      }
    } catch {
      /* abaikan data rusak */
    }
    loaded.current = true;
  }, []);

  const update = useCallback((patch: Partial<A11yPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      applyPrefs(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage penuh/di-block — tetap terapkan tanpa simpan */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    update({ ...DEFAULT_PREFS });
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [update]);

  // Baca isi halaman dengan suara (bahasa Indonesia).
  const readPage = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const main =
      document.querySelector("main") ?? document.querySelector("body");
    const selection = window.getSelection()?.toString().trim();
    const text = (selection || main?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utter);
    setSpeaking(true);
  }, [speaking]);

  // Hentikan pembacaan saat pindah halaman.
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [pathname]);

  // Sembunyikan di area dashboard/petugas agar tidak bertumpuk dengan UI admin.
  if (pathname?.startsWith("/dashboard")) return null;

  const Toggle = ({
    active,
    onClick,
    icon: Icon,
    label,
  }: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-4 left-4 z-[70]">
      {open && (
        <div
          role="dialog"
          aria-label="Menu aksesibilitas"
          className="absolute bottom-14 left-0 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              Aksesibilitas
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu aksesibilitas"
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mb-3">
            <p className="mb-1.5 text-xs font-medium text-slate-500">
              Ukuran teks ({FONT_STEPS[prefs.fontScale]}%)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  update({ fontScale: Math.max(0, prefs.fontScale - 1) })
                }
                disabled={prefs.fontScale === 0}
                aria-label="Perkecil teks"
                className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <AArrowDown className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() =>
                  update({
                    fontScale: Math.min(
                      FONT_STEPS.length - 1,
                      prefs.fontScale + 1,
                    ),
                  })
                }
                disabled={prefs.fontScale === FONT_STEPS.length - 1}
                aria-label="Perbesar teks"
                className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <AArrowUp className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Toggle
              active={prefs.contrast}
              onClick={() => update({ contrast: !prefs.contrast })}
              icon={Contrast}
              label="Kontras tinggi"
            />
            <Toggle
              active={prefs.grayscale}
              onClick={() => update({ grayscale: !prefs.grayscale })}
              icon={Contrast}
              label="Skala abu-abu"
            />
            <Toggle
              active={prefs.underline}
              onClick={() => update({ underline: !prefs.underline })}
              icon={Link2}
              label="Garis bawahi tautan"
            />
            <Toggle
              active={prefs.noMotion}
              onClick={() => update({ noMotion: !prefs.noMotion })}
              icon={PauseOctagon}
              label="Hentikan animasi"
            />
            <Toggle
              active={speaking}
              onClick={readPage}
              icon={speaking ? Square : Volume2}
              label={
                speaking ? "Berhenti membaca" : "Bacakan halaman / teks terpilih"
              }
            />
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Kembalikan ke pengaturan awal
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Buka menu aksesibilitas"
        aria-expanded={open}
        title="Aksesibilitas"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <Accessibility className="h-6 w-6" aria-hidden />
      </button>
    </div>
  );
}
