import { InfoPage } from '@/components/shared/info-page';

export default function GisPage() {
  return (
    <InfoPage
      content={{
        title: 'GIS Dukcapil',
        description: 'Sistem Informasi Geografis data kependudukan Kabupaten Pesisir Barat.',
        body: [
          'GIS Dukcapil menampilkan persebaran data kependudukan secara geografis per kecamatan dan kelurahan/desa di Kabupaten Pesisir Barat.',
          'Modul GIS interaktif masih dalam pengembangan. Untuk peta lokasi kantor, silakan kunjungi halaman Peta.',
        ],
      }}
    />
  );
}
