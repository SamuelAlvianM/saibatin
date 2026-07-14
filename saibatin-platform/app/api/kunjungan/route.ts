import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { statsKunjungan, tanggalHariIni } from "@/lib/kunjungan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VID_COOKIE = "saibatin_vid";

/** Statistik pengunjung: { online, hariIni, total }. */
export async function GET() {
  return ok(await statsKunjungan());
}

/**
 * Ping kunjungan dari halaman publik (komponen KunjunganPing).
 * body { pv?: boolean } — pv=true (default) menambah hitungan tampilan
 * halaman; pv=false hanya menyegarkan status online.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { pv?: boolean };
  const pv = body.pv !== false;

  const store = await cookies();
  let vid = store.get(VID_COOKIE)?.value ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(vid)) {
    vid = randomUUID();
    store.set(VID_COOKIE, vid, {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV === "production" &&
        process.env.AUTH_COOKIE_SECURE !== "false",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const now = new Date();
  try {
    await prisma.kunjungan.upsert({
      where: { visitorId_tanggal: { visitorId: vid, tanggal: tanggalHariIni() } },
      create: { visitorId: vid, tanggal: tanggalHariIni(), hits: 1, lastSeen: now },
      update: { lastSeen: now, ...(pv ? { hits: { increment: 1 } } : {}) },
    });
  } catch {
    /* pencatatan gagal tidak boleh mengganggu halaman */
  }

  return ok(null);
}
