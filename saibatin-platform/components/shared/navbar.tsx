"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, ChevronDown, ChevronRight, Home, FileText, Info, Building2, Newspaper, Image as ImageIcon, Phone, LogOut, LayoutDashboard, User as UserIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";

function DropdownMenu({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items?: Array<{ title: string; href: string; description: string; subItems?: Array<{ title: string; href: string; description: string }> }>;
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
          isOpen && "text-yellow-300 bg-white/10"
        )}
      >
        {Icon && (
          <Icon 
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out",
              isHovered && "scale-110"
            )} 
            strokeWidth={2} 
          />
        )}
        <span className="transition-transform duration-300 ease-out">{title}</span>
        {items && (
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-all duration-300 ease-out",
              isOpen && "rotate-180",
              isHovered && !isOpen && "translate-y-0.5"
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
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
          >
            <div
              ref={contentRef}
              className={cn(
                "rounded-xl py-2",
                "transition-all duration-300 ease-out",
                isOpen ? "shadow-xl scale-100" : "shadow-lg scale-95"
              )}
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(33,118,189,0.12)',
                boxShadow: '0 8px 32px rgba(33,118,189,0.12)',
                overflow: isOpen ? 'visible' : 'hidden',
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
  item: { title: string; href: string; description: string; subItems?: Array<{ title: string; href: string; description: string }> };
  onClose: () => void;
  index: number;
  isVisible: boolean;
}) {
  const [showDescription, setShowDescription] = React.useState(false);
  const [showSubItems, setShowSubItems] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
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
    []
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
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          )}
          style={{
            transitionDelay: isVisible ? `${index * 40}ms` : "0ms",
            transitionDuration: isVisible ? "250ms" : "200ms",
          }}
          onClick={(e) => e.preventDefault()}
        >
          <div className={cn(
            "font-medium text-sm transition-all duration-300 ease-out",
            isHovered && "text-primary translate-x-1"
          )}>
            {item.title}
          </div>
          <ChevronRight 
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out",
              isHovered && "translate-x-1 text-primary"
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
              : "opacity-0 invisible -translate-x-2 scale-95 pointer-events-none"
          )}
          onMouseEnter={handleSubmenuEnter}
        >
          <div className="rounded-xl shadow-xl py-2" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', border: '1px solid rgba(33,118,189,0.12)', boxShadow: '0 8px 32px rgba(33,118,189,0.12)' }}>
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
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      )}
      style={{
        transitionDelay: isVisible ? `${index * 40}ms` : "0ms",
        transitionDuration: isVisible ? "250ms" : "200ms",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClose}
    >
      <div className={cn(
        "font-medium text-sm transition-all duration-300 ease-out",
        isHovered && "text-primary translate-x-1"
      )}>
        {item.title}
      </div>
      <div
        className={cn(
          "text-xs text-muted-foreground overflow-hidden",
          "transition-all duration-300 ease-out",
          showDescription ? "opacity-100 max-h-20 mt-1" : "opacity-0 max-h-0"
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
    undefined
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
    []
  );

  return (
    <Link
      href={item.href}
      className={cn(
        "block px-4 py-3 rounded-md mx-2",
        "transition-all duration-300 ease-out",
        "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
        "hover:shadow-sm hover:translate-x-1"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClose}
    >
      <div className={cn(
        "font-medium text-sm transition-all duration-300 ease-out",
        isHovered && "text-primary translate-x-1"
      )}>
        {item.title}
      </div>
      <div
        className={cn(
          "text-xs text-muted-foreground overflow-hidden",
          "transition-all duration-300 ease-out",
          showDescription ? "opacity-100 max-h-20 mt-1" : "opacity-0 max-h-0"
        )}
      >
        {item.description}
      </div>
    </Link>
  );
}

function MobileMenuItem({
  title,
  items,
  onClose,
  icon: Icon,
}: {
  title: string;
  items?: Array<{ title: string; href: string; description: string; subItems?: Array<{ title: string; href: string; description: string }> }>;
  onClose: () => void;
  icon?: React.ElementType;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = React.useState<string | null>(null);

  if (!items) {
    return (
      <Link
        href={`/${title.toLowerCase().replace(/\s+/g, "-")}`}
        className={cn(
          "block p-3 rounded-lg font-medium flex items-center justify-between gap-2",
          "transition-all duration-300 ease-out",
          "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
          "hover:shadow-sm hover:translate-x-1"
        )}
        onClick={onClose}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon 
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out",
                isHovered && "scale-110"
              )} 
              strokeWidth={2} 
            />
          )}
          <span className={cn(
            "transition-transform duration-300 ease-out",
            isHovered && "translate-x-1"
          )}>
            {title}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "w-full p-3 rounded-lg font-medium flex items-center justify-between gap-2 text-left",
          "transition-all duration-300 ease-out",
          "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
          "hover:shadow-sm",
          isExpanded && "bg-accent/30"
        )}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon 
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out",
                isHovered && "scale-110"
              )} 
              strokeWidth={2} 
            />
          )}
          <span>{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out",
            isExpanded && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-6 space-y-1 border-l-2 border-accent pl-3">
          {items.map((item) => {
            if (item.subItems) {
              return (
                <div key={item.title} className="space-y-1">
                  <button
                    onClick={() =>
                      setExpandedSubMenu((prev) =>
                        prev === item.title ? null : item.title
                      )
                    }
                    className={cn(
                      "w-full p-2 rounded-md text-sm font-medium flex items-center justify-between gap-2 text-left",
                      "transition-all duration-300 ease-out",
                      "hover:bg-accent/50 hover:translate-x-1"
                    )}
                  >
                    <span>{item.title}</span>
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 flex-shrink-0 transition-transform duration-300 ease-out",
                        expandedSubMenu === item.title && "rotate-90"
                      )}
                      strokeWidth={2}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      expandedSubMenu === item.title
                        ? "max-h-[1000px] opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-4 space-y-1 border-l-2 border-accent/50 pl-3">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className={cn(
                            "block p-2 rounded-md text-sm",
                            "transition-all duration-300 ease-out",
                            "hover:bg-accent/40 hover:translate-x-1 hover:text-primary"
                          )}
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
                className={cn(
                  "block p-2 rounded-md text-sm",
                  "transition-all duration-300 ease-out",
                  "hover:bg-accent/50 hover:translate-x-1 hover:text-primary"
                )}
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
  "Pelayanan Online": Building2,
  "Pengaduan": Info,
  "Produk": FileText,
  "Media Informasi": Newspaper,
  "Gallery": ImageIcon,
  "Hubungi Kami": Phone,
};

const navigationItems = [
  {
    title: "Pelayanan Online",
    items: [
      {
        title: "Permohonan Online",
        href: "/permohonan-online",
        description: "Ajukan permohonan dokumen kependudukan secara online",
      },
    ],
  },
  {
    title: "Produk",
    items: [
      {
        title: "Produk Disdukcapil",
        href: "/produk/produk-disdukcapil",
        description: "Produk dan layanan Disdukcapil",
      },
      {
        title: "Formulir Persyaratan",
        href: "/produk/formulir-persyaratan",
        description: "Persyaratan pengurusan dokumen kependudukan",
      },
      {
        title: "Hukum",
        href: "/produk/hukum",
        description: "Produk hukum terkait kependudukan",
      },
      
      {
        title: "Standar Operasional Prosedur (SOP)",
        href: "/produk/sop",
        description: "Standar operasional prosedur pelayanan",
      },
    ],
  },
  {
    title: "Media Informasi",
    items: [
      {
        title: "Berita",
        href: "/media/berita",
        description: "Berita dan informasi terkini",
      },
      {
        title: "Galeri",
        href: "/galeri",
        description: "Dokumentasi kegiatan Disdukcapil",
      },
      {
        title: "Data Demografi",
        href: "#",
        description: "Data statistik kependudukan",
        subItems: [
          {
            title: "Jenis Kelamin",
            href: "/media/demografi/jenis-kelamin",
            description: "Statistik berdasarkan jenis kelamin",
          },
          {
            title: "Agama",
            href: "/media/demografi/agama",
            description: "Statistik berdasarkan agama",
          },
          {
            title: "Golongan Darah",
            href: "/media/demografi/gol-darah",
            description: "Statistik berdasarkan golongan darah",
          },
          {
            title: "Pekerjaan",
            href: "/media/demografi/pekerjaan",
            description: "Statistik berdasarkan pekerjaan",
          },
          {
            title: "Kartu Keluarga",
            href: "/media/demografi/kk",
            description: "Statistik data kepala keluarga",
          },
          {
            title: "Pendidikan Terakhir",
            href: "/media/demografi/pendidikan",
            description: "Statistik berdasarkan pendidikan",
          },
          {
            title: "Status Perkawinan",
            href: "/media/demografi/status-kawin",
            description: "Statistik berdasarkan status perkawinan",
          },
          {
            title: "Wajib KTP",
            href: "/media/demografi/wajib-ktp",
            description: "Statistik wajib KTP",
          },
        ],
      },
      {
        title: "Peta",
        href: "/media/peta",
        description: "Peta wilayah administrasi",
      },
      {
        title: "Survey Kepuasan Masyarakat",
        href: "/media/survey-kepuasan",
        description: "Survey kepuasan layanan publik",
      },
      {
        title: "GIS Dukcapil",
        href: "/media/gis",
        description: "Sistem informasi geografis Dukcapil",
      },
      {
        title: "Laporan Data Demografi",
        href: "/media/laporan-demografi",
        description: "Laporan lengkap data demografi",
      },
    ],
  },
  {
    title: "Pengaduan",
    items: [
      {
        title: "Pengaduan Masyarakat",
        href: "/pengaduan",
        description: "Sampaikan pengaduan terkait layanan Disdukcapil",
      },
      {
        title: "Kritik & Saran",
        href: "/hubungi-kami/kritik-saran",
        description: "Kritik dan saran untuk peningkatan layanan",
      },
      {
        title: "Hubungi Kami",
        href: "/hubungi-kami/kontak",
        description: "Informasi kontak dan lokasi kantor",
      },
    ],
  },
  {
    title: "PPID",
    items: [
      {
        title: "Profil PPID",
        href: "/ppid/profil-ppid",
        description: "Profil PPID Disdukcapil",
      },
      {
        title: "Wajib Diumumkan Setiap Saat",
        href: "#",
        description: "Data wajib diumumkan setiap saat",
        subItems: [
          {
            title: "Laporan PPID Pelaksana",
            href: "/ppid/laporan-ppid-pelaksana",
            description: "Laporan PPID pelaksana",
          },
          {
            title: "LKJIP (Laporan Kinerja Instansi Pemerintah)",
            href: "/ppid/lkjip",
            description: "Laporan kinerja instansi pemerintah",
          },
          {
            title: "Survey Kepuasan Masyarakat",
            href: "/ppid/survey-kepuasan-masyarakat",
            description: "Survey kepuasan masyarakat terhadap pelayanan",
          },
          {
            title: "Buku Profil Kependudukan",
            href: "/ppid/buku-profil-kependudukan",
            description: "Buku profil kependudukan",
          },
          {
            title: "Dokumen Pelaksana Anggaran (DPA)",
            href: "/ppid/dpa",
            description: "Dokumen pelaksana anggaran",
          },
          {
            title: "Indikator Kinerja Individu (IKI)",
            href: "/ppid/iki",
            description: "Indikator kinerja individu",
          },
          {
            title: "Rencana Kinerja Tahunan (RKT)",
            href: "/ppid/rkt",
            description: "Rencana kinerja tahunan",
          },
          {
            title: "Rencana Kerja (Renka)",
            href: "/ppid/renka",
            description: "Rencana kerja",
          },
          {
            title: "Perjanjian Kerjasama",
              href: "/ppid/perjanjian-kerjasama",
              description: "Perjanjian kerjasama",
          },
        ],
      },
      {
        title: "Wajib Diumumkan Secara Berkala",
        href: "#",
        description: "Data wajib diumumkan secara berkala",
        subItems: [
          {
            title: "Renstra OPD",
            href: "/ppid/renstra-opd",
            description: "Renstra OPD",
          },
          {
            title: "Standar Pelayanan",
            href: "/ppid/standar-pelayanan",
            description: "Standar pelayanan publik",
          },
          {
            title: "Indikator Kinerja Utama (IKU)",
            href: "/ppid/iku",
            description: "Indikator kinerja utama",
          },
          {
            title: "Perjanjian Kinerja",
            href: "/ppid/perjanjian-kinerja",
            description: "Perjanjian kinerja",
          },
          {
            title: "Standar Operasional Prosedur (SOP)",
            href: "/ppid/sop",
            description: "Standar operasional prosedur",
          },
          {
            title: "Zona Integritas",
            href: "/ppid/zona-integritas",
            description: "Zona integritas",
          },
          {
            title: "Pengendalian Gratifikasi",
            href: "/ppid/pengendalian-gratifikasi",
            description: "Pengendalian gratifikasi",
          },
        ],
      },
    ],
  },
  {
    title: "WBS",
    items: [
      {
        title: "Tentang WBS",
        href: "/wbs/tentang-wbs",
        description: "Informasi tentang WBS",
      },
      {
        title: "Form Pengaduan WBS",
        href: "/wbs/form-pengaduan",
        description: "Form pengaduan WBS",
      },
    ],
  },
  {
    title: "Hubungi Kami",
    items: [
      {
        title: "Alamat Disdukcapil",
        href: "/hubungi-kami/alamat",
        description: "Alamat kantor Disdukcapil",
      },
      {
        title: "Pengaduan Masyarakat",
        href: "/hubungi-kami/pengaduan-masyarakat",
        description: "Form pengaduan masyarakat",
      },
    ],
  },
];

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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
          "transition-all duration-300 ease-out hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
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
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
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
          open && "bg-white/15"
        )}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40">
          <UserIcon className="h-4 w-4" />
        </span>
        <span className="max-w-[10rem] truncate text-white">{displayName}</span>
        <ChevronDown className={cn("h-4 w-4 text-white transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-52 rounded-xl py-1 z-50" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', border: '1px solid rgba(33,118,189,0.12)', boxShadow: '0 8px 32px rgba(33,118,189,0.15)' }}>
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
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoHovered, setLogoHovered] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out glass-nav",
        isScrolled
          ? "shadow-lg shadow-blue-900/20"
          : "shadow-md shadow-blue-900/10"
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
            <div className={cn(
              "relative w-10 h-10 transition-all duration-500 ease-out",
              logoHovered && "scale-120"
            )}>
              <Image
                src="/logo-saibatin.png"
                alt="DISDUKCAPIL Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-bold text-base leading-tight transition-all duration-300 ease-out text-white",
                logoHovered && "text-yellow-300 translate-x-1"
              )}>
                SAIBATIN
              </span>
              <span className={cn(
                "hidden sm:block text-xs leading-tight transition-all duration-300 ease-out text-primary-foreground/80",
                logoHovered && "translate-x-1"
              )}>
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
                "hover:before:w-[calc(100%-1.25rem)]"
              )}
            >
              <Home className="h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-110" strokeWidth={2} />
              <span>Beranda</span>
            </Link>

            {navigationItems.map((item) => (
              <DropdownMenu
                key={item.title}
                title={item.title}
                items={item.items}
                icon={navigationIcons[item.title]}
              />
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <AuthArea />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="transition-all duration-300 ease-out hover:scale-110 hover:bg-accent/50"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5 transition-transform duration-300 ease-out rotate-90" />
                ) : (
                  <Menu className="h-5 w-5 transition-transform duration-300 ease-out" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] md:w-[450px] overflow-y-auto"
            >
              <nav className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/"
                  className={cn(
                    "block p-3 rounded-lg font-medium flex items-center gap-2",
                    "transition-all duration-300 ease-out",
                    "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
                    "hover:shadow-sm hover:translate-x-1"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Home className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                  Beranda
                </Link>

                {navigationItems.map((item) => (
                  <MobileMenuItem
                    key={item.title}
                    title={item.title}
                    items={item.items}
                    onClose={() => setMobileOpen(false)}
                    icon={navigationIcons[item.title]}
                  />
                ))}

                <Link
                  href="/kebijakan-privasi"
                  className={cn(
                    "block p-3 rounded-lg font-medium flex items-center gap-2",
                    "transition-all duration-300 ease-out",
                    "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
                    "hover:shadow-sm hover:translate-x-1"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <FileText className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                  Kebijakan & Privasi
                </Link>

                <div className="flex pt-4 border-t">
                  <AuthArea mobile onNavigate={() => setMobileOpen(false)} />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}