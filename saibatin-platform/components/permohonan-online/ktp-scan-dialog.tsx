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
import { Camera, ImageUp, Loader2, ScanLine, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export interface KtpScanResult {
  nik?: string;
  nama?: string;
}

interface KtpScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (result: KtpScanResult) => void;
}

/** Perbaiki salah baca OCR yang umum pada digit NIK. */
function normalizeDigits(text: string): string {
  return text
    .replace(/[OoQ]/g, "0")
    .replace(/[Il|]/g, "1")
    .replace(/[S]/g, "5")
    .replace(/[B]/g, "8")
    .replace(/[Zz]/g, "2");
}

/** Ekstrak NIK (16 digit) dan Nama dari teks hasil OCR KTP. */
function parseKtpText(raw: string): KtpScanResult {
  const result: KtpScanResult = {};
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Baris NIK biasanya "NIK : 1871xxxxxxxxxxxx"
    const candidate = normalizeDigits(line).replace(/[^0-9]/g, "");
    if (!result.nik) {
      const m = candidate.match(/\d{16}/);
      if (m && (/nik/i.test(line) || candidate.length <= 20)) {
        result.nik = m[0];
      }
    }
    // Baris nama: "Nama : BUDI SANTOSO"
    if (!result.nama && /nama/i.test(line)) {
      const after = line.split(/[:∶]/)[1];
      if (after) {
        const nama = after.replace(/[^A-Za-z.,'\s-]/g, "").trim();
        if (nama.length >= 3) result.nama = nama;
      }
    }
  }

  // Fallback: cari 16 digit di mana pun pada teks
  if (!result.nik) {
    const m = normalizeDigits(raw)
      .replace(/[^0-9\n]/g, "")
      .match(/\d{16}/);
    if (m) result.nik = m[0];
  }

  return result;
}

export function KtpScanDialog({
  open,
  onOpenChange,
  onResult,
}: KtpScanDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraError(
        "Kamera tidak dapat diakses. Izinkan akses kamera di browser, atau unggah foto KTP.",
      );
    }
  }, []);

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  const runOcr = useCallback(
    async (image: HTMLCanvasElement | File) => {
      setScanning(true);
      setProgress(0);
      try {
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("ind", 1, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });
        const { data } = await worker.recognize(image);
        await worker.terminate();

        const parsed = parseKtpText(data.text ?? "");
        if (!parsed.nik && !parsed.nama) {
          toast.error(
            "NIK tidak terbaca. Coba foto ulang dengan pencahayaan lebih baik.",
          );
          return;
        }
        onResult(parsed);
        toast.success(
          parsed.nik
            ? `NIK terbaca: ${parsed.nik} — mohon periksa kembali`
            : "Nama terbaca — mohon periksa kembali",
        );
        onOpenChange(false);
      } catch {
        toast.error("Gagal memproses gambar. Silakan coba lagi.");
      } finally {
        setScanning(false);
      }
    },
    [onOpenChange, onResult],
  );

  const captureFromCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    runOcr(canvas);
  }, [cameraReady, runOcr]);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) runOcr(file);
      e.target.value = "";
    },
    [runOcr],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            Scan KTP
          </DialogTitle>
          <DialogDescription>
            Arahkan kamera ke KTP hingga tulisan terlihat jelas, lalu tekan
            tombol ambil. Hasil scan otomatis mengisi NIK & nama — tetap
            periksa kembali sebelum lanjut.
          </DialogDescription>
        </DialogHeader>

        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Bingkai panduan posisi KTP */}
          {cameraReady && !scanning && (
            <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-lg pointer-events-none" />
          )}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/90">
              {cameraError}
            </div>
          )}
          {scanning && (
            <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center gap-3 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">
                Membaca teks KTP... {progress > 0 ? `${progress}%` : ""}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            onClick={captureFromCamera}
            disabled={!cameraReady || scanning}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Ambil & Baca
          </Button>
          {cameraError && (
            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
              disabled={scanning}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="flex-1"
          >
            <ImageUp className="h-4 w-4 mr-2" />
            Unggah Foto KTP
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
