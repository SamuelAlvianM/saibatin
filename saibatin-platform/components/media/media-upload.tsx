"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageCropperDialog } from "./image-cropper-dialog";
import { CloudUpload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface MediaItem {
  id: string;
  namaAsli: string;
  namaFile: string;
  mimeType: string;
  ukuran: number;
  lebar: number | null;
  tinggi: number | null;
  path: string;
  url: string;
  createdAt: string;
}

interface MediaUploadProps {
  /** Dipanggil setelah upload sukses dengan record media dari server. */
  onUploaded: (media: MediaItem) => void;
  /** Hanya terima gambar (default true). false = gambar + PDF. */
  imageOnly?: boolean;
  /** Tawarkan langkah crop sebelum upload untuk gambar (default true). */
  withCrop?: boolean;
  /** Rasio crop tetap, mis. 16/9. */
  aspect?: number;
  className?: string;
}

/** Zona drag-and-drop upload media → crop (opsional) → simpan ke pustaka. */
export function MediaUpload({
  onUploaded,
  imageOnly = true,
  withCrop = true,
  aspect,
  className,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [pendingName, setPendingName] = useState("gambar.webp");

  const doUpload = useCallback(
    async (blob: Blob, filename: string) => {
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", new File([blob], filename, { type: blob.type }));
        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok || json.error?.length) {
          toast.error(json.error?.[0] ?? "Gagal mengunggah file");
          return;
        }
        toast.success("File berhasil diunggah");
        onUploaded(json.data.media as MediaItem);
      } catch {
        toast.error("Gagal mengunggah file");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      const isImage = file.type.startsWith("image/");
      if (withCrop && isImage && file.type !== "image/gif") {
        setPendingName(file.name.replace(/\.[^.]+$/, "") + ".webp");
        setCropSrc(URL.createObjectURL(file));
        setCropOpen(true);
      } else {
        doUpload(file, file.name);
      }
    },
    [doUpload, withCrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
    accept: imageOnly
      ? { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] }
      : {
          "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
          "application/pdf": [".pdf"],
        },
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-slate-300 hover:border-primary/60 hover:bg-slate-50",
          uploading && "pointer-events-none opacity-70",
          className,
        )}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
          {uploading ? (
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
          ) : (
            <CloudUpload className="h-7 w-7 text-primary" />
          )}
        </div>
        <div>
          <p className="font-medium text-slate-800">
            {uploading
              ? "Mengunggah..."
              : isDragActive
                ? "Lepaskan file di sini"
                : "Tarik & letakkan gambar di sini"}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            atau klik untuk memilih file
            {imageOnly ? " (JPG, PNG, WebP, GIF" : " (gambar/PDF"}
            , maks. 10 MB)
          </p>
        </div>
      </div>

      <ImageCropperDialog
        open={cropOpen}
        onOpenChange={(o) => {
          setCropOpen(o);
          if (!o && cropSrc) {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }
        }}
        src={cropSrc}
        aspect={aspect}
        onCropped={(blob) => doUpload(blob, pendingName)}
      />
    </>
  );
}
