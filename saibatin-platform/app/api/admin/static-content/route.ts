import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { getStaticBlock } from "@/lib/static-content-registry";
import type { Prisma } from "@prisma/client";

/** Simpan/ubah konten statis (upsert per kunci) — admin/operator. */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  const body = await req.json().catch(() => ({}));
  const { kunci, konten } = body as { kunci?: string; konten?: unknown };

  const block = kunci ? getStaticBlock(kunci) : undefined;
  if (!block) return fail(["Kunci konten tidak dikenal"]);
  if (!konten || typeof konten !== "object") {
    return fail(["Konten tidak valid"]);
  }

  const data = konten as Prisma.InputJsonValue;
  await prisma.staticContent.upsert({
    where: { kunci: block.kunci },
    create: {
      kunci: block.kunci,
      judul: block.judul,
      konten: data,
      updatedBy: session.uid,
    },
    update: { konten: data, updatedBy: session.uid },
  });

  return ok(null, ["Konten berhasil disimpan"]);
}
