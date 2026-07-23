import { NextRequest } from "next/server";
import { mkdir, unlink } from "fs/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as WebReadableStream } from "stream/web";
import { join, extname } from "path";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

// Dokumen PPID (LKJIP, Renstra, DPA, Buku Profil) umumnya hasil pindai dan
// jauh melewati 5 MB — batas lama membuat unggahan PPID selalu ditolak.
const MAX_SIZE_GAMBAR = 5 * 1024 * 1024; // 5 MB
const MAX_SIZE_PDF = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".pdf"];

/**
 * `folder` datang dari klien dan ikut menyusun path di disk, jadi harus
 * dibatasi ketat — tanpa ini nilai seperti "../../.." bisa menulis berkas di
 * luar direktori unggahan.
 */
function folderAman(nilai: string): string {
  const bersih = nilai.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return bersih || "berkas";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  let tujuan: string | null = null;
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = folderAman((form.get("folder") as string) ?? "berkas");

    if (!file) return fail(["File tidak ditemukan"]);

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return fail(["Format file harus JPG, PNG, atau PDF"]);
    }

    const maks = ext === ".pdf" ? MAX_SIZE_PDF : MAX_SIZE_GAMBAR;
    if (file.size > maks) {
      return fail([`Ukuran file maksimal ${maks / 1024 / 1024} MB`]);
    }

    const safeName = `${session.uid}_${Date.now()}${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    tujuan = join(uploadDir, safeName);

    // Dialirkan ke disk, TIDAK dimuat utuh ke memori.
    // Versi lama memakai `Buffer.from(await file.arrayBuffer())` yang menahan
    // dua salinan berkas sekaligus di RAM; untuk PDF pindaian puluhan MB itu
    // cukup untuk membuat proses Node kena OOM di server, dan klien hanya
    // melihat 500 tanpa isi karena prosesnya keburu mati.
    await pipeline(
      Readable.fromWeb(file.stream() as WebReadableStream<Uint8Array>),
      createWriteStream(tujuan),
    );

    return ok({ url: `/uploads/${folder}/${safeName}` }, [
      "File berhasil diunggah",
    ]);
  } catch (err) {
    console.error("Upload error:", err);
    // Jangan tinggalkan berkas separuh tertulis bila aliran terputus.
    if (tujuan) await unlink(tujuan).catch(() => {});
    return fail(["Gagal mengunggah file"], 500);
  }
}
