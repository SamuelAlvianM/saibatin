import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { tplAkunDisetujui, tplAkunDitolak } from "@/lib/mail-templates";

/** Pastikan pemanggil adalah operator/admin (level 1 atau 2). */
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.level > 2) return null;
  return session;
}

/** Daftar user untuk panel admin (filter status, kelompok level & pencarian). */
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Tidak diizinkan"], 403);

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status"); // "0" | "1" | null
  // Kelompok akun: "3" = warga, "4" = operator OPD, "staff" = petugas dinas (1&2).
  const levelParam = searchParams.get("level");
  const q = searchParams.get("q")?.trim();

  const items = await prisma.user.findMany({
    where: {
      ...(statusParam === "0" || statusParam === "1"
        ? { status: Number(statusParam) }
        : {}),
      ...(levelParam === "staff"
        ? { userlevelId: { in: [1, 2] } }
        : levelParam === "3" || levelParam === "4"
          ? { userlevelId: Number(levelParam) }
          : {}),
      ...(q
        ? {
            OR: [
              { userId: { contains: q } },
              { userFullname: { contains: q } },
              { userEmail: { contains: q } },
              { userNik: { contains: q } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      userId: true,
      userlevelId: true,
      userFullname: true,
      userNik: true,
      userNokk: true,
      userHp: true,
      userEmail: true,
      status: true,
      createdAt: true,
      level: { select: { nama: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return ok({ items });
}

/**
 * Buat akun baru oleh admin/operator.
 * Level yang bisa dibuat: 3 = Warga, 4 = Operator OPD (instansi pemerintah
 * daerah). Level 2 (Operator dinas) hanya bisa dibuat Super Admin (level 1).
 * Akun langsung aktif karena dibuat petugas; email pemberitahuan dikirim
 * bila alamat email diisi.
 */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Tidak diizinkan"], 403);

  const body = await req.json().catch(() => ({}));
  const { nama, userId, nik, kk, hp, email, level, password } = body as {
    nama?: string;
    userId?: string; // NIK (warga) atau username (OPD/staff)
    nik?: string; // NIK perwakilan instansi (khusus OPD)
    kk?: string;
    hp?: string;
    email?: string;
    level?: number;
    password?: string;
  };

  if (!nama?.trim() || !userId?.trim() || !password) {
    return fail(["Info: Nama, NIK/Username, dan password wajib diisi"]);
  }
  if (level !== 2 && level !== 3 && level !== 4) {
    return fail(["Info: Level akun tidak valid"]);
  }
  if (level === 2 && session.level !== 1) {
    return fail(["Info: Hanya Super Admin yang dapat membuat akun Staff"], 403);
  }
  if (level === 3 && !/^\d{16}$/.test(userId)) {
    return fail(["Info: NIK warga harus 16 digit angka"]);
  }
  // OPD login memakai USERNAME instansi (mis. rs.saibatin); NIK perwakilan
  // disimpan terpisah untuk fitur lupa password.
  if (level === 4) {
    if (!/^[a-z0-9][a-z0-9._-]{3,29}$/i.test(userId.trim())) {
      return fail([
        "Info: Username OPD 4-30 karakter (huruf/angka/titik/underscore/strip)",
      ]);
    }
    if (!/^\d{16}$/.test(nik ?? "")) {
      return fail(["Info: NIK perwakilan OPD harus 16 digit angka"]);
    }
  }
  if (level === 2 && userId.trim().length < 4) {
    return fail(["Info: Username minimal 4 karakter"]);
  }
  if (password.length < 6) {
    return fail(["Info: Password minimal 6 karakter"]);
  }

  try {
    const sudahAda = await prisma.user.count({
      where: { userId: userId.trim(), status: 1 },
    });
    if (sudahAda > 0) {
      return fail(["Info: NIK/Username sudah terdaftar dan aktif"]);
    }

    // Pastikan level Operator OPD ada (DB lama mungkin belum punya baris ini).
    await prisma.userLevel.upsert({
      where: { id: 4 },
      create: { id: 4, nama: "Operator OPD" },
      update: {},
    });

    const hashpass = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        userId: userId.trim(),
        password: hashpass,
        userlevelId: level,
        userFullname: nama.trim(),
        // NIK untuk fitur lupa password: warga = NIK login-nya sendiri,
        // OPD = NIK perwakilan instansi (field terpisah dari username).
        userNik:
          level === 4
            ? (nik ?? "").trim()
            : /^\d{16}$/.test(userId.trim())
              ? userId.trim()
              : null,
        userNokk: kk?.trim() || null,
        userHp: hp?.trim() || null,
        userEmail: email?.trim() || null,
        status: 1, // dibuat petugas = langsung aktif
        activationTime: new Date(),
        createdBy: session.uid,
      },
    });

    if (user.userEmail) {
      const mail = tplAkunDisetujui(user.userFullname ?? user.userId);
      await sendMail({ to: user.userEmail, ...mail });
    }

    return ok({ id: user.id }, ["Info: Akun berhasil dibuat dan langsung aktif"]);
  } catch {
    return fail(["Info: Gagal membuat akun"], 500);
  }
}

/** Ubah status aktif/nonaktif user (aktivasi akun). */
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail(["Tidak diizinkan"], 403);

  const body = await req.json().catch(() => ({}));
  const { id, status, alasan } = body as {
    id?: number;
    status?: number;
    alasan?: string;
  };

  if (typeof id !== "number" || (status !== 0 && status !== 1)) {
    return fail(["Info: Parameter id/status tidak valid"]);
  }

  try {
    const sebelum = await prisma.user.findUnique({
      where: { id },
      select: { status: true },
    });
    const user = await prisma.user.update({
      where: { id },
      data: {
        status,
        updatedBy: typeof session.uid === "number" ? session.uid : undefined,
        ...(status === 1 ? { activationTime: new Date() } : {}),
        ...(alasan ? { ket: alasan } : {}),
      },
    });

    // Notifikasi email hanya saat status benar-benar berubah.
    if (user.userEmail && sebelum && sebelum.status !== status) {
      const nama = user.userFullname ?? user.userId;
      const mail =
        status === 1 ? tplAkunDisetujui(nama) : tplAkunDitolak(nama, alasan);
      await sendMail({ to: user.userEmail, ...mail });
    }

    return ok(null, [
      status === 1 ? "Info: Akun berhasil diaktifkan" : "Info: Akun dinonaktifkan/ditolak",
    ]);
  } catch {
    return fail(["Info: Gagal memperbarui status user"], 500);
  }
}
