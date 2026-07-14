"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface OcrUploadResult {
  nik?: string;
  nama?: string;
  nokk?: string;
}

interface OcrUploadButtonProps {
  /** Label dokumen (default "KTP"). Untuk Kartu Keluarga: "KK". */
  docLabel?: string;
  onResult: (result: OcrUploadResult) => void;
  className?: string;
}

/**
 * Tombol "Unggah KTP/KK": pilih foto dokumen → dibaca OCR di server → NIK/
 * No.KK/Nama mengisi field otomatis. Pengganti dialog scan kamera lama:
 * cukup unggah foto (di HP tetap bisa memotret lewat pemilih berkas).
 */
export function OcrUploadButton({
  docLabel = "KTP",
  onResult,
  className,
}: OcrUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setReading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ocr/ktp", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok || json.error?.length) {
        toast.error(
          json.error?.[0] ??
            `Data ${docLabel} tidak terbaca. Coba foto yang lebih terang dan lurus.`,
        );
        return;
      }

      const parsed = (json.data ?? {}) as OcrUploadResult;
      if (!parsed.nik && !parsed.nama && !parsed.nokk) {
        toast.error(
          `Data ${docLabel} tidak terbaca. Coba foto yang lebih terang dan lurus.`,
        );
        return;
      }

      onResult(parsed);
      const nomor = parsed.nik ?? parsed.nokk;
      toast.success(
        nomor
          ? `Nomor terbaca: ${nomor} — mohon periksa kembali`
          : "Data terbaca — mohon periksa kembali",
      );
    } catch {
      toast.error("Gagal memproses gambar. Silakan coba lagi.");
    } finally {
      setReading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={reading}
        onClick={() => inputRef.current?.click()}
        title={`Unggah foto ${docLabel} untuk mengisi otomatis`}
        className={cn("shrink-0 px-3", className)}
      >
        {reading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageUp className="h-4 w-4" />
        )}
        <span className="ml-1.5 hidden sm:inline">
          {reading ? "Membaca..." : `Unggah ${docLabel}`}
        </span>
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
