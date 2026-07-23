import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { PELAYANAN_VISIBILITY_KEY, PELAYANAN_LIST } from "@/lib/pelayanan-list";
import { catatAktivitas } from "@/lib/log-aktivitas";

export const dynamic = "force-dynamic";

const VALID = new Set(PELAYANAN_LIST.map((p) => p.modalType));

/** Ambil daftar layanan yang disembunyikan dari permohonan online (admin). */
export async function GET() {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Tidak diizinkan"], 403);

  const row = await prisma.staticContent.findUnique({
    where: { kunci: PELAYANAN_VISIBILITY_KEY },
  });
  const konten = (row?.konten ?? {}) as { hidden?: unknown };
  const hidden = Array.isArray(konten.hidden)
    ? konten.hidden.filter((h): h is string => typeof h === "string")
    : [];

  return ok({ hidden });
}

/** Simpan daftar layanan yang disembunyikan (upsert). */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level !== 1) return fail(["Tidak diizinkan"], 403);

  const body = await req.json().catch(() => ({}));
  const raw = (body as { hidden?: unknown }).hidden;
  if (!Array.isArray(raw)) return fail(["Data tidak valid"]);

  // Hanya simpan modalType yang dikenal → cegah data sampah.
  const hidden = [...new Set(raw.filter((h): h is string => typeof h === "string" && VALID.has(h)))];

  await prisma.staticContent.upsert({
    where: { kunci: PELAYANAN_VISIBILITY_KEY },
    create: {
      kunci: PELAYANAN_VISIBILITY_KEY,
      judul: "Visibilitas Layanan Permohonan Online",
      konten: { hidden },
      updatedBy: session.uid,
    },
    update: { konten: { hidden }, updatedBy: session.uid },
  });

  await catatAktivitas(
    session,
    "UBAH",
    "Pengaturan",
    `Memperbarui visibilitas layanan (${hidden.length} disembunyikan)`,
    { entitasId: PELAYANAN_VISIBILITY_KEY, req },
  );

  return ok({ hidden }, ["Pengaturan pelayanan disimpan"]);
}
