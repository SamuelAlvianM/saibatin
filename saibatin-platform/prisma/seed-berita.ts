import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const BERITA = [
  {
    judul: 'Permohonan Adminduk Kini Bisa Diajukan Online',
    kategori: 'Pengumuman',
    ringkasan: 'Masyarakat Kabupaten Pesisir Barat kini dapat mengajukan berbagai dokumen kependudukan secara online melalui portal SAIBATIN, tanpa perlu datang ke kantor.',
    konten: `<p>Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil) Kabupaten Pesisir Barat menghadirkan layanan permohonan administrasi kependudukan secara daring melalui portal SAIBATIN. Melalui layanan ini, masyarakat dapat mengajukan lebih dari 15 jenis dokumen — mulai dari Kartu Keluarga, KTP-el, Akta Kelahiran, Akta Kematian, hingga surat pindah datang — cukup dari rumah.</p><p>Seluruh proses permohonan tidak dipungut biaya sesuai dengan prinsip pelayanan publik yang mudah, cepat, dan gratis. Warga cukup membuat akun, mengisi formulir sesuai jenis dokumen yang dibutuhkan, mengunggah berkas persyaratan, lalu memantau statusnya secara real-time melalui menu Riwayat Permohonan.</p>`,
    gambar: '/uploads/berita/adminduk-online.jpg',
    publish: true,
  },
  {
    judul: 'Jemput Bola Perekaman KTP-el untuk Warga Lanjut Usia',
    kategori: 'Kegiatan',
    ringkasan: 'Disdukcapil Pesisir Barat rutin menjalankan program jemput bola perekaman KTP-el bagi warga lanjut usia yang kesulitan datang ke kantor pelayanan.',
    konten: `<p>Sebagai bentuk komitmen pelayanan yang inklusif, Disdukcapil Kabupaten Pesisir Barat secara berkala melaksanakan kegiatan perekaman KTP-el keliling yang menyasar warga lanjut usia. Petugas mendatangi langsung kediaman warga untuk melakukan proses perekaman data biometrik, sehingga lansia tidak perlu menempuh perjalanan jauh menuju kantor kecamatan atau kabupaten.</p><p>Program jemput bola ini merupakan bagian dari upaya percepatan cakupan kepemilikan dokumen kependudukan di seluruh pekon (desa) se-Kabupaten Pesisir Barat.</p>`,
    gambar: '/uploads/berita/jemput-bola-lansia.jpg',
    publish: true,
  },
  {
    judul: 'Layanan Perekaman KTP-el Keliling untuk Penyandang Disabilitas',
    kategori: 'Kegiatan',
    ringkasan: 'Petugas Disdukcapil mendatangi langsung warga penyandang disabilitas untuk memastikan hak administrasi kependudukan tetap terpenuhi.',
    konten: `<p>Disdukcapil Kabupaten Pesisir Barat berkomitmen memastikan tidak ada warga yang tertinggal dalam pendataan kependudukan, termasuk penyandang disabilitas. Melalui program perekaman keliling, petugas mendatangi langsung rumah-rumah warga untuk melakukan perekaman KTP-el bagi mereka yang memiliki keterbatasan mobilitas.</p><p>Layanan ini sejalan dengan semangat pelayanan publik yang ramah dan setara bagi seluruh lapisan masyarakat Pesisir Barat.</p>`,
    gambar: '/uploads/berita/perekaman-disabilitas.jpg',
    publish: true,
  },
  {
    judul: 'Pelayanan Langsung Akta Pencatatan Sipil di Pekon Marang',
    kategori: 'Kegiatan',
    ringkasan: 'Tim Disdukcapil turun langsung ke Pekon Marang, Kecamatan Ngambur, untuk melayani permohonan akta pencatatan sipil warga setempat.',
    konten: `<p>Dalam rangka mendekatkan layanan kepada masyarakat, Disdukcapil Kabupaten Pesisir Barat menggelar pelayanan langsung akta pencatatan sipil di Pekon Marang, Kecamatan Ngambur. Warga dapat mengurus akta kelahiran, akta kematian, maupun dokumen pencatatan sipil lainnya tanpa harus menempuh perjalanan ke ibu kota kabupaten.</p><p>Kegiatan pelayanan jemput bola semacam ini rutin dijadwalkan bergiliran ke kecamatan-kecamatan lain di wilayah Pesisir Barat.</p>`,
    gambar: '/uploads/berita/akta-pekon-marang.jpg',
    publish: true,
  },
  {
    judul: 'Perekaman KTP-el Keliling di Pekon Kuripan, Pesisir Utara',
    kategori: 'Kegiatan',
    ringkasan: 'Kantor Peratin Pekon Kuripan menjadi lokasi kegiatan perekaman KTP-el keliling bagi warga Kecamatan Pesisir Utara.',
    konten: `<p>Disdukcapil Kabupaten Pesisir Barat bekerja sama dengan perangkat pekon menggelar kegiatan perekaman KTP-el keliling di Kantor Peratin Pekon Kuripan, Kecamatan Pesisir Utara. Kegiatan ini bertujuan mempercepat cakupan perekaman KTP-el bagi wajib KTP yang belum sempat melakukan perekaman di kantor pelayanan kabupaten.</p><p>Warga cukup membawa fotokopi Kartu Keluarga dan datang ke lokasi sesuai jadwal yang diinformasikan oleh perangkat pekon setempat.</p>`,
    gambar: '/uploads/berita/perekaman-pekon-kuripan.jpg',
    publish: true,
  },
  {
    judul: 'Tips Menyiapkan Berkas Sebelum Mengajukan Permohonan Online',
    kategori: 'Tips',
    ringkasan: 'Agar proses verifikasi lebih cepat, pastikan berkas persyaratan sudah lengkap dan sesuai format sebelum mengajukan permohonan melalui SAIBATIN.',
    konten: `<p>Sebelum mengajukan permohonan dokumen kependudukan secara online, ada beberapa hal yang perlu disiapkan agar proses verifikasi oleh petugas berjalan lebih cepat:</p><ul><li>Pastikan berkas discan atau difoto dengan jelas, tidak buram, dan seluruh bagian dokumen terlihat.</li><li>Format berkas yang diterima adalah JPG, PNG, atau PDF dengan ukuran maksimal 5MB.</li><li>Periksa kembali data yang diisi pada formulir sudah sesuai dengan dokumen pendukung.</li><li>Pantau status permohonan secara berkala melalui menu Riwayat agar dapat segera melengkapi berkas apabila diminta petugas.</li></ul><p>Dengan berkas yang lengkap sejak awal, proses permohonan dapat diselesaikan lebih cepat tanpa bolak-balik revisi.</p>`,
    gambar: '/uploads/berita/tips-persyaratan.jpg',
    publish: true,
  },
];

async function main() {
  for (const b of BERITA) {
    const root = slugify(b.judul);
    let slug = root;
    let n = 1;
    while (await prisma.news.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${root}-${n}`;
    }
    const created = await prisma.news.create({
      data: { ...b, slug, penulis: 'Admin SAIBATIN' },
    });
    console.log(`✓ ${created.judul} (${created.slug})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
