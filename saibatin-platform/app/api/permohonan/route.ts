import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { getSession } from "@/lib/auth";
import { notifyPetugas, safeNotify } from "@/lib/notifikasi";
import { cekJamLayananSekarang } from "@/lib/jam-layanan-server";

/**
 * Daftar permohonan milik warga/OPD login — paginasi cursor untuk load-on-scroll.
 * Query: ?status=<STATUS|semua>&cursor=<id>&limit=<n>
 * - Tanpa cursor → halaman pertama, disertai `counts` per status (untuk badge tab).
 * - `nextCursor` = id terakhir; null bila sudah habis.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // MENUNGGU | DIPROSES | SELESAI | DITOLAK | semua
  const cursor = searchParams.get("cursor");
  const limit = Math.min(30, Math.max(5, parseInt(searchParams.get("limit") ?? "12", 10) || 12));

  const where = {
    userId: session.uid,
    ...(status && status !== "semua" ? { status } : {}),
  };

  // Ambil limit+1 untuk tahu apakah masih ada halaman berikutnya. Urut by id
  // desc (monotonic ≈ createdAt desc) supaya cursor stabil.
  const rows = await prisma.permohonan.findMany({
    where,
    include: { jenis: { select: { nama: true } } },
    orderBy: { id: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
  });
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const items = page.map((i) => ({
    id: i.id,
    noregister: i.noregister,
    status: i.status,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    jenisNama: i.jenis?.nama ?? String(i.jenisId),
  }));
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  // Hitung jumlah per status hanya di halaman pertama (hemat query saat scroll).
  let counts: Record<string, number> | undefined;
  if (!cursor) {
    const grouped = await prisma.permohonan.groupBy({
      by: ["status"],
      where: { userId: session.uid },
      _count: { _all: true },
    });
    counts = { semua: 0, MENUNGGU: 0, DIPROSES: 0, SELESAI: 0, DITOLAK: 0 };
    for (const g of grouped) {
      counts[g.status] = (counts[g.status] ?? 0) + g._count._all;
      counts.semua += g._count._all;
    }
  }

  return ok({ items, nextCursor, ...(counts ? { counts } : {}) });
}

/** Buat permohonan baru (menyatukan 17 jenis form via jenisKode + payload). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  // Jam layanan berlaku untuk semua pembuat permohonan (warga & staff).
  const jam = await cekJamLayananSekarang();
  if (!jam.open) return fail([jam.message], 403);

  const body = await req.json().catch(() => ({}));
  const { jenisKode, payload, recaptchaToken } = body as {
    jenisKode?: string;
    payload?: unknown;
    recaptchaToken?: string;
  };

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return fail(["Info: Verifikasi reCAPTCHA gagal"]);
  }
  if (!jenisKode) return fail(["Info: Jenis permohonan wajib dipilih"]);

  const jenis = await prisma.jenisPermohonan.findUnique({ where: { kode: jenisKode } });
  if (!jenis) return fail(["Info: Jenis permohonan tidak valid"]);

  const noregister = `REG${Date.now()}`;
  const permohonan = await prisma.permohonan.create({
    data: {
      noregister,
      userId: session.uid,
      jenisId: jenis.id,
      status: "MENUNGGU",
      payload: (payload ?? {}) as object,
    },
  });

  // Notifikasi ke petugas: ada permohonan masuk.
  await safeNotify(() =>
    notifyPetugas({
      tipe: "PERMOHONAN_BARU",
      judul: "Permohonan baru masuk",
      isi: `${session.nama ?? session.userId} mengajukan ${jenis.nama} (${noregister}).`,
      link: "/dashboard/permohonan",
      refType: "Permohonan",
      refId: permohonan.id,
    }),
  );

  return ok({ noregister: permohonan.noregister, id: permohonan.id }, [
    "Info: Permohonan berhasil diajukan",
  ]);
}
