"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notifyError, notifySuccess } from "@/lib/notify";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Lock,
  LockOpen,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Ticket,
} from "lucide-react";

/**
 * Panel tiket + chat dua panel (daftar kiri, percakapan kanan).
 * Dipakai warga (/tiket) dan petugas (/dashboard/tiket) — bedanya hanya
 * cakupan data dari API dan opsi kategori INTERNAL untuk petugas.
 */

interface TiketRingkas {
  id: number;
  nomor: string;
  subjek: string;
  kategori: string;
  status: string;
  pembuat: string;
  pembuatId: number;
  jumlahPesan: number;
  pesanTerakhir: string | null;
  updatedAt: string;
  createdAt: string;
}

interface Pesan {
  id: number;
  isi: string;
  pengirimId: number;
  pengirim: string;
  petugas: boolean;
  createdAt: string;
}

interface TiketDetail {
  id: number;
  nomor: string;
  subjek: string;
  kategori: string;
  status: string;
  pembuatId: number;
  createdAt: string;
  closedAt: string | null;
}

const POLL_MS = 5000;

function fmtWaktu(s: string) {
  const d = new Date(s);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const KATEGORI_LABEL: Record<string, string> = {
  LAYANAN: "Layanan",
  TEKNIS: "Teknis",
  INTERNAL: "Internal",
};

export function TiketPanel({ petugas = false }: { petugas?: boolean }) {
  const [tikets, setTikets] = useState<TiketRingkas[]>([]);
  const [autoCloseDays, setAutoCloseDays] = useState(3);
  const [loadingList, setLoadingList] = useState(true);
  const [aktifId, setAktifId] = useState<number | null>(null);
  const [detail, setDetail] = useState<TiketDetail | null>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [meId, setMeId] = useState<number | null>(null);
  const [isi, setIsi] = useState("");
  const [sending, setSending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [baru, setBaru] = useState({ subjek: "", kategori: "LAYANAN", pesan: "" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const aktifIdRef = useRef<number | null>(null);
  aktifIdRef.current = aktifId;

  const loadList = useCallback(async () => {
    try {
      const res = await fetch("/api/tiket");
      const json = await res.json();
      if (json.error?.length) return;
      setTikets(json.data.tikets);
      setAutoCloseDays(json.data.autoCloseDays ?? 3);
    } catch {
      /* jaringan — biarkan polling berikutnya mencoba lagi */
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/tiket/${id}`);
      const json = await res.json();
      if (json.error?.length) {
        notifyError(json.error);
        return;
      }
      // Abaikan respons yang terlambat setelah pindah tiket.
      if (aktifIdRef.current !== id) return;
      setDetail(json.data.tiket);
      setPesan(json.data.pesan);
      setMeId(json.data.meId);
    } catch {
      /* abaikan; polling berikutnya mencoba lagi */
    }
  }, []);

  // Muat awal + polling daftar & percakapan aktif.
  useEffect(() => {
    loadList();
    const t = setInterval(() => {
      loadList();
      if (aktifIdRef.current) loadDetail(aktifIdRef.current);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [loadList, loadDetail]);

  // Scroll ke pesan terakhir saat percakapan berubah.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [pesan.length, aktifId]);

  const pilihTiket = (id: number) => {
    setAktifId(id);
    setDetail(null);
    setPesan([]);
    loadDetail(id);
  };

  const kirim = async () => {
    if (!aktifId || !isi.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tiket/${aktifId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi }),
      });
      const json = await res.json();
      if (json.error?.length) {
        notifyError(json.error);
      } else {
        setIsi("");
        await loadDetail(aktifId);
        loadList();
      }
    } catch {
      notifyError("Gagal mengirim pesan. Periksa koneksi Anda.");
    } finally {
      setSending(false);
    }
  };

  const ubahStatus = async (status: "TERBUKA" | "TERTUTUP") => {
    if (!aktifId) return;
    try {
      const res = await fetch(`/api/tiket/${aktifId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.error?.length) notifyError(json.error);
      else {
        notifySuccess(json.success);
        await loadDetail(aktifId);
        loadList();
      }
    } catch {
      notifyError("Gagal mengubah status tiket.");
    }
  };

  const buatTiket = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baru),
      });
      const json = await res.json();
      if (json.error?.length) {
        notifyError(json.error, "Tiket belum bisa dibuka");
      } else {
        notifySuccess(json.success);
        setCreateOpen(false);
        setBaru({ subjek: "", kategori: "LAYANAN", pesan: "" });
        await loadList();
        if (json.data?.id) pilihTiket(json.data.id);
      }
    } catch {
      notifyError("Gagal membuka tiket. Periksa koneksi Anda.");
    } finally {
      setCreating(false);
    }
  };

  const bisaBalas = detail?.status === "TERBUKA";

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:h-[calc(100vh-8rem)] min-h-[560px]">
      {/* ── Daftar tiket ── */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Ticket className="h-4 w-4 text-primary" aria-hidden />
            Tiket {petugas ? "Masuk" : "Saya"}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadList()}
              title="Muat ulang"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Baru
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : tikets.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Belum ada tiket. Klik <b>Baru</b> untuk membuka tiket
              {petugas ? "" : " bantuan"}.
            </div>
          ) : (
            tikets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pilihTiket(t.id)}
                className={cn(
                  "w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                  aktifId === t.id && "bg-primary/5 hover:bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {t.subjek}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold",
                      t.status === "TERBUKA"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600",
                    )}
                  >
                    {t.status === "TERBUKA" ? "Terbuka" : "Tertutup"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {t.pesanTerakhir ?? "—"}
                </p>
                <p className="mt-1 text-[0.68rem] text-slate-400">
                  {t.nomor} · {KATEGORI_LABEL[t.kategori] ?? t.kategori}
                  {petugas && <> · {t.pembuat}</>} · {fmtWaktu(t.updatedAt)}
                </p>
              </button>
            ))
          )}
        </div>

        <p className="border-t border-slate-100 px-4 py-2 text-[0.68rem] text-slate-400">
          Tiket tanpa aktivitas {autoCloseDays} hari akan tertutup otomatis.
        </p>
      </div>

      {/* ── Percakapan ── */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {!aktifId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
            <MessageCircle className="h-10 w-10" aria-hidden />
            <p className="text-sm">
              Pilih tiket di sebelah kiri, atau buka tiket baru untuk memulai
              percakapan.
            </p>
          </div>
        ) : !detail ? (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {detail.subjek}
                </p>
                <p className="text-[0.7rem] text-slate-400">
                  {detail.nomor} · {KATEGORI_LABEL[detail.kategori] ?? detail.kategori} ·{" "}
                  {detail.status === "TERBUKA" ? "Terbuka" : "Tertutup"}
                </p>
              </div>
              {detail.status === "TERBUKA" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => ubahStatus("TERTUTUP")}
                >
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Tutup Tiket
                </Button>
              ) : (
                <Button size="sm" onClick={() => ubahStatus("TERBUKA")}>
                  <LockOpen className="h-3.5 w-3.5 mr-1.5" />
                  Buka Kembali
                </Button>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4"
            >
              {pesan.map((p) => {
                const milikku = p.pengirimId === meId;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[70%]",
                      milikku ? "ml-auto items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words",
                        milikku
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm",
                      )}
                    >
                      {p.isi}
                    </div>
                    <p className="mt-1 px-1 text-[0.65rem] text-slate-400">
                      {milikku ? "Anda" : p.pengirim}
                      {!milikku && p.petugas && " (Petugas)"} · {fmtWaktu(p.createdAt)}
                    </p>
                  </div>
                );
              })}
              {detail.status === "TERTUTUP" && (
                <div className="mx-auto w-fit rounded-full bg-slate-200 px-4 py-1.5 text-xs text-slate-600">
                  Tiket ditutup
                  {detail.closedAt ? ` · ${fmtWaktu(detail.closedAt)}` : ""} — buka
                  kembali untuk membalas
                </div>
              )}
            </div>

            <div className="flex items-end gap-2 border-t border-slate-100 p-3">
              <Textarea
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    kirim();
                  }
                }}
                placeholder={
                  bisaBalas
                    ? "Tulis pesan… (Enter untuk kirim, Shift+Enter baris baru)"
                    : "Tiket tertutup — buka kembali untuk membalas"
                }
                disabled={!bisaBalas || sending}
                rows={2}
                className="resize-none"
                aria-label="Tulis pesan"
              />
              <Button
                onClick={kirim}
                disabled={!bisaBalas || sending || !isi.trim()}
                aria-label="Kirim pesan"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ── Dialog tiket baru ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buka Tiket Baru</DialogTitle>
            <DialogDescription>
              Jelaskan kebutuhan Anda — petugas akan membalas melalui tiket ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tiket-subjek">Subjek *</Label>
              <Input
                id="tiket-subjek"
                value={baru.subjek}
                maxLength={150}
                onChange={(e) => setBaru({ ...baru, subjek: e.target.value })}
                placeholder="Contoh: Status permohonan KTP-el"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select
                value={baru.kategori}
                onValueChange={(v) => setBaru({ ...baru, kategori: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAYANAN">Layanan</SelectItem>
                  <SelectItem value="TEKNIS">Teknis</SelectItem>
                  {petugas && (
                    <SelectItem value="INTERNAL">Internal (antar petugas)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tiket-pesan">Pesan *</Label>
              <Textarea
                id="tiket-pesan"
                value={baru.pesan}
                onChange={(e) => setBaru({ ...baru, pesan: e.target.value })}
                placeholder="Tuliskan pertanyaan atau kebutuhan Anda…"
                rows={4}
              />
            </div>
            <Button onClick={buatTiket} disabled={creating} className="w-full">
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuka tiket…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Buka Tiket
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
