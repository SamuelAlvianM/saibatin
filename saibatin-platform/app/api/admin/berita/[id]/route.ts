import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.level > 2) return null;
  return session;
}

async function uniqueSlug(base: string, ignoreId: number): Promise<string> {
  const root = slugify(base) || `berita-${Date.now()}`;
  let slug = root;
  let n = 1;
  while (true) {
    const exist = await prisma.news.findUnique({ where: { slug } });
    if (!exist || exist.id === ignoreId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

/** Ubah berita. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  const beritaId = Number(id);
  const existing = await prisma.news.findUnique({ where: { id: beritaId } });
  if (!existing) return fail(["Berita tidak ditemukan"], 404);

  const body = await req.json().catch(() => ({}));
  const { judul, kategori, ringkasan, konten, gambar, publish } = body as Record<string, string | boolean>;

  if (!judul || !String(judul).trim()) return fail(["Info: Judul wajib diisi"]);
  if (!konten || !String(konten).trim()) return fail(["Info: Isi berita wajib diisi"]);

  // Regenerasi slug hanya bila judul berubah.
  const slug =
    String(judul).trim() !== existing.judul
      ? await uniqueSlug(String(judul), beritaId)
      : existing.slug;

  const item = await prisma.news.update({
    where: { id: beritaId },
    data: {
      judul: String(judul).trim(),
      slug,
      kategori: kategori ? String(kategori) : null,
      ringkasan: ringkasan ? String(ringkasan) : null,
      konten: String(konten),
      gambar: gambar ? String(gambar) : null,
      publish: Boolean(publish),
    },
  });

  return ok({ item }, ["Info: Berita berhasil diperbarui"]);
}

/** Hapus berita. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return fail(["Akses ditolak"], 403);

  const { id } = await params;
  try {
    await prisma.news.delete({ where: { id: Number(id) } });
    return ok(null, ["Info: Berita berhasil dihapus"]);
  } catch {
    return fail(["Info: Gagal menghapus berita"], 500);
  }
}
