"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KtpScanDialog, type KtpScanResult } from "./ktp-scan-dialog";
import { ScanLine } from "lucide-react";

interface KkScanFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Input Nomor KK + tombol scan Kartu Keluarga via kamera (OCR server).
 * Hasil scan mengambil No.KK (16 digit) dari kartu untuk mempermudah pengisian.
 */
export function KkScanField({
  id,
  value,
  onChange,
  placeholder = "Masukkan 16 digit KK",
  className,
}: KkScanFieldProps) {
  const [scanOpen, setScanOpen] = useState(false);

  const handleResult = (r: KtpScanResult) => {
    // Kartu Keluarga: utamakan No.KK; fallback bila terbaca sebagai 16 digit NIK.
    const val = r.nokk || r.nik;
    if (val) onChange(val);
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
          title="Scan Kartu Keluarga dengan kamera"
          className="shrink-0 px-3"
        >
          <ScanLine className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Scan KK</span>
        </Button>
      </div>

      <KtpScanDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onResult={handleResult}
        docLabel="KK"
        description="Arahkan kamera ke Kartu Keluarga hingga Nomor KK terlihat jelas, lalu tekan tombol ambil. Nomor KK terisi otomatis — tetap periksa kembali."
      />
    </div>
  );
}
