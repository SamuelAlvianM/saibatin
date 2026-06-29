import { InfoPage } from '@/components/shared/info-page';

export default function PrivasiPage() {
  return (
    <InfoPage
      content={{
        title: 'Privasi',
        description: 'Informasi privasi data pengguna pada portal SAIBATIN.',
        body: [
          'Lihat detail lengkap kebijakan privasi kami pada halaman Kebijakan & Privasi.',
        ],
      }}
    />
  );
}
