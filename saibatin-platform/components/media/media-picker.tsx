"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaUpload, type MediaItem } from "./media-upload";
import {
  Search,
  Loader2,
  ImageIcon,
  Trash2,
  CloudUpload,
  LayoutGrid,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dipanggil saat user memilih media (dari galeri maupun hasil upload). */
  onSelect: (media: MediaItem) => void;
  /** Hanya tampilkan/terima gambar (default true). */
  imageOnly?: boolean;
  /** Rasio crop tetap saat upload baru. */
  aspect?: number;
  title?: string;
}

/**
 * Pustaka media: pilih gambar yang sudah ada (grid visual) atau unggah baru
 * dengan drag-and-drop + crop. User tidak pernah mengetik URL.
 */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  imageOnly = true,
  aspect,
  title = "Pilih Gambar",
}: MediaPickerProps) {
  const [tab, setTab] = useState<"galeri" | "upload">("galeri");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 24;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      if (imageOnly) params.set("type", "image");
      const res = await fetch(`/api/media?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, q, imageOnly]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const pilih = (media: MediaItem) => {
    onSelect(media);
    onOpenChange(false);
  };

  const hapus = async (e: React.MouseEvent, media: MediaItem) => {
    e.stopPropagation();
    if (!window.confirm(`Hapus "${media.namaAsli}" dari pustaka media?`)) return;
    const res = await fetch(`/api/media/${media.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success("Media dihapus");
      setItems((prev) => prev.filter((m) => m.id !== media.id));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Pilih dari pustaka media atau unggah gambar baru (drag &amp; drop).
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 border-b border-slate-200 -mt-1">
          {(
            [
              ["galeri", "Pustaka Media", LayoutGrid],
              ["upload", "Upload Baru", CloudUpload],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-slate-700",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "upload" ? (
          <div className="py-4">
            <MediaUpload
              imageOnly={imageOnly}
              aspect={aspect}
              onUploaded={pilih}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 min-h-0 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama file..."
                className="pl-9"
              />
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1 min-h-[200px]">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada media. Unggah lewat tab &quot;Upload Baru&quot;.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {items.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => pilih(m)}
                      title={m.namaAsli}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all bg-slate-50"
                    >
                      {m.mimeType.startsWith("image/") ? (
                        <Image
                          src={m.url}
                          alt={m.namaAsli}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground">
                          <FileText className="h-6 w-6" />
                          <span className="text-[10px] px-1 truncate max-w-full">
                            {m.namaAsli}
                          </span>
                        </div>
                      )}
                      <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => hapus(e, m)}
                        title="Hapus media"
                        className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-md bg-destructive text-white shadow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">
                  {total} media — hal. {page}/{totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
