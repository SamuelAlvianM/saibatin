import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU: "Menunggu Verifikasi",
  DIPROSES: "Sedang Diproses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

function buildPdf(doc: PDFKit.PDFDocument, data: {
  noregister: string;
  jenis: string;
  tanggal: string;
  status: string;
  catatan: string | null;
  payload: Record<string, unknown>;
}) {
  // Header
  doc.fontSize(15).font("Helvetica-Bold")
    .text("DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL", { align: "center" });
  doc.fontSize(13).text("KABUPATEN PESISIR BARAT", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica")
    .text("Portal SAIBATIN — Bukti Pengajuan Permohonan Online", { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(doc.x, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  // Info utama
  const row = (label: string, value: string) => {
    doc.fontSize(10).font("Helvetica-Bold").text(label, { continued: true, width: 160 });
    doc.font("Helvetica").text(`  ${value}`);
  };
  row("No. Registrasi", data.noregister);
  row("Jenis Permohonan", data.jenis);
  row("Tanggal Pengajuan", data.tanggal);
  row("Status", STATUS_LABEL[data.status] ?? data.status);
  if (data.catatan) row("Catatan Petugas", data.catatan);

  doc.moveDown(1);
  doc.fontSize(11).font("Helvetica-Bold").text("Data Permohonan");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(10);

  const entries = Object.entries(data.payload).filter(
    ([, v]) => v !== null && v !== undefined && String(v).trim() !== "" && typeof v !== "object"
  );
  if (entries.length === 0) {
    doc.fillColor("#666").text("(Tidak ada data tambahan)").fillColor("#000");
  } else {
    for (const [k, v] of entries) {
      const label = k.replace(/_/g, " ").replace(/x$/, "");
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
      doc.font("Helvetica").text(String(v));
    }
  }

  // Footer
  doc.moveDown(2);
  doc.moveTo(doc.x, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(8).fillColor("#666")
    .text("Dokumen ini dicetak dari sistem SAIBATIN", { align: "center" })
    .text(`Dicetak pada ${new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}`, { align: "center" });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  const { id } = await params;
  const item = await prisma.permohonan.findUnique({
    where: { id: Number(id) },
    include: { jenis: true },
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

  const buffer: Buffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    buildPdf(doc, {
      noregister: item.noregister,
      jenis: item.jenis?.nama ?? "-",
      tanggal: new Date(item.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }),
      status: item.status,
      catatan: item.catatan,
      payload,
    });
    doc.end();
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="permohonan-${item.noregister}.pdf"`,
    },
  });
}
