import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Daftar pustaka media untuk picker dashboard (admin/operator). */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type"); // "image" | null
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = 24;

  const where = {
    ...(q ? { namaAsli: { contains: q } } : {}),
    ...(type === "image" ? { mimeType: { startsWith: "image/" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.media.count({ where }),
  ]);

  return ok({ items, total, page, perPage });
}
