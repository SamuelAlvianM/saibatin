import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, normalize } from "path";
import { getSession, isStaff } from "@/lib/auth";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

/** Berkas publik (produk/PPID) — boleh tetap di public/. */
const ROOT_PUBLIK = join(process.cwd(), "public", "uploads");
/** Berkas permohonan (KTP/KK) — DI LUAR public/ agar tak dilayani statis. */
const ROOT_PRIVAT = join(process.cwd(), "storage", "permohonan");
/** Foto wajah/selfie akun — juga pribadi, lihat lib/foto-profil.ts. */
const ROOT_PROFIL = join(process.cwd(), "storage", "profil");

/**
 * Folder yang memang untuk konsumsi publik (dokumen PPID / produk hukum yang
 * diunggah admin lewat /api/upload dengan folder="produk").
 *
 * DEFAULT-DENY: apa pun di luar daftar ini dianggap berkas permohonan warga
 * (KTP/KK/akta) dan wajib berizin. Folder baru otomatis terlindungi.
 */
const FOLDER_PUBLIK = new Set(["produk"]);

/** Semua penolakan memakai 404 agar keberadaan berkas tidak bocor. */
const tidakDitemukan = () => new NextResponse("Not found", { status: 404 });

/**
 * Penyaji berkas unggahan: /uploads/<folder>/<file>
 *
 * Kenapa route ini ada: Next.js HANYA menyajikan isi `public/` yang sudah ada
 * saat build. Berkas yang diunggah saat runtime tidak pernah dilayani →
 * pratinjau <img> patah. Route ini membacanya langsung dari disk.
 *
 * Kontrol akses (berkas permohonan bersifat pribadi — memuat KTP/KK warga):
 *   - staff (superadmin/operator) → boleh semua
 *   - warga                       → hanya berkas miliknya sendiri
 *   - warga lain / tanpa sesi     → 404
 *
 * Kepemilikan dibaca dari nama berkas: kedua endpoint unggah menamainya
 * `${session.uid}_${Date.now()}${ext}` (lihat app/api/upload/route.ts dan
 * app/api/[layanan]/[action]/route.ts), jadi tidak perlu query DB.
 *
 * Catatan: /uploads/media/... ditangani route yang lebih spesifik
 * (app/uploads/media/[...path]) dan tidak sampai ke sini.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  // Tolak path traversal per-segmen (aman lintas OS; normalize() memakai "\" di Windows).
  if (path.length === 0 || path.some((s) => s.includes(".."))) {
    return tidakDitemukan();
  }

  const folder = path[0];
  const namaFile = path[path.length - 1];

  const ext = namaFile.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME_BY_EXT[ext];
  if (!mime) return tidakDitemukan();

  const publik = FOLDER_PUBLIK.has(folder);

  if (!publik) {
    const session = await getSession();
    if (!session) return tidakDitemukan();

    if (!isStaff(session)) {
      // Warga hanya boleh berkasnya sendiri: prefix nama berkas = uid pengunggah.
      const pemilik = Number.parseInt(namaFile.split("_")[0] ?? "", 10);
      if (!Number.isInteger(pemilik) || pemilik !== session.uid) {
        return tidakDitemukan();
      }
    }
  }

  const rel = normalize(path.join("/"));
  try {
    // Privat: baca dari storage/. Berkas LAMA masih ada di public/uploads/ →
    // fallback agar riwayat permohonan tidak putus sebelum dipindahkan.
    // (Selama belum dipindah, berkas lama itu masih terekspos sebagai aset
    //  statis — pemindahan folder di server yang menutupnya.)
    let buffer: Buffer;
    if (publik) {
      buffer = await readFile(join(ROOT_PUBLIK, rel));
    } else {
      buffer = await readFile(join(ROOT_PRIVAT, rel))
        .catch(() => readFile(join(ROOT_PROFIL, rel)))
        .catch(() => readFile(join(ROOT_PUBLIK, rel)));
    }
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        // Berkas pribadi TIDAK boleh singgah di cache bersama/CDN.
        "Cache-Control": publik
          ? "public, max-age=31536000, immutable"
          : "private, no-store",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return tidakDitemukan();
  }
}
