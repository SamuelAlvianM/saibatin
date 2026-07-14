import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { createNotifikasi, notifyPetugas, safeNotify } from "@/lib/notifikasi";

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

/**
 * Validasi payload sisi server — kumpulkan SEMUA kekurangan lalu balas
 * sekaligus (bukan satu-satu), agar warga tahu persis data apa saja yang
 * belum lengkap. Field wajib di bawah ada di semua 15 modal permohonan;
 * field NIK/No.KK lain hanya dicek formatnya bila terisi (beberapa layanan
 * memang membolehkan NIK kosong, mis. akta kelahiran NIK belum ada).
 */
function validatePayload(payload: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const val = (k: string) => String(payload?.[k] ?? "").trim();

  const wajib: [string, string][] = [
    ["pemohonnik", "NIK pemohon"],
    ["pemohonnama", "Nama pemohon"],
    ["pemohonhp", "Nomor HP pemohon"],
    ["pemohonemail", "Email pemohon"],
  ];
  for (const [k, label] of wajib) {
    if (!val(k)) errors.push(`${label} wajib diisi`);
  }

  const hp = val("pemohonhp");
  if (hp && !/^0\d{9,12}$/.test(hp)) {
    errors.push("Nomor HP pemohon harus 10-13 digit dan diawali 0");
  }
  const email = val("pemohonemail");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Format email pemohon tidak valid");
  }

  // Semua field bernuansa NIK/No.KK yang terisi harus 16 digit angka.
  for (const [k, v] of Object.entries(payload ?? {})) {
    if (k.startsWith("file")) continue;
    const s = String(v ?? "").trim();
    if (!s) continue;
    if (/(nik|nokk|kk)$/i.test(k) && !/^\d{16}$/.test(s)) {
      errors.push(`Kolom ${k} harus berupa 16 digit angka`);
    }
  }

  return errors;
}
const FETCH_ACTIONS = ["fetch", "fetchdatas", "jenis", "fetchdata"];

const MAX_SIZE = 5 * 1024 * 1024;
// Berkas permohonan HANYA gambar (scan/foto dokumen) — PDF tidak diterima.
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];

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
        return fail(["Berkas permohonan harus berupa gambar (JPG, PNG, atau WebP)"]);
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

    const kekurangan = validatePayload(payload as Record<string, unknown>);
    if (kekurangan.length > 0) return fail(kekurangan, 422);

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

    // Notifikasi ke petugas: ada permohonan masuk. Pembuat dikecualikan
    // (form staf "Pengajuan Baru" juga lewat endpoint ini).
    const namaPemohon =
      String((payload as Record<string, unknown>)?.pemohonnama ?? "").trim() ||
      session.nama ||
      session.userId;
    await safeNotify(() =>
      notifyPetugas({
        tipe: "PERMOHONAN_BARU",
        judul: "Permohonan baru masuk",
        isi: `${namaPemohon} mengajukan ${jenis.nama} (${noregister}).`,
        link: "/dashboard/permohonan",
        refType: "Permohonan",
        refId: permohonan.id,
        kecualiUserId: session.uid,
      }),
    );

    // Konfirmasi in-app untuk warga/OPD pengaju (petugas tidak perlu).
    if (session.level > 2) {
      await safeNotify(() =>
        createNotifikasi({
          userId: session.uid,
          tipe: "PERMOHONAN_STATUS",
          judul: "Permohonan terkirim",
          isi: `Permohonan ${jenis.nama} Anda terkirim dengan No. Registrasi ${noregister} dan menunggu diproses petugas.`,
          link: "/user/pengajuan",
          refType: "Permohonan",
          refId: permohonan.id,
        }),
      );
    }

    return ok({ noregister: permohonan.noregister, id: permohonan.id }, [
      `Permohonan berhasil diajukan — No. Registrasi ${permohonan.noregister}`,
    ]);
  }

  return fail(["Aksi tidak dikenal"], 404);
}
