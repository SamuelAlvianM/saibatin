'use client';

import { useMemo, useState } from 'react';
import { navigationItems, type NavMenu } from '@/lib/navigation';
import { PPID_INFORMASI_GRUP } from '@/lib/ppid-informasi';
import { cn } from '@/lib/utils';
import {
  Home,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

/**
 * Editor Konten Halaman gaya "site editor":
 * - Kiri  : seluruh menu navbar publik (+ Beranda & halaman footer).
 * - Atas  : sub-menu dari menu terpilih (kiri → kanan).
 * - Tengah: pratinjau halaman TERSEBUT dengan Mode Edit aktif (?editmode=1) —
 *           admin mengedit langsung lewat tombol pensil di pratinjau.
 */

interface Leaf {
  title: string;
  href: string;
  /** Label grup (untuk item bersarang, mis. PPID → Berkala). */
  group?: string;
}

interface MenuEntry {
  title: string;
  icon?: LucideIcon;
  leaves: Leaf[];
}

/** Ratakan items + subItems sebuah menu navbar menjadi daftar link. */
function flatten(menu: NavMenu): Leaf[] {
  // Menu tanpa dropdown (link langsung) → satu leaf.
  if (!menu.items?.length) {
    return menu.href && menu.href !== '#'
      ? [{ title: menu.title, href: menu.href }]
      : [];
  }
  const out: Leaf[] = [];
  for (const item of menu.items ?? []) {
    if (item.subItems?.length) {
      for (const sub of item.subItems) {
        if (sub.href && sub.href !== '#') {
          out.push({ title: sub.title, href: sub.href, group: item.title });
        }
      }
    } else if (item.href && item.href !== '#') {
      out.push({ title: item.title, href: item.href });
    }
  }
  return out;
}

export function AdminKonten() {
  const menus = useMemo<MenuEntry[]>(() => {
    const entries: MenuEntry[] = [
      { title: 'Beranda', icon: Home, leaves: [{ title: 'Beranda', href: '/' }] },
      ...navigationItems.map((m) => {
        const leaves = flatten(m);
        // Halaman kategori PPID kini di balik halaman indeks (bukan submenu
        // navbar) — tetap dimunculkan di editor agar bisa diedit admin.
        if (m.title === 'PPID') {
          for (const grup of PPID_INFORMASI_GRUP) {
            for (const it of grup.items) {
              leaves.push({ title: it.title, href: it.href, group: grup.judulPendek });
            }
          }
        }
        return { title: m.title, leaves };
      }),
      {
        title: 'Kebijakan & Privasi',
        icon: ShieldCheck,
        leaves: [{ title: 'Kebijakan & Privasi', href: '/kebijakan-privasi' }],
      },
    ];
    return entries.filter((e) => e.leaves.length > 0);
  }, []);

  const [menuIdx, setMenuIdx] = useState(0);
  const [href, setHref] = useState(menus[0].leaves[0].href);
  const [reloadKey, setReloadKey] = useState(0);

  const menu = menus[menuIdx];
  const previewSrc = `${href}${href.includes('?') ? '&' : '?'}editmode=1`;

  const pilihMenu = (idx: number) => {
    setMenuIdx(idx);
    setHref(menus[idx].leaves[0].href);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[230px_1fr] lg:h-[calc(100vh-180px)] min-h-[560px]">
      {/* ── Kiri: seluruh isi navbar ── */}
      <aside className="rounded-2xl border border-slate-200 bg-white p-2 overflow-y-auto">
        <p className="px-3 pb-1.5 pt-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
          Menu Situs
        </p>
        {menus.map((m, i) => {
          const active = i === menuIdx;
          const Icon = m.icon;
          return (
            <button
              key={m.title}
              type="button"
              onClick={() => pilihMenu(i)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-slate-700 hover:bg-primary/5 hover:text-primary',
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
                <span className="truncate">{m.title}</span>
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-1.5 text-[0.65rem] font-semibold',
                  active ? 'bg-white/20' : 'bg-slate-100 text-slate-500',
                )}
              >
                {m.leaves.length}
              </span>
            </button>
          );
        })}
      </aside>

      {/* ── Kanan: submenu di atas + pratinjau editable ── */}
      <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Sub-menu (kiri → kanan) */}
        <div className="flex items-center gap-2 border-b border-slate-100 p-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
            {menu.leaves.map((leaf) => {
              const active = leaf.href === href;
              return (
                <button
                  key={leaf.href}
                  type="button"
                  onClick={() => setHref(leaf.href)}
                  title={leaf.group ? `${leaf.group} → ${leaf.title}` : leaf.title}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {leaf.group && (
                    <>
                      <span className={active ? 'text-white/70' : 'text-slate-400'}>
                        {leaf.group}
                      </span>
                      <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
                    </>
                  )}
                  {leaf.title}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              title="Muat ulang pratinjau"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka halaman di tab baru"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Pratinjau — Mode Edit langsung aktif, edit via tombol pensil */}
        <iframe
          key={`${href}-${reloadKey}`}
          src={previewSrc}
          title={`Pratinjau ${href}`}
          className="h-full min-h-[480px] w-full flex-1 bg-slate-50"
        />
      </div>
    </div>
  );
}
