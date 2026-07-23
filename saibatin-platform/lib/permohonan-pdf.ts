import PDFDocument from "pdfkit";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import {
  payloadDataEntries,
  payloadBerkasEntries,
  labelField,
} from "@/lib/permohonan-display";

/**
 * Pembuat PDF "Bukti Pengajuan Permohonan".
 *
 * Dipisah dari route API supaya bisa diuji sendiri tanpa database — berkas
 * route Next hanya boleh mengekspor GET/POST/dsb, jadi fungsi pembangun PDF
 * tidak mungkin diekspor dari sana.
 *
 * Label field & pemisahan data/berkas memakai kamus yang sama dengan tampilan
 * web (lib/permohonan-display.ts) supaya PDF dan layar tidak pernah beda istilah.
 */

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU: "Menunggu Verifikasi",
  DIPROSES: "Sedang Diproses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

const STATUS_WARNA: Record<string, string> = {
  MENUNGGU: "#b45309",
  DIPROSES: "#1d4ed8",
  SELESAI: "#15803d",
  DITOLAK: "#b91c1c",
};

// ── Geometri halaman A4 ────────────────────────────────────────────────────
const MARGIN = 50;
const HAL_LEBAR = 595.28;
const HAL_TINGGI = 841.89;
const KONTEN_LEBAR = HAL_LEBAR - MARGIN * 2;
const BATAS_BAWAH = HAL_TINGGI - MARGIN - 28; // sisakan ruang footer

const BIRU = "#1b4b72";

// Berkas permohonan disimpan di storage/ (di luar public/); berkas lama masih
// tertinggal di public/uploads/ — pola resolusi sama dengan app/uploads/[...path].
const ROOT_PRIVAT = join(process.cwd(), "storage", "permohonan");
const ROOT_PUBLIK = join(process.cwd(), "public", "uploads");

/** Baca berkas unggahan dari disk; null bila tak ada / di luar folder resmi. */
async function bacaBerkas(urlPath: string): Promise<Buffer | null> {
  const rel = normalize(urlPath.replace(/^\/uploads\//, ""));
  if (rel.startsWith("..")) return null; // jaga dari path traversal
  for (const root of [ROOT_PRIVAT, ROOT_PUBLIK]) {
    try {
      return await readFile(join(root, rel));
    } catch {
      /* coba lokasi berikutnya */
    }
  }
  return null;
}

/**
 * Siapkan gambar agar PASTI bisa disematkan pdfkit.
 *
 * pdfkit hanya menerima JPEG baseline dan PNG non-interlaced. Foto hasil unggah
 * warga bermacam-macam: PNG interlaced (Adam7), WebP, JPEG progresif, CMYK,
 * 16-bit — semuanya membuat doc.image() melempar, dan sebelumnya berkas itu
 * diam-diam hilang dari PDF ("beberapa gambar tidak terbawa").
 *
 * sharp menormalkan semuanya jadi JPEG baseline sekaligus:
 * - memutar sesuai EXIF (foto HP miring jadi tegak),
 * - membatasi sisi terpanjang 1400px → PDF jauh lebih ringan & cepat,
 * - membuang alpha dengan latar putih (JPEG tak punya kanal alpha).
 */
async function siapkanGambar(buf: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buf)
      .rotate()
      .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 78, progressive: false })
      .toBuffer();
  } catch {
    return null; // bukan gambar (mis. PDF) atau berkas rusak
  }
}

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/**
 * Rapikan nilai agar enak dibaca: tanggal ISO → "1 Juli 2026", teks huruf kecil
 * → Kapital Tiap Kata. Email, NIK/angka, dan akronim sengaja dibiarkan apa adanya.
 */
export function rapikanNilai(key: string, nilai: string): string {
  const v = nilai.trim();
  if (!v) return "-";
  if (/email/i.test(key) || v.includes("@")) return v;
  if (/^\d+$/.test(v)) return v; // NIK, no. KK, no. HP

  const tanggal = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (tanggal) {
    const [, th, bl, tg] = tanggal;
    return `${Number(tg)} ${BULAN[Number(bl) - 1] ?? bl} ${th}`;
  }

  // Kapital tiap kata; kata yang sudah SEMUA KAPITAL dibiarkan (akronim).
  return v
    .split(/\s+/)
    .map((w) =>
      w === w.toUpperCase() && w.length > 1
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}

interface BerkasSiap {
  label: string;
  /** Sudah dinormalkan ke JPEG; null = bukan gambar / tidak ditemukan. */
  gambar: Buffer | null;
  /** Berkasnya ada di disk tapi bukan gambar (mis. PDF). */
  adaTapiBukanGambar: boolean;
}

export interface PermohonanPdfInput {
  noregister: string;
  jenis: string;
  tanggal: string;
  status: string;
  catatan: string | null;
  pemohon: string;
  /** Kapan status terakhir diubah & oleh siapa; null bila belum diproses. */
  prosesTanggal?: string | null;
  prosesOleh?: string | null;
  payload: Record<string, unknown>;
}

interface DataPdf extends Omit<PermohonanPdfInput, "payload"> {
  data: { label: string; nilai: string }[];
  berkas: BerkasSiap[];
  logo: Buffer | null;
}

function gambarDokumen(doc: PDFKit.PDFDocument, d: DataPdf) {
  const ruang = (tinggi: number) => {
    if (doc.y + tinggi > BATAS_BAWAH) doc.addPage();
  };

  // ── Kop surat ───────────────────────────────────────────────────────────
  if (d.logo) {
    doc.image(d.logo, (HAL_LEBAR - 52) / 2, doc.y, { fit: [52, 62] });
    doc.y += 68;
  }

  doc
    .font("Times-Bold").fontSize(15).fillColor("#000")
    .text("DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL", MARGIN, doc.y, {
      align: "center",
      width: KONTEN_LEBAR,
      characterSpacing: 0.4,
    });
  doc
    .font("Times-Bold").fontSize(13)
    .text("KABUPATEN PESISIR BARAT", MARGIN, doc.y + 1, {
      align: "center",
      width: KONTEN_LEBAR,
    });
  doc
    .font("Helvetica").fontSize(8.5).fillColor("#555")
    .text("Portal SAIBATIN — Bukti Pengajuan Permohonan Online", MARGIN, doc.y + 4, {
      align: "center",
      width: KONTEN_LEBAR,
    });

  // Garis ganda tebal-tipis, khas kop surat resmi.
  const yGaris = doc.y + 8;
  doc.lineWidth(2).strokeColor(BIRU)
    .moveTo(MARGIN, yGaris).lineTo(MARGIN + KONTEN_LEBAR, yGaris).stroke();
  doc.lineWidth(0.6)
    .moveTo(MARGIN, yGaris + 3.5).lineTo(MARGIN + KONTEN_LEBAR, yGaris + 3.5).stroke();
  doc.strokeColor("#000").lineWidth(1);
  doc.y = yGaris + 18;

  // ── Ringkasan permohonan ────────────────────────────────────────────────
  const ringkas: [string, string][] = [
    ["No. Registrasi", d.noregister],
    ["Jenis Permohonan", d.jenis],
    ["Nama Pemohon", d.pemohon],
    ["Dibuat Pada", d.tanggal],
    // Baris kedua tanggal: kapan status terakhir berubah — supaya pembaca tahu
    // kapan permohonan diproses/diselesaikan, bukan hanya kapan diajukan.
    [
      "Perubahan Status",
      d.prosesTanggal
        ? d.prosesOleh
          ? `${d.prosesTanggal} — oleh ${d.prosesOleh}`
          : d.prosesTanggal
        : "Belum diproses",
    ],
  ];

  const kotakY = doc.y;
  const barisTinggi = 17;
  const kotakTinggi = ringkas.length * barisTinggi + 26;
  doc.roundedRect(MARGIN, kotakY, KONTEN_LEBAR, kotakTinggi, 4)
    .fillAndStroke("#f7f9fb", "#dbe3ea");
  doc.fillColor("#000");

  let ry = kotakY + 9;
  for (const [label, nilai] of ringkas) {
    doc.font("Helvetica").fontSize(9).fillColor("#5b6b7b")
      .text(label, MARGIN + 12, ry, { width: 120 });
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#111")
      .text(nilai, MARGIN + 140, ry - 0.5, { width: KONTEN_LEBAR - 152 });
    ry += barisTinggi;
  }

  // Status sebagai lencana berwarna.
  const warna = STATUS_WARNA[d.status] ?? "#334155";
  const teksStatus = STATUS_LABEL[d.status] ?? d.status;
  doc.font("Helvetica-Bold").fontSize(9);
  const lebarLencana = doc.widthOfString(teksStatus) + 18;
  doc.roundedRect(MARGIN + 140, ry - 1, lebarLencana, 15, 7.5).fill(warna);
  doc.fillColor("#fff").text(teksStatus, MARGIN + 149, ry + 3);
  doc.font("Helvetica").fontSize(9).fillColor("#5b6b7b")
    .text("Status", MARGIN + 12, ry + 3, { width: 120 });

  doc.fillColor("#000");
  doc.y = kotakY + kotakTinggi + 16;

  // ── Judul seksi ─────────────────────────────────────────────────────────
  const seksi = (teks: string) => {
    ruang(46);
    const y = doc.y;
    doc.rect(MARGIN, y, KONTEN_LEBAR, 19).fill(BIRU);
    doc.fillColor("#fff").font("Helvetica-Bold").fontSize(9.5)
      .text(teks.toUpperCase(), MARGIN + 9, y + 5.5, {
        width: KONTEN_LEBAR - 18,
        characterSpacing: 0.6,
      });
    doc.fillColor("#000");
    doc.y = y + 19 + 8;
  };

  // ── Data permohonan ─────────────────────────────────────────────────────
  seksi("Data Permohonan");

  if (d.data.length === 0) {
    doc.font("Helvetica-Oblique").fontSize(9.5).fillColor("#888")
      .text("Tidak ada data tambahan.", MARGIN + 4, doc.y);
    doc.fillColor("#000");
    doc.y += 16;
  } else {
    const LBL = 165;
    const NILAI = KONTEN_LEBAR - LBL - 20;
    d.data.forEach((it, i) => {
      doc.font("Helvetica").fontSize(9.5);
      const tinggi =
        Math.max(
          doc.heightOfString(it.label, { width: LBL }),
          doc.heightOfString(it.nilai, { width: NILAI }),
        ) + 9;
      ruang(tinggi);
      const y = doc.y;
      if (i % 2 === 0) doc.rect(MARGIN, y, KONTEN_LEBAR, tinggi).fill("#f7f9fb");
      doc.fillColor("#5b6b7b").font("Helvetica-Bold").fontSize(9)
        .text(it.label, MARGIN + 10, y + 4.5, { width: LBL });
      doc.fillColor("#111").font("Helvetica").fontSize(9.5)
        .text(it.nilai, MARGIN + 10 + LBL, y + 4, { width: NILAI });
      doc.fillColor("#000");
      doc.y = y + tinggi;
    });
  }

  // ── Catatan petugas ─────────────────────────────────────────────────────
  if (d.catatan?.trim()) {
    doc.y += 14;
    seksi("Catatan Petugas");
    doc.font("Helvetica").fontSize(9.5);
    const t = doc.heightOfString(d.catatan, { width: KONTEN_LEBAR - 24 }) + 14;
    ruang(t);
    const y = doc.y;
    doc.roundedRect(MARGIN, y, KONTEN_LEBAR, t, 3)
      .fillAndStroke("#fffbeb", "#fcd34d");
    doc.fillColor("#111")
      .text(d.catatan, MARGIN + 12, y + 7, { width: KONTEN_LEBAR - 24 });
    doc.fillColor("#000");
    doc.y = y + t;
  }

  // ── Dokumen terlampir (gambar asli, bukan URL) ──────────────────────────
  if (d.berkas.length > 0) {
    doc.y += 14;
    seksi("Dokumen Terlampir");

    const KOLOM = 2;
    const JARAK = 14;
    const KARTU_L = (KONTEN_LEBAR - JARAK * (KOLOM - 1)) / KOLOM;
    const GBR_T = 132;
    const KARTU_T = GBR_T + 26;

    for (let i = 0; i < d.berkas.length; i += KOLOM) {
      ruang(KARTU_T + 8);
      const barisY = doc.y;

      for (let k = 0; k < KOLOM; k++) {
        const it = d.berkas[i + k];
        if (!it) break;
        const x = MARGIN + k * (KARTU_L + JARAK);

        doc.roundedRect(x, barisY, KARTU_L, KARTU_T, 4)
          .fillAndStroke("#fbfcfd", "#dbe3ea");
        doc.fillColor("#000");

        doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#5b6b7b")
          .text(it.label, x + 8, barisY + 7, {
            width: KARTU_L - 16,
            height: 11,
            ellipsis: true,
          });

        // Gambar sudah dinormalkan sharp → JPEG baseline, selalu bisa disemat.
        if (it.gambar) {
          doc.image(it.gambar, x + 8, barisY + 21, {
            fit: [KARTU_L - 16, GBR_T - 4],
            align: "center",
            valign: "center",
          });
        } else {
          doc.font("Helvetica-Oblique").fontSize(8).fillColor("#999")
            .text(
              it.adaTapiBukanGambar
                ? "(berkas PDF — lihat di portal)"
                : "(berkas tidak ditemukan)",
              x + 8,
              barisY + 60,
              { width: KARTU_L - 16, align: "center" },
            );
        }
        doc.fillColor("#000");
      }

      doc.y = barisY + KARTU_T + 10;
    }
  }

  // ── Footer di semua halaman ─────────────────────────────────────────────
  const dicetak = new Date().toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const total = doc.bufferedPageRange().count;
  for (let i = 0; i < total; i++) {
    doc.switchToPage(i);
    const y = HAL_TINGGI - MARGIN - 16;
    doc.lineWidth(0.6).strokeColor("#dbe3ea")
      .moveTo(MARGIN, y).lineTo(MARGIN + KONTEN_LEBAR, y).stroke();
    doc.font("Helvetica").fontSize(7.5).fillColor("#8a97a4")
      .text(`Dokumen ini dicetak dari sistem SAIBATIN  •  ${dicetak}`, MARGIN, y + 5, {
        width: KONTEN_LEBAR - 60,
      })
      .text(`Hal. ${i + 1}/${total}`, MARGIN, y + 5, {
        width: KONTEN_LEBAR,
        align: "right",
      });
  }
  doc.fillColor("#000");
}

/** Rakit PDF bukti pengajuan; mengembalikan buffer siap kirim. */
export async function buatPermohonanPdf(
  input: PermohonanPdfInput,
): Promise<Buffer> {
  const data = payloadDataEntries(input.payload).map(([k, v]) => ({
    label: labelField(k),
    nilai: rapikanNilai(k, v),
  }));

  const berkas: BerkasSiap[] = await Promise.all(
    payloadBerkasEntries(input.payload).map(async (b) => {
      const mentah = await bacaBerkas(b.path);
      const gambar = mentah ? await siapkanGambar(mentah) : null;
      return {
        label: b.label,
        gambar,
        adaTapiBukanGambar: Boolean(mentah) && !gambar,
      };
    }),
  );

  const logo = await readFile(
    join(process.cwd(), "public", "logo-saibatin.png"),
  ).catch(() => null);

  return new Promise<Buffer>((resolve, reject) => {
    // bufferPages: wajib agar footer bisa ditulis ke semua halaman di akhir.
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    gambarDokumen(doc, { ...input, data, berkas, logo });
    doc.end();
  });
}
