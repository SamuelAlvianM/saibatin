/**
 * Test koneksi DB read-only lewat driver adapter mariadb (Rust-free).
 * Membuktikan tidak ada panic engine. Tidak menulis/menghapus apa pun.
 *
 * Jalankan:  npx tsx --env-file=.env scripts/test-db.ts
 */
import { prisma } from "../lib/prisma";

async function main() {
  console.log("• Menguji query count() ...");
  const [kunjungan, users, permohonan] = await Promise.all([
    prisma.kunjungan.count(),
    prisma.user.count(),
    prisma.permohonan.count(),
  ]);
  console.log("  ✓ Kunjungan :", kunjungan);
  console.log("  ✓ User      :", users);
  console.log("  ✓ Permohonan:", permohonan);
  console.log("\n✅ DB OK — adapter mariadb jalan tanpa engine Rust.");
}

main()
  .catch((e) => {
    console.error("\n❌ GAGAL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
