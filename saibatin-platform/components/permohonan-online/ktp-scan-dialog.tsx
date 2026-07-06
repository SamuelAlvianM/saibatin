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
  nokk?: string;
}

interface KtpScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (result: KtpScanResult) => void;
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
    async (blob: Blob, filename: string) => {
      setScanning(true);
      setProgress(0);
      try {
        const form = new FormData();
        form.append("file", new File([blob], filename, { type: blob.type }));
        const res = await fetch("/api/ocr/ktp", { method: "POST", body: form });
        const json = await res.json();

        if (!res.ok || json.error?.length) {
          toast.error(
            json.error?.[0] ??
              "NIK tidak terbaca. Coba foto ulang dengan pencahayaan lebih baik.",
          );
          return;
        }

        const parsed = (json.data ?? {}) as KtpScanResult;
        if (!parsed.nik && !parsed.nama && !parsed.nokk) {
          toast.error("Data tidak terbaca. Coba foto ulang dengan pencahayaan lebih baik.");
          return;
        }
        onResult(parsed);
        toast.success(
          parsed.nik
            ? `NIK terbaca: ${parsed.nik} — mohon periksa kembali`
            : "Data terbaca — mohon periksa kembali",
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
    canvas.toBlob(
      (blob) => {
        if (blob) runOcr(blob, "ktp-kamera.jpg");
      },
      "image/jpeg",
      0.92,
    );
  }, [cameraReady, runOcr]);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) runOcr(file, file.name);
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
