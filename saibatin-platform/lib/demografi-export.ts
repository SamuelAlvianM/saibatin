import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import {
  DEMOGRAFI_KATEGORI,
  getDemografiKategori,
} from "@/lib/demografi-kategori";

/**
 * Penyusun workbook Excel data demografi — dipakai endpoint export admin
 * (/api/admin/demografi/export) dan publik (/api/demografi/export).
 */

interface DbRow {
  kode: string;
  wilayah: string;
  level: number;
  data: unknown;
}

/** Tambah satu sheet berisi baris (kecamatan + pekon) satu kategori. */
function addSheet(wb: ExcelJS.Workbook, label: string, rows: DbRow[]) {
  const ws = wb.addWorksheet(label.slice(0, 31)); // batas nama sheet Excel = 31
  const kolom = rows.length ? Object.keys((rows[0].data ?? {}) as object) : [];

  ws.addRow(["KODE", "WILAYAH", "LEVEL", ...kolom]);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8F0F8" },
  };

  for (const r of rows) {
    const d = (r.data ?? {}) as Record<string, number>;
    ws.addRow([
      r.kode,
      r.wilayah,
      r.level === 5 ? "Pekon" : "Kecamatan",
      ...kolom.map((k) => d[k] ?? 0),
    ]);
  }

  ws.columns.forEach((c, i) => {
    c.width = i === 1 ? 28 : i === 0 ? 14 : 12;
  });
}

/**
 * Susun workbook untuk satu kategori (bila diisi) atau semua kategori
 * (1 sheet per kategori). Mengembalikan null bila tidak ada data sama sekali.
 */
export async function buildDemografiWorkbook(kategori?: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SAIBATIN Disdukcapil Pesisir Barat";
  wb.created = new Date();

  const targets = kategori
    ? [getDemografiKategori(kategori)!]
    : DEMOGRAFI_KATEGORI;

  let total = 0;
  for (const k of targets) {
    const rows = await prisma.demografiWilayah.findMany({
      where: { kategori: k.slug },
      orderBy: { kode: "asc" },
      select: { kode: true, wilayah: true, level: true, data: true },
    });
    total += rows.length;
    addSheet(wb, k.label, rows);
  }

  if (total === 0) return null;
  return wb;
}

/** Respon unduhan .xlsx dari workbook. */
export async function workbookResponse(wb: ExcelJS.Workbook, namaFile: string) {
  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${namaFile}"`,
      "Cache-Control": "no-store",
    },
  });
}
