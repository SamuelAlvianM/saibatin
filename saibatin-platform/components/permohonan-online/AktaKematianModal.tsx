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
import { KkScanField } from "@/components/permohonan-online/kk-scan-field";
import { DatePicker } from "@/components/ui/date-picker";
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
  User,
  Users,
  FileCheck,
  Cross,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notifyError, notifySuccess } from "@/lib/notify";

interface AktaKematianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

interface FormData {
  // Setup fields
  permohonanType: string;
  permohonanKet: string;
  permohonanInitial: string;
  
  // Step 1: Data Pemohon
  pemohonnik: string;
  pemohonnama: string;
  pemohonkk: string;
  pemohonhp: string;
  pemohonemail: string;
  
  // Step 2: Data Jenazah
  nikjenazah: string;
  namalengkap: string;
  jeniskelamin: string;
  tgllahir: string;
  
  // Step 3: Data Orang Tua
  nikayah: string;
  namaayah: string;
  pekerjaan: string;
  nikibu: string;
  namaibu: string;
  
  // Step 4: Data Kematian
  anakke: string;
  tglkematian: string;
  jamkematian: string;
  tempatkematian: string;
  sebabkematian: string;
  menerangkankematian: string;
  
  // Step 5: Data Saksi
  niksaksi1: string;
  namasaksi1: string;
  niksaksi2: string;
  namasaksi2: string;
  
  // Step 6: Dokumen
  fileketkematianx: string;
  filekkx: string;
  filektppelaporx: string;
  filektpjenazahx: string;
  filependukung1x: string;
  filependukung2x: string;
  
  // Catatan dan status
  catatan: string;
  prgsts: string;
  rjkalasan: string;
  alasandetail: string;
  key: string;
  act: string;
}

interface UploadedFile {
  name: string;
  serverName: string;
  type: string;
}

export default function AktaKematianModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: AktaKematianModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    permohonanType: "kematian",
    permohonanKet: "Akta Kematian",
    permohonanInitial: "AKM01",
    
    pemohonnik: "",
    pemohonnama: "",
    pemohonkk: "",
    pemohonhp: "",
    pemohonemail: "",
    
    nikjenazah: "",
    namalengkap: "",
    jeniskelamin: "",
    tgllahir: "",
    
    nikayah: "",
    namaayah: "",
    pekerjaan: "",
    nikibu: "",
    namaibu: "",
    
    anakke: "",
    tglkematian: "",
    jamkematian: "",
    tempatkematian: "",
    sebabkematian: "",
    menerangkankematian: "",
    
    niksaksi1: "",
    namasaksi1: "",
    niksaksi2: "",
    namasaksi2: "",
    
    fileketkematianx: "",
    filekkx: "",
    filektppelaporx: "",
    filektpjenazahx: "",
    filependukung1x: "",
    filependukung2x: "",
    
    catatan: "",
    prgsts: "",
    rjkalasan: "",
    alasandetail: "",
    key: "",
    act: "ins",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    ketkematian?: UploadedFile;
    kk?: UploadedFile;
    ktppelapor?: UploadedFile;
    ktpjenazah?: UploadedFile;
    pendukung1?: UploadedFile;
    pendukung2?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Options matching PHP OptionModel lookups
  const jenisKelaminOptions = [
    { value: "1", label: "Laki-laki" },
    { value: "2", label: "Perempuan" },
  ];

  const sebabKematianOptions = [
    { value: "1", label: "Sakit Biasa / Tua" },
    { value: "2", label: "Wabah Penyakit" },
    { value: "3", label: "Kecelakaan" },
    { value: "4", label: "Kriminalitas" },
    { value: "5", label: "Bunuh Diri" },
    { value: "6", label: "Lainnya" },
  ];

  const menerangkanKematianOptions = [
    { value: "1", label: "Dokter" },
    { value: "2", label: "Tenaga Kesehatan" },
    { value: "3", label: "Kepala Desa/Lurah" },
    { value: "4", label: "Lainnya" },
  ];

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return "Email harus diisi";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Format email tidak valid";
    }
    return null;
  };

  const validateNIK = (nik: string, fieldName: string): string | null => {
    if (!nik) return `${fieldName} harus diisi`;
    if (!/^\d+$/.test(nik)) {
      return `${fieldName} harus berisi angka saja`;
    }
    if (nik.length !== 16) {
      return `${fieldName} harus 16 digit`;
    }
    return null;
  };

  const validateKK = (kk: string): string | null => {
    if (!kk) return "Nomor KK harus diisi";
    if (!/^\d+$/.test(kk)) {
      return "Nomor KK harus berisi angka saja";
    }
    if (kk.length !== 16) {
      return "Nomor KK harus 16 digit";
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return "Nomor HP harus diisi";
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

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === "") {
      return `${fieldName} harus diisi`;
    }
    return null;
  };

  const validateField = (
    field: keyof FormData,
    value: string,
  ): string | null => {
    switch (field) {
      case "pemohonemail":
        return validateEmail(value);
      case "pemohonnik":
        return validateNIK(value, "NIK Pemohon");
      case "nikjenazah":
        return validateNIK(value, "NIK Jenazah");
      case "nikayah":
        return validateNIK(value, "NIK Ayah");
      case "nikibu":
        return validateNIK(value, "NIK Ibu");
      case "niksaksi1":
        return validateNIK(value, "NIK Saksi 1");
      case "niksaksi2":
        return validateNIK(value, "NIK Saksi 2");
      case "pemohonkk":
        return validateKK(value);
      case "pemohonhp":
        return validatePhone(value);
      case "pemohonnama":
        return validateRequired(value, "Nama Pemohon");
      case "namalengkap":
        return validateRequired(value, "Nama Lengkap Jenazah");
      case "jeniskelamin":
        return validateRequired(value, "Jenis Kelamin");
      case "tgllahir":
        return validateRequired(value, "Tanggal Lahir");
      case "namaayah":
        return validateRequired(value, "Nama Ayah");
      case "pekerjaan":
        return validateRequired(value, "Pekerjaan Ayah");
      case "namaibu":
        return validateRequired(value, "Nama Ibu");
      case "anakke":
        return validateRequired(value, "Anak Ke");
      case "tglkematian":
        return validateRequired(value, "Tanggal Kematian");
      case "jamkematian":
        return validateRequired(value, "Jam Kematian");
      case "tempatkematian":
        return validateRequired(value, "Tempat Kematian");
      case "sebabkematian":
        return validateRequired(value, "Sebab Kematian");
      case "menerangkankematian":
        return validateRequired(value, "Yang Menerangkan Kematian");
      case "namasaksi1":
        return validateRequired(value, "Nama Saksi 1");
      case "namasaksi2":
        return validateRequired(value, "Nama Saksi 2");
      case "fileketkematianx":
        return validateRequired(value, "Upload Surat Keterangan Kematian");
      case "filekkx":
        return validateRequired(value, "Upload KK");
      case "filektppelaporx":
        return validateRequired(value, "Upload KTP Pelapor");
      case "filektpjenazahx":
        return validateRequired(value, "Upload KTP Jenazah");
      default:
        return null;
    }
  };

  // Validate entire step
  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const stepErrors: string[] = [];
    const newTouched = new Set(touchedFields);
    const newFieldErrors: Record<string, string> = { ...fieldErrors };

    let fieldsToValidate: (keyof FormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["pemohonnik", "pemohonnama", "pemohonkk", "pemohonhp", "pemohonemail"];
        break;
      case 2:
        fieldsToValidate = ["nikjenazah", "namalengkap", "jeniskelamin", "tgllahir"];
        break;
      case 3:
        fieldsToValidate = ["nikayah", "namaayah", "pekerjaan", "nikibu", "namaibu"];
        break;
      case 4:
        fieldsToValidate = ["anakke", "tglkematian", "jamkematian", "tempatkematian", "sebabkematian", "menerangkankematian"];
        break;
      case 5:
        fieldsToValidate = ["niksaksi1", "namasaksi1", "niksaksi2", "namasaksi2"];
        break;
      case 6:
        fieldsToValidate = ["fileketkematianx", "filekkx", "filektppelaporx", "filektpjenazahx"];
        break;
    }

    let hasErrors = false;

    fieldsToValidate.forEach((field) => {
      newTouched.add(field);
      const value = formData[field] || "";
      const error = validateField(field, value);
      
      if (error) {
        hasErrors = true;
        stepErrors.push(error);
        newFieldErrors[field] = error;
      } else {
        delete newFieldErrors[field];
      }
    });

    setTouchedFields(newTouched);
    setFieldErrors(newFieldErrors);

    return { isValid: !hasErrors, errors: stepErrors };
  };

  const handleNextStep = () => {
    const { isValid, errors: stepErrors } = validateStep(currentStep);
    
    if (!isValid) {
      setErrors(stepErrors);
      notifyError(stepErrors, "Data belum lengkap");
      // Scroll to top to show errors
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setErrors([]);
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrors([]);
    setCurrentStep((prev) => prev - 1);
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
      const response = await fetch("/api/akta-kematian/fetchDatas", {
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
          ...formData,
          pemohonnik: data.pemohonnik || "",
          pemohonnama: data.pemohonnama || "",
          pemohonkk: data.pemohonkk || "",
          pemohonhp: data.pemohonhp || "",
          pemohonemail: data.pemohonemail || "",
          
          nikjenazah: data.nikjenazah || "",
          namalengkap: data.namalengkap || "",
          jeniskelamin: data.jeniskelamin || "",
          tgllahir: data.tgllahir || "",
          
          nikayah: data.nikayah || "",
          namaayah: data.namaayah || "",
          pekerjaan: data.pekerjaan || "",
          
          nikibu: data.nikibu || "",
          namaibu: data.namaibu || "",
          
          anakke: data.anakke || "",
          tglkematian: data.tglkematian || "",
          jamkematian: data.jamkematian || "",
          tempatkematian: data.tempatkematian || "",
          sebabkematian: data.sebabkematian || "",
          menerangkankematian: data.menerangkankematian || "",
          
          niksaksi1: data.niksaksi1 || "",
          namasaksi1: data.namasaksi1 || "",
          niksaksi2: data.niksaksi2 || "",
          namasaksi2: data.namasaksi2 || "",
          
          fileketkematianx: data.fileketkematian || "",
          filekkx: data.filekk || "",
          filektppelaporx: data.filektppelapor || "",
          filektpjenazahx: data.filektpjenazah || "",
          filependukung1x: data.filependukung1 || "",
          filependukung2x: data.filependukung2 || "",
          
          catatan: data.catatan || "",
          prgsts: data.prgsts || "",
          rjkalasan: data.rjkalasan || "",
          alasandetail: data.rjkdetil || "",
          key: data.key || "",
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
        field === "nikjenazah" ||
        field === "nikayah" ||
        field === "nikibu" ||
        field === "niksaksi1" ||
        field === "niksaksi2") &&
      value
    ) {
      value = value.replace(/\D/g, "");
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

    // Clear step errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: keyof typeof uploadedFiles,
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
        ketkematian: "fileketkematian",
        kk: "filekk",
        ktppelapor: "filektppelapor",
        ktpjenazah: "filektpjenazah",
        pendukung1: "filependukung1",
        pendukung2: "filependukung2",
      };
      
      formDataUpload.append(fieldNameMap[fileType], file);
      formDataUpload.append("typeset", fieldNameMap[fileType]);
      formDataUpload.append("uid", Date.now().toString());
      formDataUpload.append("groupset", fileType);

      const response = await fetch("/api/akta-kematian/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.error && result.error.length > 0) {
        setErrors(result.error.flat());
        notifyError(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        const serverFileName = result.success[0];

        const fieldMap = {
          ketkematian: "fileketkematianx",
          kk: "filekkx",
          ktppelapor: "filektppelaporx",
          ktpjenazah: "filektpjenazahx",
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

  const removeFile = (fileType: keyof typeof uploadedFiles) => {
    const fieldMap = {
      ketkematian: "fileketkematianx",
      kk: "filekkx",
      ktppelapor: "filektppelaporx",
      ktpjenazah: "filektpjenazahx",
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
    // Validate all steps
    for (let step = 1; step <= 6; step++) {
      const { isValid, errors: stepErrors } = validateStep(step);
      if (!isValid) {
        setErrors(stepErrors);
        notifyError(stepErrors, "Data belum lengkap");
        setCurrentStep(step);
        return false;
      }
    }
    return true;
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
      const endpoint = "/api/akta-kematian/postdata";
      
      const payload = {
        ...formData,
        act: mode === "edit" ? "upd" : "ins",
        key: mode === "edit" ? permohonanId : "",
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
        notifyError(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        setSuccess(result.success.flat());
        notifySuccess(result.success.flat());
        setTimeout(() => { window.location.href = "/riwayat"; }, 1200);
        setTimeout(() => {
          onOpenChange(false);
          // Reset form
          setFormData({
            permohonanType: "kematian",
            permohonanKet: "Akta Kematian",
            permohonanInitial: "AKM01",
            pemohonnik: "",
            pemohonnama: "",
            pemohonkk: "",
            pemohonhp: "",
            pemohonemail: "",
            nikjenazah: "",
            namalengkap: "",
            jeniskelamin: "",
            tgllahir: "",
            nikayah: "",
            namaayah: "",
            pekerjaan: "",
            nikibu: "",
            namaibu: "",
            anakke: "",
            tglkematian: "",
            jamkematian: "",
            tempatkematian: "",
            sebabkematian: "",
            menerangkankematian: "",
            niksaksi1: "",
            namasaksi1: "",
            niksaksi2: "",
            namasaksi2: "",
            fileketkematianx: "",
            filekkx: "",
            filektppelaporx: "",
            filektpjenazahx: "",
            filependukung1x: "",
            filependukung2x: "",
            catatan: "",
            prgsts: "",
            rjkalasan: "",
            alasandetail: "",
            key: "",
            act: "ins",
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
    const steps = [
      ["pemohonnik", "pemohonnama", "pemohonkk", "pemohonhp", "pemohonemail"],
      ["nikjenazah", "namalengkap", "jeniskelamin", "tgllahir"],
      ["nikayah", "namaayah", "pekerjaan", "nikibu", "namaibu"],
      ["anakke", "tglkematian", "jamkematian", "tempatkematian", "sebabkematian", "menerangkankematian"],
      ["niksaksi1", "namasaksi1", "niksaksi2", "namasaksi2"],
      ["fileketkematianx", "filekkx", "filektppelaporx", "filektpjenazahx"],
    ];

    const progress: Record<string, number> = {};
    steps.forEach((stepFields, index) => {
      const filled = stepFields.filter(
        (field) => formData[field as keyof FormData],
      ).length;
      progress[`step${index + 1}`] = (filled / stepFields.length) * 100;
    });

    return progress;
  };

  const progress = getStepProgress();

  const steps = [
    { step: 1, label: "Data Pemohon", icon: User },
    { step: 2, label: "Data Jenazah", icon: Cross },
    { step: 3, label: "Data Ortu", icon: Users },
    { step: 4, label: "Data Kematian", icon: FileCheck },
    { step: 5, label: "Saksi", icon: Users },
    { step: 6, label: "Dokumen", icon: FileText },
  ];

  // Helper to show field error
  const showFieldError = (field: keyof FormData) => {
    return touchedFields.has(field) && fieldErrors[field] ? (
      <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200 mt-1">
        {fieldErrors[field]}
      </p>
    ) : null;
  };

  // Helper for input class with error state
  const getInputClass = (field: keyof FormData) => {
    return cn(
      "transition-all duration-200 focus:ring-2 focus:ring-primary",
      touchedFields.has(field) && fieldErrors[field] && "border-destructive focus:border-destructive focus:ring-destructive"
    );
  };

  // Helper for select class with error state
  const getSelectClass = (field: keyof FormData) => {
    return cn(
      "transition-all duration-200 focus:ring-2 focus:ring-primary",
      touchedFields.has(field) && fieldErrors[field] && "border-destructive focus:border-destructive focus:ring-destructive"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col w-full">
        <DialogHeader className="space-y-1 pb-1 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            {mode === "edit"
              ? "Edit Permohonan"
              : "Permohonan Akta Kematian"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lengkapi formulir di bawah ini dengan data yang akurat
          </DialogDescription>

          {/* Progress Steps */}
          <div className="pt-4 space-y-3">
            {/* Step Labels */}
            <div className="flex items-center justify-between px-2">
              {steps.map(({ step, label, icon: Icon }) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-all duration-300 cursor-pointer",
                    currentStep === step
                      ? "text-primary scale-110 font-bold"
                      : currentStep > step
                        ? "text-success"
                        : "text-muted-foreground",
                  )}
                  onClick={() => {
                    // Allow clicking on completed steps to go back
                    if (step < currentStep) {
                      setCurrentStep(step);
                      setErrors([]);
                    }
                  }}
                >
                  {currentStep > step && (
                    <CheckCircle className="h-4 w-4 animate-in zoom-in duration-300" />
                  )}
                  {currentStep <= step && <Icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out",
                  "bg-primary",
                )}
                style={{
                  width: `${((currentStep - 1) / 5) * 100}%`,
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
                  : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="pemohonnik" className="flex items-center justify-between">
                    <span>NIK Pemohon *</span>
                    <span className={cn("text-xs font-normal", formData.pemohonnik.length === 16 ? "text-success" : "text-muted-foreground")}>
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
                    className={getInputClass("pemohonnik")}
                  />
                  {showFieldError("pemohonnik")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="pemohonnama">Nama Pemohon *</Label>
                  <Input
                    id="pemohonnama"
                    value={formData.pemohonnama}
                    onChange={(e) => handleInputChange("pemohonnama", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={getInputClass("pemohonnama")}
                  />
                  {showFieldError("pemohonnama")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="pemohonkk" className="flex items-center justify-between">
                    <span>Nomor KK *</span>
                    <span className={cn("text-xs font-normal", formData.pemohonkk.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.pemohonkk.length}/16
                    </span>
                  </Label>
                  <KkScanField
                    id="pemohonkk"
                    value={formData.pemohonkk}
                    onChange={(v) => handleInputChange("pemohonkk", v)}
                    className={getInputClass("pemohonkk")}
                  />
                  {showFieldError("pemohonkk")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                  <Label htmlFor="pemohonhp" className="flex items-center justify-between">
                    <span>Nomor HP *</span>
                    <span className={cn("text-xs font-normal", formData.pemohonhp.length >= 10 && formData.pemohonhp.length <= 13 ? "text-success" : "text-muted-foreground")}>
                      {formData.pemohonhp.length}/13
                    </span>
                  </Label>
                  <Input
                    id="pemohonhp"
                    type="tel"
                    value={formData.pemohonhp}
                    onChange={(e) => handleInputChange("pemohonhp", e.target.value)}
                    placeholder="Contoh: 081234567890"
                    maxLength={13}
                    className={getInputClass("pemohonhp")}
                  />
                  {showFieldError("pemohonhp")}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="pemohonemail">Email *</Label>
                  <Input
                    id="pemohonemail"
                    type="email"
                    value={formData.pemohonemail}
                    onChange={(e) => handleInputChange("pemohonemail", e.target.value)}
                    placeholder="Contoh: email@domain.com"
                    className={getInputClass("pemohonemail")}
                  />
                  {showFieldError("pemohonemail")}
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.step1}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step1)}%</span>
                </div>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>

            {/* Step 2: Data Jenazah */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 2 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nikjenazah" className="flex items-center justify-between">
                    <span>NIK Jenazah *</span>
                    <span className={cn("text-xs font-normal", formData.nikjenazah.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.nikjenazah.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikjenazah"
                    value={formData.nikjenazah}
                    onChange={(e) => handleInputChange("nikjenazah", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Jenazah"
                    maxLength={16}
                    className={getInputClass("nikjenazah")}
                  />
                  {showFieldError("nikjenazah")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="namalengkap">Nama Lengkap Jenazah *</Label>
                  <Input
                    id="namalengkap"
                    value={formData.namalengkap}
                    onChange={(e) => handleInputChange("namalengkap", e.target.value)}
                    placeholder="Masukkan nama lengkap jenazah"
                    className={getInputClass("namalengkap")}
                  />
                  {showFieldError("namalengkap")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="jeniskelamin">Jenis Kelamin *</Label>
                  <Select 
                    value={formData.jeniskelamin} 
                    onValueChange={(value) => handleInputChange("jeniskelamin", value)}
                  >
                    <SelectTrigger className={getSelectClass("jeniskelamin")}>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisKelaminOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("jeniskelamin")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="tgllahir">Tanggal Lahir *</Label>
                  <DatePicker
                    id="tgllahir"
                    value={formData.tgllahir}
                    onChange={(v) => handleInputChange("tgllahir", v)}
                    maxToday
                    className={getInputClass("tgllahir")}
                  />
                  {showFieldError("tgllahir")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.step2}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step2)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3: Data Orang Tua */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <h3 className="text-lg font-semibold text-muted-foreground">Data Ayah</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nikayah" className="flex items-center justify-between">
                    <span>NIK Ayah *</span>
                    <span className={cn("text-xs font-normal", formData.nikayah.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.nikayah.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikayah"
                    value={formData.nikayah}
                    onChange={(e) => handleInputChange("nikayah", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Ayah"
                    maxLength={16}
                    className={getInputClass("nikayah")}
                  />
                  {showFieldError("nikayah")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="namaayah">Nama Ayah *</Label>
                  <Input
                    id="namaayah"
                    value={formData.namaayah}
                    onChange={(e) => handleInputChange("namaayah", e.target.value)}
                    placeholder="Masukkan nama ayah"
                    className={getInputClass("namaayah")}
                  />
                  {showFieldError("namaayah")}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="pekerjaan">Pekerjaan Ayah *</Label>
                  <Input
                    id="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={(e) => handleInputChange("pekerjaan", e.target.value)}
                    placeholder="Masukkan pekerjaan ayah"
                    className={getInputClass("pekerjaan")}
                  />
                  {showFieldError("pekerjaan")}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-muted-foreground pt-4">Data Ibu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nikibu" className="flex items-center justify-between">
                    <span>NIK Ibu *</span>
                    <span className={cn("text-xs font-normal", formData.nikibu.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.nikibu.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikibu"
                    value={formData.nikibu}
                    onChange={(e) => handleInputChange("nikibu", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Ibu"
                    maxLength={16}
                    className={getInputClass("nikibu")}
                  />
                  {showFieldError("nikibu")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="namaibu">Nama Ibu *</Label>
                  <Input
                    id="namaibu"
                    value={formData.namaibu}
                    onChange={(e) => handleInputChange("namaibu", e.target.value)}
                    placeholder="Masukkan nama ibu"
                    className={getInputClass("namaibu")}
                  />
                  {showFieldError("namaibu")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.step3}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step3)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 4: Data Kematian */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 4 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="anakke">Anak Ke *</Label>
                  <Input
                    id="anakke"
                    type="number"
                    value={formData.anakke}
                    onChange={(e) => handleInputChange("anakke", e.target.value)}
                    placeholder="Masukkan anak ke-"
                    min="1"
                    className={getInputClass("anakke")}
                  />
                  {showFieldError("anakke")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="tglkematian">Tanggal Kematian *</Label>
                  <DatePicker
                    id="tglkematian"
                    value={formData.tglkematian}
                    onChange={(v) => handleInputChange("tglkematian", v)}
                    maxToday
                    className={getInputClass("tglkematian")}
                  />
                  {showFieldError("tglkematian")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="jamkematian">Jam Kematian *</Label>
                  <Input
                    id="jamkematian"
                    type="time"
                    value={formData.jamkematian}
                    onChange={(e) => handleInputChange("jamkematian", e.target.value)}
                    className={getInputClass("jamkematian")}
                  />
                  {showFieldError("jamkematian")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="tempatkematian">Tempat Kematian *</Label>
                  <Input
                    id="tempatkematian"
                    value={formData.tempatkematian}
                    onChange={(e) => handleInputChange("tempatkematian", e.target.value)}
                    placeholder="Masukkan tempat kematian"
                    className={getInputClass("tempatkematian")}
                  />
                  {showFieldError("tempatkematian")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                  <Label htmlFor="sebabkematian">Sebab Kematian *</Label>
                  <Select 
                    value={formData.sebabkematian} 
                    onValueChange={(value) => handleInputChange("sebabkematian", value)}
                  >
                    <SelectTrigger className={getSelectClass("sebabkematian")}>
                      <SelectValue placeholder="Pilih sebab kematian" />
                    </SelectTrigger>
                    <SelectContent>
                      {sebabKematianOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("sebabkematian")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="menerangkankematian">Yang Menerangkan Kematian *</Label>
                  <Select 
                    value={formData.menerangkankematian} 
                    onValueChange={(value) => handleInputChange("menerangkankematian", value)}
                  >
                    <SelectTrigger className={getSelectClass("menerangkankematian")}>
                      <SelectValue placeholder="Pilih yang menerangkan" />
                    </SelectTrigger>
                    <SelectContent>
                      {menerangkanKematianOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("menerangkankematian")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.step4}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step4)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 5: Data Saksi */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 5 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <h3 className="text-lg font-semibold text-muted-foreground">Saksi 1</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="niksaksi1" className="flex items-center justify-between">
                    <span>NIK Saksi 1 *</span>
                    <span className={cn("text-xs font-normal", formData.niksaksi1.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.niksaksi1.length}/16
                    </span>
                  </Label>
                  <Input
                    id="niksaksi1"
                    value={formData.niksaksi1}
                    onChange={(e) => handleInputChange("niksaksi1", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Saksi 1"
                    maxLength={16}
                    className={getInputClass("niksaksi1")}
                  />
                  {showFieldError("niksaksi1")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="namasaksi1">Nama Saksi 1 *</Label>
                  <Input
                    id="namasaksi1"
                    value={formData.namasaksi1}
                    onChange={(e) => handleInputChange("namasaksi1", e.target.value)}
                    placeholder="Masukkan nama saksi 1"
                    className={getInputClass("namasaksi1")}
                  />
                  {showFieldError("namasaksi1")}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-muted-foreground pt-4">Saksi 2</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="niksaksi2" className="flex items-center justify-between">
                    <span>NIK Saksi 2 *</span>
                    <span className={cn("text-xs font-normal", formData.niksaksi2.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.niksaksi2.length}/16
                    </span>
                  </Label>
                  <Input
                    id="niksaksi2"
                    value={formData.niksaksi2}
                    onChange={(e) => handleInputChange("niksaksi2", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Saksi 2"
                    maxLength={16}
                    className={getInputClass("niksaksi2")}
                  />
                  {showFieldError("niksaksi2")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="namasaksi2">Nama Saksi 2 *</Label>
                  <Input
                    id="namasaksi2"
                    value={formData.namasaksi2}
                    onChange={(e) => handleInputChange("namasaksi2", e.target.value)}
                    placeholder="Masukkan nama saksi 2"
                    className={getInputClass("namasaksi2")}
                  />
                  {showFieldError("namasaksi2")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.step5}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step5)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 6: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 6 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              {/* Surat Keterangan Kematian - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="fileketkematian" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Surat Keterangan Kematian *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ketkematian ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">{uploadedFiles.ketkematian.name}</p>
                          <p className="text-xs text-success">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ketkematian")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="fileketkematian"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ketkematian")}
                      disabled={uploading === "ketkematian"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-primary",
                        touchedFields.has("fileketkematianx") && !formData.fileketkematianx && "border-destructive focus:border-destructive"
                      )}
                    />
                    {touchedFields.has("fileketkematianx") && !formData.fileketkematianx && (
                      <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload Surat Keterangan Kematian wajib dilakukan
                      </p>
                    )}
                    {uploading === "ketkematian" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KK - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                <Label htmlFor="filekk" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KK *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.kk ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">{uploadedFiles.kk.name}</p>
                          <p className="text-xs text-success">Berhasil diupload</p>
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
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-primary",
                        touchedFields.has("filekkx") && !formData.filekkx && "border-destructive focus:border-destructive"
                      )}
                    />
                    {touchedFields.has("filekkx") && !formData.filekkx && (
                      <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KK wajib dilakukan
                      </p>
                    )}
                    {uploading === "kk" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KTP Pelapor - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                <Label htmlFor="filektppelapor" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Pelapor *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktppelapor ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">{uploadedFiles.ktppelapor.name}</p>
                          <p className="text-xs text-success">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktppelapor")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektppelapor"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktppelapor")}
                      disabled={uploading === "ktppelapor"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-primary",
                        touchedFields.has("filektppelaporx") && !formData.filektppelaporx && "border-destructive focus:border-destructive"
                      )}
                    />
                    {touchedFields.has("filektppelaporx") && !formData.filektppelaporx && (
                      <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KTP Pelapor wajib dilakukan
                      </p>
                    )}
                    {uploading === "ktppelapor" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KTP Jenazah - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                <Label htmlFor="filektpjenazah" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Jenazah *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktpjenazah ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">{uploadedFiles.ktpjenazah.name}</p>
                          <p className="text-xs text-success">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktpjenazah")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektpjenazah"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktpjenazah")}
                      disabled={uploading === "ktpjenazah"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-primary",
                        touchedFields.has("filektpjenazahx") && !formData.filektpjenazahx && "border-destructive focus:border-destructive"
                      )}
                    />
                    {touchedFields.has("filektpjenazahx") && !formData.filektpjenazahx && (
                      <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KTP Jenazah wajib dilakukan
                      </p>
                    )}
                    {uploading === "ktpjenazah" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional: Dokumen Pendukung 1 */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                <Label htmlFor="filependukung1" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Dokumen Pendukung 1 (Opsional)
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.pendukung1 ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">{uploadedFiles.pendukung1.name}</p>
                          <p className="text-xs text-success">Berhasil diupload</p>
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

              {/* Optional: Dokumen Pendukung 2 */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                <Label htmlFor="filependukung2" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Dokumen Pendukung 2 (Opsional)
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.pendukung2 ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">{uploadedFiles.pendukung2.name}</p>
                          <p className="text-xs text-success">Berhasil diupload</p>
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

              {/* Catatan */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-500">
                <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) => handleInputChange("catatan", e.target.value)}
                  placeholder="Masukkan catatan tambahan jika diperlukan"
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.step6}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step6)}%</span>
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