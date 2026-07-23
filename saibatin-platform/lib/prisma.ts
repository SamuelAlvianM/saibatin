import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { PoolConfig } from "mariadb";

// ── Prisma via Driver Adapter (mariadb, JS murni) ──────────────────────────
// Server cPanel "damar" mengurung akun di LVE dengan ulimit -u = 35 proses/
// thread. Query-engine Rust bawaan Prisma menyalakan tokio yang men-spawn
// thread → tembus batas → panic "timer has gone away" → semua query 500.
// Adapter ini + preview `queryCompiler` (lihat schema.prisma) membuat client
// TANPA engine Rust: koneksi DB lewat paket `mariadb` (event-loop, tanpa
// thread OS tambahan). Aman di ulimit 35.

// DATABASE_URL produksi memakai UNIX socket:
//   mysql://user:pass@localhost/db?socket=/var/lib/mysql/mysql.sock
// Dev lokal biasanya TCP host:port. Dukung keduanya, tanpa hardcode kredensial.
function buildPoolConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL belum di-set");

  const url = new URL(raw);
  const socketPath =
    url.searchParams.get("socket") ?? url.searchParams.get("socketPath");

  const base: PoolConfig = {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    // Shared hosting ketat: batasi pool agar hemat resource akun.
    connectionLimit: 5,
    // MySQL 8 memakai caching_sha2_password; konektor mariadb butuh ini untuk
    // handshake non-TLS (localhost/socket tepercaya). Tak berpengaruh di
    // MariaDB. Tanpa ini: "RSA public key is not available client side".
    allowPublicKeyRetrieval: true,
  };

  // Socket UNIX (produksi cPanel) → host/port diabaikan oleh driver.
  if (socketPath) return { ...base, socketPath };

  // TCP (dev lokal / VPS).
  return {
    ...base,
    host: url.hostname || "localhost",
    port: url.port ? parseInt(url.port, 10) : 3306,
  };
}

// Singleton — hindari koneksi berganda saat hot-reload dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const adapter = new PrismaMariaDb(buildPoolConfig());
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
