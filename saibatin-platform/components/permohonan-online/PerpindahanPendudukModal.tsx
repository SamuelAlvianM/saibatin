"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PemohonNikField } from "@/components/permohonan-online/pemohon-nik-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerpindahanPendudukModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

interface FormData {
  // Applicant data
  pemohonnik: string;
  pemohonnama: string;
  pemohonkk: string;
  pemohonhp: string;
  pemohonemail: string;
  // Movement data
  klasifikasikepindahan: string;
  jeniskepindahan: string;
  nikygpindah: string;
  alasanpindah: string;
  alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  rt: string;
  rw: string;
  // Files
  filekkx: string;
  filependukung1x: string;
  filependukung2x: string;
  // Notes
  catatan: string;
}

interface UploadedFile {
  name: string;
  serverName: string;
  type: string;
}

export default function PerpindahanPendudukModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: PerpindahanPendudukModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    pemohonnik: "",
    pemohonnama: "",
    pemohonkk: "",
    pemohonhp: "",
    pemohonemail: "",
    klasifikasikepindahan: "",
    jeniskepindahan: "",
    nikygpindah: "",
    alasanpindah: "",
    alamat: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    rt: "",
    rw: "",
    filekkx: "",
    filependukung1x: "",
    filependukung2x: "",
    catatan: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    kk?: UploadedFile;
    pendukung1?: UploadedFile;
    pendukung2?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Select options from PHP OptionModel references
  const klasifikasiOptions = [
    { value: "1", label: "Antar Desa/Kelurahan dalam Satu Kecamatan" },
    { value: "2", label: "Antar Kecamatan dalam Satu Kabupaten/Kota" },
    { value: "3", label: "Antar Kabupaten/Kota dalam Satu Provinsi" },
    { value: "4", label: "Antar Provinsi" },
  ];

  const jenisOptions = [
    { value: "1", label: "Kepala Keluarga" },
    { value: "2", label: "Kepala Keluarga dan Seluruh Anggota Keluarga" },
    { value: "3", label: "Anggota Keluarga" },
    { value: "4", label: "Orang Asing" },
  ];

  // Validation functions (preserved from original)
  const validateEmail = (email: string): string | null => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Format email tidak valid";
    }
    return null;
  };

  const validateNIK = (nik: string): string | null => {
    if (!nik) return null;
    if (!/^\d+$/.test(nik)) {
      return "NIK harus berisi angka saja";
    }
    if (nik.length !== 16) {
      return "NIK harus 16 digit";
    }
    return null;
  };

  const validateKK = (kk: string): string | null => {
    if (!kk) return null;
    if (!/^\d+$/.test(kk)) {
      return "Nomor KK harus berisi angka saja";
    }
    if (kk.length !== 16) {
      return "Nomor KK harus 16 digit";
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null;
    if (!/^\d+$/.test(phone)) {
      return "Nomor HP harus berisi angka saja";
    }
    if (phone.length < 10 || phone.length > 13) {
      return "Nomor HP harus 10-13 digit";
    }
    if (!phone.startsWith("0")) {
      return "Nomor HP harus diawali angka 0";
    }
    return null;
  };

  const validateField = (
    field: keyof FormData,
    value: string
  ): string | null => {
    switch (field) {
      case "pemohonemail":
        return validateEmail(value);
      case "pemohonnik":
      case "nikygpindah":
        return validateNIK(value);
      case "pemohonkk":
        return validateKK(value);
      case "pemohonhp":
        return validatePhone(value);
      default:
        return null;
    }
  };

  useEffect(() => {
    if (mode === "edit" && permohonanId && open) {
      fetchPermohonanData();
    }
  }, [mode, permohonanId, open]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep(1);
        setErrors([]);
        setSuccess([]);
        setTouchedFields(new Set());
        setFieldErrors({});
      }, 300);
    }
  }, [open]);

  const fetchPermohonanData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/perpindahan-penduduk/fetchDatas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prm2: permohonanId,
        }),
      });

      const data = await response.json();
      if (data) {
        setFormData({
          pemohonnik: data.pemohonnik || "",
          pemohonnama: data.pemohonnama || "",
          pemohonkk: data.pemohonkk || "",
          pemohonhp: data.pemohonhp || "",
          pemohonemail: data.pemohonemail || "",
          klasifikasikepindahan: data.klasifikasikepindahan || "",
          jeniskepindahan: data.jeniskepindahan || "",
          nikygpindah: data.nikygpindah || "",
          alasanpindah: data.alasanpindah || "",
          alamat: data.alamat || "",
          provinsi: data.provinsi || "",
          kabupaten: data.kabupaten || "",
          kecamatan: data.kecamatan || "",
          kelurahan: data.kelurahan || "",
          rt: data.rt || "",
          rw: data.rw || "",
          filekkx: data.filekk || "",
          filependukung1x: data.filependukung1 || "",
          filependukung2x: data.filependukung2 || "",
          catatan: data.catatan || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrors(["Gagal memuat data permohonan"]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // For NIK, KK, and phone - only allow numbers
    if (
      (field === "pemohonnik" ||
        field === "pemohonkk" ||
        field === "pemohonhp" ||
        field === "nikygpindah") &&
      value
    ) {
      value = value.replace(/\D/g, ""); // Remove non-digits
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setTouchedFields((prev) => new Set(prev).add(field));

    // Real-time validation
    const error = validateField(field, value);
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "kk" | "pendukung1" | "pendukung2"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpg", "image/jpeg"];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setErrors(["Jenis file harus PNG, JPG, atau JPEG"]);
      return;
    }

    if (file.size > maxSize) {
      setErrors(["Ukuran file maksimal 2MB"]);
      return;
    }

    setUploading(fileType);
    setErrors([]);

    try {
      const formDataUpload = new FormData();
      const fieldNameMap = {
        kk: "filekk",
        pendukung1: "filependukung1",
        pendukung2: "filependukung2",
      };
      formDataUpload.append(fieldNameMap[fileType], file);
      formDataUpload.append("typeset", fieldNameMap[fileType]);
      formDataUpload.append("uid", Date.now().toString());
      formDataUpload.append("groupset", fileType);

      const response = await fetch("/api/perpindahan-penduduk/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.error && result.error.length > 0) {
        setErrors(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        const serverFileName = result.success[0];

        const fieldMap = {
          kk: "filekkx",
          pendukung1: "filependukung1x",
          pendukung2: "filependukung2x",
        };

        handleInputChange(fieldMap[fileType] as keyof FormData, serverFileName);

        setUploadedFiles((prev) => ({
          ...prev,
          [fileType]: {
            name: file.name,
            serverName: serverFileName,
            type: file.type,
          },
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrors(["Gagal mengupload file"]);
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (fileType: "kk" | "pendukung1" | "pendukung2") => {
    const fieldMap = {
      kk: "filekkx",
      pendukung1: "filependukung1x",
      pendukung2: "filependukung2x",
    };

    handleInputChange(fieldMap[fileType] as keyof FormData, "");
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fileType];
      return newFiles;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Required field checks (matching PHP validation)
    if (!formData.pemohonnik) newErrors.push("NIK Pemohon harus diisi");
    if (!formData.pemohonnama) newErrors.push("Nama Pemohon harus diisi");
    if (!formData.pemohonkk) newErrors.push("Nomor KK Pemohon harus diisi");
    if (!formData.pemohonhp) newErrors.push("Nomor HP harus diisi");
    if (!formData.pemohonemail) newErrors.push("Email harus diisi");
    if (!formData.klasifikasikepindahan)
      newErrors.push("Klasifikasi Kepindahan harus dipilih");
    if (!formData.jeniskepindahan)
      newErrors.push("Jenis Kepindahan harus dipilih");
    if (!formData.nikygpindah) newErrors.push("NIK Yang Pindah harus diisi");
    if (!formData.alasanpindah) newErrors.push("Alasan Pindah harus diisi");
    if (!formData.alamat) newErrors.push("Alamat Tujuan harus diisi");
    if (!formData.provinsi) newErrors.push("Provinsi harus diisi");
    if (!formData.kabupaten) newErrors.push("Kabupaten/Kota harus diisi");
    if (!formData.kecamatan) newErrors.push("Kecamatan harus diisi");
    if (!formData.kelurahan) newErrors.push("Kelurahan harus diisi");
    if (!formData.rt) newErrors.push("RT harus diisi");
    if (!formData.rw) newErrors.push("RW harus diisi");
    if (!formData.filekkx) newErrors.push("Upload KK wajib dilakukan");

    // Format validation
    const nikError = validateNIK(formData.pemohonnik);
    if (nikError) newErrors.push(nikError);

    const kkError = validateKK(formData.pemohonkk);
    if (kkError) newErrors.push(kkError);

    const phoneError = validatePhone(formData.pemohonhp);
    if (phoneError) newErrors.push(phoneError);

    const emailError = validateEmail(formData.pemohonemail);
    if (emailError) newErrors.push(emailError);

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess([]);

    try {
      const endpoint = "/api/perpindahan-penduduk/postdata";
      const payload = {
        ...formData,
        act: mode === "edit" ? "upd" : "ins",
        key: mode === "edit" ? permohonanId : undefined,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.error && result.error.length > 0) {
        setErrors(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        setSuccess(result.success.flat());
        setTimeout(() => { window.location.href = "/riwayat"; }, 1200);
        setTimeout(() => {
          onOpenChange(false);
          setFormData({
            pemohonnik: "",
            pemohonnama: "",
            pemohonkk: "",
            pemohonhp: "",
            pemohonemail: "",
            klasifikasikepindahan: "",
            jeniskepindahan: "",
            nikygpindah: "",
            alasanpindah: "",
            alamat: "",
            provinsi: "",
            kabupaten: "",
            kecamatan: "",
            kelurahan: "",
            rt: "",
            rw: "",
            filekkx: "",
            filependukung1x: "",
            filependukung2x: "",
            catatan: "",
          });
          setUploadedFiles({});
        }, 1500);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setErrors(["Terjadi kesalahan saat menyimpan data"]);
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    const step1Fields = [
      "pemohonnik",
      "pemohonnama",
      "pemohonkk",
      "pemohonhp",
      "pemohonemail",
    ];
    const step2Fields = [
      "klasifikasikepindahan",
      "jeniskepindahan",
      "nikygpindah",
      "alasanpindah",
      "alamat",
      "provinsi",
      "kabupaten",
      "kecamatan",
      "kelurahan",
      "rt",
      "rw",
    ];
    const step3Fields = ["filekkx"];

    const step1Filled = step1Fields.filter(
      (field) => formData[field as keyof FormData]
    ).length;
    const step2Filled = step2Fields.filter(
      (field) => formData[field as keyof FormData]
    ).length;
    const step3Filled = step3Fields.filter(
      (field) => formData[field as keyof FormData]
    ).length;

    return {
      step1: (step1Filled / step1Fields.length) * 100,
      step2: (step2Filled / step2Fields.length) * 100,
      step3: (step3Filled / step3Fields.length) * 100,
    };
  };

  const progress = getStepProgress();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-225! max-h-[95vh] overflow-hidden flex flex-col w-full">
        <DialogHeader className="space-y-1 pb-1 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            {mode === "edit"
              ? "Edit Permohonan Perpindahan Penduduk"
              : "Permohonan Perpindahan Penduduk"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lengkapi formulir di bawah ini dengan data yang akurat
          </DialogDescription>

          {/* Progress Steps */}
          <div className="pt-4 space-y-3">
            {/* Step Labels */}
            <div className="flex items-center justify-between px-2">
              {[
                { step: 1, label: "Data Pemohon" },
                { step: 2, label: "Data Perpindahan" },
                { step: 3, label: "Dokumen" },
              ].map(({ step, label }) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-all duration-300",
                    currentStep === step
                      ? "text-primary scale-110 font-bold"
                      : currentStep > step
                      ? "text-success"
                      : "text-muted-foreground"
                  )}
                >
                  {currentStep > step && (
                    <CheckCircle className="h-4 w-4 animate-in zoom-in duration-300" />
                  )}
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out",
                  "bg-primary"
                )}
                style={{
                  width: `${((currentStep - 1) / 2) * 100}%`,
                }}
              />
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-1">
          <div className="space-y-4 py-4">
            {/* Error Alert */}
            {errors.length > 0 && (
              <Alert
                variant="destructive"
                className="animate-in slide-in-from-top-2 duration-300"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success.length > 0 && (
              <Alert className="border-success bg-success/10 text-success animate-in slide-in-from-top-2 duration-300">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {success.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Data Pemohon */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 1
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden"
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label
                    htmlFor="pemohonnik"
                    className="flex items-center justify-between"
                  >
                    <span>NIK Pemohon *</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        formData.pemohonnik.length === 16
                          ? "text-success"
                          : "text-muted-foreground"
                      )}
                    >
                      {formData.pemohonnik.length}/16
                    </span>
                  </Label>
                  <PemohonNikField
                    id="pemohonnik"
                    value={formData.pemohonnik}
                    onChange={(v) => handleInputChange("pemohonnik", v)}
                    onAutoFill={(d) => {
                      if (d.nama && !formData.pemohonnama) handleInputChange("pemohonnama", d.nama);
                      if (d.nokk && !formData.pemohonkk) handleInputChange("pemohonkk", d.nokk);
                      if (d.hp && !formData.pemohonhp) handleInputChange("pemohonhp", d.hp);
                      if (d.email && !formData.pemohonemail) handleInputChange("pemohonemail", d.email);
                    }}
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary",
                      touchedFields.has("pemohonnik") &&
                        fieldErrors.pemohonnik &&
                        "border-destructive focus:ring-destructive"
                    )}
                  />
                  {touchedFields.has("pemohonnik") &&
                    fieldErrors.pemohonnik && (
                      <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                        {fieldErrors.pemohonnik}
                      </p>
                    )}
                  {formData.pemohonnik && !fieldErrors.pemohonnik && (
                    <p className="text-xs text-success flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <CheckCircle className="h-3 w-3" /> Valid
                    </p>
                  )}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="pemohonnama">Nama Pemohon *</Label>
                  <Input
                    id="pemohonnama"
                    value={formData.pemohonnama}
                    onChange={(e) =>
                      handleInputChange("pemohonnama", e.target.value)
                    }
                    placeholder="Masukkan nama lengkap"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label
                    htmlFor="pemohonkk"
                    className="flex items-center justify-between"
                  >
                    <span>Nomor KK Pemohon *</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        formData.pemohonkk.length === 16
                          ? "text-success"
                          : "text-muted-foreground"
                      )}
                    >
                      {formData.pemohonkk.length}/16
                    </span>
                  </Label>
                  <Input
                    id="pemohonkk"
                    value={formData.pemohonkk}
                    onChange={(e) =>
                      handleInputChange("pemohonkk", e.target.value)
                    }
                    placeholder="Masukkan 16 digit KK"
                    maxLength={16}
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary",
                      touchedFields.has("pemohonkk") &&
                        fieldErrors.pemohonkk &&
                        "border-destructive focus:ring-destructive"
                    )}
                  />
                  {touchedFields.has("pemohonkk") && fieldErrors.pemohonkk && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                      {fieldErrors.pemohonkk}
                    </p>
                  )}
                  {formData.pemohonkk && !fieldErrors.pemohonkk && (
                    <p className="text-xs text-success flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <CheckCircle className="h-3 w-3" /> Valid
                    </p>
                  )}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                  <Label
                    htmlFor="pemohonhp"
                    className="flex items-center justify-between"
                  >
                    <span>Nomor HP *</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        formData.pemohonhp.length >= 10 &&
                          formData.pemohonhp.length <= 13
                          ? "text-success"
                          : "text-muted-foreground"
                      )}
                    >
                      {formData.pemohonhp.length}/13
                    </span>
                  </Label>
                  <Input
                    id="pemohonhp"
                    type="tel"
                    value={formData.pemohonhp}
                    onChange={(e) =>
                      handleInputChange("pemohonhp", e.target.value)
                    }
                    placeholder="Contoh: 081234567890"
                    maxLength={13}
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary",
                      touchedFields.has("pemohonhp") &&
                        fieldErrors.pemohonhp &&
                        "border-destructive focus:ring-destructive"
                    )}
                  />
                  {touchedFields.has("pemohonhp") && fieldErrors.pemohonhp && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                      {fieldErrors.pemohonhp}
                    </p>
                  )}
                  {formData.pemohonhp && !fieldErrors.pemohonhp && (
                    <p className="text-xs text-success flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <CheckCircle className="h-3 w-3" /> Valid
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="pemohonemail">Email *</Label>
                  <Input
                    id="pemohonemail"
                    type="email"
                    value={formData.pemohonemail}
                    onChange={(e) =>
                      handleInputChange("pemohonemail", e.target.value)
                    }
                    placeholder="Contoh: email@domain.com"
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary",
                      touchedFields.has("pemohonemail") &&
                        fieldErrors.pemohonemail &&
                        "border-destructive focus:ring-destructive"
                    )}
                  />
                  {touchedFields.has("pemohonemail") &&
                    fieldErrors.pemohonemail && (
                      <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                        {fieldErrors.pemohonemail}
                      </p>
                    )}
                  {formData.pemohonemail && !fieldErrors.pemohonemail && (
                    <p className="text-xs text-success flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <CheckCircle className="h-3 w-3" /> Valid
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${progress.step1}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress.step1)}%
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    const step1Fields: (keyof FormData)[] = [
                      "pemohonnik",
                      "pemohonnama",
                      "pemohonkk",
                      "pemohonhp",
                      "pemohonemail",
                    ];
                    let hasErrors = false;
                    const newTouched = new Set(touchedFields);

                    step1Fields.forEach((field) => {
                      newTouched.add(field);
                      if (!formData[field]) {
                        hasErrors = true;
                      }
                      const error = validateField(field, formData[field]);
                      if (error) {
                        hasErrors = true;
                      }
                    });

                    setTouchedFields(newTouched);

                    if (!hasErrors) {
                      setCurrentStep(2);
                    } else {
                      setErrors([
                        "Mohon lengkapi dan perbaiki semua field yang diperlukan",
                      ]);
                    }
                  }}
                  className="bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>

            {/* Step 2: Data Perpindahan */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 2
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden"
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Klasifikasi Kepindahan */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="klasifikasikepindahan">
                    Klasifikasi Kepindahan *
                  </Label>
                  <Select
                    value={formData.klasifikasikepindahan}
                    onValueChange={(value) =>
                      handleInputChange("klasifikasikepindahan", value)
                    }
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Pilih klasifikasi kepindahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {klasifikasiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Jenis Kepindahan */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="jeniskepindahan">Jenis Kepindahan *</Label>
                  <Select
                    value={formData.jeniskepindahan}
                    onValueChange={(value) =>
                      handleInputChange("jeniskepindahan", value)
                    }
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Pilih jenis kepindahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* NIK Yang Pindah */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label
                    htmlFor="nikygpindah"
                    className="flex items-center justify-between"
                  >
                    <span>NIK Yang Akan Pindah *</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        formData.nikygpindah.length === 16
                          ? "text-success"
                          : "text-muted-foreground"
                      )}
                    >
                      {formData.nikygpindah.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikygpindah"
                    value={formData.nikygpindah}
                    onChange={(e) =>
                      handleInputChange("nikygpindah", e.target.value)
                    }
                    placeholder="Masukkan 16 digit NIK yang pindah"
                    maxLength={16}
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary",
                      touchedFields.has("nikygpindah") &&
                        fieldErrors.nikygpindah &&
                        "border-destructive focus:ring-destructive"
                    )}
                  />
                  {touchedFields.has("nikygpindah") &&
                    fieldErrors.nikygpindah && (
                      <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                        {fieldErrors.nikygpindah}
                      </p>
                    )}
                  {formData.nikygpindah && !fieldErrors.nikygpindah && (
                    <p className="text-xs text-success flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <CheckCircle className="h-3 w-3" /> Valid
                    </p>
                  )}
                </div>

                {/* Alasan Pindah */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                  <Label htmlFor="alasanpindah">Alasan Pindah *</Label>
                  <Input
                    id="alasanpindah"
                    value={formData.alasanpindah}
                    onChange={(e) =>
                      handleInputChange("alasanpindah", e.target.value)
                    }
                    placeholder="Masukkan alasan pindah"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Alamat Tujuan - Full width */}
                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="alamat">Alamat Tujuan *</Label>
                  <Textarea
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) =>
                      handleInputChange("alamat", e.target.value)
                    }
                    placeholder="Masukkan alamat lengkap tujuan"
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Provinsi */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-500">
                  <Label htmlFor="provinsi">Provinsi *</Label>
                  <Input
                    id="provinsi"
                    value={formData.provinsi}
                    onChange={(e) =>
                      handleInputChange("provinsi", e.target.value)
                    }
                    placeholder="Masukkan nama provinsi"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Kabupaten */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-700">
                  <Label htmlFor="kabupaten">Kabupaten/Kota *</Label>
                  <Input
                    id="kabupaten"
                    value={formData.kabupaten}
                    onChange={(e) =>
                      handleInputChange("kabupaten", e.target.value)
                    }
                    placeholder="Masukkan nama kabupaten/kota"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Kecamatan */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
                  <Label htmlFor="kecamatan">Kecamatan *</Label>
                  <Input
                    id="kecamatan"
                    value={formData.kecamatan}
                    onChange={(e) =>
                      handleInputChange("kecamatan", e.target.value)
                    }
                    placeholder="Masukkan nama kecamatan"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Kelurahan */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
                  <Label htmlFor="kelurahan">Kelurahan *</Label>
                  <Input
                    id="kelurahan"
                    value={formData.kelurahan}
                    onChange={(e) =>
                      handleInputChange("kelurahan", e.target.value)
                    }
                    placeholder="Masukkan nama kelurahan"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* RT */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
                  <Label htmlFor="rt">RT *</Label>
                  <Input
                    id="rt"
                    value={formData.rt}
                    onChange={(e) => handleInputChange("rt", e.target.value)}
                    placeholder="Masukkan RT"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* RW */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
                  <Label htmlFor="rw">RW *</Label>
                  <Input
                    id="rw"
                    value={formData.rw}
                    onChange={(e) => handleInputChange("rw", e.target.value)}
                    placeholder="Masukkan RW"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Catatan - Full width */}
                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
                  <Label htmlFor="catatan">Catatan Tambahan</Label>
                  <Textarea
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) =>
                      handleInputChange("catatan", e.target.value)
                    }
                    placeholder="Masukkan catatan tambahan jika diperlukan"
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="transition-all duration-300"
                >
                  Kembali
                </Button>
                <div className="flex justify-end pt-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress.step2}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress.step2)}%
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      const step2Fields: (keyof FormData)[] = [
                        "klasifikasikepindahan",
                        "jeniskepindahan",
                        "nikygpindah",
                        "alasanpindah",
                        "alamat",
                        "provinsi",
                        "kabupaten",
                        "kecamatan",
                        "kelurahan",
                        "rt",
                        "rw",
                      ];
                      let hasErrors = false;
                      const newTouched = new Set(touchedFields);

                      step2Fields.forEach((field) => {
                        newTouched.add(field);
                        if (!formData[field]) {
                          hasErrors = true;
                        }
                      });

                      setTouchedFields(newTouched);

                      if (!hasErrors) {
                        setCurrentStep(3);
                      } else {
                        setErrors([
                          "Mohon lengkapi semua field yang diperlukan",
                        ]);
                      }
                    }}
                    className="bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden"
              )}
            >
              {/* KK Upload */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="filekk" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KK *
                  <span className="text-xs text-muted-foreground">
                    (PNG/JPG/JPEG, Max 2MB)
                  </span>
                </Label>
                {uploadedFiles.kk ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">
                            {uploadedFiles.kk.name}
                          </p>
                          <p className="text-xs text-success">
                            Berhasil diupload
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("kk")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filekk"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "kk")}
                      disabled={uploading === "kk"}
                      className="cursor-pointer transition-all duration-200 hover:border-primary"
                    />
                    {uploading === "kk" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dokumen Pendukung 1 Upload */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                <Label
                  htmlFor="filependukung1"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Upload Dokumen Pendukung 1
                  <span className="text-xs text-muted-foreground">
                    (Opsional, PNG/JPG/JPEG, Max 2MB)
                  </span>
                </Label>
                {uploadedFiles.pendukung1 ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">
                            {uploadedFiles.pendukung1.name}
                          </p>
                          <p className="text-xs text-success">
                            Berhasil diupload
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("pendukung1")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filependukung1"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "pendukung1")}
                      disabled={uploading === "pendukung1"}
                      className="cursor-pointer transition-all duration-200 hover:border-primary"
                    />
                    {uploading === "pendukung1" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dokumen Pendukung 2 Upload */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                <Label
                  htmlFor="filependukung2"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Upload Dokumen Pendukung 2
                  <span className="text-xs text-muted-foreground">
                    (Opsional, PNG/JPG/JPEG, Max 2MB)
                  </span>
                </Label>
                {uploadedFiles.pendukung2 ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">
                            {uploadedFiles.pendukung2.name}
                          </p>
                          <p className="text-xs text-success">
                            Berhasil diupload
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("pendukung2")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filependukung2"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "pendukung2")}
                      disabled={uploading === "pendukung2"}
                      className="cursor-pointer transition-all duration-200 hover:border-primary"
                    />
                    {uploading === "pendukung2" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="transition-all duration-300"
                >
                  Kembali
                </Button>
                <div className="flex justify-end pt-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress.step3}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress.step3)}%
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Kirim Permohonan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}