"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  FileText,
  Info,
  Building2,
  Newspaper,
  Image as ImageIcon,
  Phone,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Loader2,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems } from "@/lib/navigation";
import { NotificationBell } from "@/components/shared/notification-bell";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";

function DropdownMenu({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items?: Array<{
    title: string;
    href: string;
    description: string;
    subItems?: Array<{ title: string; href: string; description: string }>;
  }>;
  icon?: React.ElementType;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Recalculate height on every render when open
  React.useEffect(() => {
    if (isOpen && contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      };
      updateHeight();
      // Use ResizeObserver to watch for content changes
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [isOpen]);

  // click-outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative px-2.5 py-2 text-sm font-medium flex items-center gap-1.5 rounded-md whitespace-nowrap text-white/90",
          "transition-all duration-300 ease-out",
          "hover:text-yellow-300 hover:bg-white/10",
          "before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0.5 before:bg-yellow-300",
          "before:transition-all before:duration-300 before:ease-out",
          "hover:before:w-[calc(100%-1.25rem)]",
          isOpen && "text-yellow-300 bg-white/10",
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out",
              isHovered && "scale-110",
            )}
            strokeWidth={2}
          />
        )}
        <span className="transition-transform duration-300 ease-out">
          {title}
        </span>
        {items && (
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-all duration-300 ease-out",
              isOpen && "rotate-180",
              isHovered && !isOpen && "translate-y-0.5",
            )}
            strokeWidth={2}
          />
        )}
      </button>

      {/* Slide-down / slide-up panel — height animates from 0 to scrollHeight */}
      {items && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <div
            className="min-w-70 transition-[height,opacity] duration-300 ease-out"
            style={{
              height: isOpen ? contentHeight : 0,
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
            }}
          >
            <div
              ref={contentRef}
              className={cn(
                "rounded-xl py-2",
                "transition-all duration-300 ease-out",
                isOpen ? "shadow-xl scale-100" : "shadow-lg scale-95",
              )}
              style={{
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(33,118,189,0.12)",
                boxShadow: "0 8px 32px rgba(33,118,189,0.12)",
                overflow: isOpen ? "visible" : "hidden",
              }}
            >
              {items.map((item, i) => (
                <DropdownItem
                  key={item.title}
                  item={item}
                  onClose={() => setIsOpen(false)}
                  index={i}
                  isVisible={isOpen}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  item,
  onClose,
  index,
  isVisible,
}: {
  item: {
    title: string;
    href: string;
    description: string;
    subItems?: Array<{ title: string; href: string; description: string }>;
  };
  onClose: () => void;
  index: number;
  isVisible: boolean;
}) {
  const [showDescription, setShowDescription] = React.useState(false);
  const [showSubItems, setShowSubItems] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (item.subItems) {
      // Show submenu immediately for better UX
      setShowSubItems(true);
    } else {
      timeoutRef.current = setTimeout(() => setShowDescription(true), 250);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!item.subItems) {
      setShowDescription(false);
    }
    // For subItems, use a small delay to allow moving to submenu
    if (item.subItems) {
      timeoutRef.current = setTimeout(() => setShowSubItems(false), 100);
    }
  };

  const handleSubmenuEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowSubItems(true);
  };

  const handleSubmenuLeave = () => {
    setShowSubItems(false);
  };

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  if (item.subItems) {
    return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleSubmenuLeave}
      >
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 cursor-default rounded-md mx-2",
            "transition-all duration-300 ease-out",
            "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
            "hover:shadow-sm hover:translate-x-1",
            "transition-[opacity,transform,background,shadow] ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
          )}
          style={{
            transitionDelay: isVisible ? `${index * 40}ms` : "0ms",
            transitionDuration: isVisible ? "250ms" : "200ms",
          }}
          onClick={(e) => e.preventDefault()}
        >
          <div
            className={cn(
              "font-medium text-sm transition-all duration-300 ease-out",
              isHovered && "text-primary translate-x-1",
            )}
          >
            {item.title}
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out",
              isHovered && "translate-x-1 text-primary",
            )}
            strokeWidth={2}
          />
        </div>

        {/* Sub-menu - appears to the right */}
        <div
          className={cn(
            "absolute left-full top-0 ml-1 min-w-[250px] z-[100]",
            "transition-all duration-300 ease-out",
            showSubItems
              ? "opacity-100 visible translate-x-0 scale-100"
              : "opacity-0 invisible -translate-x-2 scale-95 pointer-events-none",
          )}
          onMouseEnter={handleSubmenuEnter}
        >
          <div
            className="rounded-xl shadow-xl py-2"
            style={{
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(33,118,189,0.12)",
              boxShadow: "0 8px 32px rgba(33,118,189,0.12)",
            }}
          >
            {item.subItems.map((subItem, subIndex) => (
              <SubDropdownItem
                key={subItem.title}
                item={subItem}
                onClose={onClose}
                index={subIndex}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "block px-4 py-3 rounded-md mx-2",
        "transition-all duration-300 ease-out",
        "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
        "hover:shadow-sm hover:translate-x-1",
        "transition-[opacity,transform,background,shadow] ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
      )}
      style={{
        transitionDelay: isVisible ? `${index * 40}ms` : "0ms",
        transitionDuration: isVisible ? "250ms" : "200ms",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClose}
    >
      <div
        className={cn(
          "font-medium text-sm transition-all duration-300 ease-out",
          isHovered && "text-primary translate-x-1",
        )}
      >
        {item.title}
      </div>
      <div
        className={cn(
          "text-xs text-muted-foreground overflow-hidden",
          "transition-all duration-300 ease-out",
          showDescription ? "opacity-100 max-h-20 mt-1" : "opacity-0 max-h-0",
        )}
      >
        {item.description}
      </div>
    </Link>
  );
}

function SubDropdownItem({
  item,
  onClose,
  index,
}: {
  item: { title: string; href: string; description: string };
  onClose: () => void;
  index: number;
}) {
  const [showDescription, setShowDescription] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    timeoutRef.current = setTimeout(() => setShowDescription(true), 250);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDescription(false);
  };

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <Link
      href={item.href}
      className={cn(
        "block px-4 py-3 rounded-md mx-2",
        "transition-all duration-300 ease-out",
        "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
        "hover:shadow-sm hover:translate-x-1",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClose}
    >
      <div
        className={cn(
          "font-medium text-sm transition-all duration-300 ease-out",
          isHovered && "text-primary translate-x-1",
        )}
      >
        {item.title}
      </div>
      <div
        className={cn(
          "text-xs text-muted-foreground overflow-hidden",
          "transition-all duration-300 ease-out",
          showDescription ? "opacity-100 max-h-20 mt-1" : "opacity-0 max-h-0",
        )}
      >
        {item.description}
      </div>
    </Link>
  );
}

/** Kotak ikon kecil di kiri item menu mobile. */
function MobileItemIcon({
  icon: Icon,
  active,
}: {
  icon?: React.ElementType;
  active?: boolean;
}) {
  if (!Icon) return null;
  return (
    <span
      className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
        active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  );
}

function MobileMenuItem({
  title,
  href,
  items,
  onClose,
  icon: Icon,
}: {
  title: string;
  /** Link langsung untuk menu tanpa dropdown. */
  href?: string;
  items?: Array<{
    title: string;
    href: string;
    description: string;
    subItems?: Array<{ title: string; href: string; description: string }>;
  }>;
  onClose: () => void;
  icon?: React.ElementType;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = React.useState<string | null>(
    null,
  );

  if (!items) {
    return (
      <Link
        href={href ?? `/${title.toLowerCase().replace(/\s+/g, "-")}`}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.925rem] font-medium text-slate-700 transition-colors hover:bg-primary/5 hover:text-primary"
        onClick={onClose}
      >
        <MobileItemIcon icon={Icon} />
        {title}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[0.925rem] font-medium transition-colors",
          isExpanded
            ? "bg-primary/5 text-primary"
            : "text-slate-700 hover:bg-primary/5 hover:text-primary",
        )}
      >
        <span className="flex items-center gap-3">
          <MobileItemIcon icon={Icon} active={isExpanded} />
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ease-out",
            isExpanded && "rotate-180 text-primary",
          )}
          strokeWidth={2}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="ml-[1.35rem] mt-1 space-y-0.5 border-l border-slate-200 pl-3 pb-1">
          {items.map((item) => {
            if (item.subItems) {
              return (
                <div key={item.title} className="space-y-1">
                  <button
                    onClick={() =>
                      setExpandedSubMenu((prev) =>
                        prev === item.title ? null : item.title,
                      )
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                      expandedSubMenu === item.title
                        ? "text-primary"
                        : "text-slate-600 hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    <span>{item.title}</span>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-transform duration-300 ease-out",
                        expandedSubMenu === item.title && "rotate-90 text-primary",
                      )}
                      strokeWidth={2}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      expandedSubMenu === item.title
                        ? "max-h-[1000px] opacity-100"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3 pb-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className="block rounded-lg px-3 py-1.5 text-[0.83rem] text-slate-500 transition-colors hover:bg-primary/5 hover:text-primary"
                          onClick={onClose}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-primary/5 hover:text-primary"
                onClick={onClose}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Navigation config
// ---------------------------------------------------------------------------

// Icon mapping for navigation items
const navigationIcons: { [key: string]: React.ElementType } = {
  Permohonan: FileText,
  "Pelayanan Online": Building2,
  Pengaduan: Info,
  Produk: FileText,
  "Media Informasi": Newspaper,
  Gallery: ImageIcon,
  "Hubungi Kami": Phone,
  PPID: Landmark,
  WBS: ShieldAlert,
};

// navigationItems dipindah ke lib/navigation.ts (dipakai juga oleh dashboard Konten).

function AuthArea({
  mobile,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar.
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Berhasil keluar");
      setOpen(false);
      onNavigate?.();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar, coba lagi");
    } finally {
      setLoggingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        asChild
        className={cn(
          mobile && "w-full",
          "transition-all duration-300 ease-out hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:translate-y-0",
        )}
      >
        <Link href="/login" onClick={onNavigate}>
          Login/Daftar
        </Link>
      </Button>
    );
  }

  const displayName = user?.name || user?.user_id || "Pengguna";
  // Petugas (level 1-2) ke dashboard admin; warga/OPD langsung ke pengajuan.
  const isPetugas = (user?.level ?? 3) <= 2;
  const areaHref = isPetugas ? "/dashboard" : "/user/pengajuan";
  const areaLabel = isPetugas ? "Dashboard" : "Pengajuan Saya";

  // ── Mobile: tersusun vertikal di dalam sheet ──
  if (mobile) {
    return (
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2 px-1 py-2 text-sm font-medium">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
            <UserIcon className="h-4 w-4" />
          </span>
          <span className="truncate">{displayName}</span>
        </div>
        <Link
          href={areaHref}
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50"
        >
          <LayoutDashboard className="h-4 w-4" /> {areaLabel}
        </Link>
        <Link
          href="/profil"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50"
        >
          <UserIcon className="h-4 w-4" /> Pengaturan Akun
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Keluar
        </button>
      </div>
    );
  }

  // ── Desktop: dropdown saat klik nama ──
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15",
          open && "bg-white/15",
        )}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40">
          <UserIcon className="h-4 w-4" />
        </span>
        <span className="max-w-[10rem] truncate text-white">{displayName}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-white transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Panel selalu dirender agar bisa dianimasikan buka/tutup (fade + slide + scale) */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 min-w-52 rounded-xl py-1 z-50 origin-top-right",
          "transition-all duration-200 ease-out",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible pointer-events-none -translate-y-1 scale-95 opacity-0",
        )}
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(33,118,189,0.12)",
          boxShadow: "0 8px 32px rgba(33,118,189,0.15)",
        }}
      >
          <Link
            href={areaHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent/50"
          >
            <LayoutDashboard className="h-4 w-4" /> {areaLabel}
          </Link>
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent/50"
          >
            <UserIcon className="h-4 w-4" /> Pengaturan Akun
          </Link>
          <div className="my-1 border-t" />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Keluar
          </button>
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoHovered, setLogoHovered] = React.useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Akun OPD (level 4): navbar disederhanakan — hanya Permohonan; pengaturan
  // akun tetap lewat dropdown profil.
  const isOpd = isAuthenticated && user?.level === 4;
  const menuItems = isOpd
    ? [{ title: "Permohonan", href: "/user/pengajuan" } satisfies (typeof navigationItems)[number]]
    : navigationItems;

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dashboard petugas punya top-bar & sidebar sendiri — navbar publik disembunyikan.
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out glass-nav",
        isScrolled
          ? "shadow-lg shadow-blue-900/20"
          : "shadow-md shadow-blue-900/10",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex min-h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <div
              className={cn(
                "relative w-10 h-10 transition-all duration-500 ease-out",
                logoHovered && "scale-120",
              )}
            >
              <Image
                src="/logo-saibatin.png"
                alt="DISDUKCAPIL Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-bold text-base leading-tight transition-all duration-300 ease-out text-white",
                  logoHovered && "text-yellow-300 translate-x-1",
                )}
              >
                SAIBATIN
              </span>
              <span
                className={cn(
                  "hidden sm:block text-xs leading-tight transition-all duration-300 ease-out text-primary-foreground/80",
                  logoHovered && "translate-x-1",
                )}
              >
                Disdukcapil Kab. Pesisir Barat
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-nowrap gap-0.5 flex-1 justify-center px-2">
            <Link
              href="/"
              className={cn(
                "relative px-2.5 py-2 text-sm font-medium flex items-center gap-1.5 rounded-md group whitespace-nowrap text-white/90",
                "transition-all duration-300 ease-out",
                "hover:text-yellow-300 hover:bg-white/10",
                "before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0.5 before:bg-yellow-300",
                "before:transition-all before:duration-300 before:ease-out",
                "hover:before:w-[calc(100%-1.25rem)]",
              )}
            >
              {/* <Home className="h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-110" strokeWidth={2} />
              <span>Beranda</span> */}
            </Link>

            {menuItems.map((item) => {
              // Menu tanpa dropdown → link langsung (mis. Pelayanan Online).
              if (!item.items?.length && item.href) {
                const Icon = navigationIcons[item.title];
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "relative px-2.5 py-2 text-sm font-medium flex items-center gap-1.5 rounded-md whitespace-nowrap text-white/90",
                      "transition-all duration-300 ease-out",
                      "hover:text-yellow-300 hover:bg-white/10",
                      "before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0.5 before:bg-yellow-300",
                      "before:transition-all before:duration-300 before:ease-out",
                      "hover:before:w-[calc(100%-1.25rem)]",
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />}
                    {item.title}
                  </Link>
                );
              }
              return (
                <DropdownMenu
                  key={item.title}
                  title={item.title}
                  items={item.items}
                  icon={navigationIcons[item.title]}
                />
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
            <NotificationBell tone="onDark" />
            <AuthArea />
          </div>

          {/* Mobile: lonceng notifikasi + hamburger */}
          <div className="flex items-center gap-1 lg:hidden">
            <NotificationBell tone="onDark" />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Buka menu navigasi"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Menu className="h-5 w-5" strokeWidth={2} />
                </button>
              </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="flex w-[320px] flex-col gap-0 border-l-0 p-0 sm:w-[380px] sm:max-w-[380px]"
            >
              {/* Kepala panel: identitas + tombol tutup */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ background: "linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9">
                    <Image
                      src="/logo-saibatin.png"
                      alt="Logo SAIBATIN"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight text-white">SAIBATIN</p>
                    <p className="text-[0.7rem] leading-tight text-white/70">
                      Disdukcapil Kab. Pesisir Barat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Tutup menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              {/* Isi menu (scroll) */}
              <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                <p className="px-3 pb-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
                  Menu
                </p>
                {!isOpd && (
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.925rem] font-medium text-slate-700 transition-colors hover:bg-primary/5 hover:text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    <MobileItemIcon icon={Home} />
                    Beranda
                  </Link>
                )}

                {menuItems.map((item) => (
                  <MobileMenuItem
                    key={item.title}
                    title={item.title}
                    href={item.href}
                    items={item.items}
                    onClose={() => setMobileOpen(false)}
                    icon={navigationIcons[item.title]}
                  />
                ))}

              </nav>

              {/* Area akun menempel di bawah */}
              <div className="border-t border-slate-100 bg-slate-50/80 p-4">
                <AuthArea mobile onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
