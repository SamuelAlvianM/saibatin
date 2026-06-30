import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/** Daftar pengaduan masyarakat (admin/operator). */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // belum | selesai | null

  const where =
    filter === "selesai"
      ? { status: "SELESAI" }
      : filter === "belum"
      ? { NOT: { status: "SELESAI" } }
      : {};

  const items = await prisma.pengaduan.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return ok({ items });
}
