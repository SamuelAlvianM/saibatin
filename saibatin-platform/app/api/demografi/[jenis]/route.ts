import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { demografiData } from "@/lib/demografi-data";

/**
 * Statistik demografi per jenis.
 * Jenis = slug halaman: agama, golongan-darah, jenis-kelamin, kepala-keluarga,
 * pendidikan, status-perkawinan, wajib-ktp.
 *
 * Catatan: data kependudukan nyata berada di sistem dapduk eksternal yang
 * tidak dapat diakses dari portal ini, sehingga nilai berikut bersifat
 * contoh realistis (statis). Format respons sudah siap untuk grafik.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jenis: string }> }
) {
  const { jenis } = await params;
  const dataset = demografiData[jenis];
  if (!dataset) return fail(["Jenis demografi tidak ditemukan"], 404);

  const labels = dataset.items.map((i) => i.label);
  const data = dataset.items.map((i) => i.value);
  const total = data.reduce((a, b) => a + b, 0);

  return ok({
    jenis,
    title: dataset.title,
    description: dataset.description,
    labels,
    data,
    total,
    satuan: dataset.unit,
  });
}
