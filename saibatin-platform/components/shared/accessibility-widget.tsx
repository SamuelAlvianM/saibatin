"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Accessibility,
  AArrowUp,
  AArrowDown,
  AudioLines,
  Blend,
  Contrast,
  Link2,
  MousePointer2,
  MousePointerClick,
  Palette,
  PauseOctagon,
  RotateCcw,
  Ruler,
  Square,
  StretchHorizontal,
  Sun,
  Type,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type A11yPrefs,
  A11Y_STORAGE_KEY,
  DEFAULT_PREFS,
  FONT_DEFAULT_IDX,
  FONT_STEPS,
  SPACING_MAX,
  applyPrefs,
  loadPrefs,
  savePrefs,
} from "@/lib/a11y";

/**
 * Widget aksesibilitas (FAB kanan-tengah layar) untuk penyandang disabilitas:
 * - Low vision / tunanetra: skala teks, spasi teks, kontras tinggi, invert,
 *   skala abu, latar terang, sorot tautan, kursor besar, text-to-speech id-ID.
 * - Disleksia / kognitif: font ramah disleksia, garis bantu baca, jeda animasi.
 * Preferensi persist di localStorage (lib/a11y.ts) dan diterapkan sebelum
 * paint oleh A11Y_INIT_SCRIPT di app/layout.tsx (anti-flicker).
 */

const SPACING_LABEL = ["Normal", "Lebar", "Sangat Lebar"];

function TileButton({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-[0.72rem] font-medium leading-tight transition-colors focus-visible:ring-2 focus-visible:ring-primary/60",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span>{label}</span>
      {hint && (
        <span className={cn("text-[0.62rem]", active ? "text-white/80" : "text-slate-400")}>
          {hint}
        </span>
      )}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-0.5 pt-3 pb-1.5 text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

export function AccessibilityWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);
  const [speaking, setSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [idVoiceMissing, setIdVoiceMissing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Muat preferensi tersimpan (kelas <html> sudah dipasang init script;
  // di sini cukup sinkronkan state UI + jalankan applyPrefs sekali lagi).
  useEffect(() => {
    const saved = loadPrefs();
    setPrefs(saved);
    applyPrefs(saved);
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Pilih suara Bahasa Indonesia agar pelafalan tidak "kebarat-baratan".
  // Daftar suara dimuat asinkron, jadi dengarkan event `voiceschanged`.
  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) return;
    const pick = () => {
      const voices = synth.getVoices();
      if (!voices.length) return;
      const idVoices = voices.filter(
        (v) => /^id[-_]?/i.test(v.lang) || /indonesia|bahasa/i.test(v.name),
      );
      // Prioritaskan suara natural/daring (Google / Microsoft Natural) bila ada.
      voiceRef.current =
        idVoices.find((v) => /google/i.test(v.name)) ??
        idVoices.find((v) => /natural|online/i.test(v.name)) ??
        idVoices[0] ??
        null;
      setIdVoiceMissing(idVoices.length === 0);
    };
    pick();
    synth.addEventListener("voiceschanged", pick);
    return () => synth.removeEventListener("voiceschanged", pick);
  }, []);

  const update = useCallback(
    (patch: Partial<A11yPrefs> | ((prev: A11yPrefs) => Partial<A11yPrefs>)) => {
      setPrefs((prev) => {
        const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
        applyPrefs(next);
        savePrefs(next);
        return next;
      });
    },
    [],
  );

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    // Pakai suara Indonesia terpilih; lang tetap id-ID sebagai isyarat pelafalan.
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.lang = voiceRef.current?.lang || "id-ID";
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utter);
    setSpeaking(true);
  }, []);

  const reset = useCallback(() => {
    setPrefs({ ...DEFAULT_PREFS });
    applyPrefs(DEFAULT_PREFS);
    try {
      localStorage.removeItem(A11Y_STORAGE_KEY);
    } catch {
      /* abaikan */
    }
    stopSpeech();
  }, [stopSpeech]);

  // Bacakan halaman penuh / teks terpilih.
  const readPage = useCallback(() => {
    if (speaking) {
      stopSpeech();
      return;
    }
    const main = document.querySelector("main") ?? document.body;
    const selection = window.getSelection()?.toString().trim();
    const text = (selection || main?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);
    if (text) speak(text);
  }, [speaking, speak, stopSpeech]);

  // Mode "baca saat klik": klik blok teks manapun → dibacakan.
  useEffect(() => {
    if (!prefs.ttsClick) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || t.closest("[data-a11y-widget]")) return;
      const block =
        t.closest("p,h1,h2,h3,h4,h5,h6,li,td,th,label,figcaption,blockquote,a,button") ?? t;
      const text = (block.textContent || "").replace(/\s+/g, " ").trim().slice(0, 2000);
      if (text) speak(text);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [prefs.ttsClick, speak]);

  // Mode "baca saat diarahkan": blok teks yang ditunjuk kursor dibacakan &
  // disorot. Ada jeda kecil agar tidak membaca setiap blok yang sekadar dilewati.
  useEffect(() => {
    if (!prefs.ttsHover) return;
    let current: Element | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clearHighlight = () => {
      current?.classList.remove("a11y-tts-hover");
      current = null;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || t.closest("[data-a11y-widget]")) return;
      const block = t.closest(
        "p,h1,h2,h3,h4,h5,h6,li,td,th,label,figcaption,blockquote,a,button",
      );
      if (!block || block === current) return;
      clearTimeout(timer);
      clearHighlight();
      const text = (block.textContent || "").replace(/\s+/g, " ").trim().slice(0, 2000);
      if (!text) return;
      current = block;
      block.classList.add("a11y-tts-hover");
      timer = setTimeout(() => speak(text), 320);
    };
    document.addEventListener("mouseover", onOver, true);
    return () => {
      document.removeEventListener("mouseover", onOver, true);
      clearTimeout(timer);
      clearHighlight();
    };
  }, [prefs.ttsHover, speak]);

  // Garis bantu baca mengikuti kursor.
  useEffect(() => {
    if (!prefs.readingGuide) return;
    const move = (e: MouseEvent) => {
      if (guideRef.current) guideRef.current.style.top = `${e.clientY + 20}px`;
    };
    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, [prefs.readingGuide]);

  // Hentikan pembacaan saat pindah halaman.
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [pathname]);

  // Focus-trap panel: Esc menutup (fokus balik ke FAB), Tab berputar di panel.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        fabRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>("button:not([disabled])"));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Sembunyikan di area dashboard/petugas agar tidak bertumpuk dengan UI admin.
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <div data-a11y-widget>
      {/* Garis bantu baca */}
      {prefs.readingGuide && <div ref={guideRef} className="a11y-reading-guide" aria-hidden />}

      {/* FAB kanan-tengah */}
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Buka menu aksesibilitas"
        aria-expanded={open}
        title="Aksesibilitas"
        className="fixed right-3 top-[62%] z-[70] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <Accessibility className="h-6 w-6" aria-hidden />
      </button>

      {open && (
        <>
          {/* Overlay: klik di luar menutup panel */}
          <div
            className="fixed inset-0 z-[71] bg-black/25 sm:bg-black/10"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu aksesibilitas"
            className={cn(
              "fixed z-[72] flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl",
              // Mobile: bottom-sheet penuh; Desktop: panel di kiri FAB.
              "inset-x-0 bottom-0 max-h-[78dvh] rounded-t-2xl",
              "sm:inset-x-auto sm:bottom-auto sm:right-[4.5rem] sm:top-1/2 sm:max-h-[86dvh] sm:w-[21.5rem] sm:-translate-y-1/2 sm:rounded-2xl",
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Accessibility className="h-4 w-4 text-primary" aria-hidden />
                Menu Aksesibilitas
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  fabRef.current?.focus();
                }}
                aria-label="Tutup menu aksesibilitas"
                className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* ── Ukuran & keterbacaan teks ── */}
              <SectionLabel>Ukuran &amp; Keterbacaan Teks</SectionLabel>
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update((p) => ({ fontIdx: Math.max(0, p.fontIdx - 1) }))}
                  disabled={prefs.fontIdx === 0}
                  aria-label="Perkecil teks"
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  <AArrowDown className="h-5 w-5" aria-hidden />
                </button>
                <span
                  className="w-14 text-center text-sm font-semibold text-slate-700"
                  aria-live="polite"
                >
                  {FONT_STEPS[prefs.fontIdx]}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update((p) => ({ fontIdx: Math.min(FONT_STEPS.length - 1, p.fontIdx + 1) }))
                  }
                  disabled={prefs.fontIdx === FONT_STEPS.length - 1}
                  aria-label="Perbesar teks"
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  <AArrowUp className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <TileButton
                  active={prefs.spacing > 0}
                  onClick={() => update((p) => ({ spacing: (p.spacing + 1) % (SPACING_MAX + 1) }))}
                  icon={StretchHorizontal}
                  label="Spasi Teks"
                  hint={SPACING_LABEL[prefs.spacing]}
                />
                <TileButton
                  active={prefs.dyslexia}
                  onClick={() => update({ dyslexia: !prefs.dyslexia })}
                  icon={Type}
                  label="Font Disleksia"
                />
                <TileButton
                  active={prefs.fontIdx !== FONT_DEFAULT_IDX}
                  onClick={() => update({ fontIdx: FONT_DEFAULT_IDX })}
                  icon={RotateCcw}
                  label="Teks Normal"
                />
              </div>

              {/* ── Warna & kontras ── */}
              <SectionLabel>Warna &amp; Kontras</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                <TileButton
                  active={prefs.contrast}
                  onClick={() => update({ contrast: !prefs.contrast })}
                  icon={Contrast}
                  label="Kontras Tinggi"
                />
                <TileButton
                  active={prefs.invert}
                  onClick={() => update({ invert: !prefs.invert })}
                  icon={Blend}
                  label="Kontras Negatif"
                />
                <TileButton
                  active={prefs.grayscale}
                  onClick={() => update({ grayscale: !prefs.grayscale })}
                  icon={Palette}
                  label="Skala Abu"
                />
                <TileButton
                  active={prefs.lightBg}
                  onClick={() => update({ lightBg: !prefs.lightBg })}
                  icon={Sun}
                  label="Latar Terang"
                />
                <TileButton
                  active={prefs.highlightLinks}
                  onClick={() => update({ highlightLinks: !prefs.highlightLinks })}
                  icon={Link2}
                  label="Sorot Tautan"
                />
              </div>

              {/* ── Bantuan navigasi & baca ── */}
              <SectionLabel>Bantuan Navigasi &amp; Baca</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                <TileButton
                  active={prefs.readingGuide}
                  onClick={() => update({ readingGuide: !prefs.readingGuide })}
                  icon={Ruler}
                  label="Garis Bantu Baca"
                />
                <TileButton
                  active={prefs.bigCursor}
                  onClick={() => update({ bigCursor: !prefs.bigCursor })}
                  icon={MousePointer2}
                  label="Kursor Besar"
                />
                <TileButton
                  active={prefs.noMotion}
                  onClick={() => update({ noMotion: !prefs.noMotion })}
                  icon={PauseOctagon}
                  label="Jeda Animasi"
                />
                {ttsSupported && (
                  <>
                    <TileButton
                      active={prefs.ttsHover}
                      onClick={() => {
                        if (prefs.ttsHover) stopSpeech();
                        update({ ttsHover: !prefs.ttsHover });
                      }}
                      icon={AudioLines}
                      label="Baca Saat Diarahkan"
                    />
                    <TileButton
                      active={prefs.ttsClick}
                      onClick={() => {
                        if (prefs.ttsClick) stopSpeech();
                        update({ ttsClick: !prefs.ttsClick });
                      }}
                      icon={MousePointerClick}
                      label="Baca Saat Klik"
                    />
                    <TileButton
                      active={speaking}
                      onClick={readPage}
                      icon={speaking ? Square : Volume2}
                      label={speaking ? "Berhenti Baca" : "Bacakan Halaman"}
                    />
                  </>
                )}
              </div>
              {ttsSupported && (prefs.ttsHover || prefs.ttsClick) && (
                <p className="mt-2 text-[0.7rem] text-slate-500">
                  {prefs.ttsHover
                    ? "Arahkan kursor ke teks untuk dibacakan."
                    : "Klik teks mana pun untuk dibacakan."}
                </p>
              )}
              {ttsSupported && idVoiceMissing && (
                <p className="mt-1 text-[0.7rem] text-amber-600">
                  Suara Bahasa Indonesia belum terpasang di perangkat ini, sehingga
                  pelafalan mungkin kurang tepat.
                </p>
              )}
              {!ttsSupported && (
                <p className="mt-2 text-[0.7rem] text-slate-400">
                  Fitur baca nyaring tidak didukung peramban ini.
                </p>
              )}

              <button
                type="button"
                onClick={reset}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Kembalikan ke Pengaturan Awal
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
