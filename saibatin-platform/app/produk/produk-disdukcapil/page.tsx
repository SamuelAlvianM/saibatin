import { ProdukDisdukcapilView } from '@/components/produk/produk-disdukcapil-view';

/**
 * Produk Disdukcapil — diport dari app lama (produk layanan Capil & Dafduk).
 * Route statis ini mengalahkan catch-all /produk/[...slug].
 * Konten (pengantar + daftar produk) editable via blok `produk.disdukcapil`.
 */
export default function ProdukDisdukcapilPage() {
  return <ProdukDisdukcapilView />;
}
