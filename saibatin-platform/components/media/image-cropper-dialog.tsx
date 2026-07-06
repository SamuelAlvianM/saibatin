"use client";

import { useRef, useState } from "react";
import { Cropper, type CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, Loader2, RotateCcw, RotateCw } from "lucide-react";

interface ImageCropperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Object URL / data URL gambar yang akan dipotong. */
  src: string | null;
  /** Rasio tetap, mis. 16/9 untuk carousel. Kosongkan = bebas. */
  aspect?: number;
  /** Menerima hasil crop sebagai Blob (image/webp berkualitas tinggi). */
  onCropped: (blob: Blob) => void | Promise<void>;
}

/** Dialog crop gambar (react-advanced-cropper) — dipakai sebelum upload
 *  maupun untuk mengedit ulang gambar dari pustaka media. */
export function ImageCropperDialog({
  open,
  onOpenChange,
  src,
  aspect,
  onCropped,
}: ImageCropperDialogProps) {
  const cropperRef = useRef<CropperRef>(null);
  const [busy, setBusy] = useState(false);

  const rotate = (deg: number) => cropperRef.current?.rotateImage(deg);

  const apply = async () => {
    const canvas = cropperRef.current?.getCanvas({ maxWidth: 2560, maxHeight: 2560 });
    if (!canvas) return;
    setBusy(true);
    canvas.toBlob(
      async (blob) => {
        if (blob) await onCropped(blob);
        setBusy(false);
        onOpenChange(false);
      },
      "image/webp",
      0.92,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-primary" />
            Potong Gambar
          </DialogTitle>
          <DialogDescription>
            Geser dan ubah ukuran area untuk memotong gambar sesuai kebutuhan.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl overflow-hidden bg-slate-950 max-h-[60vh]">
          {src && (
            <Cropper
              ref={cropperRef}
              src={src}
              stencilProps={aspect ? { aspectRatio: aspect } : undefined}
              className="h-[50vh]"
            />
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <div className="flex gap-1">
            <Button type="button" variant="outline" size="sm" onClick={() => rotate(-90)} title="Putar kiri">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => rotate(90)} title="Putar kanan">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Batal
            </Button>
            <Button type="button" onClick={apply} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Crop className="h-4 w-4 mr-2" />}
              Terapkan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
