import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

// Jenis sesuai kolom Produk.jenis (lihat schema).
const JENIS_VALID = ["PERSYARATAN", "HUKUM", "SOP", "STANDAR_PELAYANAN", "DAFDUK"];

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.level > 2) return null;
  return session;
}

/** Daftar produk/dokumen per jenis. */
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Akses ditolak"], 403);

  const { searchParams } = new URL(req.url);
  const jenis = searchParams.get("jenis") ?? searchParams.get("kategori") ?? undefined;

  const items = await prisma.produk.findMany({
    where: jenis ? { jenis } : {},
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return ok({ items });
}

/** Tambah produk/dokumen baru. */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Akses ditolak"], 403);

  const body = await req.json().catch(() => ({}));
  const { jenis, judul, file, konten } = body as Record<string, string>;

  if (!jenis || !JENIS_VALID.includes(jenis)) return fail(["Info: Jenis tidak valid"]);
  if (!judul?.trim()) return fail(["Info: Judul wajib diisi"]);
  if (!file && !konten) return fail(["Info: Lampirkan file atau isi konten"]);

  const item = await prisma.produk.create({
    data: {
      jenis,
      judul: judul.trim(),
      file: file ?? null,
      konten: konten ?? null,
    },
  });
  return ok({ item }, ["Info: Dokumen berhasil ditambahkan"]);
}
