import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

import { rentangPeriode, bacaAcuan } from "@/lib/periode";

/**
 * Daftar SEMUA permohonan untuk panel admin.
 *
 * Paginasi BERNOMOR (page/limit), bukan cursor: petugas perlu melompat ke
 * halaman tertentu dan tahu total datanya. Pencarian & seluruh filter
 * dijalankan di DATABASE, jadi hasilnya mencakup seluruh data — bukan hanya
 * baris yang kebetulan sedang tampil di halaman aktif.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.level > 2) return fail(["Akses ditolak"], 403);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // MENUNGGU | DIPROSES | SELESAI | DITOLAK
  const q = searchParams.get("q")?.trim();
  const petugas = searchParams.get("petugas")?.trim(); // prosesById
  const periode = searchParams.get("periode"); // hari | minggu | bulan | tahun
  const sorot = searchParams.get("sorot"); // id permohonan yang harus ditampilkan
  let page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(10, parseInt(searchParams.get("limit") ?? "20", 10) || 20),
  );

  // `acuan` menentukan periode ke berapa (mis. minggu lalu), bukan hanya yang
  // sedang berjalan. Rentangnya [awal, akhir) — akhir eksklusif agar seluruh
  // hari terakhir ikut terhitung.
  const rentang = rentangPeriode(periode, bacaAcuan(searchParams.get("acuan")));

  const where: Prisma.PermohonanWhereInput = {
    ...(status ? { status } : {}),
    ...(petugas ? { prosesById: Number(petugas) } : {}),
    ...(rentang ? { createdAt: { gte: rentang.awal, lt: rentang.akhir } } : {}),
    ...(q
      ? {
          OR: [
            { noregister: { contains: q } },
            { catatan: { contains: q } },
            { user: { userFullname: { contains: q } } },
            { user: { userId: { contains: q } } },
            { user: { userHp: { contains: q } } },
            { jenis: { nama: { contains: q } } },
          ],
        }
      : {}),
  };

  // Datang dari notifikasi: hitung permohonan itu ada di halaman berapa, lalu
  // langsung buka halaman tersebut. Tanpa ini petugas mendarat di halaman 1 dan
  // harus mencari sendiri di antara ribuan baris.
  if (sorot) {
    const id = Number(sorot);
    if (Number.isFinite(id)) {
      // Urutan id menurun → posisi = jumlah baris dengan id LEBIH BESAR.
      const sebelum = await prisma.permohonan.count({
        where: { AND: [where, { id: { gt: id } }] },
      });
      page = Math.floor(sebelum / limit) + 1;
    }
  }

  const [total, rows] = await Promise.all([
    prisma.permohonan.count({ where }),
    prisma.permohonan.findMany({
      where,
      include: {
        jenis: { select: { nama: true, kategori: true } },
        user: { select: { userId: true, userFullname: true, userHp: true } },
        _count: { select: { berkas: true } },
      },
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const totalHalaman = Math.max(1, Math.ceil(total / limit));

  const items = rows.map((i) => ({
    id: i.id,
    noregister: i.noregister,
    status: i.status,
    catatan: i.catatan,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    // Jejak perubahan status — dipakai kolom "Diperbarui" & PDF.
    prosesAt: i.prosesAt,
    prosesByName: i.prosesByName,
    jenisNama: i.jenis?.nama ?? "-",
    kategori: i.jenis?.kategori ?? "-",
    pemohon: i.user?.userFullname ?? i.user?.userId ?? "-",
    pemohonId: i.user?.userId ?? "-",
    hp: i.user?.userHp ?? "-",
    jumlahBerkas: i._count.berkas,
  }));

  // Hitungan per status & daftar petugas hanya dikirim di halaman pertama —
  // isinya sama untuk tiap halaman, jadi tak perlu dihitung ulang.
  let counts: Record<string, number> | undefined;
  let daftarPetugas: { id: number; nama: string }[] | undefined;
  if (page === 1) {
    const [grouped, petugasRows] = await Promise.all([
      // Hitungan status mengikuti filter LAIN (petugas/periode/pencarian),
      // tapi bukan filter status itu sendiri — supaya angka di tiap chip
      // menunjukkan "berapa yang akan muncul kalau chip ini diklik".
      prisma.permohonan.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: { ...where, status: undefined },
      }),
      prisma.permohonan.findMany({
        where: { prosesById: { not: null } },
        select: { prosesById: true, prosesByName: true },
        distinct: ["prosesById"],
        orderBy: { prosesByName: "asc" },
      }),
    ]);

    counts = {};
    let semua = 0;
    for (const g of grouped) {
      counts[g.status] = g._count._all;
      semua += g._count._all;
    }
    counts[""] = semua;

    daftarPetugas = petugasRows
      .filter((p) => p.prosesById != null)
      .map((p) => ({
        id: p.prosesById as number,
        nama: p.prosesByName ?? `Petugas #${p.prosesById}`,
      }));
  }

  return ok({
    items,
    page,
    limit,
    total,
    totalHalaman,
    ...(counts ? { counts } : {}),
    ...(daftarPetugas ? { daftarPetugas } : {}),
  });
}
