export interface Relasi {
  nama: string;
  logo: string; // path PNG/SVG asli di /public/relasi/
  href: string;
}

export const relasiTerkait: Relasi[] = [
  { nama: 'Dinas Kependudukan dan Pencatatan Sipil', logo: '/relasi/dinas.png', href: 'https://pesisirbaratkab.go.id' },
  { nama: 'Kementerian Dalam Negeri', logo: '/relasi/kemendagri.png', href: 'https://kemendagri.go.id' },
  { nama: 'LPSE Pesisir Barat', logo: '/relasi/lpse.png', href: 'https://lpse.pesisirbaratkab.go.id' },
  { nama: 'LAPOR!', logo: '/relasi/lapor.png', href: 'https://www.lapor.go.id' },
  { nama: 'Ombudsman RI', logo: '/relasi/ombudsman.jpg', href: 'https://ombudsman.go.id' },
  { nama: 'KemenPAN-RB', logo: '/relasi/panrb.png', href: 'https://menpan.go.id' },
  { nama: 'Kota Tanpa Kumuh', logo: '/relasi/kotaku.png', href: 'https://kotaku.pu.go.id' },
  { nama: 'SIAPP', logo: '/relasi/siapp.svg', href: '#' },
];
