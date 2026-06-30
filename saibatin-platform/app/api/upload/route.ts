import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".pdf"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string) ?? "berkas";

    if (!file) return fail(["File tidak ditemukan"]);
    if (file.size > MAX_SIZE) return fail(["Ukuran file maksimal 5 MB"]);

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return fail(["Format file harus JPG, PNG, atau PDF"]);
    }

    const timestamp = Date.now();
    const safeName = `${session.uid}_${timestamp}${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", folder);

    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, safeName), Buffer.from(bytes));

    const url = `/uploads/${folder}/${safeName}`;
    return ok({ url }, ["File berhasil diunggah"]);
  } catch (err) {
    console.error("Upload error:", err);
    return fail(["Gagal mengunggah file"], 500);
  }
}
