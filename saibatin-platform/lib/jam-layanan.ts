/**
 * Pengaturan jam pelayanan permohonan (ala jam buka Google Maps).
 * - Per hari (Senin–Minggu): buka/tutup + rentang jam (HH:MM).
 * - Tanggal libur khusus (YYYY-MM-DD) yang menutup layanan penuh.
 * - Master switch `enabled`; bila false, permohonan bisa dibuat kapan pun.
 * Disimpan di StaticContent kunci `pelayanan.jam`; berlaku untuk warga & staff.
 * Zona waktu acuan: WIB (Asia/Jakarta).
 */

export const JAM_LAYANAN_KEY = "pelayanan.jam";
export const JAM_TIMEZONE = "Asia/Jakarta";

export interface JamHari {
  /** Hari buka atau tutup penuh. */
  buka: boolean;
  /** Jam mulai "HH:MM" (24 jam). */
  mulai: string;
  /** Jam selesai "HH:MM" (24 jam). */
  selesai: string;
}

export interface JamLayananConfig {
  /** false = tidak ada pembatasan jam sama sekali. */
  enabled: boolean;
  /** Indeks 0=Minggu … 6=Sabtu (mengikuti Date.getDay()). */
  days: JamHari[];
  /** Tanggal libur khusus "YYYY-MM-DD" (tutup penuh). */
  holidays: string[];
}

export const HARI_LABEL = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/** Default: Senin–Jumat 08.00–16.00 WIB, pembatasan nonaktif. */
export function defaultJamLayanan(): JamLayananConfig {
  return {
    enabled: false,
    days: HARI_LABEL.map((_, i) => ({
      buka: i >= 1 && i <= 5,
      mulai: "08:00",
      selesai: "16:00",
    })),
    holidays: [],
  };
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Normalisasi & validasi konfigurasi dari input tak tepercaya. */
export function sanitizeJamLayanan(raw: unknown): JamLayananConfig {
  const def = defaultJamLayanan();
  if (!raw || typeof raw !== "object") return def;
  const o = raw as Record<string, unknown>;

  const days = Array.isArray(o.days)
    ? def.days.map((d, i) => {
        const r = (o.days as unknown[])[i];
        if (!r || typeof r !== "object") return d;
        const h = r as Record<string, unknown>;
        const mulai = typeof h.mulai === "string" && HHMM.test(h.mulai) ? h.mulai : d.mulai;
        const selesai =
          typeof h.selesai === "string" && HHMM.test(h.selesai) ? h.selesai : d.selesai;
        return { buka: h.buka === true, mulai, selesai };
      })
    : def.days;

  const holidays = Array.isArray(o.holidays)
    ? [...new Set(
        (o.holidays as unknown[]).filter(
          (t): t is string => typeof t === "string" && YMD.test(t),
        ),
      )].sort()
    : [];

  return { enabled: o.enabled === true, days, holidays };
}

/** Tanggal & menit saat ini pada zona WIB. */
function nowInWib(now = new Date()): { ymd: string; day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const ymd = `${get("year")}-${get("month")}-${get("day")}`;
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    ymd,
    day: dayMap[get("weekday")] ?? 0,
    minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10),
  };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export interface StatusJam {
  open: boolean;
  /** Alasan tutup / info jam hari ini, siap ditampilkan ke user. */
  message: string;
}

/** Apakah pembuatan permohonan diizinkan saat ini (WIB). */
export function cekJamLayanan(cfg: JamLayananConfig, now = new Date()): StatusJam {
  if (!cfg.enabled) return { open: true, message: "" };

  const { ymd, day, minutes } = nowInWib(now);

  if (cfg.holidays.includes(ymd)) {
    return {
      open: false,
      message: `Layanan permohonan online libur pada ${ymd}. Silakan kembali di hari kerja berikutnya.`,
    };
  }

  const jam = cfg.days[day];
  if (!jam?.buka) {
    return {
      open: false,
      message: `Layanan permohonan online tutup pada hari ${HARI_LABEL[day]}.`,
    };
  }

  const start = toMinutes(jam.mulai);
  const end = toMinutes(jam.selesai);
  if (minutes < start || minutes >= end) {
    return {
      open: false,
      message: `Layanan permohonan online hari ${HARI_LABEL[day]} hanya buka pukul ${jam.mulai}–${jam.selesai} WIB.`,
    };
  }

  return {
    open: true,
    message: `Buka hari ${HARI_LABEL[day]} pukul ${jam.mulai}–${jam.selesai} WIB`,
  };
}
