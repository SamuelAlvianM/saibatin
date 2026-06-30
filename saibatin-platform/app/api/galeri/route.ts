import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const kategori = searchParams.get("kategori") ?? undefined;

  try {
    const where = { ...(kategori ? { kategori } : {}) };
    const [items, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gallery.count({ where }),
    ]);
    return ok({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return fail(["Gagal mengambil data galeri"], 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  try {
    const body = await req.json();
    const { judul, gambar, kategori } = body as Record<string, string>;
    if (!judul || !gambar) return fail(["Judul dan gambar wajib diisi"]);

    const item = await prisma.gallery.create({ data: { judul, gambar, kategori: kategori ?? null } });
    return ok({ item }, ["Foto berhasil ditambahkan"]);
  } catch {
    return fail(["Gagal menyimpan foto"], 500);
  }
}
