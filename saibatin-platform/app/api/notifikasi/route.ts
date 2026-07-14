import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Daftar notifikasi milik pengguna login + jumlah belum dibaca. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  const [items, unread] = await Promise.all([
    prisma.notifikasi.findMany({
      where: { userId: session.uid },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notifikasi.count({ where: { userId: session.uid, dibaca: false } }),
  ]);

  return ok({ items, unread });
}

/** Tandai SEMUA notifikasi milik pengguna sebagai sudah dibaca. */
export async function PATCH() {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  await prisma.notifikasi.updateMany({
    where: { userId: session.uid, dibaca: false },
    data: { dibaca: true },
  });

  return ok(null, ["Semua notifikasi ditandai dibaca"]);
}
