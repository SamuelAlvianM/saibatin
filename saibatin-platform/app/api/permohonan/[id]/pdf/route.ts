import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { buatPermohonanPdf } from "@/lib/permohonan-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { id } = await params;
  const item = await prisma.permohonan.findUnique({
    where: { id: Number(id) },
    include: {
      jenis: true,
      user: { select: { userFullname: true, userId: true } },
    },
  });
  if (!item) return fail(["Permohonan tidak ditemukan"], 404);

  // Hanya pemilik atau admin/operator.
  if (session.level > 2 && item.userId !== session.uid) {
    return fail(["Akses ditolak"], 403);
  }

  const payload: Record<string, unknown> =
    item.payload && typeof item.payload === "object"
      ? (item.payload as Record<string, unknown>)
      : {};

  const buffer = await buatPermohonanPdf({
    noregister: item.noregister,
    jenis: item.jenis?.nama ?? "-",
    tanggal: new Date(item.createdAt).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    }),
    status: item.status,
    catatan: item.catatan,
    pemohon: item.user?.userFullname ?? item.user?.userId ?? "-",
    prosesTanggal: item.prosesAt
      ? new Date(item.prosesAt).toLocaleString("id-ID", {
          dateStyle: "long",
          timeStyle: "short",
        })
      : null,
    prosesOleh: item.prosesByName,
    payload,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="permohonan-${item.noregister}.pdf"`,
    },
  });
}
