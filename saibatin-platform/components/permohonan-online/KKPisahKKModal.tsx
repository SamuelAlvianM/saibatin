"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/permohonan-online/form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PemohonNikField } from "@/components/permohonan-online/pemohon-nik-field";
import { KkScanField } from "@/components/permohonan-online/kk-scan-field";
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
  Users,
  MapPin,
  Home,
  Split,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notifyError, notifySuccess } from "@/lib/notify";

interface KKPisahKKModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

interface FormData {
  // Data Pemohon
  pemohonnik: string;
  pemohonnama: string;
  pemohonkk: string;
  pemohonhp: string;
  pemohonemail: string;
  // Data Pisah KK
  jenispisah: string;
  nikygpisah: string;
  alasanpisah: string;
  nikpasangan: string;
  // Alamat Tujuan (conditional)
  kecamatantujuan: string;
  kelurahantujuan: string;
  norwtujuan: string;
  norttujuan: string;
  alamattujuan: string;
  // Files
  filekkx: string;
  filekkpasanganx: string;
  filebukunikahx: string;
  filesuratceraix: string;
  fileaktamatix: string;
  // Lainnya
  catatan: string;
}

interface UploadedFile {
  name: string;
  serverName: string;
  type: string;
}

export default function KKPisahKKModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: KKPisahKKModalProps) {
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
    jenispisah: "",
    nikygpisah: "",
    alasanpisah: "",
    nikpasangan: "",
    kecamatantujuan: "",
    kelurahantujuan: "",
    norwtujuan: "",
    norttujuan: "",
    alamattujuan: "",
    filekkx: "",
    filekkpasanganx: "",
    filebukunikahx: "",
    filesuratceraix: "",
    fileaktamatix: "",
    catatan: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    kk?: UploadedFile;
    kkpasangan?: UploadedFile;
    bukunikah?: UploadedFile;
    suratcerai?: UploadedFile;
    aktamati?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Options from PHP logic
  const jenisPisahOptions = [
    { value: "1", label: "Pisah KK dengan Pasangan" },
    { value: "2", label: "Pisah KK dengan Anggota Keluarga" },
  ];

  const alasanPisahOptions = [
    { value: "1", label: "Menikah" },
    { value: "2", label: "Menikah & Pindah Alamat" },
    { value: "3", label: "Cerai" },
    { value: "4", label: "Cerai & Pindah Alamat" },
    { value: "5", label: "Cerai Mati" },
    { value: "6", label: "Cerai Mati & Pindah Alamat" },
    { value: "7", label: "Kepala Keluarga Meninggal" },
    { value: "8", label: "Kepala Keluarga Meninggal & Pindah Alamat" },
    { value: "9", label: "Anak Keluarga Meninggal" },
    { value: "10", label: "Anak Keluarga Meninggal & Pindah Alamat" },
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

  const validateKK = (kk: string, fieldName: string): string | null => {
    if (!kk) return `${fieldName} harus diisi`;
    if (!/^\d+$/.test(kk)) {
      return `${fieldName} harus berisi angka saja`;
    }
    if (kk.length !== 16) {
      return `${fieldName} harus 16 digit`;
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

  const validateField = (field: keyof FormData, value: string): string | null => {
    switch (field) {
      case "pemohonemail":
        return validateEmail(value);
      case "pemohonnik":
        return validateNIK(value, "NIK Pemohon");
      case "nikygpisah":
        return validateNIK(value, "NIK yang Pisah");
      case "nikpasangan":
        return validateNIK(value, "NIK Pasangan");
      case "pemohonkk":
        return validateKK(value, "Nomor KK");
      case "pemohonhp":
        return validatePhone(value);
      case "pemohonnama":
        return validateRequired(value, "Nama Pemohon");
      case "jenispisah":
        return validateRequired(value, "Jenis Pisah KK");
      case "alasanpisah":
        return validateRequired(value, "Alasan Pisah");
      case "kecamatantujuan":
        return validateRequired(value, "Kecamatan Tujuan");
      case "kelurahantujuan":
        return validateRequired(value, "Kelurahan Tujuan");
      case "norwtujuan":
        return validateRequired(value, "No RW Tujuan");
      case "norttujuan":
        return validateRequired(value, "No RT Tujuan");
      case "alamattujuan":
        return validateRequired(value, "Alamat Tujuan");
      case "filekkx":
        return validateRequired(value, "Upload KK");
      case "filekkpasanganx":
        return validateRequired(value, "Upload KK Pasangan");
      case "filebukunikahx":
        return validateRequired(value, "Upload Buku Nikah");
      case "filesuratceraix":
        return validateRequired(value, "Upload Surat Cerai");
      case "fileaktamatix":
        return validateRequired(value, "Upload Akta Kematian");
      default:
        return null;
    }
  };

  // Helper to check if field should show based on alasanpisah
  const showAlamatTujuan = () => {
    const alasan = formData.alasanpisah;
    return ["2", "4", "6", "8", "10"].includes(alasan);
  };

  const showNikPasangan = () => {
    const alasan = formData.alasanpisah;
    return ["1", "2", "5", "6", "7", "8"].includes(alasan);
  };

  const showKKBukuNikah = () => {
    const alasan = formData.alasanpisah;
    return ["1", "2", "7", "8"].includes(alasan);
  };

  const showSuratCerai = () => {
    const alasan = formData.alasanpisah;
    return ["5", "6", "7", "8"].includes(alasan);
  };

  const showAktaMati = () => {
    const alasan = formData.alasanpisah;
    return ["9", "10"].includes(alasan);
  };

  // Get conditional fields for current state
  const getConditionalFields = (): (keyof FormData)[] => {
    const fields: (keyof FormData)[] = [];
    if (showNikPasangan()) fields.push("nikpasangan");
    if (showAlamatTujuan()) {
      fields.push("kecamatantujuan", "kelurahantujuan", "norwtujuan", "norttujuan", "alamattujuan");
    }
    if (showKKBukuNikah()) {
      fields.push("filekkpasanganx", "filebukunikahx");
    }
    if (showSuratCerai()) {
      fields.push("filesuratceraix");
    }
    if (showAktaMati()) {
      fields.push("fileaktamatix");
    }
    return fields;
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
        fieldsToValidate = ["jenispisah", "nikygpisah", "alasanpisah"];
        if (showNikPasangan()) fieldsToValidate.push("nikpasangan");
        break;
      case 3:
        if (showAlamatTujuan()) {
          fieldsToValidate = ["kecamatantujuan", "kelurahantujuan", "norwtujuan", "norttujuan", "alamattujuan"];
        }
        break;
      case 4:
        fieldsToValidate = ["filekkx"];
        if (showKKBukuNikah()) fieldsToValidate.push("filekkpasanganx", "filebukunikahx");
        if (showSuratCerai()) fieldsToValidate.push("filesuratceraix");
        if (showAktaMati()) fieldsToValidate.push("fileaktamatix");
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
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setErrors([]);
    
    // Determine next step based on conditions
    if (currentStep === 2) {
      setCurrentStep(showAlamatTujuan() ? 3 : 4);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrors([]);
    
    // Determine previous step based on conditions
    if (currentStep === 4 && !showAlamatTujuan()) {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => prev - 1);
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
      const response = await fetch("/api/kk-pisah/fetch", {
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
          jenispisah: data.jenispisah || "",
          nikygpisah: data.nikygpisah || "",
          alasanpisah: data.alasanpisah || "",
          nikpasangan: data.nikpasangan || "",
          kecamatantujuan: data.kecamatantujuan || "",
          kelurahantujuan: data.kelurahantujuan || "",
          norwtujuan: data.norwtujuan || "",
          norttujuan: data.norttujuan || "",
          alamattujuan: data.alamattujuan || "",
          filekkx: data.filekk || "",
          filekkpasanganx: data.filekkpasangan || "",
          filebukunikahx: data.filebukunikah || "",
          filesuratceraix: data.filesuratcerai || "",
          fileaktamatix: data.fileaktamati || "",
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
    if (
      (field === "pemohonnik" ||
        field === "pemohonkk" ||
        field === "pemohonhp" ||
        field === "nikygpisah" ||
        field === "nikpasangan") &&
      value
    ) {
      value = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setTouchedFields((prev) => new Set(prev).add(field));

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
    fileType: "kk" | "kkpasangan" | "bukunikah" | "suratcerai" | "aktamati",
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
      formDataUpload.append("file" + fileType, file);
      formDataUpload.append("typeset", "file" + fileType);
      formDataUpload.append("uid", Date.now().toString());
      formDataUpload.append("groupset", fileType);

      const response = await fetch("/api/kk-pisah/upload", {
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
          kk: "filekkx",
          kkpasangan: "filekkpasanganx",
          bukunikah: "filebukunikahx",
          suratcerai: "filesuratceraix",
          aktamati: "fileaktamatix",
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

  const removeFile = (fileType: "kk" | "kkpasangan" | "bukunikah" | "suratcerai" | "aktamati") => {
    const fieldMap = {
      kk: "filekkx",
      kkpasangan: "filekkpasanganx",
      bukunikah: "filebukunikahx",
      suratcerai: "filesuratceraix",
      aktamati: "fileaktamatix",
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
    for (let step = 1; step <= 4; step++) {
      // Skip step 3 if no alamat tujuan needed
      if (step === 3 && !showAlamatTujuan()) continue;
      
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
      const endpoint =
        mode === "edit"
          ? "/api/kk-pisah/update"
          : "/api/kk-pisah/create";

      const payload =
        mode === "edit" ? { ...formData, prm2: permohonanId } : formData;

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
          setFormData({
            pemohonnik: "",
            pemohonnama: "",
            pemohonkk: "",
            pemohonhp: "",
            pemohonemail: "",
            jenispisah: "",
            nikygpisah: "",
            alasanpisah: "",
            nikpasangan: "",
            kecamatantujuan: "",
            kelurahantujuan: "",
            norwtujuan: "",
            norttujuan: "",
            alamattujuan: "",
            filekkx: "",
            filekkpasanganx: "",
            filebukunikahx: "",
            filesuratceraix: "",
            fileaktamatix: "",
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
    const steps = [
      ["pemohonnik", "pemohonnama", "pemohonkk", "pemohonhp", "pemohonemail"],
      ["jenispisah", "nikygpisah", "alasanpisah"],
      showAlamatTujuan() ? ["kecamatantujuan", "kelurahantujuan", "norwtujuan", "norttujuan", "alamattujuan"] : [],
      ["filekkx"],
    ];

    const progress: Record<string, number> = {};
    steps.forEach((stepFields, index) => {
      if (stepFields.length === 0) {
        progress[`step${index + 1}`] = 100;
      } else {
        const filled = stepFields.filter(
          (field) => formData[field as keyof FormData],
        ).length;
        progress[`step${index + 1}`] = (filled / stepFields.length) * 100;
      }
    });

    // Add conditional file fields to step 4 progress
    const step4Fields = ["filekkx"];
    if (showKKBukuNikah()) step4Fields.push("filekkpasanganx", "filebukunikahx");
    if (showSuratCerai()) step4Fields.push("filesuratceraix");
    if (showAktaMati()) step4Fields.push("fileaktamatix");
    
    const step4Filled = step4Fields.filter(
      (field) => formData[field as keyof FormData],
    ).length;
    progress.step4 = (step4Filled / step4Fields.length) * 100;

    return progress;
  };

  const progress = getStepProgress();

  const steps = [
    { step: 1, label: "Data Pemohon", icon: Users },
    { step: 2, label: "Jenis Pisah", icon: Split },
    { step: 3, label: "Alamat Tujuan", icon: showAlamatTujuan() ? MapPin : Home },
    { step: 4, label: "Dokumen", icon: FileText },
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
      "transition-all duration-200 focus:ring-2 focus:ring-warning",
      touchedFields.has(field) && fieldErrors[field] && "border-destructive focus:border-destructive focus:ring-destructive"
    );
  };

  // Helper for select class with error state
  const getSelectClass = (field: keyof FormData) => {
    return cn(
      "transition-all duration-200 focus:ring-2 focus:ring-warning",
      touchedFields.has(field) && fieldErrors[field] && "border-destructive focus:border-destructive focus:ring-destructive"
    );
  };

  // Render file upload with validation
  const renderFileUpload = (
    id: string,
    label: string,
    fileType: "kk" | "kkpasangan" | "bukunikah" | "suratcerai" | "aktamati",
    required: boolean = false,
    delayClass: string = ""
  ) => {
    const fieldMap = {
      kk: "filekkx",
      kkpasangan: "filekkpasanganx",
      bukunikah: "filebukunikahx",
      suratcerai: "filesuratceraix",
      aktamati: "fileaktamatix",
    };
    const fieldName = fieldMap[fileType] as keyof FormData;

    return (
      <div className={`space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 ${delayClass}`}>
        <Label htmlFor={id} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {label} {required && "*"}
          {!required && <span className="text-xs text-muted-foreground">(Opsional)</span>}
          {required && <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>}
        </Label>
        {uploadedFiles[fileType] ? (
          <div className="relative group">
            <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-success">
                    {uploadedFiles[fileType]?.name}
                  </p>
                  <p className="text-xs text-success">Berhasil diupload</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(fileType)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Input
              id={id}
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              onChange={(e) => handleFileUpload(e, fileType)}
              disabled={uploading === fileType}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-warning",
                required && touchedFields.has(fieldName) && !formData[fieldName] && "border-destructive focus:border-destructive"
              )}
            />
            {required && touchedFields.has(fieldName) && !formData[fieldName] && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                {fieldErrors[fieldName] || `Upload ${label} wajib dilakukan`}
              </p>
            )}
            {uploading === fileType && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-warning" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col w-full">
        <DialogHeader className="space-y-1 pb-1 border-b">
          <DialogTitle className="text-2xl font-bold text-warning">
            {mode === "edit" ? "Edit Permohonan" : "Permohonan Pisah KK"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lengkapi formulir pemisahan kartu keluarga dengan data yang akurat
          </DialogDescription>

          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between px-2">
              {steps.map(({ step, label, icon: Icon }) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-all duration-300 cursor-pointer",
                    currentStep === step
                      ? "text-warning scale-110 font-bold"
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

            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out",
                  "bg-warning",
                )}
                style={{
                  width: `${((currentStep - 1) / 3) * 100}%`,
                }}
              />
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-1">
          <div className="space-y-4 py-4">
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
                    <div className="h-full bg-warning transition-all duration-500" style={{ width: `${progress.step1}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step1)}%</span>
                </div>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-warning hover:bg-warning/90 transition-all duration-300"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>

            {/* Step 2: Jenis Pisah & Alasan */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 2
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="jenispisah">Jenis Pisah KK *</Label>
                  <Select 
                    value={formData.jenispisah} 
                    onValueChange={(value) => handleInputChange("jenispisah", value)}
                  >
                    <SelectTrigger className={getSelectClass("jenispisah")}>
                      <SelectValue placeholder="Pilih jenis pisah KK" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisPisahOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("jenispisah")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="alasanpisah">Alasan Pisah *</Label>
                  <Select 
                    value={formData.alasanpisah} 
                    onValueChange={(value) => {
                      handleInputChange("alasanpisah", value);
                      // Reset conditional fields when alasan changes
                      if (!showNikPasangan()) handleInputChange("nikpasangan", "");
                      if (!showAlamatTujuan()) {
                        handleInputChange("kecamatantujuan", "");
                        handleInputChange("kelurahantujuan", "");
                        handleInputChange("norwtujuan", "");
                        handleInputChange("norttujuan", "");
                        handleInputChange("alamattujuan", "");
                      }
                    }}
                  >
                    <SelectTrigger className={getSelectClass("alasanpisah")}>
                      <SelectValue placeholder="Pilih alasan pemisahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {alasanPisahOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("alasanpisah")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="nikygpisah" className="flex items-center justify-between">
                    <span>NIK yang Pisah *</span>
                    <span className={cn("text-xs font-normal", formData.nikygpisah.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.nikygpisah.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikygpisah"
                    value={formData.nikygpisah}
                    onChange={(e) => handleInputChange("nikygpisah", e.target.value)}
                    placeholder="16 digit NIK yang akan dipisah"
                    maxLength={16}
                    className={getInputClass("nikygpisah")}
                  />
                  {showFieldError("nikygpisah")}
                </div>

                {showNikPasangan() && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                    <Label htmlFor="nikpasangan" className="flex items-center justify-between">
                      <span>NIK Pasangan *</span>
                      <span className={cn("text-xs font-normal", formData.nikpasangan.length === 16 ? "text-success" : "text-muted-foreground")}>
                        {formData.nikpasangan.length}/16
                      </span>
                    </Label>
                    <Input
                      id="nikpasangan"
                      value={formData.nikpasangan}
                      onChange={(e) => handleInputChange("nikpasangan", e.target.value)}
                      placeholder="16 digit NIK Pasangan"
                      maxLength={16}
                      className={getInputClass("nikpasangan")}
                    />
                    {showFieldError("nikpasangan")}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning transition-all duration-500" style={{ width: `${progress.step2}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step2)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-warning hover:bg-warning/90 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3: Alamat Tujuan (Conditional) */}
            {showAlamatTujuan() && (
              <div
                className={cn(
                  "space-y-4 transition-all duration-500 ease-in-out",
                  currentStep === 3
                    ? "animate-in slide-in-from-top-4 fade-in"
                    : "hidden",
                )}
              >
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
                  <h3 className="font-semibold text-warning mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Alamat Tujuan Baru
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                      <Label htmlFor="kecamatantujuan">Kecamatan Tujuan *</Label>
                      <Input
                        id="kecamatantujuan"
                        value={formData.kecamatantujuan}
                        onChange={(e) => handleInputChange("kecamatantujuan", e.target.value)}
                        placeholder="Nama kecamatan tujuan"
                        className={getInputClass("kecamatantujuan")}
                      />
                      {showFieldError("kecamatantujuan")}
                    </div>

                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                      <Label htmlFor="kelurahantujuan">Kelurahan Tujuan *</Label>
                      <Input
                        id="kelurahantujuan"
                        value={formData.kelurahantujuan}
                        onChange={(e) => handleInputChange("kelurahantujuan", e.target.value)}
                        placeholder="Nama kelurahan tujuan"
                        className={getInputClass("kelurahantujuan")}
                      />
                      {showFieldError("kelurahantujuan")}
                    </div>

                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                      <Label htmlFor="norwtujuan">No RW Tujuan *</Label>
                      <Input
                        id="norwtujuan"
                        value={formData.norwtujuan}
                        onChange={(e) => handleInputChange("norwtujuan", e.target.value)}
                        placeholder="Nomor RW"
                        className={getInputClass("norwtujuan")}
                      />
                      {showFieldError("norwtujuan")}
                    </div>

                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                      <Label htmlFor="norttujuan">No RT Tujuan *</Label>
                      <Input
                        id="norttujuan"
                        value={formData.norttujuan}
                        onChange={(e) => handleInputChange("norttujuan", e.target.value)}
                        placeholder="Nomor RT"
                        className={getInputClass("norttujuan")}
                      />
                      {showFieldError("norttujuan")}
                    </div>

                    <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                      <Label htmlFor="alamattujuan">Alamat Lengkap Tujuan *</Label>
                      <Textarea
                        id="alamattujuan"
                        value={formData.alamattujuan}
                        onChange={(e) => handleInputChange("alamattujuan", e.target.value)}
                        placeholder="Alamat lengkap tujuan pemisahan KK"
                        rows={3}
                        className={cn(
                          "transition-all duration-200 focus:ring-2 focus:ring-warning resize-none",
                          touchedFields.has("alamattujuan") && fieldErrors.alamattujuan && "border-destructive focus:ring-destructive"
                        )}
                      />
                      {showFieldError("alamattujuan")}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                    Kembali
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning transition-all duration-500" style={{ width: `${progress.step3}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground">{Math.round(progress.step3)}%</span>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-warning hover:bg-warning/90 transition-all duration-300"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Upload Dokumen */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 4
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFileUpload("filekk", "Kartu Keluarga (KK) Asal", "kk", true, "")}
                
                {showKKBukuNikah() && renderFileUpload("filekkpasangan", "KK Pasangan", "kkpasangan", true, "delay-75")}
                
                {showKKBukuNikah() && renderFileUpload("filebukunikah", "Buku Nikah", "bukunikah", true, "delay-100")}
                
                {showSuratCerai() && renderFileUpload("filesuratcerai", "Surat Cerai", "suratcerai", true, "delay-150")}
                
                {showAktaMati() && renderFileUpload("fileaktamati", "Akta Kematian", "aktamati", true, "delay-200")}

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
                  <Textarea
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => handleInputChange("catatan", e.target.value)}
                    placeholder="Masukkan catatan tambahan jika diperlukan"
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-warning resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning transition-all duration-500" style={{ width: `${progress.step4}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step4)}%</span>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-warning hover:bg-warning/90 transition-all duration-300 shadow-lg hover:shadow-xl"
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