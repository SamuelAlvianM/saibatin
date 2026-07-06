"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KtpScanDialog, type KtpScanResult } from "./ktp-scan-dialog";
import {
  Loader2,
  CheckCircle2,
  UserPlus2,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PemohonAutoFill {
  nama?: string;
  nokk?: string;
  hp?: string;
  email?: string;
}

interface PemohonNikFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Dipanggil saat data profil user ditemukan / hasil scan KTP tersedia. */
  onAutoFill?: (data: PemohonAutoFill) => void;
  placeholder?: string;
  className?: string;
}

type CheckStatus = "idle" | "checking" | "terdaftar" | "baru";

/**
 * Input NIK pemohon dengan: deteksi otomatis terdaftar/baru ke database,
 * auto-fill data milik sendiri, dan tombol scan KTP via kamera (OCR).
 */
export function PemohonNikField({
  id,
  value,
  onChange,
  onAutoFill,
  placeholder = "Masukkan 16 digit NIK",
  className,
}: PemohonNikFieldProps) {
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [scanOpen, setScanOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    if (!/^\d{16}$/.test(value)) {
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/penduduk/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nik: value }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (controller.signal.aborted) return;
        if (!res.ok) {
          setStatus("idle");
          return;
        }
        setStatus(json.data?.terdaftar ? "terdaftar" : "baru");
        if (json.data?.autofill && onAutoFill) {
          onAutoFill(json.data.autofill as PemohonAutoFill);
        }
      } catch {
        if (!controller.signal.aborted) setStatus("idle");
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // onAutoFill sengaja tidak jadi dependency: identitasnya berubah tiap render modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleScanResult = (result: KtpScanResult) => {
    if (result.nik) onChange(result.nik);
    if (result.nama && onAutoFill) onAutoFill({ nama: result.nama });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder={placeholder}
          maxLength={16}
          className={className}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setScanOpen(true)}
          title="Scan KTP dengan kamera"
          className="shrink-0 px-3"
        >
          <ScanLine className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Scan KTP</span>
        </Button>
      </div>

      {status !== "idle" && (
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            status === "checking" && "text-muted-foreground",
            status === "terdaftar" && "text-success",
            status === "baru" && "text-primary",
          )}
        >
          {status === "checking" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memeriksa NIK di database...
            </>
          )}
          {status === "terdaftar" && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              NIK sudah terdaftar di database
            </>
          )}
          {status === "baru" && (
            <>
              <UserPlus2 className="h-3.5 w-3.5" />
              NIK belum terdaftar — dianggap pemohon baru
            </>
          )}
        </p>
      )}

      <KtpScanDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onResult={handleScanResult}
      />
    </div>
  );
}
