/**
 * Registry blok konten statis yang bisa diedit dari dashboard.
 * - `fields` menentukan bentuk form editor di /dashboard/konten.
 * - `defaults` dipakai sebagai fallback bila belum pernah diedit (tidak perlu seeding).
 * Komponen publik membaca via useStaticContent(kunci) — hasil merge DB + default.
 */

export type StaticFieldType =
  | "text"
  | "textarea"
  | "list"
  | "richtext"
  | "items";

export interface StaticField {
  name: string;
  label: string;
  type: StaticFieldType;
  /** Untuk type "items": definisi kolom tiap baris.
   *  `image` = pemilih gambar; `icon` = pemilih ikon; `parent` = pilih atasan
   *  (dropdown jabatan lain pada baris yang sama). */
  itemFields?: {
    name: string;
    label: string;
    type?: "text" | "image" | "icon" | "parent";
  }[];
  placeholder?: string;
}

export interface StaticBlock {
  kunci: string;
  judul: string;
  deskripsi: string;
  fields: StaticField[];
  defaults: Record<string, unknown>;
}

export const STATIC_BLOCKS: StaticBlock[] = [
  {
    kunci: "beranda.hero",
    judul: "Beranda — Hero",
    deskripsi:
      "Judul besar, sub-judul, dan teks pencarian di bagian atas beranda.",
    fields: [
      { name: "heading", label: "Judul Utama", type: "text" },
      { name: "subheading", label: "Sub-judul", type: "textarea" },
      {
        name: "searchPlaceholder",
        label: "Placeholder Pencarian",
        type: "text",
      },
    ],
    defaults: {
      heading: "Layanan Kependudukan Kabupaten Pesisir Barat",
      subheading:
        "Urus akta kelahiran, KTP-el, Kartu Keluarga, dan layanan kependudukan lainnya secara online — cepat, mudah, dan gratis.",
      searchPlaceholder: "Mau mengurus apa hari ini?",
    },
  },
  {
    kunci: "profil.visi-misi",
    judul: "Profil — Visi & Misi",
    deskripsi: "Visi dan daftar misi dinas.",
    fields: [
      { name: "visi", label: "Visi", type: "textarea" },
      { name: "misi", label: "Daftar Misi", type: "list" },
    ],
    defaults: {
      visi: "Terwujudnya Pusat Pelayanan Data Base Kependudukan yang Akurat dan Aktual Berbasis Sistem Informasi Administrasi Kependudukan",
      misi: [
        "Meningkatkan profesionalitas, efisiensi dan efektifitas organisasi",
        "Mengoptimalkan dan meningkatkan pengelolaan administrasi kependudukan",
        "Meningkatkan kualitas kinerja pelayanan administrasi kependudukan secara prima",
      ],
    },
  },
  {
    kunci: "profil.motto",
    judul: "Profil — Motto & Tujuan",
    deskripsi: "Motto pelayanan, tujuan, dan sasaran strategis.",
    fields: [
      { name: "motto", label: "Motto", type: "text" },
      { name: "tujuan", label: "Daftar Tujuan", type: "list" },
      { name: "sasaran", label: "Daftar Sasaran", type: "list" },
    ],
    defaults: {
      motto: "Profesional, Integritas, Prima",
      tujuan: [
        "Memberikan pelayanan kependudukan yang cepat, tepat, dan akurat",
        "Mewujudkan database kependudukan yang berkualitas dan terintegrasi",
        "Meningkatkan kepuasan masyarakat melalui pelayanan berbasis teknologi",
      ],
      sasaran: [
        "Tersedianya data kependudukan yang akurat dan mutakhir",
        "Terwujudnya pelayanan administrasi kependudukan yang prima",
        "Terbangunnya sistem informasi kependudukan yang terintegrasi",
      ],
    },
  },
  {
    kunci: "profil.maklumat",
    judul: "Profil — Maklumat Pelayanan",
    deskripsi: "Janji pelayanan (4 kartu) dan pernyataan standar pelayanan.",
    fields: [
      {
        name: "janji",
        label: "Janji Pelayanan",
        type: "items",
        itemFields: [
          { name: "icon", label: "Ikon", type: "icon" },
          { name: "title", label: "Judul" },
          { name: "desc", label: "Keterangan" },
        ],
      },
      { name: "standar", label: "Pernyataan Standar", type: "textarea" },
    ],
    defaults: {
      janji: [
        { icon: "Clock", title: "Cepat", desc: "15 menit" },
        { icon: "ShieldCheck", title: "Akurat", desc: "Data valid" },
        { icon: "Gift", title: "Gratis", desc: "Tanpa biaya" },
        { icon: "Smile", title: "Ramah", desc: "Sikap prima" },
      ],
      standar:
        "Kami berkomitmen memberikan pelayanan terbaik sesuai Standar Pelayanan Publik",
    },
  },
  {
    kunci: "profil.tugas",
    judul: "Profil — Tugas & Fungsi",
    deskripsi: "Tugas utama dan daftar fungsi dinas.",
    fields: [
      { name: "utama", label: "Tugas Utama", type: "textarea" },
      { name: "fungsi", label: "Daftar Fungsi", type: "list" },
    ],
    defaults: {
      utama:
        "Melaksanakan urusan pemerintahan bidang kependudukan dan pencatatan sipil",
      fungsi: [
        "Penyelenggaraan administrasi kependudukan",
        "Pelayanan pencatatan sipil",
        "Pengelolaan data dan informasi kependudukan",
        "Pelaksanaan identifikasi kependudukan",
        "Fasilitasi perpindahan penduduk",
      ],
    },
  },
  {
    kunci: "profil.struktur",
    judul: "Profil — Struktur Organisasi",
    deskripsi:
      "Bagan struktur. Kolom 'Atasan' menentukan garis: pilih jabatan di atasnya. Biarkan kosong untuk jabatan paling atas (Kepala).",
    fields: [
      {
        name: "organisasi",
        label: "Susunan Organisasi",
        type: "items",
        itemFields: [
          { name: "jabatan", label: "Jabatan" },
          { name: "nama", label: "Nama Pejabat" },
          { name: "parent", label: "Atasan", type: "parent" },
        ],
      },
    ],
    defaults: {
      organisasi: [
        { jabatan: "Kepala Dinas", nama: "-", parent: "" },
        { jabatan: "Sekretaris", nama: "-", parent: "Kepala Dinas" },
        { jabatan: "Bidang Pelayanan Pendaftaran Penduduk", nama: "-", parent: "Kepala Dinas" },
        { jabatan: "Bidang Pelayanan Pencatatan Sipil", nama: "-", parent: "Kepala Dinas" },
        { jabatan: "Bidang Pengelolaan Informasi Administrasi Kependudukan", nama: "-", parent: "Kepala Dinas" },
      ],
    },
  },
  {
    kunci: "beranda.carousel",
    judul: "Beranda — Carousel Hero",
    deskripsi:
      "Slide gambar besar di beranda. Isi gambar + judul + sub-judul. Jika dikosongkan, beranda memakai slide bawaan.",
    fields: [
      {
        name: "slides",
        label: "Slide",
        type: "items",
        itemFields: [
          { name: "image", label: "Gambar", type: "image" },
          { name: "title", label: "Judul" },
          { name: "subtitle", label: "Sub-judul" },
        ],
      },
    ],
    defaults: { slides: [] },
  },
  {
    kunci: "beranda.tentang",
    judul: "Beranda — Tentang Dinas",
    deskripsi: "Paragraf perkenalan dinas (teks bebas, mendukung format).",
    fields: [{ name: "html", label: "Isi", type: "richtext" }],
    defaults: {
      html: "<p>Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat melayani administrasi kependudukan: KTP elektronik, Kartu Keluarga, akta kelahiran, akta kematian, perpindahan penduduk, dan layanan lainnya.</p>",
    },
  },
];

export function getStaticBlock(kunci: string): StaticBlock | undefined {
  return STATIC_BLOCKS.find((b) => b.kunci === kunci);
}

export function getStaticDefaults(kunci: string): Record<string, unknown> {
  return getStaticBlock(kunci)?.defaults ?? {};
}
