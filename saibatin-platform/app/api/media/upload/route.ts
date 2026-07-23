import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import {
  MEDIA_STORAGE_ROOT,
  MEDIA_MAX_SIZE,
  MEDIA_ALLOWED_IMAGE,
  MEDIA_ALLOWED_OTHER,
  mediaPublicUrl,
  mediaSubdir,
} from "@/lib/media";
import { catatAktivitas } from "@/lib/log-aktivitas";

/**
 * Upload media ke pustaka terpusat (khusus admin/operator).
 * Gambar dikonversi otomatis ke WebP (hemat & cepat), dimensi dicatat.
 * PDF disimpan apa adanya. Hasil: record t_media + URL /uploads/media/...
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Tidak diizinkan"], 403);

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return fail(["File tidak ditemukan"]);
    if (file.size > MEDIA_MAX_SIZE) {
      return fail(["Ukuran file maksimal 10 MB"]);
    }

    const mime = file.type;
    const isImage = MEDIA_ALLOWED_IMAGE.includes(mime);
    if (!isImage && !MEDIA_ALLOWED_OTHER.includes(mime)) {
      return fail(["Format harus JPG, PNG, WebP, GIF, atau PDF"]);
    }

    const id = randomUUID();
    const subdir = mediaSubdir();
    const dir = join(MEDIA_STORAGE_ROOT, subdir);
    await mkdir(dir, { recursive: true });

    let buffer = Buffer.from(await file.arrayBuffer());
    let ext: string;
    let outMime = mime;
    let lebar: number | null = null;
    let tinggi: number | null = null;

    if (isImage && mime !== "image/gif") {
      // Konversi ke WebP + batasi sisi terpanjang 2560px agar tetap ringan.
      const image = sharp(buffer).rotate().resize(2560, 2560, {
        fit: "inside",
        withoutEnlargement: true,
      });
      buffer = Buffer.from(await image.webp({ quality: 82 }).toBuffer());
      const meta = await sharp(buffer).metadata();
      lebar = meta.width ?? null;
      tinggi = meta.height ?? null;
      ext = "webp";
      outMime = "image/webp";
    } else if (mime === "image/gif") {
      const meta = await sharp(buffer).metadata();
      lebar = meta.width ?? null;
      tinggi = meta.height ?? null;
      ext = "gif";
    } else {
      ext = "pdf";
    }

    const namaFile = `${id}.${ext}`;
    const relPath = `${subdir}/${namaFile}`;
    await writeFile(join(dir, namaFile), buffer);

    const media = await prisma.media.create({
      data: {
        id,
        namaAsli: file.name,
        namaFile,
        mimeType: outMime,
        ukuran: buffer.length,
        lebar,
        tinggi,
        path: relPath,
        url: mediaPublicUrl(relPath),
        uploadedBy: session.uid,
      },
    });

    await catatAktivitas(
      session,
      "UNGGAH",
      "Media",
      `Mengunggah media "${media.namaAsli}"`,
      { entitasId: media.id, req },
    );

    return ok({ media }, ["File berhasil diunggah"]);
  } catch (err) {
    console.error("Media upload error:", err);
    return fail(["Gagal mengunggah file"], 500);
  }
}
