import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

/** Detail berita (port frtMediaInformasiBerita/getnewsdetail). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const berita = await prisma.news.findUnique({ where: { slug } });
  if (!berita || !berita.publish) return fail(["Berita tidak ditemukan"], 404);
  return ok(berita);
}
