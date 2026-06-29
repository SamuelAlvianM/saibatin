/**
 * Konfigurasi situs terpusat — hasil mapping dari APP_SITE_* di Laravel .env.
 * Semua nilai berasal dari NEXT_PUBLIC_* sehingga aman dipakai di client & server.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "saibatin",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://saibatin.pesisirbaratkab.go.id",
  kode: process.env.NEXT_PUBLIC_APP_KODE ?? "1813",

  tenant: process.env.NEXT_PUBLIC_SITE_TENANT ?? "disdukcapil",
  tenant2: process.env.NEXT_PUBLIC_SITE_TENANT2 ?? "dinas dukcapil",
  namaFull: process.env.NEXT_PUBLIC_SITE_NAME_FULLNAME ?? "pesisir barat",
  namaNick: process.env.NEXT_PUBLIC_SITE_NAME_NICKNAME ?? "pesisirbarat",
  namaFamous: process.env.NEXT_PUBLIC_SITE_NAME_FAMOUS ?? "saibatin",
  namaKet: process.env.NEXT_PUBLIC_SITE_NAME_KET ?? "pelayanan",

  navbarBgColor: process.env.NEXT_PUBLIC_SITE_NAVBAR_BGCOLOR ?? "rgb(0 114 184 / 70%)",
  navbarTextShadow: process.env.NEXT_PUBLIC_SITE_NAVBAR_TEXTSHADOW ?? "1px 1px 30px #000",
  version: process.env.NEXT_PUBLIC_SITE_VERSION ?? "",
  copyrightYear: process.env.NEXT_PUBLIC_SITE_COPYRIGHT_YEAR ?? "2024",
  poweredBy: process.env.NEXT_PUBLIC_SITE_POWEREDBY ?? "",

  maps: {
    alamatEmbed: process.env.NEXT_PUBLIC_SITE_MAPS_ALAMAT_EMBED ?? "",
    alamatKet: process.env.NEXT_PUBLIC_SITE_MAPS_ALAMAT_KET ?? "",
    gisJson: process.env.NEXT_PUBLIC_SITE_MAPS_GIS_JSON ?? "",
  },

  relasi: {
    lpse: process.env.NEXT_PUBLIC_SITE_RELASI_LPSE ?? "",
    dinas: process.env.NEXT_PUBLIC_SITE_RELASI_DINAS ?? "",
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "",
    gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAGMANAGER_ID ?? "",
    siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION_ID ?? "",
  },

  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
} as const;

export type SiteConfig = typeof siteConfig;
