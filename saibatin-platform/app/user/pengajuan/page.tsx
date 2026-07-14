import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Footer } from '@/components/shared/footer';
import { RiwayatList } from '@/components/shared/riwayat-list';
import { FilePlus2, ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * Halaman utama warga/OPD setelah login — tidak ada "dashboard":
 * langsung riwayat pengajuan + tombol ajukan permohonan & pengaturan akun.
 */
export default async function UserPengajuanPage() {
  const session = await getSession();
  if (!session) redirect('/login?redirect=/user/pengajuan');
  if (session.level <= 2) redirect('/dashboard'); // petugas tetap ke dashboard admin

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl glass-card-blue flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Pengajuan Saya
                </h1>
                <p className="text-primary-foreground/80 mt-0.5 text-sm">
                  Halo, {session.nama ?? session.userId} — pantau semua permohonan Anda di sini.
                </p>
              </div>
            </div>
            {/* Pengaturan Akun cukup lewat dropdown akun di navbar — tidak
                diduplikasi di sini. Ajukan Permohonan dipertahankan karena
                tidak ada di dropdown (satu-satunya jalur OPD ke form). */}
            <div className="flex gap-2 shrink-0">
              <Link
                href="/permohonan-online"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1b4b72] shadow-lg hover:bg-slate-100 transition-colors"
              >
                <FilePlus2 className="w-4 h-4" />
                Ajukan Permohonan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat langsung terbuka */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8 max-w-4xl">
        <RiwayatList />
      </div>

      <Footer />
    </div>
  );
}
