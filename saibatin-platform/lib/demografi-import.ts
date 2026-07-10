import ExcelJS from "exceljs";

/**
 * Parser Excel agregat Dukcapil (format SIAK). Setiap file punya baris header:
 *   IDEM | KODE | WILAYAH | <kolom nilai...>
 *
 * PENTING: nomor IDEM TIDAK konsisten antar file (mis. kecamatan = IDEM 4 di file
 * jenis kelamin, tapi IDEM 3 di file KK/WKTP), dan format KODE berbeda (bertitik
 * "82.72.01" vs polos "827201"). Karena itu level ditentukan dari STRUKTUR KODE
 * (standar kode wilayah Kemendagri): 6 digit = kecamatan, 10 digit = desa/pekon.
 * Baris kab/kota (≤4 digit) & dusun (mengandung huruf, mis. ".DUSUN") diabaikan.
 * Kolom setelah WILAYAH = nilai (mis. L, P, JML untuk jenis kelamin).
 */

export interface DemografiRow {
  kode: string;
  wilayah: string;
  level: number;
  parentKode: string | null;
  data: Record<string, number>;
}

export interface ParseResult {
  rows: DemografiRow[];
  kolom: string[]; // nama kolom nilai (untuk header tabel di UI)
  kecamatan: number;
  pekon: number;
}

const norm = (s: unknown) => String(s ?? "").trim();
const cellNum = (v: unknown): number => {
  if (typeof v === "number") return v;
  const n = parseInt(String(v ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Dari KODE mentah → { kode ternormalisasi (digit saja), level }.
 * 6 digit = kecamatan (level 4), 10 digit = desa/pekon (level 5).
 * Mengembalikan null untuk kab/kota, dusun (ada huruf), atau panjang lain.
 */
function classifyKode(raw: string): { kode: string; level: number } | null {
  const digits = raw.replace(/\./g, "");
  if (!/^\d+$/.test(digits)) return null; // ada huruf (mis. DUSUN) → lewati
  if (digits.length === 6) return { kode: digits, level: 4 };
  if (digits.length === 10) return { kode: digits, level: 5 };
  return null;
}

export async function parseDemografiExcel(buffer: Buffer): Promise<ParseResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error("File Excel tidak memiliki sheet");

  // Baris header (baris 1). Temukan kolom IDEM/KODE/WILAYAH, sisanya = nilai.
  const header: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
    header[col] = norm(cell.value).toUpperCase();
  });
  const findCol = (name: string) => header.findIndex((h) => h === name);
  const cIdem = findCol("IDEM");
  const cKode = findCol("KODE");
  const cWil = findCol("WILAYAH");
  if (cIdem < 0 || cKode < 0 || cWil < 0) {
    throw new Error("Header tidak dikenali (butuh kolom IDEM, KODE, WILAYAH)");
  }

  // Kolom nilai = kolom selain IDEM/KODE/WILAYAH yang punya nama header.
  const valueCols: { col: number; name: string }[] = [];
  header.forEach((h, col) => {
    if (col === cIdem || col === cKode || col === cWil) return;
    if (h) valueCols.push({ col, name: header[col] });
  });

  const rows: DemografiRow[] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cls = classifyKode(norm(row.getCell(cKode).value));
    if (!cls) return; // bukan kecamatan/pekon (kab/dusun/lainnya)
    const wilayah = norm(row.getCell(cWil).value);
    if (!wilayah) return;

    const data: Record<string, number> = {};
    for (const { col, name } of valueCols) {
      data[name] = cellNum(row.getCell(col).value);
    }
    // Induk pekon = 6 digit pertama (kode kecamatan).
    const parentKode = cls.level === 5 ? cls.kode.slice(0, 6) : null;
    rows.push({ kode: cls.kode, wilayah, level: cls.level, parentKode, data });
  });

  return {
    rows,
    kolom: valueCols.map((v) => v.name),
    kecamatan: rows.filter((r) => r.level === 4).length,
    pekon: rows.filter((r) => r.level === 5).length,
  };
}
