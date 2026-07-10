'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Newspaper,
  Image as ImageIcon,
  MessageSquare,
  FolderOpen,
  Gauge,
  Users,
  FilePlus2,
  FileText,
  MessagesSquare,
  Images,
  BarChart3,
  TicketCheck,
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
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
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
      { href: '/dashboard/galeri', label: 'Galeri', icon: ImageIcon },
      { href: '/dashboard/media', label: 'Pustaka Media', icon: Images },
      { href: '/dashboard/produk', label: 'Dokumen Publikasi', icon: FolderOpen },
      { href: '/dashboard/demografi', label: 'Data Demografi', icon: BarChart3 },
    ],
  },
  {
    title: 'Aspirasi Warga',
    items: [
      { href: '/dashboard/tiket', label: 'Tiket & Chat', icon: TicketCheck },
      { href: '/dashboard/pengaduan', label: 'Pengaduan', icon: MessageSquare },
      { href: '/dashboard/kritik-saran', label: 'Kritik & Saran', icon: MessagesSquare },
      { href: '/dashboard/skm', label: 'SKM & IKM', icon: Gauge },
    ],
  },
  {
    title: 'Sistem',
    items: [{ href: '/dashboard#users', label: 'Manajemen User', icon: Users }],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    const base = href.split('#')[0];
    if (exact || base === '/dashboard') {
      return pathname === '/dashboard' && (href === '/dashboard' || href.includes('#'));
    }
    return pathname.startsWith(base);
  };

  return (
    <aside className="w-full lg:w-60 lg:flex-shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200/60 bg-white/60 backdrop-blur-sm">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto p-3 lg:p-4">
        {GROUPS.map((group, gi) => (
          <div key={gi} className="flex lg:flex-col gap-1 lg:gap-0.5">
            {group.title && (
              <p className="hidden lg:block px-3 pt-4 pb-1.5 text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">
                {group.title}
              </p>
            )}
            {group.items.map((m) => {
              const active = isActive(m.href, m.exact);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                    active ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
                  )}
                  style={active ? { background: '#2176bd' } : undefined}
                >
                  <m.icon className="h-4 w-4 flex-shrink-0" />
                  {m.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
