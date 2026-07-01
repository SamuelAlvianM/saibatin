import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

/**
 * Catch-all kompatibilitas untuk modal permohonan (warisan struktur Laravel).
 * Setiap modal di components/permohonan-online/* memanggil endpoint berpola
 * /api/<layanan>/<action>:
 *   - action "upload"            → simpan file, balas { url } + success:[url]
 *   - action "fetch|fetchDatas|jenis" → prefill (kosong, non-blocking)
 *   - action "create|update|postdata|insertdata|store" → buat permohonan
 *
 * <layanan> dipetakan ke kode JenisPermohonan di DB.
 */
const LAYANAN_KODE: Record<string, string> = {
  "akta-kelahiran-nik-ada": "AKTA_KELAHIRAN_NIK_ADA",
  "akta-kelahiran-nik-tidak-ada": "AKTA_KELAHIRAN_NIK_BLM_ADA",
  "akta-kematian": "AKTA_KEMATIAN",
  "akta-nikah": "AKTA_NIKAH",
  "akta-perceraian": "AKTA_PERCERAIAN",
  kia: "KIA",
  ktpel: "KTP_EL",
  "perpindahan-penduduk": "PINDAH",
  kedatangan: "KEDATANGAN",
  "konsolidasi-update-data": "KONSOLIDASI",
  "kk-tambah-anak": "KK_TAMBAH_ANAK",
  "kk-pisah": "KK_PISAH",
  "kk-numpang": "KK_NUMPANG",
  "kk-perubahan-biodata": "KK_UBAH_BIODATA",
  "kk-cetak-ulang": "KK_CETAK_ULANG",
};

const SUBMIT_ACTIONS = ["create", "update", "postdata", "insertdata", "store"];
const FETCH_ACTIONS = ["fetch", "fetchdatas", "jenis", "fetchdata"];

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".pdf"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ layanan: string; action: string }> }
) {
  const { layanan, action: rawAction } = await params;
  const action = rawAction.toLowerCase();

  // Hanya tangani layanan permohonan yang dikenal; sisanya 404 alami.
  if (!(layanan in LAYANAN_KODE)) {
    return fail(["Layanan tidak ditemukan"], 404);
  }

  const session = await getSession();
  if (!session) return fail(["Silakan login terlebih dahulu"], 401);

  // ── Prefill (non-blocking) ──
  if (FETCH_ACTIONS.includes(action)) {
    return ok({});
  }

  // ── Upload berkas ──
  if (action === "upload") {
    try {
      const form = await req.formData();
      let file: File | null = null;
      for (const v of form.values()) {
        if (v instanceof File) {
          file = v;
          break;
        }
      }
      if (!file) return fail(["File tidak ditemukan"]);
      if (file.size > MAX_SIZE) return fail(["Ukuran file maksimal 5 MB"]);

      const ext = extname(file.name).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        return fail(["Format file harus JPG, PNG, atau PDF"]);
      }

      const safeName = `${session.uid}_${Date.now()}${ext}`;
      const uploadDir = join(process.cwd(), "public", "uploads", layanan);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, safeName), Buffer.from(await file.arrayBuffer()));

      const url = `/uploads/${layanan}/${safeName}`;
      // success[0] = url → modal menyimpannya ke payload.
      return ok({ url }, [url]);
    } catch {
      return fail(["Gagal mengunggah file"], 500);
    }
  }

  // ── Submit permohonan ──
  if (SUBMIT_ACTIONS.includes(action)) {
    const payload = await req.json().catch(() => ({}));
    const jenis = await prisma.jenisPermohonan.findUnique({
      where: { kode: LAYANAN_KODE[layanan] },
    });
    if (!jenis) return fail(["Jenis permohonan tidak valid"]);

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

    return ok({ noregister: permohonan.noregister, id: permohonan.id }, [
      "Info: Permohonan berhasil diajukan",
    ]);
  }

  return fail(["Aksi tidak dikenal"], 404);
}
