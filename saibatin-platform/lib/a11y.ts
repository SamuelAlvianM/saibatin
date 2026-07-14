/**
 * Util aksesibilitas (accessibility-widget).
 *
 * Preferensi disimpan sebagai satu objek JSON di localStorage dan diterapkan
 * ke <html> sebagai kelas `a11y-*` + inline style (font-size, --a11y-filter).
 * Efek visualnya didefinisikan terpusat di app/globals.css.
 *
 * File ini TANPA "use client" agar bisa diimpor server component (layout)
 * untuk skrip init anti-flicker maupun client component (widget).
 */

export const A11Y_STORAGE_KEY = "saibatin-a11y";

/** Skala font global dalam persen; indeks 1 = 100% (default). */
export const FONT_STEPS = [90, 100, 110, 125, 150, 175, 200];
export const FONT_DEFAULT_IDX = 1;

/** Jumlah tingkat spasi teks: 0 = normal, 1 = lebar, 2 = sangat lebar. */
export const SPACING_MAX = 2;

export interface A11yPrefs {
  /** Versi skema penyimpanan (migrasi dari format lama tanpa `v`). */
  v: 2;
  /** Indeks ke FONT_STEPS. */
  fontIdx: number;
  /** 0..SPACING_MAX. */
  spacing: number;
  dyslexia: boolean;
  contrast: boolean;
  invert: boolean;
  grayscale: boolean;
  lightBg: boolean;
  highlightLinks: boolean;
  readingGuide: boolean;
  bigCursor: boolean;
  noMotion: boolean;
  /** Mode "baca saat klik" (text-to-speech). */
  ttsClick: boolean;
  /** Mode "baca saat diarahkan" — teks yang ditunjuk kursor dibacakan. */
  ttsHover: boolean;
}

export const DEFAULT_PREFS: A11yPrefs = {
  v: 2,
  fontIdx: FONT_DEFAULT_IDX,
  spacing: 0,
  dyslexia: false,
  contrast: false,
  invert: false,
  grayscale: false,
  lightBg: false,
  highlightLinks: false,
  readingGuide: false,
  bigCursor: false,
  noMotion: false,
  ttsClick: false,
  ttsHover: false,
};

/** Migrasi dari format lama {fontScale:0..3, underline, ...} ke v2. */
export function migratePrefs(raw: unknown): A11yPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREFS };
  const o = raw as Record<string, unknown>;
  if (o.v === 2) return { ...DEFAULT_PREFS, ...(o as Partial<A11yPrefs>), v: 2 };
  const oldScale = typeof o.fontScale === "number" ? o.fontScale : 0;
  return {
    ...DEFAULT_PREFS,
    fontIdx: Math.min(FONT_STEPS.length - 1, FONT_DEFAULT_IDX + Math.max(0, oldScale)),
    contrast: !!o.contrast,
    grayscale: !!o.grayscale,
    highlightLinks: !!o.underline,
    noMotion: !!o.noMotion,
  };
}

export function loadPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return migratePrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(p: A11yPrefs) {
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage penuh/diblokir — efek tetap diterapkan tanpa persist */
  }
}

/** Terapkan preferensi ke <html>. Logika sama dengan A11Y_INIT_SCRIPT. */
export function applyPrefs(p: A11yPrefs) {
  const root = document.documentElement;

  const idx = Math.min(Math.max(p.fontIdx, 0), FONT_STEPS.length - 1);
  root.style.fontSize = idx === FONT_DEFAULT_IDX ? "" : `${FONT_STEPS[idx]}%`;

  // Filter halaman dikomposisikan jadi satu CSS var (lihat globals.css).
  const filters: string[] = [];
  if (p.contrast) filters.push("contrast(1.2)");
  if (p.grayscale) filters.push("grayscale(1)");
  if (p.invert) filters.push("invert(1) hue-rotate(180deg)");
  if (filters.length) root.style.setProperty("--a11y-filter", filters.join(" "));
  else root.style.removeProperty("--a11y-filter");

  root.classList.toggle("a11y-contrast", p.contrast);
  root.classList.toggle("a11y-invert", p.invert);
  root.classList.toggle("a11y-underline", p.highlightLinks);
  root.classList.toggle("a11y-dyslexia", p.dyslexia);
  root.classList.toggle("a11y-lightbg", p.lightBg);
  root.classList.toggle("a11y-cursor", p.bigCursor);
  root.classList.toggle("a11y-no-motion", p.noMotion);
  root.classList.remove("a11y-spacing-1", "a11y-spacing-2");
  if (p.spacing > 0) root.classList.add(`a11y-spacing-${Math.min(p.spacing, SPACING_MAX)}`);
  if (p.lightBg) root.classList.remove("dark");
}

/**
 * Skrip inline yang dijalankan SEBELUM konten body di-render (anti-flicker):
 * baca localStorage lalu terapkan kelas/style yang sama dengan applyPrefs().
 * Dirender lewat <script dangerouslySetInnerHTML> di app/layout.tsx.
 */
export const A11Y_INIT_SCRIPT = `(function(){try{
var r=document.documentElement,raw=localStorage.getItem(${JSON.stringify(A11Y_STORAGE_KEY)});
if(!raw)return;var s=JSON.parse(raw);if(!s||typeof s!=="object")return;
if(s.v!==2){s={v:2,fontIdx:Math.min(6,1+Math.max(0,s.fontScale||0)),spacing:0,dyslexia:false,contrast:!!s.contrast,invert:false,grayscale:!!s.grayscale,lightBg:false,highlightLinks:!!s.underline,readingGuide:false,bigCursor:false,noMotion:!!s.noMotion,ttsClick:false};}
var F=${JSON.stringify(FONT_STEPS)};var i=Math.min(Math.max(s.fontIdx||0,0),F.length-1);
if(i!==${FONT_DEFAULT_IDX})r.style.fontSize=F[i]+"%";
var f=[];if(s.contrast)f.push("contrast(1.2)");if(s.grayscale)f.push("grayscale(1)");if(s.invert)f.push("invert(1) hue-rotate(180deg)");
if(f.length)r.style.setProperty("--a11y-filter",f.join(" "));
var c={"a11y-contrast":s.contrast,"a11y-invert":s.invert,"a11y-underline":s.highlightLinks,"a11y-dyslexia":s.dyslexia,"a11y-lightbg":s.lightBg,"a11y-cursor":s.bigCursor,"a11y-no-motion":s.noMotion};
for(var k in c)if(c[k])r.classList.add(k);
if(s.spacing>0)r.classList.add("a11y-spacing-"+Math.min(s.spacing,${SPACING_MAX}));
if(s.lightBg)r.classList.remove("dark");
}catch(e){}})();`;
