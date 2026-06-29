import { InfoPage } from '@/components/shared/info-page';

export default function SyaratPage() {
  return (
    <InfoPage
      content={{
        title: 'Syarat & Ketentuan',
        description: 'Syarat dan ketentuan penggunaan portal layanan SAIBATIN.',
        list: [
          'Pengguna wajib mengisi data yang benar dan sesuai dengan dokumen resmi.',
          'Permohonan dengan data palsu dapat dibatalkan sepihak oleh Disdukcapil.',
          'Layanan permohonan online tidak dipungut biaya (gratis).',
          'Disdukcapil berhak memverifikasi ulang data pemohon sebelum dokumen diterbitkan.',
        ],
      }}
    />
  );
}
