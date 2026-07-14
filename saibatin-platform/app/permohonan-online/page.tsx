"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AktaKelahiranNikAda from "@/components/permohonan-online/AktaKelahiranNikAdaModal";
import AktaKelahiranNikTidakAdaModal from "@/components/permohonan-online/AktaKelahiranNikTidakAdaModal";
import AktaKematian from "@/components/permohonan-online/AktaKematianModal";
import AktaNikah from "@/components/permohonan-online/AktaNikahModal";
import AktaPerceraian from "@/components/permohonan-online/AktaPerceraianModal";
import KedatanganPenduduk from "@/components/permohonan-online/KedatanganPendudukModal";
import KIA from "@/components/permohonan-online/KIAModal";
import KKCetakUlang from "@/components/permohonan-online/KKCetakUlangModal";
import KKNumpang from "@/components/permohonan-online/KKNumpangModal";
import KKPerubahanBiodata from "@/components/permohonan-online/KKPerubahanBiodataModal";
import KKPisahKK from "@/components/permohonan-online/KKPisahKKModal";
import KKTambahAnak from "@/components/permohonan-online/KKTambahAnakModal";
import KonsolidasiUpdateDataModal from "@/components/permohonan-online/KonsolidasiUpdateDataModal";
import KTPEL from "@/components/permohonan-online/KTPELModal";
import PerpindahanPenduduk from "@/components/permohonan-online/PerpindahanPendudukModal";

import {
  Search,
  FileText,
  Baby,
  Users,
  UserPlus,
  Edit,
  Printer,
  ScrollText,
  Heart,
  Book,
  IdCard,
  MapPin,
  Home,
  Zap,
  ArrowRight,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// Service data structure
const services = [
  {
    id: 1,
    title: "Konsolidasi Update Data",
    description: "Pengecekan dan penyesuaian data kependudukan",
    icon: FileText,
    category: "data",
    path: "/services/konsolidasi-data",
    color: "from-primary to-primary/70",
    useModal: true,
    modalType: "konsolidasi",
  },
  {
    id: 2,
    title: "Akta Kelahiran (Blm Ada Nik)",
    description: "Penerbitan akta kelahiran untuk yang belum memiliki NIK",
    icon: Baby,
    category: "akta",
    path: "/services/akta-kelahiran-blm-nik",
    color: "from-pink-500 to-rose-600",
    useModal: true,
    modalType: "aktaKelahiranNikTidakAda",
  },
  {
    id: 3,
    title: "Akta Kelahiran (Ada Nik)",
    description: "Penerbitan akta kelahiran untuk yang sudah memiliki NIK",
    icon: Baby,
    category: "akta",
    path: "/services/akta-kelahiran-ada-nik",
    color: "from-pink-500 to-rose-600",
    useModal: true,
    modalType: "aktaKelahiranNikAda",
  },
  {
    id: 4,
    title: "Kartu Keluarga Perubahan Biodata",
    description: "Perubahan data pada Kartu Keluarga",
    icon: Users,
    category: "kk",
    path: "/services/kk-perubahan-biodata",
    color: "from-violet-500 to-purple-600",
    useModal: true,
    modalType: "kartuKeluargaPerubahanData",
  },
  {
    id: 5,
    title: "Kartu Keluarga Pisah KK",
    description: "Pemisahan Kartu Keluarga",
    icon: Users,
    category: "kk",
    path: "/services/kk-pisah",
    color: "from-violet-500 to-purple-600",
    useModal: true,
    modalType: "kartuKeluargaPisahKK",
  },
  {
    id: 6,
    title: "Kartu Keluarga Numpang KK",
    description: "Penambahan anggota keluarga yang numpang",
    icon: Users,
    category: "kk",
    path: "/services/kk-numpang",
    color: "from-violet-500 to-purple-600",
    useModal: true,
    modalType: "kartuKeluargaNumpang",
  },
  {
    id: 7,
    title: "Kartu Keluarga Penambahan Anak",
    description: "Penambahan data anak dalam Kartu Keluarga",
    icon: UserPlus,
    category: "kk",
    path: "/services/kk-penambahan-anak",
    color: "from-violet-500 to-purple-600",
    useModal: true,
    modalType: "kartuKeluargaPenambahanAnak",
  },
  {
    id: 8,
    title: "Kartu Keluarga Cetak Ulang",
    description: "Pencetakan ulang Kartu Keluarga",
    icon: Printer,
    category: "kk",
    path: "/services/kk-cetak-ulang",
    color: "from-violet-500 to-purple-600",
    useModal: true,
    modalType: "kartuKeluargaCetakUlang",
  },
  {
    id: 9,
    title: "Akta Perceraian",
    description: "Penerbitan akta perceraian",
    icon: ScrollText,
    category: "akta",
    path: "/services/akta-perceraian",
    color: "from-warning to-warning/70",
    useModal: true,
    modalType: "aktaPerceraian",
  },
  {
    id: 10,
    title: "Akta Kematian",
    description: "Penerbitan akta kematian",
    icon: Heart,
    category: "akta",
    path: "/services/akta-kematian",
    color: "from-slate-500 to-slate-700",
    useModal: true,
    modalType: "aktaKematian",
  },
  {
    id: 11,
    title: "Akta Perkawinan",
    description: "Penerbitan akta perkawinan",
    icon: Book,
    category: "akta",
    path: "/services/akta-perkawinan",
    color: "from-destructive to-destructive/70",
    useModal: true,
    modalType: "aktaPerkawinan",
  },
  {
    id: 12,
    title: "Kartu Identitas Anak (KIA)",
    description: "Penerbitan Kartu Identitas Anak",
    icon: IdCard,
    category: "identitas",
    path: "/services/kia",
    color: "from-success to-success/70",
    useModal: true,
    modalType: "kartuIdentitasAnak",
  },
  {
    id: 13,
    title: "Perpindahan Penduduk",
    description: "Layanan perpindahan alamat penduduk",
    icon: MapPin,
    category: "pindah",
    path: "/services/perpindahan-penduduk",
    color: "from-primary to-primary/70",
    useModal: true,
    modalType: "perpindahanPenduduk",
  },
  {
    id: 14,
    title: "Kedatangan Penduduk",
    description: "Pencatatan kedatangan penduduk baru",
    icon: Home,
    category: "pindah",
    path: "/services/kedatangan-penduduk",
    color: "from-primary to-primary/70",
    useModal: true,
    modalType: "kedatanganPenduduk",
  },
  {
    id: 15,
    title: "KTP Elektronik",
    description: "Penerbitan dan pembaruan KTP Elektronik",
    icon: Zap,
    category: "identitas",
    path: "/services/ktp-elektronik",
    color: "from-warning to-warning/70",
    useModal: true,
    modalType: "ktpElektronik",
  },
];

// Category grouping
const categories = [
  { id: "all", name: "Semua Layanan", icon: FileText },
  { id: "akta", name: "Akta", icon: ScrollText },
  { id: "kk", name: "Kartu Keluarga", icon: Users },
  { id: "identitas", name: "Identitas", icon: IdCard },
  { id: "pindah", name: "Perpindahan", icon: MapPin },
  { id: "data", name: "Data", icon: FileText },
];

const LOGIN_URL = "/login?redirect=/permohonan-online";

export default function PelayananOnlineDemo() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAppSelector(
    (state) => state.auth,
  );
  // Akun OPD: tanpa kartu dekoratif — daftar layanan ringkas, klik langsung
  // membuka form pengisian.
  const isOpd = isAuthenticated && user?.level === 4;
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Terima kata kunci dari pencarian hero beranda (/permohonan-online?q=...).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearchQuery(q);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [
    aktaKelahiranNikTidakAdaModalOpen,
    setAktaKelahiranNikTidakAdaModalOpen,
  ] = useState(false);
  const [aktaKelahiranNikAdaModalOpen, setAktaKelahiranNikAdaModalOpen] =
    useState(false);
  const [aktaKematianModalOpen, setAktaKematianModalOpen] = useState(false);
  const [aktaNikahModalOpen, setaAktaNikahModalOpen] = useState(false);
  const [aktaPerceraianModalOpen, setAktaPerceraianModalOpen] = useState(false);
  const [kedatanganPendudukModalOpen, setKedatanganPendudukModalOpen] =
    useState(false);
  const [kartuIdentitasAnakModalOpen, setkartuIdentitasAnakModalOpen] =
    useState(false);
  const [kkCetakUlangModalOpen, setKKCetakUlangModalOpen] = useState(false);
  const [kkNumpangModalOpen, setKKNumpangModalOpen] = useState(false);
  const [kkPerubahanBiodataModalOpen, setKKPerubahanBiodataModalOpen] =
    useState(false);
  const [kkPisahKKModalOpen, setKKPisahKKModalOpen] = useState(false);
  const [kkTambahAnakModalOpen, setKKTambahAnakModalOpen] = useState(false);
  const [ktpElektronikModalOpen, setKTPElektronikModalOpen] = useState(false);
  const [perpindahanPendudukModalOpen, setPerpindahanPendudukModalOpen] =
    useState(false);
  const [konsolidasiModalOpen, setKonsolidasiModalOpen] = useState(false);

  // Layanan yang disembunyikan admin (dari dashboard → Pengaturan Pelayanan).
  const [hiddenServices, setHiddenServices] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    fetch("/api/static-content?keys=pelayanan.visibilitas")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const hidden = j.data?.items?.["pelayanan.visibilitas"]?.hidden;
        if (Array.isArray(hidden)) setHiddenServices(new Set(hidden));
      })
      .catch(() => {
        /* gagal fetch → tampilkan semua (default aman) */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Memoize filtered services for better performance
  const filteredServicesByCategory = useMemo(() => {
    return categories.reduce(
      (acc, category) => {
        acc[category.id] = services.filter((service) => {
          if (hiddenServices.has(service.modalType)) return false;
          const matchesCategory =
            category.id === "all" || service.category === category.id;
          const matchesSearch =
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        return acc;
      },
      {} as Record<string, typeof services>,
    );
  }, [searchQuery, hiddenServices]);

  const handleServiceClick = (service: (typeof services)[0]) => {
    // Wajib login sebelum mengisi form permohonan apa pun.
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    if (service.useModal) {
      // Open the appropriate modal based on modalType
      if (service.modalType === "konsolidasi") {
        setKonsolidasiModalOpen(true);
      } else if (service.modalType === "aktaKelahiranNikTidakAda") {
        setAktaKelahiranNikTidakAdaModalOpen(true);
      } else if (service.modalType === "aktaKelahiranNikAda") {
        setAktaKelahiranNikAdaModalOpen(true);
      } else if (service.modalType === "aktaKematian") {
        setAktaKematianModalOpen(true);
      } else if (service.modalType === "aktaPerkawinan") {
        setaAktaNikahModalOpen(true);
      } else if (service.modalType === "aktaPerceraian") {
        setAktaPerceraianModalOpen(true);
      } else if (service.modalType === "kedatanganPenduduk") {
        setKedatanganPendudukModalOpen(true);
      } else if (service.modalType === "kartuIdentitasAnak") {
        setkartuIdentitasAnakModalOpen(true);
      } else if (service.modalType === "kartuKeluargaCetakUlang") {
        setKKCetakUlangModalOpen(true);
      } else if (service.modalType === "kartuKeluargaNumpang") {
        setKKNumpangModalOpen(true);
      } else if (service.modalType === "kartuKeluargaPerubahanData") {
        setKKPerubahanBiodataModalOpen(true);
      } else if (service.modalType === "kartuKeluargaPisahKK") {
        setKKPisahKKModalOpen(true);
      } else if (service.modalType === "kartuKeluargaPenambahanAnak") {
        setKKTambahAnakModalOpen(true);
      } else if (service.modalType === "perpindahanPenduduk") {
        setPerpindahanPendudukModalOpen(true);
      } else if (service.modalType === "ktpElektronik") {
        setKTPElektronikModalOpen(true);
      }
    } else {
      router.push(service.path);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-primary/5 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative p-2">
        <div className="container mx-auto max-w-7xl">
          {/* Header with staggered animation */}
          <Card className="mb-3 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-indigo-500/5 to-violet-500/5" />
            <CardHeader className="relative p-4 px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary/80 rounded-2xl opacity-25 group-hover:opacity-40 blur transition duration-500" />
                    <div className="relative dark:bg-slate-900 p-1 rounded-xxl">
                      <Image
                        src="/logo-saibatin.png"
                        alt="Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold bg-linear-to-r text-primary">
                      Pelayanan Online
                    </CardTitle>
                    <CardDescription className="text-base md:text-md mt-1 font-medium">
                      Dinas Kependudukan dan Pencatatan Sipil
                    </CardDescription>
                  </div>
                </div>

                {/* Right Section: Search Bar */}
                <div className="relative w-full md:w-126 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary/80 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300" />
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black transition-colors group-hover:text-primary" />
                      <Input
                        type="text"
                        placeholder="Cari layanan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 h-14 text-base border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Pemberitahuan wajib login — tampil dari awal jika belum masuk */}
          {!authLoading && !isAuthenticated && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/40 backdrop-blur-sm p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 shrink-0">
                <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Login diperlukan untuk mengajukan permohonan
                </p>
                <p className="text-sm text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Anda bebas melihat daftar layanan, tetapi untuk mengisi
                  formulir permohonan Anda harus masuk terlebih dahulu dengan
                  akun terdaftar.
                </p>
              </div>
              <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                <Button asChild className="flex-1 sm:flex-none">
                  <Link href={LOGIN_URL}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Masuk
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 sm:flex-none border-amber-300 dark:border-amber-700">
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Daftar
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex flex-wrap justify-center gap-5 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-lg ${
                    isActive
                      ? "bg-linear-to-r from-primary to-primary/80 text-primary-foreground scale-105 shadow-primary/50"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-105 hover:shadow-xl"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Tabs with smooth transitions */}
          <Tabs defaultValue="all" className="w-full" value={selectedCategory}>
            {categories.map((category) => {
              const filteredServices =
                filteredServicesByCategory[category.id] || [];
              return (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="mt-0"
                >
                  {isOpd ? (
                    // ── Daftar ringkas (akun OPD): klik baris → form pengisian ──
                    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                      {filteredServices.map((service) => {
                        const Icon = service.icon;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceClick(service)}
                            className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-primary/5"
                          >
                            <div
                              className={`shrink-0 rounded-lg bg-linear-to-br p-2 text-white shadow-sm ${service.color}`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100">
                                {service.title}
                              </p>
                              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                {service.description}
                              </p>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all group-hover:gap-2.5">
                              Isi Formulir <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredServices.map((service, index) => {
                      const Icon = service.icon;
                      return (
                        <Card
                          key={service.id}
                          onClick={() => handleServiceClick(service)}
                          className="group relative hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Gradient overlaop7y */}
                          <div
                            className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                            style={{
                              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                            }}
                          />

                          {/* Shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                          <CardHeader className="relative p-1!">
                            <div className="flex items-center gap-2.5 px-4">
                              <div
                                className={`relative p-2 rounded-lg bg-linear-to-br ${service.color} text-white shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-500 shrink-0`}
                              >
                                <Icon className="h-8 w-8" />
                                <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-semibold leading-none group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 line-clamp-1">
                                  {service.title}
                                </CardTitle>
                                <CardDescription className="text-sm leading-none line-clamp-1 mt-1">
                                  {service.description}
                                </CardDescription>
                                <div className="flex items-center gap-1 mt-1 text-primary font-medium text-xs opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300">
                                  <span>Lihat Detail</span>
                                  <ArrowRight className="h-3 w-3" />
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                  )}

                  {/* Empty state with animation */}
                  {filteredServices.length === 0 && (
                    <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-6">
                        <Search className="h-10 w-10 text-slate-400" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xl font-medium">
                        Tidak ada layanan yang ditemukan
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                        Coba kata kunci lain atau pilih kategori berbeda
                      </p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>

      {/* Dialog wajib login */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
              <LogIn className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center">Login Diperlukan</DialogTitle>
            <DialogDescription className="text-center">
              Untuk mengajukan permohonan online, Anda harus masuk terlebih
              dahulu. Belum punya akun? Daftar gratis menggunakan NIK dan
              nomor KK Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={LOGIN_URL}>
                <LogIn className="h-4 w-4 mr-2" />
                Masuk Sekarang
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">
                <UserPlus className="h-4 w-4 mr-2" />
                Daftar Akun Baru
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <AktaKelahiranNikAda
        open={aktaKelahiranNikAdaModalOpen}
        onOpenChange={setAktaKelahiranNikAdaModalOpen}
        mode="create"
      />

      <AktaKelahiranNikTidakAdaModal
        open={aktaKelahiranNikTidakAdaModalOpen}
        onOpenChange={setAktaKelahiranNikTidakAdaModalOpen}
        mode="create"
      />

      <AktaKematian
        open={aktaKematianModalOpen}
        onOpenChange={setAktaKematianModalOpen}
        mode="create"
      />

      <AktaNikah
        open={aktaNikahModalOpen}
        onOpenChange={setaAktaNikahModalOpen}
        mode="create"
      />

      <AktaPerceraian
        open={aktaPerceraianModalOpen}
        onOpenChange={setAktaPerceraianModalOpen}
        mode="create"
      />

      <KedatanganPenduduk
        open={kedatanganPendudukModalOpen}
        onOpenChange={setKedatanganPendudukModalOpen}
        mode="create"
      />

      <KIA
        open={kartuIdentitasAnakModalOpen}
        onOpenChange={setkartuIdentitasAnakModalOpen}
        mode="create"
      />

      <KKCetakUlang
        open={kkCetakUlangModalOpen}
        onOpenChange={setKKCetakUlangModalOpen}
        mode="create"
      />

      <KKNumpang
        open={kkNumpangModalOpen}
        onOpenChange={setKKNumpangModalOpen}
        mode="create"
      />

      <KKPerubahanBiodata
        open={kkPerubahanBiodataModalOpen}
        onOpenChange={setKKPerubahanBiodataModalOpen}
        mode="create"
      />

      <KKPisahKK
        open={kkPisahKKModalOpen}
        onOpenChange={setKKPisahKKModalOpen}
        mode="create"
      />

      <KKTambahAnak
        open={kkTambahAnakModalOpen}
        onOpenChange={setKKTambahAnakModalOpen}
        mode="create"
      />

      <KTPEL
        open={ktpElektronikModalOpen}
        onOpenChange={setKTPElektronikModalOpen}
        mode="create"
      />

      <PerpindahanPenduduk
        open={perpindahanPendudukModalOpen}
        onOpenChange={setPerpindahanPendudukModalOpen}
        mode="create"
      />

      <KonsolidasiUpdateDataModal
        open={konsolidasiModalOpen}
        onOpenChange={setKonsolidasiModalOpen}
        mode="create"
      />
    </div>
  );
}
