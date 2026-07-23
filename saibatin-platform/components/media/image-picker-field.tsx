"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { MediaPicker } from "./media-picker";
import { ImagePlus, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePickerFieldProps {
  /** URL gambar terpilih (kosong = belum ada). */
  value: string;
  onChange: (url: string) => void;
  /** Label singkat, dipakai pada placeholder & judul picker. */
  label?: string;
  /** Judul dialog picker (default: "Pilih {label}"). */
  title?: string;
  /** Rasio crop tetap saat upload baru. */
  aspect?: number;
  /** Kelas ukuran/bentuk tile (default: kotak lebar penuh). */
  className?: string;
  /** Gaya inline tambahan pada tile (mis. `aspectRatio` non-standar). */
  style?: CSSProperties;
}

/**
 * Kontrol gambar tunggal: preview SEKALIGUS tombol.
 * - Klik tile → buka pustaka media / upload.
 * - Ada gambar → hover memunculkan overlay "Ganti" + tombol hapus di pojok.
 * - Belum ada → tampil zona putus-putus "Pilih {label}".
 * Menggantikan pola lama (thumbnail + tombol terpisah) agar konsisten & ringkas.
 */
export function ImagePickerField({
  value,
  onChange,
  label = "Gambar",
  title,
  aspect,
  className,
  style,
}: ImagePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={value ? "Ganti gambar" : `Pilih ${label}`}
        style={style}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-lg border bg-slate-50 transition-colors",
          value
            ? "border-slate-200"
            : "border-dashed border-slate-300 hover:border-primary/60 hover:bg-primary/5",
          className ?? "aspect-video w-full",
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt={label}
              fill
              sizes="240px"
              className="object-cover"
            />
            {/* Overlay saat hover */}
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-900/0 text-transparent transition-colors group-hover:bg-slate-900/50 group-hover:text-white">
              <Pencil className="h-4 w-4" />
              <span className="text-xs font-medium">Ganti</span>
            </span>
            {/* Tombol hapus */}
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              title="Hapus gambar"
              className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-destructive text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center justify-center gap-1 p-2 text-center text-slate-400">
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px] font-medium leading-tight">
              Pilih {label}
            </span>
          </span>
        )}
      </button>

      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        title={title ?? `Pilih ${label}`}
        aspect={aspect}
        onSelect={(m) => onChange(m.url)}
      />
    </>
  );
}
