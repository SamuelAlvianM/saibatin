import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";
import { createWorker, OEM, type Worker } from "tesseract.js";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

// OCR memakai CPU cukup berat → wajib Node runtime (bukan Edge) & tak di-cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD = 8 * 1024 * 1024; // 8 MB
const OCR_TIMEOUT = 45_000; // gagal cepat, jangan menggantung berlama-lama
// Data bahasa dibundel lokal (tessdata/ind.traineddata.gz) → tidak mengunduh
// dari CDN saat runtime. Inilah kunci agar scan tidak menggantung.
const TESSDATA_DIR = path.join(process.cwd(), "tessdata");

/**
 * Worker OCR dipakai ulang (singleton) — inisialisasi + baca data bahasa
 * hanya SEKALI, tidak tiap request. Request pertama menyiapkan worker,
 * berikutnya langsung recognize.
 */
let workerPromise: Promise<Worker> | null = null;
function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker("ind", OEM.LSTM_ONLY, {
      langPath: TESSDATA_DIR,
      cacheMethod: "none",
      gzip: true,
    }).catch((e) => {
      workerPromise = null; // izinkan retry bila init gagal
      throw e;
    });
  }
  return workerPromise;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

/** Salah baca OCR yang umum pada digit → angka. */
function normalizeDigits(text: string): string {
  return text
    .replace(/[OoQ]/g, "0")
    .replace(/[Il|!]/g, "1")
    .replace(/[Ss]/g, "5")
    .replace(/[B]/g, "8")
    .replace(/[Zz]/g, "2");
}

/**
 * Validasi struktur NIK 16 digit: 6 digit kode wilayah + tgl lahir (2, +40 utk
 * perempuan) + bulan (2) + tahun (2) + urut (4). Cek tanggal & bulan agar
 * hasil ngawur ditolak.
 */
function isValidNik(nik: string): boolean {
  if (!/^\d{16}$/.test(nik)) return false;
  let hari = parseInt(nik.slice(6, 8), 10);
  const bulan = parseInt(nik.slice(8, 10), 10);
  if (hari > 40) hari -= 40; // perempuan
  return hari >= 1 && hari <= 31 && bulan >= 1 && bulan <= 12;
}

/** Dari deretan digit, ambil jendela 16-digit yang valid sebagai NIK.
 *  Menangani kasus OCR menyisipkan 1 digit liar (deret jadi 17+ digit). */
function pickNik(digits: string): string | undefined {
  if (digits.length < 16) return undefined;
  for (let i = 0; i + 16 <= digits.length; i++) {
    const cand = digits.slice(i, i + 16);
    if (isValidNik(cand)) return cand;
  }
  return digits.length === 16 ? digits : undefined;
}

interface KtpParsed {
  nik?: string;
  nama?: string;
  nokk?: string;
}

/** Ekstrak NIK / No.KK (16 digit) dan Nama dari teks OCR KTP/KK. */
function parseKtpText(raw: string): KtpParsed {
  const result: KtpParsed = {};
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const digits = normalizeDigits(line).replace(/[^0-9]/g, "");
    const m16 = digits.match(/\d{16}/);

    if (!result.nokk && /(no\.?\s*kk|kartu\s*keluarga|nomor\s*kk)/i.test(line)) {
      // Ambil digit setelah ":" agar "No"/"KK" (huruf) tak jadi digit palsu.
      const tail = line.includes(":") ? line.slice(line.lastIndexOf(":") + 1) : line;
      const tailDigits = normalizeDigits(tail).replace(/[^0-9]/g, "");
      const mk = tailDigits.match(/\d{16}/);
      if (mk) {
        result.nokk = mk[0];
        continue;
      }
    }
    if (!result.nik && m16 && (/nik/i.test(line) || digits.length <= 20)) {
      const nik = pickNik(digits);
      if (nik) result.nik = nik;
    }
    if (!result.nama && /nama/i.test(line) && !/keluarga/i.test(line)) {
      const after = line.split(/[:∶]/)[1];
      if (after) {
        const nama = after.replace(/[^A-Za-z.,'\s-]/g, "").trim();
        if (nama.length >= 3) result.nama = nama;
      }
    }
  }

  if (!result.nik) {
    for (const run of normalizeDigits(raw).match(/\d{16,}/g) ?? []) {
      const nik = pickNik(run);
      if (nik) {
        result.nik = nik;
        break;
      }
    }
  }

  return result;
}

/**
 * OCR KTP/KK sisi server. Terima gambar (multipart "file"), pra-proses dengan
 * sharp lalu baca dengan tesseract.js (`ind`, data bahasa lokal). Gambar tidak
 * disimpan; hanya diproses di memori.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return fail(["Format unggahan tidak valid"]);
  }

  if (!file) return fail(["Tidak ada gambar yang dikirim"]);
  if (!file.type.startsWith("image/")) return fail(["File harus berupa gambar"]);
  if (file.size > MAX_UPLOAD) return fail(["Ukuran gambar maksimal 8 MB"]);

  const input = Buffer.from(await file.arrayBuffer());

  // Pra-proses: kunci naiknya akurasi OCR dibanding di browser.
  let pre: Buffer;
  try {
    pre = await sharp(input)
      .rotate() // auto-orient dari EXIF
      .resize({ width: 1500, withoutEnlargement: false })
      .grayscale()
      .normalize()
      .sharpen()
      .toFormat("png")
      .toBuffer();
  } catch {
    return fail(["Gambar tidak dapat diproses"]);
  }

  let text = "";
  try {
    const worker = await getWorker();
    const { data } = await withTimeout(worker.recognize(pre), OCR_TIMEOUT);
    text = data.text ?? "";
  } catch (e) {
    const msg =
      e instanceof Error && e.message === "timeout"
        ? "OCR terlalu lama. Coba foto lebih terang, lurus, dan dekat."
        : "Gagal menjalankan OCR di server";
    return fail([msg], 500);
  }

  const parsed = parseKtpText(text);
  if (!parsed.nik && !parsed.nama && !parsed.nokk) {
    return fail(
      ["Teks KTP/KK tidak terbaca. Coba foto ulang dengan pencahayaan lebih baik."],
      422,
    );
  }

  return ok(parsed, ["Hasil scan — mohon periksa kembali sebelum lanjut"]);
}
