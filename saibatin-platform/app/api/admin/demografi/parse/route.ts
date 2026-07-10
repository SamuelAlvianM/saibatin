import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { parseDemografiExcel, type DemografiRow } from "@/lib/demografi-import";
import { DEMOGRAFI_SLUGS } from "@/lib/demografi-kategori";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD = 10 * 1024 * 1024; // 10 MB / file

/** Tanda tangan nilai baris (untuk mendeteksi data berbeda pada wilayah sama). */
function sig(data: Record<string, number>): string {
  return JSON.stringify(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
}

interface Variant {
  label: string; // sumber (nama file atau "Data tersimpan")
  data: Record<string, number>;
}
interface Conflict {
  kode: string;
  wilayah: string;
  level: number;
  parentKode: string | null;
  options: Variant[];
}

/**
 * Parse beberapa file Excel sekaligus TANPA menyimpan. Menggabungkan per KODE
 * wilayah dan mengembalikan:
 *  - rows: baris yang tidak berkonflik (semua sumber sepakat / hanya satu sumber)
 *  - conflicts: wilayah yang datanya BERBEDA antar file (atau beda dari data
 *    tersimpan) → klien memilih salah satu.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Tidak diizinkan"], 403);

  let files: File[] = [];
  let kategori = "";
  try {
    const form = await req.formData();
    kategori = String(form.get("kategori") ?? "").trim();
    files = form.getAll("files").filter((f): f is File => f instanceof File);
  } catch {
    return fail(["Format unggahan tidak valid"]);
  }

  if (!DEMOGRAFI_SLUGS.has(kategori)) return fail(["Kategori tidak dikenal"]);
  if (files.length === 0) return fail(["Tidak ada file yang dikirim"]);
  for (const f of files) {
    if (!/\.xlsx$/i.test(f.name)) return fail([`"${f.name}" bukan file .xlsx`]);
    if (f.size > MAX_UPLOAD) return fail([`"${f.name}" melebihi 10 MB`]);
  }

  // Parse tiap file.
  const parsedFiles: { name: string; rows: DemografiRow[] }[] = [];
  const kolomOrder: string[] = [];
  for (const f of files) {
    try {
      const buffer = Buffer.from(await f.arrayBuffer());
      const p = await parseDemografiExcel(buffer);
      parsedFiles.push({ name: f.name, rows: p.rows });
      for (const k of p.kolom) if (!kolomOrder.includes(k)) kolomOrder.push(k);
    } catch (e) {
      return fail([`Gagal membaca "${f.name}": ${e instanceof Error ? e.message : "error"}`]);
    }
  }

  // Data tersimpan (untuk pembanding).
  const existing = await prisma.demografiWilayah.findMany({
    where: { kategori },
    select: { kode: true, data: true },
  });
  const existingByKode = new Map(
    existing.map((e) => [e.kode, e.data as Record<string, number>]),
  );

  // Gabungkan per kode: kumpulkan variasi (sig unik) beserta label sumbernya.
  interface Agg {
    wilayah: string;
    level: number;
    parentKode: string | null;
    variants: Map<string, Variant>; // sig → variant (label digabung)
  }
  const byKode = new Map<string, Agg>();
  for (const pf of parsedFiles) {
    for (const r of pf.rows) {
      const agg = byKode.get(r.kode) ?? {
        wilayah: r.wilayah,
        level: r.level,
        parentKode: r.parentKode,
        variants: new Map<string, Variant>(),
      };
      const s = sig(r.data);
      const existingVar = agg.variants.get(s);
      if (existingVar) {
        if (!existingVar.label.includes(pf.name)) existingVar.label += `, ${pf.name}`;
      } else {
        agg.variants.set(s, { label: pf.name, data: r.data });
      }
      byKode.set(r.kode, agg);
    }
  }

  const rows: DemografiRow[] = [];
  const conflicts: Conflict[] = [];
  let changed = 0;
  let unchanged = 0;

  for (const [kode, agg] of byKode) {
    const variants = [...agg.variants.values()];
    const prev = existingByKode.get(kode);

    if (variants.length === 1) {
      // Semua file sepakat. Info perubahan vs data tersimpan.
      const only = variants[0];
      if (prev && sig(prev) !== sig(only.data)) changed++;
      else if (prev) unchanged++;
      rows.push({ kode, wilayah: agg.wilayah, level: agg.level, parentKode: agg.parentKode, data: only.data });
    } else {
      // Berbeda antar file → konflik. Sertakan data tersimpan sbila ada & beda.
      const options = [...variants];
      if (prev && !variants.some((v) => sig(v.data) === sig(prev))) {
        options.push({ label: "Data tersimpan", data: prev });
      }
      conflicts.push({ kode, wilayah: agg.wilayah, level: agg.level, parentKode: agg.parentKode, options });
    }
  }

  return ok({
    kolom: kolomOrder,
    rows,
    conflicts,
    ringkas: {
      totalWilayah: byKode.size,
      konflik: conflicts.length,
      berubah: changed,
      tetap: unchanged,
      file: files.length,
    },
  });
}
