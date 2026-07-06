import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const JENIS = [
  ["AKTA_KELAHIRAN_NIK_ADA", "Akta Kelahiran (NIK Sudah Ada)", "CAPIL"],
  ["AKTA_KELAHIRAN_NIK_BLM_ADA", "Akta Kelahiran (NIK Belum Ada)", "CAPIL"],
  ["AKTA_NIKAH", "Akta Perkawinan/Nikah", "CAPIL"],
  ["AKTA_KEMATIAN", "Akta Kematian", "CAPIL"],
  ["AKTA_PERCERAIAN", "Akta Perceraian", "CAPIL"],
  ["KIA", "Kartu Identitas Anak (KIA)", "CAPIL"],
  ["KTP_EL", "KTP Elektronik", "DAFDUK"],
  ["PINDAH", "Surat Keterangan Pindah", "DAFDUK"],
  ["KEDATANGAN", "Surat Keterangan Kedatangan", "DAFDUK"],
  ["KONSOLIDASI", "Konsolidasi/Update Data", "DAFDUK"],
  ["KK_TAMBAH_ANAK", "KK - Tambah Anak", "DAFDUK"],
  ["KK_PISAH", "KK - Pisah KK", "DAFDUK"],
  ["KK_NUMPANG", "KK - Numpang KK", "DAFDUK"],
  ["KK_UBAH_BIODATA", "KK - Perubahan Biodata", "DAFDUK"],
  ["KK_CETAK_ULANG", "KK - Cetak Ulang", "DAFDUK"],
  ["SAKINAH", "Kartu Keluarga Sakinah", "CAPIL"],
  ["PENCETAKAN_KTP", "Pencetakan KTP", "DAFDUK"],
];

async function main() {
  console.log("🌱 Seeding...");

  // Level
  await prisma.userLevel.createMany({
    data: [
      { id: 1, nama: "Super Admin" },
      { id: 2, nama: "Operator" },
      { id: 3, nama: "Warga" },
      { id: 4, nama: "Operator OPD" }, // instansi pemerintah daerah (istilah legacy)
    ],
    skipDuplicates: true,
  });

  // Akun demo (status aktif)
  const adminPass = await bcrypt.hash("admin123", 10);
  const wargaPass = await bcrypt.hash("warga123", 10);
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: "admin",
      password: adminPass,
      userlevelId: 1,
      userFullname: "Administrator",
      userEmail: "admin@saibatin.local",
      status: 1,
      activationTime: new Date(),
    },
  });
  await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: "1813010101900001",
      password: wargaPass,
      userlevelId: 3,
      userFullname: "Budi Warga",
      userNik: "1813010101900001",
      userNokk: "1813010101900002",
      userHp: "081234567890",
      userEmail: "budi@example.com",
      status: 1,
      activationTime: new Date(),
    },
  });

  // Jenis permohonan
  for (let i = 0; i < JENIS.length; i++) {
    const [kode, nama, kategori] = JENIS[i];
    await prisma.jenisPermohonan.upsert({
      where: { kode },
      update: { nama, kategori, urutan: i },
      create: { kode, nama, kategori, urutan: i },
    });
  }

  // Wilayah contoh (kecamatan + kelurahan)
  const kec = await prisma.wilayah.upsert({
    where: { kode: "1813010" },
    update: {},
    create: { kode: "1813010", nama: "Pesisir Tengah", jenis: "KECAMATAN" },
  });
  await prisma.wilayah.upsert({
    where: { kode: "1813010001" },
    update: {},
    create: { kode: "1813010001", nama: "Pasar Krui", jenis: "KELURAHAN", parentId: kec.id },
  });

  // Berita contoh
  await prisma.news.upsert({
    where: { slug: "pelayanan-adminduk-online" },
    update: {},
    create: {
      judul: "Pelayanan Adminduk Kini Bisa Online",
      slug: "pelayanan-adminduk-online",
      kategori: "Pengumuman",
      ringkasan: "Warga dapat mengajukan permohonan dokumen kependudukan secara daring.",
      konten: "<p>Disdukcapil Pesisir Barat meluncurkan layanan SAIBATIN...</p>",
      penulis: "Admin",
      publish: true,
    },
  });

  // Pengaduan contoh
  await prisma.pengaduan.create({
    data: {
      nama: "Siti",
      email: "siti@example.com",
      subjek: "Antrian lama",
      isi: "Mohon penambahan loket pelayanan.",
    },
  });

  console.log("✅ Seed selesai. Login demo: admin/admin123 atau 1813010101900001/warga123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
