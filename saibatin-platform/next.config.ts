import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build self-contained (server.js + node_modules ter-trace) untuk deploy ke VPS
  // via PM2 tanpa mengirim source/`npm install` di server.
  output: "standalone",
  // tesseract.js & sharp memuat worker/binary native sendiri — jangan di-bundle
  // oleh Turbopack (kalau di-bundle, resolusi path worker rusak → OCR menggantung).
  // pdfkit membaca font .afm-nya via `fs.readFileSync(__dirname + '/data/…afm')`;
  // kalau di-bundle, __dirname menunjuk ke chunk .next dan file tak ketemu →
  // route PDF melempar 500 → unduhan "gelap"/kosong. Jadikan eksternal supaya
  // di-require dari node_modules dengan __dirname yang benar.
  serverExternalPackages: ["tesseract.js", "sharp", "pdfkit"],
  // Selain eksternal, pastikan file font .afm ikut ter-trace ke output standalone
  // (dirujuk lewat string dinamis sehingga tidak terdeteksi tracer otomatis).
  outputFileTracingIncludes: {
    "/api/permohonan/[id]/pdf": ["./node_modules/pdfkit/js/data/*.afm"],
  },
  // Izinkan gambar dari domain backend Laravel (storage publik) bila diperlukan.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saibatin.pesisirbaratkab.go.id",
      },
    ],
  },
};

export default nextConfig;
