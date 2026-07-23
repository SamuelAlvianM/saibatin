"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  ClipboardCheck,
  ClipboardList,
  FilePlus2,
  MessageSquareReply,
  MessageSquareWarning,
  MessagesSquare,
  UserCheck,
  UserPlus,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

interface Notifikasi {
  id: number;
  tipe: string;
  judul: string;
  isi: string;
  link: string | null;
  /** Data yang dirujuk notifikasi — dipakai untuk menyorot barisnya. */
  refType: string | null;
  refId: number | null;
  dibaca: boolean;
  createdAt: string;
}

const SOUND_KEY = "saibatin-notif-sound"; // "1" = nyala (default), "0" = bisu
const POLL_MS = 25000;

const TIPE_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  PERMOHONAN_STATUS: { icon: ClipboardCheck, color: "text-primary bg-primary/10" },
  PERMOHONAN_BARU: { icon: FilePlus2, color: "text-emerald-600 bg-emerald-50" },
  PENGADUAN_BARU: { icon: MessageSquareWarning, color: "text-amber-600 bg-amber-50" },
  PENGADUAN_BALASAN: { icon: MessageSquareReply, color: "text-amber-600 bg-amber-50" },
  KRITIK_BARU: { icon: MessagesSquare, color: "text-violet-600 bg-violet-50" },
  SKM_BARU: { icon: ClipboardList, color: "text-sky-600 bg-sky-50" },
  AKUN_BARU: { icon: UserPlus, color: "text-rose-600 bg-rose-50" },
  AKUN_STATUS: { icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
};

function waktuRelatif(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * AudioContext BERSAMA yang dibuat sekali dan di-"unlock" pada interaksi
 * pengguna pertama (klik/ketik). Kebijakan autoplay browser membuat
 * AudioContext yang dibuat TANPA gerakan pengguna lahir dalam status
 * "suspended" → oscillator jalan tapi tak ada suara. Inilah sebab lama
 * bunyi notifikasi tidak pernah keluar: konteks dibuat saat polling.
 */
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctx();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** Dipasang pada pointerdown/keydown pertama agar konteks audio aktif. */
function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

/** Bunyi "ding" dua nada via Web Audio API (tanpa file aset). */
function playDing() {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const schedule = () => {
    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 880, t: 0 },
        { f: 1174.7, t: 0.12 },
      ];
      for (const n of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = n.f;
        gain.gain.setValueAtTime(0.0001, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.18, now + n.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + 0.36);
      }
    } catch {
      /* abaikan */
    }
  };

  if (ctx.state === "suspended") {
    // Coba lanjutkan — berhasil bila pengguna pernah berinteraksi dgn halaman.
    ctx
      .resume()
      .then(() => {
        if (ctx.state === "running") schedule();
      })
      .catch(() => {});
  } else {
    schedule();
  }
}

/**
 * Lonceng notifikasi in-app untuk warga & petugas yang login.
 * `tone`: "onDark" (ikon putih, dipakai di navbar biru) atau "onLight"
 * (ikon abu, dipakai di sidebar/topbar dashboard putih).
 */
export function NotificationBell({
  tone = "onDark",
  align = "right",
}: {
  tone?: "onDark" | "onLight";
  /** Sisi penambatan dropdown: "right" (buka ke kiri) atau "left" (buka ke kanan). */
  align?: "left" | "right";
}) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Notifikasi[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [muted, setMuted] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const lastSeenId = React.useRef(0);
  const initialized = React.useRef(false);
  const mutedRef = React.useRef(false);

  React.useEffect(() => {
    setMuted(localStorage.getItem(SOUND_KEY) === "0");
  }, []);
  React.useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Unlock audio pada interaksi pengguna pertama — setelah itu bunyi dari
  // polling latar belakang diizinkan browser.
  React.useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const fetchNotif = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifikasi?limit=20", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const data = json?.data as { items: Notifikasi[]; unread: number } | null;
      if (!data) return;
      setItems(data.items);
      setUnread(data.unread);

      // Deteksi notifikasi baru → bunyikan (kecuali pemuatan pertama / bisu).
      const maxId = data.items.reduce((m, n) => Math.max(m, n.id), 0);
      if (initialized.current) {
        const adaBaru = data.items.some((n) => n.id > lastSeenId.current && !n.dibaca);
        if (adaBaru && !mutedRef.current) playDing();
      }
      if (maxId > lastSeenId.current) lastSeenId.current = maxId;
      initialized.current = true;
    } catch {
      /* jaringan bermasalah — coba lagi pada polling berikutnya */
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling + refetch saat tab kembali fokus.
  React.useEffect(() => {
    if (!isAuthenticated) {
      // reset agar login berikutnya mulai bersih
      initialized.current = false;
      lastSeenId.current = 0;
      setItems([]);
      setUnread(0);
      return;
    }
    fetchNotif();
    const iv = setInterval(fetchNotif, POLL_MS);
    const onFocus = () => fetchNotif();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
    };
  }, [isAuthenticated, fetchNotif]);

  // Tutup dropdown saat klik di luar.
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggleMute = () => {
    const next = !mutedRef.current;
    setMuted(next);
    localStorage.setItem(SOUND_KEY, next ? "0" : "1");
    // Saat bunyi DINYALAKAN: klik ini adalah gerakan pengguna, jadi konteks
    // audio pasti boleh aktif — bunyikan contoh sebagai umpan balik.
    if (!next) playDing();
  };

  const markAllRead = async () => {
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    try {
      await fetch("/api/notifikasi", { method: "PATCH" });
    } catch {
      /* diamkan; polling akan menyinkronkan ulang */
    }
  };

  const openNotif = async (n: Notifikasi) => {
    setOpen(false);
    if (!n.dibaca) {
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, dibaca: true } : x)));
      fetch(`/api/notifikasi/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
    if (!n.link) return;
    // Bawa id data yang dirujuk agar halaman tujuan bisa langsung membuka
    // halaman yang memuatnya lalu menyorot barisnya — tanpa ini petugas
    // mendarat di halaman 1 dan harus mencari sendiri.
    const tujuan =
      n.refId && !n.link.includes("?")
        ? `${n.link}?sorot=${n.refId}`
        : n.link;
    router.push(tujuan);
  };

  if (!isAuthenticated) return null;

  const iconColor = tone === "onDark" ? "text-white" : "text-slate-600";
  const hoverBg = tone === "onDark" ? "hover:bg-white/15" : "hover:bg-slate-100";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifikasi${unread > 0 ? ` (${unread} belum dibaca)` : ""}`}
        aria-expanded={open}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          iconColor,
          hoverBg,
          open && (tone === "onDark" ? "bg-white/15" : "bg-slate-100"),
        )}
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold leading-4 text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full z-[60] mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
            align === "right" ? "right-0" : "left-0",
          )}
          role="dialog"
          aria-label="Daftar notifikasi"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifikasi</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Nyalakan bunyi notifikasi" : "Matikan bunyi notifikasi"}
                title={muted ? "Bunyi mati" : "Bunyi nyala"}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[0.72rem] font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tandai dibaca
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto sm:max-h-96">
            {loading && items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">Memuat…</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <BellOff className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">Belum ada notifikasi</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {items.map((n) => {
                  const meta = TIPE_ICON[n.tipe] ?? {
                    icon: Bell,
                    color: "text-slate-600 bg-slate-100",
                  };
                  const Icon = meta.icon;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => openNotif(n)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                          !n.dibaca && "bg-primary/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
                            meta.color,
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-slate-800">
                              {n.judul}
                            </span>
                            {!n.dibaca && (
                              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                            )}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">
                            {n.isi}
                          </span>
                          <span className="mt-1 block text-[0.68rem] text-slate-400">
                            {waktuRelatif(n.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
