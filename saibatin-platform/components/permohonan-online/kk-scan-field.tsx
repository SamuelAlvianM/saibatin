"use client";

import { Input } from "@/components/ui/input";
import {
  OcrUploadButton,
  type OcrUploadResult,
} from "./ocr-upload-button";

interface KkScanFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Input Nomor KK + tombol unggah foto Kartu Keluarga (OCR server).
 * Hasil baca mengambil No.KK (16 digit) dari kartu untuk mempermudah pengisian.
 */
export function KkScanField({
  id,
  value,
  onChange,
  placeholder = "Masukkan 16 digit KK",
  className,
}: KkScanFieldProps) {
  const handleResult = (r: OcrUploadResult) => {
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
        <OcrUploadButton docLabel="KK" onResult={handleResult} />
      </div>
    </div>
  );
}
