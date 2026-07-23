import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { catatAktivitas } from "@/lib/log-aktivitas";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.level !== 1) return null;
  return session;
}

/** Slug unik — tambahkan akhiran angka bila sudah ada. */
async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  const root = slugify(base) || `berita-${Date.now()}`;
  let slug = root;
  let n = 1;
  // cari sampai tidak ada yang bentrok (selain dirinya sendiri)
  while (true) {
    const exist = await prisma.news.findUnique({ where: { slug } });
    if (!exist || exist.id === ignoreId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

/** Daftar SEMUA berita (termasuk draft) untuk panel admin. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) return fail(["Akses ditolak"], 403);

  const items = await prisma.news.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return ok({ items });
}

/** Buat berita baru. */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Akses ditolak"], 403);

  const body = await req.json().catch(() => ({}));
  const { judul, kategori, ringkasan, konten, gambar, publish } = body as Record<string, string | boolean>;

  if (!judul || !String(judul).trim()) return fail(["Info: Judul wajib diisi"]);
  if (!konten || !String(konten).trim()) return fail(["Info: Isi berita wajib diisi"]);

  const slug = await uniqueSlug(String(judul));

  const item = await prisma.news.create({
    data: {
      judul: String(judul).trim(),
      slug,
      kategori: kategori ? String(kategori) : null,
      ringkasan: ringkasan ? String(ringkasan) : null,
      konten: String(konten),
      gambar: gambar ? String(gambar) : null,
      penulis: session.nama ?? "Admin",
      publish: Boolean(publish),
    },
  });

  await catatAktivitas(
    session,
    "BUAT",
    "Berita",
    `Membuat berita "${item.judul}"${item.publish ? " (terbit)" : " (draf)"}`,
    { entitasId: item.id, req },
  );

  return ok({ item }, ["Info: Berita berhasil dibuat"]);
}
