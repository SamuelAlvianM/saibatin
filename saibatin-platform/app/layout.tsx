import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import { KunjunganPing } from "@/components/shared/kunjungan-ping";
import { Providers } from "./providers";
import { A11Y_INIT_SCRIPT } from "@/lib/a11y";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "SAIBATIN - Disdukcapil Pesisir Barat",
  description:
    "Portal layanan administrasi kependudukan & pencatatan sipil Kabupaten Pesisir Barat (SAIBATIN).",
  openGraph: {
    title: "SAIBATIN - Disdukcapil Pesisir Barat",
    description:
      "Portal layanan administrasi kependudukan & pencatatan sipil Kabupaten Pesisir Barat (SAIBATIN).",
    siteName: "Portal SAIBATIN",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-saibatin.png",
        width: 1200,
        height: 630,
        alt: "Logo Disdukcapil Kabupaten Pesisir Barat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAIBATIN - Disdukcapil Pesisir Barat",
    images: ["/og-saibatin.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={[
        geistSans.variable,
        geistMono.variable,
        cormorant.variable,
        montserrat.variable,
      ].join(" ")}
    >
      <head>
        {/* Terapkan preferensi aksesibilitas tersimpan SEBELUM paint
            (anti-flicker) — baca localStorage, set kelas/style di <html>. */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT_SCRIPT }} />
      </head>
      <body className={geistSans.className}>
        <a href="#konten-utama" className="skip-to-content">
          Lompat ke konten utama
        </a>
        <Providers>
          <KunjunganPing />
          <Navbar />
          <main id="konten-utama">{children}</main>
        </Providers>
      </body>
    </html>
  );
}