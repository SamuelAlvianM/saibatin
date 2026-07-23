/**
 * Transisi masuk antar-halaman.
 *
 * template.tsx (bukan layout.tsx) dipakai karena template di-mount ulang tiap
 * navigasi, sehingga animasinya terpicu lagi di tiap perpindahan halaman.
 *
 * SENGAJA hanya opacity, tanpa transform: `transform` pada elemen leluhur
 * membuat containing block baru dan merusak `position: sticky` sidebar
 * dashboard. Durasinya pendek supaya navigasi tetap terasa gesit.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animasi-masuk-halaman">{children}</div>;
}
