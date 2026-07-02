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
} from 'lucide-react';

const MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/pengajuan-baru', label: 'Pengajuan Baru', icon: FilePlus2 },
  { href: '/dashboard/permohonan', label: 'Permohonan', icon: ClipboardList },
  { href: '/dashboard/berita', label: 'Berita', icon: Newspaper },
  { href: '/dashboard/galeri', label: 'Galeri', icon: ImageIcon },
  { href: '/dashboard/pengaduan', label: 'Pengaduan', icon: MessageSquare },
  { href: '/dashboard/produk', label: 'Produk & Dokumen', icon: FolderOpen },
  { href: '/dashboard/skm', label: 'SKM & IKM', icon: Gauge },
  { href: '/dashboard#users', label: 'Manajemen User', icon: Users },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    const base = href.split('#')[0];
    if (exact || base === '/dashboard') return pathname === '/dashboard' && (href === '/dashboard' || href.includes('#'));
    return pathname.startsWith(base);
  };

  return (
    <aside className="w-full lg:w-60 lg:flex-shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] border-b lg:border-b-0 lg:border-r border-slate-200/60 bg-white/60 backdrop-blur-sm">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto p-3 lg:p-4">
        {MENU.map((m) => {
          const active = isActive(m.href, m.exact);
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                active ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
              style={active ? { background: '#2176bd' } : undefined}
            >
              <m.icon className="h-4 w-4 flex-shrink-0" />
              {m.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
