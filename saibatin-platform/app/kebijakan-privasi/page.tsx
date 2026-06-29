import { InfoPage } from '@/components/shared/info-page';

export default function KebijakanPrivasiPage() {
  return (
    <InfoPage
      content={{
        title: 'Kebijakan & Privasi',
        description: 'Kebijakan penggunaan data dan privasi pengguna portal SAIBATIN.',
        body: [
          'Portal SAIBATIN (Disdukcapil Pesisir Barat) mengumpulkan data pribadi (NIK, KK, data kontak) hanya untuk keperluan layanan administrasi kependudukan.',
          'Data yang Anda masukkan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan, kecuali diwajibkan oleh peraturan perundang-undangan.',
          'Kami menerapkan langkah keamanan teknis dan administratif untuk melindungi data pribadi yang tersimpan dalam sistem ini.',
        ],
      }}
    />
  );
}
