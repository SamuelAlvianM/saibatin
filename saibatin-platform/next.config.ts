import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
