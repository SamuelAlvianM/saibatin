import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { getSession } from "@/lib/auth";

/** Daftar permohonan milik warga login, opsional filter status. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // DALAM_PROSES | SELESAI | DITOLAK

  const items = await prisma.permohonan.findMany({
    where: { userId: session.uid, ...(status ? { status } : {}) },
    include: { jenis: true, berkas: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({ items });
}

/** Buat permohonan baru (menyatukan 17 jenis form via jenisKode + payload). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

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
      status: "DALAM_PROSES",
      payload: (payload ?? {}) as object,
    },
  });

  return ok({ noregister: permohonan.noregister, id: permohonan.id }, [
    "Info: Permohonan berhasil diajukan",
  ]);
}
