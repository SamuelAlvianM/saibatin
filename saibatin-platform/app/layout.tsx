import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "SAIBATIN - Disdukcapil Pesisir Barat",
  description:
    "Portal layanan administrasi kependudukan & pencatatan sipil Kabupaten Pesisir Barat (SAIBATIN).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={[
        geistSans.variable,
        geistMono.variable,
        cormorant.variable,
        montserrat.variable,
      ].join(" ")}
    >
      <body className={geistSans.className}>
        <a href="#konten-utama" className="skip-to-content">
          Lompat ke konten utama
        </a>
        <Providers>
          <Navbar />
          <main id="konten-utama">{children}</main>
        </Providers>
      </body>
    </html>
  );
}