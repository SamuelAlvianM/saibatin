import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

/** Daftar berita terpublikasi (port frtMediaInformasiBerita/getnewsdata). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const take = Math.min(50, Number(searchParams.get("limit") ?? 9));
  const skip = (page - 1) * take;

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where: { publish: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.news.count({ where: { publish: true } }),
  ]);

  return ok({ items, total, page, totalPages: Math.ceil(total / take) });
}
