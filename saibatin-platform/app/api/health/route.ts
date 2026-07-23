import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Endpoint kebenaran runtime. 1 curl → tahu build mana yang live + DB nyambung.
// Dipakai deploy.sh sebagai health-gate, dan oleh sesi debugging berikutnya.
export async function GET() {
  let buildId = "unknown";
  try {
    buildId = readFileSync(join(process.cwd(), ".next", "BUILD_ID"), "utf8").trim();
  } catch {
    /* di standalone lokasi bisa beda — abaikan */
  }

  let db = "fail";
  let dbError: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "ok";
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  const body = {
    status: db === "ok" ? "ok" : "degraded",
    build_id: buildId,
    git_commit: process.env.GIT_COMMIT ?? "unknown",
    db,
    ...(dbError ? { db_error: dbError } : {}),
    node: process.version,
    engine: "client (rust-free) + adapter-mariadb",
    time: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: db === "ok" ? 200 : 503 });
}
