import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { JAM_LAYANAN_KEY, sanitizeJamLayanan } from "@/lib/jam-layanan";
import { loadJamLayanan } from "@/lib/jam-layanan-server";

export const dynamic = "force-dynamic";

/** Ambil pengaturan jam layanan (khusus admin level 1). */
export async function GET() {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Tidak diizinkan"], 403);
  return ok(await loadJamLayanan());
}

/** Simpan pengaturan jam layanan (khusus admin level 1). */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Tidak diizinkan"], 403);

  const body = await req.json().catch(() => null);
  const cfg = sanitizeJamLayanan(body);

  await prisma.staticContent.upsert({
    where: { kunci: JAM_LAYANAN_KEY },
    create: {
      kunci: JAM_LAYANAN_KEY,
      judul: "Jam Layanan Permohonan Online",
      konten: cfg as unknown as object,
      updatedBy: session.uid,
    },
    update: { konten: cfg as unknown as object, updatedBy: session.uid },
  });

  return ok(cfg, ["Jam layanan disimpan"]);
}
