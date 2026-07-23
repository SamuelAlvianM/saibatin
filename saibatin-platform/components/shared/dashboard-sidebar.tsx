'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NotificationBell } from '@/components/shared/notification-bell';
import {
  LayoutDashboard,
  ClipboardList,
  Newspaper,
  MessageSquare,
  FolderOpen,
  Gauge,
  Users,
  FilePlus2,
  FileText,
  MessagesSquare,
  Images,
  BarChart3,
  ScrollText,
  Home,
  LogOut,
  Loader2,
  ChevronLeft,
  LayoutGrid,
  User as UserIcon,
  X,
  type LucideIcon,
} from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

// Menu dashboard dikelompokkan menjadi beberapa kategori besar.
const GROUPS: MenuGroup[] = [
  {
    items: [{ href: '/dashboard', label: 'Statistik Rekap', icon: LayoutDashboard, exact: true }],
  },
  {
    title: 'Layanan',
    items: [
      { href: '/dashboard/pengajuan-baru', label: 'Pengajuan Baru', icon: FilePlus2 },
      { href: '/dashboard/permohonan', label: 'Permohonan', icon: ClipboardList },
    ],
  },
  {
    title: 'Konten & Media',
    items: [
      { href: '/dashboard/konten', label: 'Konten Halaman', icon: FileText },
      { href: '/dashboard/berita', label: 'Berita', icon: Newspaper },
      { href: '/dashboard/media', label: 'Pustaka Media', icon: Images },
      { href: '/dashboard/produk', label: 'Dokumen Publikasi', icon: FolderOpen },
      { href: '/dashboard/demografi', label: 'Data Demografi', icon: BarChart3 },
    ],
  },
  {
    title: 'Aspirasi Warga',
    items: [
      { href: '/dashboard/pengaduan', label: 'Pengaduan', icon: MessageSquare },
      { href: '/dashboard/kritik-saran', label: 'Kritik & Saran', icon: MessagesSquare },
      { href: '/dashboard/skm', label: 'SKM & IKM', icon: Gauge },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { href: '/dashboard/users', label: 'Manajemen Akun', icon: Users },
      { href: '/dashboard/log', label: 'Log Aktivitas', icon: ScrollText },
    ],
  },
];

// Item utama di bottom-bar mobile (sisanya lewat tombol "Menu").
const MOBILE_MAIN: MenuItem[] = [
  { href: '/dashboard', label: 'Statistik', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/permohonan', label: 'Permohonan', icon: ClipboardList },
  { href: '/dashboard/konten', label: 'Konten', icon: FileText },
  { href: '/dashboard/pengaduan', label: 'Pengaduan', icon: MessageSquare },
];

// Grup menu yang hanya boleh dilihat & diakses admin (level 1) — staff tidak.
const ADMIN_ONLY_GROUPS = new Set(['Konten & Media']);
const ADMIN_ONLY_HREFS = new Set([
  '/dashboard/konten',
  '/dashboard/berita',
  '/dashboard/media',
  '/dashboard/produk',
  '/dashboard/demografi',
  '/dashboard/log',
]);

function groupsForLevel(level: number): MenuGroup[] {
  if (level === 1) return GROUPS;
  // Selain menyembunyikan grup khusus admin, saring juga item admin yang
  // menyelinap di grup umum (mis. "Log Aktivitas" di grup Sistem).
  return GROUPS.filter((g) => !ADMIN_ONLY_GROUPS.has(g.title ?? ''))
    .map((g) => ({ ...g, items: g.items.filter((m) => !ADMIN_ONLY_HREFS.has(m.href)) }))
    .filter((g) => g.items.length > 0);
}

function mobileMainForLevel(level: number): MenuItem[] {
  if (level === 1) return MOBILE_MAIN;
  return MOBILE_MAIN.filter((m) => !ADMIN_ONLY_HREFS.has(m.href));
}

const COLLAPSE_KEY = 'saibatin-dash-collapsed';

/**
 * Label sidebar yang memudar & meluncur saat diciutkan.
 * Sebelumnya label di-unmount begitu saja (`{!collapsed && label}`) sehingga
 * teks berkedip hilang sementara lebar sidebar masih beranimasi 300ms.
 * Lebar dianimasikan lewat max-width karena `width: auto` tidak bisa ditransisi.
 */
function LabelSidebar({
  collapsed,
  children,
  className,
}: {
  collapsed: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden={collapsed}
      className={cn(
        'min-w-0 overflow-hidden whitespace-nowrap',
        'transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed
          ? 'max-w-0 -translate-x-1 opacity-0'
          : 'max-w-52 translate-x-0 opacity-100',
        className,
      )}
    >
      {children}
    </div>
  );
}

function useIsActive() {
  const pathname = usePathname();
  return React.useCallback(
    (href: string, exact?: boolean) => {
      const base = href.split('#')[0];
      if (exact || base === '/dashboard') {
        return pathname === '/dashboard' && (href === '/dashboard' || href.includes('#'));
      }
      return pathname.startsWith(base);
    },
    [pathname],
  );
}

/** Tombol keluar + info akun; dipakai footer sidebar & top-bar mobile. */
function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Berhasil keluar');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Gagal keluar, coba lagi');
    } finally {
      setLoggingOut(false);
    }
  };

  return { loggingOut, handleLogout };
}

// ── Sidebar desktop (collapsible) ──────────────────────────────────────────

function DesktopSidebar() {
  const isActive = useIsActive();
  const { user } = useAppSelector((state) => state.auth);
  const { loggingOut, handleLogout } = useLogout();
  const [collapsed, setCollapsed] = React.useState(false);
  // Keadaan tersimpan baru terbaca setelah hydrate. Tanpa penanda ini sidebar
  // sempat terlihat melebar lalu menciut 300ms tiap kali halaman dimuat —
  // transisi sengaja dimatikan untuk penyetelan awal itu saja.
  const [siapAnimasi, setSiapAnimasi] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    // Frame berikutnya, supaya penyetelan awal sudah ter-paint lebih dulu.
    const t = requestAnimationFrame(() => setSiapAnimasi(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1');
      return !prev;
    });
  };

  const displayName = user?.name || user?.user_id || 'Petugas';

  return (
    <aside
      style={{
        width: collapsed ? '5rem' : '15rem',
        minWidth: collapsed ? '5rem' : '15rem',
        maxWidth: collapsed ? '5rem' : '15rem',
      }}
      // z-30: di atas konten halaman; TANPA overflow-hidden agar dropdown
      // lonceng notifikasi & tombol ciutkan (-right-3) tidak terpotong/ketimpa.
      className={cn(
        'hidden lg:flex flex-col flex-shrink-0 sticky top-0 z-30 h-screen border-r border-slate-200/60 bg-white/60 backdrop-blur-sm',
        siapAnimasi &&
          'transition-[width,min-width,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
      )}
    >
      {/* Tombol ciutkan mengambang bundar di tepi kanan sidebar */}
      <button
        onClick={toggleCollapsed}
        title={collapsed ? 'Perlebar sidebar' : 'Ciutkan sidebar'}
        aria-label={collapsed ? 'Perlebar sidebar' : 'Ciutkan sidebar'}
        className="absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-[background-color,color,transform] duration-200 hover:scale-110 hover:bg-primary hover:text-white active:scale-95"
      >
        {/* Satu ikon yang diputar — dulu dua ikon bertukar sehingga terlihat
            berkedip alih-alih berputar mengikuti sidebar. */}
        <ChevronLeft
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            collapsed && 'rotate-180',
          )}
        />
      </button>

      {/* Kepala sidebar: logo (kembali ke beranda) + lonceng notifikasi */}
      <div
        className={cn(
          'flex items-center gap-2 border-b border-slate-200/60 px-3 py-3',
          collapsed && 'flex-col px-2',
        )}
      >
        <Link
          href="/"
          title="Kembali ke Beranda"
          className={cn(
            'flex min-w-0 flex-1 items-center rounded-lg p-1 transition-colors hover:bg-slate-100',
            // Label selebar 0 tetap dihitung sebagai flex item, sehingga `gap`
            // menyisakan ruang kosong di kanan dan ikon tampak tidak di tengah.
            collapsed ? 'justify-center gap-0' : 'gap-2.5',
          )}
        >
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image src="/logo-saibatin.png" alt="Logo SAIBATIN" fill className="object-contain" />
          </div>
          <LabelSidebar collapsed={collapsed}>
            <p className="truncate text-sm font-bold leading-tight text-slate-900">SAIBATIN</p>
            <p className="truncate text-[0.68rem] leading-tight text-slate-500">
              Dashboard Petugas
            </p>
          </LabelSidebar>
        </Link>
        <NotificationBell tone="onLight" align="left" />
      </div>

      {/* Tautan kembali ke beranda publik */}
      <div className={cn('border-b border-slate-200/60 p-2', collapsed && 'px-2')}>
        <Link
          href="/"
          title="Kembali ke Beranda"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary',
            collapsed && 'justify-center gap-0 px-0',
          )}
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          <LabelSidebar collapsed={collapsed}>Kembali ke Beranda</LabelSidebar>
        </Link>
      </div>

      {/* Menu */}
      <nav className={cn('flex-1 overflow-y-auto p-3', collapsed && 'px-2')}>
        {groupsForLevel(user?.level ?? 3).map((group, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {group.title && !collapsed && (
              <p className="px-3 pt-4 pb-1.5 text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">
                {group.title}
              </p>
            )}
            {group.title && collapsed && gi > 0 && (
              <div className="mx-2 my-2 border-t border-slate-200/70" />
            )}
            {group.items.map((m) => {
              const active = isActive(m.href, m.exact);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  title={collapsed ? m.label : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                    active ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
                    collapsed && 'justify-center gap-0 px-0',
                  )}
                  style={active ? { background: '#2176bd' } : undefined}
                >
                  <m.icon className="h-4 w-4 flex-shrink-0" />
                  <LabelSidebar collapsed={collapsed}>{m.label}</LabelSidebar>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer akun: pengganti user-menu navbar yang disembunyikan di dashboard */}
      <div
        className={cn(
          'flex items-center gap-2 border-t border-slate-200/60 p-3',
          collapsed && 'flex-col gap-2 px-2',
        )}
      >
        {/* Avatar tetap terlihat saat diciutkan supaya baris ini tidak berubah
            tinggi mendadak; hanya namanya yang memudar. */}
        <span
          title={collapsed ? displayName : undefined}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <UserIcon className="h-4 w-4" />
        </span>
        {/* Di keadaan menciut footer jadi flex-col; `max-width: 0` tidak
            meniadakan TINGGI, jadi label harus benar-benar dilepas agar tidak
            menyisakan baris kosong di antara avatar dan tombol keluar. */}
        {!collapsed && (
          <LabelSidebar
            collapsed={false}
            className="flex-1 text-sm font-medium text-slate-700"
          >
            {displayName}
          </LabelSidebar>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Keluar"
          aria-label="Keluar"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

// ── Top-bar mobile ──────────────────────────────────────────────────────────

function MobileTopBar() {
  const { user } = useAppSelector((state) => state.auth);
  const { loggingOut, handleLogout } = useLogout();
  const displayName = user?.name || user?.user_id || 'Petugas';

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-2.5 shadow-md shadow-blue-900/10 lg:hidden"
      style={{ background: 'linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)' }}
    >
      <Link href="/" title="Kembali ke Beranda" className="flex min-w-0 items-center gap-2.5">
        <div className="relative h-8 w-8 flex-shrink-0">
          <Image src="/logo-saibatin.png" alt="Logo SAIBATIN" fill className="object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-white">SAIBATIN</p>
          <p className="truncate text-[0.68rem] leading-tight text-white/70">{displayName}</p>
        </div>
      </Link>
      <div className="flex flex-shrink-0 items-center gap-1">
        <NotificationBell tone="onDark" />
        <Link
          href="/"
          title="Kembali ke Beranda"
          aria-label="Kembali ke Beranda"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <Home className="h-4.5 w-4.5" />
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Keluar"
          aria-label="Keluar"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <LogOut className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </header>
  );
}

// ── Bottom-nav mobile ───────────────────────────────────────────────────────

function MobileBottomNav() {
  const isActive = useIsActive();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const level = user?.level ?? 3;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigasi dashboard"
    >
      <div className="grid grid-cols-5">
        {mobileMainForLevel(level).map((m) => {
          const active = isActive(m.href, m.exact);
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium transition-colors',
                active ? 'text-primary' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-10 items-center justify-center rounded-full transition-colors',
                  active && 'bg-primary/10',
                )}
              >
                <m.icon className="h-4.5 w-4.5" />
              </span>
              {m.label}
            </Link>
          );
        })}

        {/* Tombol "Menu" → sheet berisi semua menu bergrup */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium text-slate-500 transition-colors hover:text-slate-700"
              aria-label="Buka semua menu dashboard"
            >
              <span className="flex h-6 w-10 items-center justify-center rounded-full">
                <LayoutGrid className="h-4.5 w-4.5" />
              </span>
              Menu
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="max-h-[80dvh] gap-0 overflow-y-auto rounded-t-2xl p-0"
          >
            <SheetTitle className="sr-only">Semua menu dashboard</SheetTitle>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-3 backdrop-blur">
              <p className="text-sm font-bold text-slate-900">Semua Menu</p>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Tutup menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 py-3 pb-6">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Home className="h-4 w-4" />
                </span>
                Kembali ke Beranda
              </Link>

              {groupsForLevel(level).map((group, gi) => (
                <div key={gi}>
                  {group.title && (
                    <p className="px-1 pt-3 pb-1.5 text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">
                      {group.title}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map((m) => {
                      const active = isActive(m.href, m.exact);
                      return (
                        <Link
                          key={m.href}
                          href={m.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center text-[0.72rem] font-medium leading-tight transition-colors',
                            active
                              ? 'bg-primary/10 text-primary'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
                          )}
                        >
                          <m.icon className="h-5 w-5" />
                          {m.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <>
      <MobileTopBar />
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
