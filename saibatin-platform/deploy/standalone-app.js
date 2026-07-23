/**
 * Startup wrapper untuk Next.js standalone di cPanel Passenger.
 *
 * Kenapa perlu: server.js bawaan `output: standalone` TIDAK memuat file .env —
 * ia hanya membaca process.env. Di cPanel, kredensial (DATABASE_URL socket, dst)
 * ada di file .env pada app root. Wrapper ini memuat .env dulu, baru menjalankan
 * server standalone. Tanpa dependensi (tak butuh dotenv).
 *
 * cPanel "Setup Node.js App":
 *   Application startup file = app.js   (file ini, di root app)
 *   Application root         = folder berisi server.js + .env + .next + node_modules
 */
const fs = require("node:fs");
const path = require("node:path");

// Muat .env (KEY=VALUE), tanpa menimpa env yang sudah di-set Passenger/cPanel.
(function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  let raw;
  try {
    raw = fs.readFileSync(envPath, "utf8");
  } catch {
    console.warn("[app] .env tidak ditemukan di", envPath, "- lanjut pakai process.env");
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    if (process.env[key] !== undefined) continue; // jangan timpa
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
})();

// Paksa bind ke 0.0.0.0 (mencakup loopback). server.js standalone memakai
// process.env.HOSTNAME sebagai alamat bind; bila OS/cPanel meng-set HOSTNAME ke
// nama mesin/FQDN, server bind ke alamat itu saja dan Passenger yang connect
// via 127.0.0.1:PORT gagal → app "tidak merespons". 0.0.0.0 menutup celah ini.
process.env.HOSTNAME = "0.0.0.0";

// Jalankan server standalone Next.js (ada di folder yang sama).
require("./server.js");
