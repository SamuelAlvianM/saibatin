/**
 * Registry blok konten statis yang bisa diedit dari dashboard.
 * - `fields` menentukan bentuk form editor di /dashboard/konten.
 * - `defaults` dipakai sebagai fallback bila belum pernah diedit (tidak perlu seeding).
 * Komponen publik membaca via useStaticContent(kunci) — hasil merge DB + default.
 */

import {
  produkContent,
  ppidContent,
  wbsContent,
  hubungiKamiContent,
} from "@/lib/info-content";
import type { InfoPageContent } from "@/components/shared/info-page";
import { KARTU_STATISTIK_KUNCI, DEFAULT_KARTU } from "@/lib/beranda-statistik";

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
   *  (dropdown jabatan lain pada baris yang sama); `richtext` = editor teks
   *  berformat, nilainya HTML dan dirender apa adanya di halaman publik. */
  itemFields?: {
    name: string;
    label: string;
    type?: "text" | "image" | "icon" | "parent" | "richtext";
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

// ───────────────────────────────────────────────────────────────────────────
// Beranda — Kartu Statistik Demografi. Diedit lewat editor layar penuh khusus
// (bukan FieldEditor generik), jadi `fields` di sini hanya deskriptif. Default =
// susunan 6 kartu bawaan (lihat lib/beranda-statistik.ts).
// ───────────────────────────────────────────────────────────────────────────
STATIC_BLOCKS.push({
  kunci: KARTU_STATISTIK_KUNCI,
  judul: "Beranda — Kartu Statistik Demografi",
  deskripsi:
    "Judul, ikon, warna, dan sumber data (kategori + kolom) tiap kartu statistik di beranda.",
  fields: [{ name: "kartu", label: "Kartu Statistik", type: "items" }],
  defaults: { kartu: DEFAULT_KARTU },
});

// ───────────────────────────────────────────────────────────────────────────
// Produk Disdukcapil — diport dari app lama (fronts/products/productdisdukcapil).
// Data produk di app lama tersimpan di DB produksi; nama & gambar direkonstruksi
// dari aset asli (public/produk-layanan/*), deskripsi bisa disempurnakan dinas
// lewat mode edit / dashboard Konten Halaman.
// ───────────────────────────────────────────────────────────────────────────
STATIC_BLOCKS.push({
  kunci: "produk.disdukcapil",
  judul: "Produk — Produk Disdukcapil",
  deskripsi:
    "Pengantar + daftar produk layanan (gambar, nama, penjelasan) di halaman Produk Disdukcapil.",
  fields: [
    { name: "intro", label: "Paragraf Pengantar", type: "textarea" },
    {
      name: "produk",
      label: "Daftar Produk Layanan",
      type: "items",
      itemFields: [
        { name: "image", label: "Gambar", type: "image" },
        { name: "nama", label: "Nama Produk" },
        // Penjelasan berisi persyaratan berformat (daftar bernomor) hasil
        // migrasi portal lama — perlu richtext, bukan teks polos.
        { name: "desc", label: "Penjelasan & Persyaratan", type: "richtext" },
      ],
    },
  ],
  defaults: {
    intro:
      "Layanan Disdukcapil Pesisir Barat terdiri atas Layanan Pencatatan Sipil (Capil) dan Layanan Pendaftaran Penduduk (Dafduk). Pencatatan Sipil adalah pencatatan peristiwa penting yang dialami oleh seseorang dalam register pencatatan sipil pada Instansi Pelaksana; dokumen yang dicatat meliputi akta-akta serta catatan pinggir. Pendaftaran Penduduk adalah pencatatan biodata penduduk, pencatatan atas pelaporan peristiwa kependudukan dan pendataan penduduk rentan administrasi kependudukan, serta penerbitan dokumen penduduk berupa kartu identitas atau surat keterangan kependudukan.",
    produk: [
      {
        image: "/produk-layanan/kelahiran.png",
        nama: "Akta Kelahiran",
        desc: "Dokumen pencatatan resmi atas peristiwa kelahiran seseorang. Menjadi bukti sah identitas dan kewarganegaraan anak sejak lahir.",
      },
      {
        image: "/produk-layanan/kematian.png",
        nama: "Akta Kematian",
        desc: "Dokumen pencatatan resmi atas peristiwa kematian seseorang, diperlukan antara lain untuk pengurusan waris, asuransi, dan penataan data keluarga.",
      },
      {
        image: "/produk-layanan/perkawinan.png",
        nama: "Akta Perkawinan",
        desc: "Dokumen pencatatan perkawinan bagi penduduk non-muslim yang telah melangsungkan perkawinan sah menurut agama/kepercayaannya.",
      },
      {
        image: "/produk-layanan/perceraian.png",
        nama: "Akta Perceraian",
        desc: "Dokumen pencatatan perceraian berdasarkan putusan pengadilan yang telah berkekuatan hukum tetap.",
      },
      {
        image: "/produk-layanan/pengakuananak.png",
        nama: "Pengakuan & Pengesahan Anak",
        desc: "Pencatatan pengakuan anak oleh ayah biologis dan pengesahan anak setelah perkawinan sah orang tuanya.",
      },
      {
        image: "/produk-layanan/kutipankedua.png",
        nama: "Kutipan Kedua Akta",
        desc: "Penerbitan ulang kutipan akta pencatatan sipil (kelahiran, kematian, perkawinan, perceraian) yang hilang atau rusak.",
      },
      {
        image: "/produk-layanan/legalisasidokumen.png",
        nama: "Legalisasi Dokumen",
        desc: "Pengesahan fotokopi dokumen kependudukan dan akta pencatatan sipil agar sah digunakan untuk berbagai keperluan.",
      },
      {
        image: "/produk-layanan/suratketerangan.png",
        nama: "Surat Keterangan Kependudukan",
        desc: "Berbagai surat keterangan resmi terkait data kependudukan, misalnya surat keterangan pindah, domisili, atau pengganti identitas.",
      },
      {
        image: "/produk-layanan/catatanpinggir.png",
        nama: "Catatan Pinggir",
        desc: "Catatan resmi pada register dan kutipan akta atas perubahan peristiwa penting setelah akta diterbitkan.",
      },
      {
        image: "/produk-layanan/catatanpinggirperubahannama.png",
        nama: "Catatan Pinggir Perubahan Nama",
        desc: "Pencatatan perubahan nama berdasarkan penetapan pengadilan negeri pada register dan kutipan akta pencatatan sipil.",
      },
      {
        image: "/produk-layanan/catatanpinggirkewarganegaraan.png",
        nama: "Catatan Pinggir Perubahan Kewarganegaraan",
        desc: "Pencatatan perubahan status kewarganegaraan pada register dan kutipan akta pencatatan sipil.",
      },
      {
        image: "/produk-layanan/catatanpinggirpengangkatananak.png",
        nama: "Catatan Pinggir Pengangkatan Anak",
        desc: "Pencatatan pengangkatan anak berdasarkan penetapan pengadilan pada register dan kutipan akta kelahiran.",
      },
    ],
  },
});

// ───────────────────────────────────────────────────────────────────────────
// Kebijakan & Privasi — konten asli diport utuh dari app lama
// (fronts/kebijakanprivasis/index.blade.php), dirapikan ejaannya.
// ───────────────────────────────────────────────────────────────────────────
STATIC_BLOCKS.push({
  kunci: "info.kebijakan-privasi",
  judul: "Halaman — Kebijakan & Privasi",
  deskripsi: "Ketentuan umum dan ketentuan penggunaan aplikasi (halaman /kebijakan-privasi).",
  fields: [
    { name: "intro", label: "Kalimat Pembuka", type: "textarea" },
    { name: "umum", label: "Ketentuan Umum (per poin)", type: "list" },
    { name: "penggunaan", label: "Ketentuan Penggunaan Aplikasi (per poin)", type: "list" },
  ],
  defaults: {
    intro:
      "Terima kasih sudah menggunakan aplikasi SAIBATIN — Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat.",
    umum: [
      "Aplikasi ini merupakan peralihan dari layanan offline (di kantor) Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat.",
      "Pengunduhan dan/atau penggunaan aplikasi ini bebas biaya. Koneksi ke jaringan internet diperlukan untuk dapat menggunakan layanan ini; segala biaya yang timbul atas koneksi perangkat pemohon dengan jaringan internet sepenuhnya ditanggung oleh pemohon.",
      "Aplikasi ini dapat digunakan oleh pemohon dengan terlebih dahulu melakukan pendaftaran yang disertai pemberian informasi data pribadi pemohon sebagaimana diminta dalam aplikasi. Informasi data pribadi yang diberikan hanya akan digunakan untuk pemberian layanan dan tujuan lain yang dimuat dalam kebijakan privasi. Informasi tambahan wajib pemohon berikan untuk dapat menggunakan layanan tertentu dalam aplikasi.",
      "Aplikasi ini bertujuan memberikan informasi secara umum terkait produk dan layanan yang kami sediakan. Kami senantiasa berupaya menjaga kebenaran dan kekinian informasi tersebut, namun tidak membuat pernyataan dan jaminan apa pun, baik tersurat maupun tersirat, mengenai kelengkapan, akurasi, keandalan, kesesuaian, keamanan, kecepatan, maupun ketersediaan fitur, informasi, produk, layanan, gambar, atau grafis dalam aplikasi. Gambar, grafis, dan/atau foto dalam aplikasi mungkin tunduk pada hak kekayaan intelektual pihak ketiga.",
      "Penggunaan beberapa layanan tertentu dalam aplikasi mensyaratkan Anda memberikan akses pada kamera dan media penyimpanan; ini diperlukan untuk mempermudah kami memverifikasi kebenaran data yang Anda berikan.",
      "Aplikasi ini tidak terhubung ke database kependudukan; aplikasi ini hanya merupakan alat bantu dalam pencatatan proses registrasi.",
      "Kami memiliki kebijakan sendiri dan menyeluruh untuk menerima, menunda, atau menolak permintaan Anda atas layanan.",
    ],
    penggunaan: [
      "Anda menyatakan dan menjamin bahwa Anda adalah individu yang secara hukum berhak dan cakap berdasarkan hukum Negara Republik Indonesia untuk meminta layanan dari Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat serta menggunakan aplikasi ini. Apabila ketentuan tersebut tidak terpenuhi, kami berhak membatalkan setiap layanan yang Anda buat.",
      "Jika Anda mendaftar untuk dan atas nama suatu institusi, Anda menyatakan dan menjamin bahwa Anda berwenang bertindak untuk dan atas nama institusi tersebut dengan menunjukkan surat penunjukan.",
      "Kami mengumpulkan dan memproses data pribadi Anda seperti nama, alamat, nomor kartu identitas, nomor telepon, alamat surel, dan tanggal lahir saat Anda mendaftar dan menggunakan aplikasi. Anda wajib memberikan informasi yang akurat dan lengkap serta memperbaruinya dari waktu ke waktu, dan setuju memberikan bukti identitas yang secara wajar kami minta.",
      "Dalam hal terjadi penggunaan kata sandi akun Anda dengan cara apa pun yang bukan karena kesalahan kami dan mengakibatkan penggunaan tanpa kewenangan, permintaan yang dilakukan melalui aplikasi tetap dianggap permintaan yang sah, kecuali Anda memberitahu kami sebelum layanan diberikan.",
      "Anda wajib melaporkan kepada kami bila kehilangan kendali atas akun Anda. Anda bertanggung jawab atas setiap penggunaan akun Anda meskipun akun tersebut disalahgunakan pihak lain.",
      "Anda dapat mengunggah informasi, foto, penilaian, dan komentar pada fitur dalam aplikasi. Anda dilarang mengunggah konten bermuatan SARA, pornografi, atau pelanggaran hak kekayaan intelektual. Kami berhak menghapus atau memblokir unggahan maupun akun yang melanggar ketentuan penggunaan.",
      "Anda tidak diperkenankan membahayakan, menyalahgunakan, mengubah, atau memodifikasi aplikasi dengan cara apa pun. Kami berhak menghentikan penggunaan akun Anda bila aplikasi digunakan tanpa mematuhi ketentuan penggunaan.",
      "Anda hanya diizinkan menggunakan aplikasi ini untuk layanan yang disediakan dan keperluan lain sesuai peraturan perundang-undangan. Anda dilarang menggunakan aplikasi untuk penipuan dalam bentuk apa pun, membuat ketidaknyamanan terhadap pihak lain, menyalahgunakan informasi yang diperoleh dari layanan, serta melecehkan atau mengancam pihak penyedia layanan.",
      "Anda memahami dan setuju bahwa penggunaan aplikasi tunduk pula pada kebijakan privasi kami yang dapat diubah dari waktu ke waktu; dengan menggunakan aplikasi, Anda dianggap memberikan persetujuan atas kebijakan privasi tersebut.",
      "Anda dilarang menggunakan layanan dalam aplikasi untuk hal-hal yang dilarang oleh hukum dan peraturan perundang-undangan yang berlaku.",
    ],
  },
});

// ───────────────────────────────────────────────────────────────────────────
// Halaman info (Produk / PPID / WBS / Hubungi Kami) — SEMUA jadi editable.
// Blok digenerate dari lib/info-content.ts (default awal), kunci =
// info.<seksi>.<slug>; halaman publik membaca merge DB+default lewat
// EditableInfoPage. Tautan (links) sengaja tidak ikut diedit.
// ───────────────────────────────────────────────────────────────────────────
const INFO_SECTIONS: {
  seksi: string;
  label: string;
  content: Record<string, InfoPageContent>;
}[] = [
  { seksi: "produk", label: "Produk", content: produkContent },
  { seksi: "ppid", label: "PPID", content: ppidContent },
  { seksi: "wbs", label: "WBS", content: wbsContent },
  { seksi: "hubungi-kami", label: "Hubungi Kami", content: hubungiKamiContent },
];

for (const { seksi, label, content } of INFO_SECTIONS) {
  for (const [slug, c] of Object.entries(content)) {
    // Punya halaman & blok khusus (produk.disdukcapil) — jangan digandakan.
    if (seksi === "produk" && slug === "produk-disdukcapil") continue;
    STATIC_BLOCKS.push({
      kunci: `info.${seksi}.${slug}`,
      judul: `${label} — ${c.title}`,
      deskripsi: `Konten halaman /${seksi}/${slug}.`,
      fields: [
        { name: "title", label: "Judul Halaman", type: "text" },
        { name: "description", label: "Deskripsi Singkat", type: "textarea" },
        { name: "body", label: "Paragraf Isi", type: "list" },
        { name: "list", label: "Daftar Poin", type: "list" },
      ],
      defaults: {
        title: c.title,
        description: c.description,
        body: c.body ?? [],
        list: c.list ?? [],
      },
    });
  }
}

/** Kunci blok untuk halaman info /<seksi>/<slug>. */
export function infoBlockKey(seksi: string, slug: string) {
  return `info.${seksi}.${slug}`;
}

export function getStaticBlock(kunci: string): StaticBlock | undefined {
  return STATIC_BLOCKS.find((b) => b.kunci === kunci);
}

export function getStaticDefaults(kunci: string): Record<string, unknown> {
  return getStaticBlock(kunci)?.defaults ?? {};
}
