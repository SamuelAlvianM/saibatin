import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { parseDemografiExcel } from "@/lib/demografi-import";
import { DEMOGRAFI_SLUGS } from "@/lib/demografi-kategori";
import { catatAktivitas } from "@/lib/log-aktivitas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD = 10 * 1024 * 1024; // 10 MB

/** Import Excel demografi (SIAK) untuk satu kategori. Mengganti data lama kategori tsb. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Tidak diizinkan"], 403);

  let file: File | null = null;
  let kategori = "";
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
    kategori = String(form.get("kategori") ?? "").trim();
  } catch {
    return fail(["Format unggahan tidak valid"]);
  }

  if (!DEMOGRAFI_SLUGS.has(kategori)) return fail(["Kategori tidak dikenal"]);
  if (!file) return fail(["Tidak ada file yang dikirim"]);
  if (!/\.xlsx$/i.test(file.name)) return fail(["File harus berformat .xlsx"]);
  if (file.size > MAX_UPLOAD) return fail(["Ukuran file maksimal 10 MB"]);

  let parsed;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    parsed = await parseDemografiExcel(buffer);
  } catch (e) {
    return fail([e instanceof Error ? e.message : "Gagal membaca file Excel"]);
  }

  if (parsed.rows.length === 0) {
    return fail(["Tidak ada baris kecamatan/desa yang terbaca dari file"]);
  }

  // Ganti total data kategori ini (import = sumber kebenaran terbaru).
  await prisma.$transaction([
    prisma.demografiWilayah.deleteMany({ where: { kategori } }),
    prisma.demografiWilayah.createMany({
      data: parsed.rows.map((r) => ({
        kategori,
        kode: r.kode,
        wilayah: r.wilayah,
        level: r.level,
        parentKode: r.parentKode,
        data: r.data,
      })),
    }),
  ]);

  await catatAktivitas(
    session,
    "IMPOR",
    "Demografi",
    `Impor Excel demografi kategori ${kategori}: ${parsed.kecamatan} kecamatan, ${parsed.pekon} desa`,
    { entitasId: kategori, req },
  );

  return ok(
    { kecamatan: parsed.kecamatan, pekon: parsed.pekon, kolom: parsed.kolom },
    [`Import berhasil: ${parsed.kecamatan} kecamatan, ${parsed.pekon} desa`],
  );
}
