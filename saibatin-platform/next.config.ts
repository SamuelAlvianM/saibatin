import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit butuh file font .afm-nya ikut ter-trace pada build produksi.
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
