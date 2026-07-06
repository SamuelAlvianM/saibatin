import { join } from "path";

/**
 * Konvensi penyimpanan media terpusat.
 * File fisik: storage/uploads/yyyy/mm/uuid.ext (di luar public/).
 * URL publik: /uploads/media/yyyy/mm/uuid.ext (disajikan route handler).
 */

export const MEDIA_STORAGE_ROOT = join(process.cwd(), "storage", "uploads");
export const MEDIA_URL_PREFIX = "/uploads/media";

export const MEDIA_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/** Mime yang diterima pustaka media. Gambar dikonversi ke WebP saat upload. */
export const MEDIA_ALLOWED_IMAGE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const MEDIA_ALLOWED_OTHER = ["application/pdf"];

export function mediaPublicUrl(relPath: string): string {
  return `${MEDIA_URL_PREFIX}/${relPath.replace(/\\/g, "/")}`;
}

/** Sub-folder per bulan agar direktori tidak membengkak. */
export function mediaSubdir(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}/${m}`;
}
