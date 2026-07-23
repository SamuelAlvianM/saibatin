/**
 * Startup file untuk cPanel (Phusion Passenger).
 *
 * cPanel "Setup Node.js App":
 *   - Application root      : folder project ini
 *   - Application startup file : server.js
 *   - Application mode      : Production
 *
 * Passenger meng-inject PORT (dan kadang HOSTNAME) lewat environment; aplikasi
 * WAJIB listen ke process.env.PORT. Jangan hard-code port.
 *
 * Catatan: project ini pakai `output: "standalone"` (lihat next.config.ts).
 * File ini memakai custom server berbasis paket `next`, jadi PASTIKAN di server
 * sudah dijalankan `npm install` (full) + `npm run build` sebelum start.
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl).catch((err) => {
        console.error("Error menangani request", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      });
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Saibatin siap di http://${hostname}:${port} (dev=${dev})`);
    });
  })
  .catch((err) => {
    console.error("Gagal mempersiapkan Next.js", err);
    process.exit(1);
  });
