import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, normalize } from "path";
import { MEDIA_STORAGE_ROOT } from "@/lib/media";

const MIME_BY_EXT: Record<string, string> = {
  webp: "image/webp",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

/**
 * Penyaji file media publik: /uploads/media/yyyy/mm/uuid.ext
 * Nama file adalah UUID (tidak bisa ditebak) + cache immutable karena
 * konten per-URL tidak pernah berubah.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const relPath = normalize(path.join("/"));

  // Tolak upaya path traversal.
  if (relPath.startsWith("..") || relPath.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = relPath.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME_BY_EXT[ext];
  if (!mime) return new NextResponse("Not found", { status: 404 });

  try {
    const buffer = await readFile(join(MEDIA_STORAGE_ROOT, relPath));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
