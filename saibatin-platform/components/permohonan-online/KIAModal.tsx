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
  MapPin,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KedatanganPendudukModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

interface FormData {
  pemohonnik: string;
  pemohonnama: string;
  pemohonkk: string;
  pemohonhp: string;
  pemohonemail: string;
  skpwni: string;
  namapemohon: string;
  nikpemohon: string;
  nohp: string;
  email: string;
  kecamatantujuan: string;
  desatujuan: string;
  dusuntujuan: string;
  filesuratpindahx: string;
  filebukunikahx: string;
  filependukung1x: string;
  filependukung2x: string;
  catatan: string;
}

interface UploadedFile {
  name: string;
  serverName: string;
  type: string;
}

export default function KedatanganPendudukModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: KedatanganPendudukModalProps) {
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
    skpwni: "",
    namapemohon: "",
    nikpemohon: "",
    nohp: "",
    email: "",
    kecamatantujuan: "",
    desatujuan: "",
    dusuntujuan: "",
    filesuratpindahx: "",
    filebukunikahx: "",
    filependukung1x: "",
    filependukung2x: "",
    catatan: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    suratpindah?: UploadedFile;
    bukunikah?: UploadedFile;
    pendukung1?: UploadedFile;
    pendukung2?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validation functions - matching AktaKelahiranNikAdaModal pattern
  const validateEmail = (email: string, fieldName: string = "Email"): string | null => {
    if (!email) return `${fieldName} harus diisi`;
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

  const validatePhone = (phone: string, fieldName: string): string | null => {
    if (!phone) return `${fieldName} harus diisi`;
    if (!/^\d+$/.test(phone)) {
      return `${fieldName} harus berisi angka saja`;
    }
    if (phone.length < 10 || phone.length > 13) {
      return `${fieldName} harus 10-13 digit`;
    }
    if (!phone.startsWith("0")) {
      return `${fieldName} harus diawali angka 0`;
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
        return validateEmail(value, "Email Pemohon");
      case "email":
        return validateEmail(value, "Email (Kedatangan)");
      case "pemohonnik":
        return validateNIK(value, "NIK Pemohon");
      case "nikpemohon":
        return validateNIK(value, "NIK Pemohon (Kedatangan)");
      case "pemohonkk":
        return validateKK(value);
      case "pemohonhp":
        return validatePhone(value, "Nomor HP");
      case "nohp":
        return validatePhone(value, "No HP");
      case "pemohonnama":
        return validateRequired(value, "Nama Pemohon");
      case "skpwni":
        return validateRequired(value, "SKPWNI");
      case "namapemohon":
        return validateRequired(value, "Nama Pemohon (Kedatangan)");
      case "kecamatantujuan":
        return validateRequired(value, "Kecamatan Tujuan");
      case "desatujuan":
        return validateRequired(value, "Desa Tujuan");
      case "dusuntujuan":
        return validateRequired(value, "Dusun Tujuan");
      case "filesuratpindahx":
        return validateRequired(value, "Upload Surat Pindah");
      default:
        return null;
    }
  };

  // Validate entire step - matching AktaKelahiranNikAdaModal pattern
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
        fieldsToValidate = ["skpwni", "namapemohon", "nikpemohon", "nohp", "email", "kecamatantujuan", "desatujuan", "dusuntujuan"];
        break;
      case 3:
        fieldsToValidate = ["filesuratpindahx"];
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
      const response = await fetch("/api/kia/fetch", {
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
          skpwni: data.skpwni || "",
          namapemohon: data.namapemohon || "",
          nikpemohon: data.nikpemohon || "",
          nohp: data.nohp || "",
          email: data.email || "",
          kecamatantujuan: data.kecamatantujuan || "",
          desatujuan: data.desatujuan || "",
          dusuntujuan: data.dusuntujuan || "",
          filesuratpindahx: data.filesuratpindah || "",
          filebukunikahx: data.filebukunikah || "",
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
        field === "nikpemohon" ||
        field === "nohp") &&
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

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "suratpindah" | "bukunikah" | "pendukung1" | "pendukung2",
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

      const response = await fetch("/api/kia/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.error && result.error.length > 0) {
        setErrors(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        const serverFileName = result.success[0];

        const fieldMap = {
          suratpindah: "filesuratpindahx",
          bukunikah: "filebukunikahx",
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

  const removeFile = (fileType: "suratpindah" | "bukunikah" | "pendukung1" | "pendukung2") => {
    const fieldMap = {
      suratpindah: "filesuratpindahx",
      bukunikah: "filebukunikahx",
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
    for (let step = 1; step <= 3; step++) {
      const { isValid, errors: stepErrors } = validateStep(step);
      if (!isValid) {
        setErrors(stepErrors);
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
          ? "/api/kia/update"
          : "/api/kia/create";

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
            skpwni: "",
            namapemohon: "",
            nikpemohon: "",
            nohp: "",
            email: "",
            kecamatantujuan: "",
            desatujuan: "",
            dusuntujuan: "",
            filesuratpindahx: "",
            filebukunikahx: "",
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
    const steps = [
      ["pemohonnik", "pemohonnama", "pemohonkk", "pemohonhp", "pemohonemail"],
      ["skpwni", "namapemohon", "nikpemohon", "nohp", "email", "kecamatantujuan", "desatujuan", "dusuntujuan"],
      ["filesuratpindahx"],
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
    { step: 2, label: "Data Kedatangan", icon: MapPin },
    { step: 3, label: "Dokumen", icon: FileCheck },
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
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col w-full">
        <DialogHeader className="space-y-1 pb-1 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            {mode === "edit"
              ? "Edit Permohonan"
              : "Permohonan Kedatangan Penduduk"}
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
                  : "hidden",
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
                          : "text-muted-foreground",
                      )}
                    >
                      {formData.pemohonnik.length}/16
                    </span>
                  </Label>
                  <Input
                    id="pemohonnik"
                    value={formData.pemohonnik}
                    onChange={(e) =>
                      handleInputChange("pemohonnik", e.target.value)
                    }
                    placeholder="Masukkan 16 digit NIK"
                    maxLength={16}
                    className={getInputClass("pemohonnik")}
                  />
                  {showFieldError("pemohonnik")}
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
                    className={getInputClass("pemohonnama")}
                  />
                  {showFieldError("pemohonnama")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label
                    htmlFor="pemohonkk"
                    className="flex items-center justify-between"
                  >
                    <span>Nomor KK *</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        formData.pemohonkk.length === 16
                          ? "text-success"
                          : "text-muted-foreground",
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
                    className={getInputClass("pemohonkk")}
                  />
                  {showFieldError("pemohonkk")}
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
                          : "text-muted-foreground",
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
                    onChange={(e) =>
                      handleInputChange("pemohonemail", e.target.value)
                    }
                    placeholder="Contoh: email@domain.com"
                    className={getInputClass("pemohonemail")}
                  />
                  {showFieldError("pemohonemail")}
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
                  onClick={handleNextStep}
                  className="bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>

            {/* Step 2: Data Kedatangan */}
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
                  <Label htmlFor="skpwni">SKPWNI *</Label>
                  <Input
                    id="skpwni"
                    value={formData.skpwni}
                    onChange={(e) => handleInputChange("skpwni", e.target.value)}
                    placeholder="Masukkan SKPWNI"
                    className={getInputClass("skpwni")}
                  />
                  {showFieldError("skpwni")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="namapemohon">Nama Pemohon (Kedatangan) *</Label>
                  <Input
                    id="namapemohon"
                    value={formData.namapemohon}
                    onChange={(e) =>
                      handleInputChange("namapemohon", e.target.value)
                    }
                    placeholder="Masukkan nama pemohon kedatangan"
                    className={getInputClass("namapemohon")}
                  />
                  {showFieldError("namapemohon")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label
                    htmlFor="nikpemohon"
                    className="flex items-center justify-between"
                  >
                    <span>NIK Pemohon (Kedatangan) *</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        formData.nikpemohon.length === 16
                          ? "text-success"
                          : "text-muted-foreground",
                      )}
                    >
                      {formData.nikpemohon.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikpemohon"
                    value={formData.nikpemohon}
                    onChange={(e) =>
                      handleInputChange("nikpemohon", e.target.value)
                    }
                    placeholder="Masukkan 16 digit NIK"
                    maxLength={16}
                    className={getInputClass("nikpemohon")}
                  />
                  {showFieldError("nikpemohon")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label
                    htmlFor="nohp"
                    className="flex items-center justify-between"
                  >
                    <span>No HP *</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        formData.nohp.length >= 10 &&
                          formData.nohp.length <= 13
                          ? "text-success"
                          : "text-muted-foreground",
                      )}
                    >
                      {formData.nohp.length}/13
                    </span>
                  </Label>
                  <Input
                    id="nohp"
                    type="tel"
                    value={formData.nohp}
                    onChange={(e) => handleInputChange("nohp", e.target.value)}
                    placeholder="Contoh: 081234567890"
                    maxLength={13}
                    className={getInputClass("nohp")}
                  />
                  {showFieldError("nohp")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                  <Label htmlFor="email">Email (Kedatangan) *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Contoh: email@domain.com"
                    className={getInputClass("email")}
                  />
                  {showFieldError("email")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="kecamatantujuan">Kecamatan Tujuan *</Label>
                  <Input
                    id="kecamatantujuan"
                    value={formData.kecamatantujuan}
                    onChange={(e) =>
                      handleInputChange("kecamatantujuan", e.target.value)
                    }
                    placeholder="Masukkan kecamatan tujuan"
                    className={getInputClass("kecamatantujuan")}
                  />
                  {showFieldError("kecamatantujuan")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-500">
                  <Label htmlFor="desatujuan">Desa Tujuan *</Label>
                  <Input
                    id="desatujuan"
                    value={formData.desatujuan}
                    onChange={(e) =>
                      handleInputChange("desatujuan", e.target.value)
                    }
                    placeholder="Masukkan desa tujuan"
                    className={getInputClass("desatujuan")}
                  />
                  {showFieldError("desatujuan")}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-700">
                  <Label htmlFor="dusuntujuan">Dusun Tujuan *</Label>
                  <Input
                    id="dusuntujuan"
                    value={formData.dusuntujuan}
                    onChange={(e) =>
                      handleInputChange("dusuntujuan", e.target.value)
                    }
                    placeholder="Masukkan dusun tujuan"
                    className={getInputClass("dusuntujuan")}
                  />
                  {showFieldError("dusuntujuan")}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
                  <Label htmlFor="catatan">Catatan (Opsional)</Label>
                  <Textarea
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => handleInputChange("catatan", e.target.value)}
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
                  onClick={handlePrevStep}
                  className="transition-all duration-300"
                >
                  Kembali
                </Button>
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

            {/* Step 3: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              {/* Surat Pindah Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="filesuratpindah" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Surat Pindah *
                  <span className="text-xs text-muted-foreground">
                    (PNG/JPG/JPEG, Max 2MB)
                  </span>
                </Label>
                {uploadedFiles.suratpindah ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">
                            {uploadedFiles.suratpindah.name}
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
                        onClick={() => removeFile("suratpindah")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filesuratpindah"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "suratpindah")}
                      disabled={uploading === "suratpindah"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-primary",
                        touchedFields.has("filesuratpindahx") && !formData.filesuratpindahx && "border-destructive focus:border-destructive"
                      )}
                    />
                    {touchedFields.has("filesuratpindahx") && !formData.filesuratpindahx && (
                      <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload Surat Pindah wajib dilakukan
                      </p>
                    )}
                    {uploading === "suratpindah" && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buku Nikah Upload - Optional */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                <Label htmlFor="filebukunikah" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Buku Nikah
                  <span className="text-xs text-muted-foreground">
                    (Opsional, PNG/JPG/JPEG, Max 2MB)
                  </span>
                </Label>
                {uploadedFiles.bukunikah ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">
                            {uploadedFiles.bukunikah.name}
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
                        onClick={() => removeFile("bukunikah")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filebukunikah"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "bukunikah")}
                      disabled={uploading === "bukunikah"}
                      className="cursor-pointer transition-all duration-200 hover:border-primary"
                    />
                    {uploading === "bukunikah" && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pendukung 1 Upload - Optional */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                <Label
                  htmlFor="filependukung1"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Upload Dokumen Pendukung 1
                  <span className="text-xs text-muted-foreground">
                    (Opsional)
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
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pendukung 2 Upload - Optional */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                <Label
                  htmlFor="filependukung2"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Upload Dokumen Pendukung 2
                  <span className="text-xs text-muted-foreground">
                    (Opsional)
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
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
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
                  onClick={handlePrevStep}
                  className="transition-all duration-300"
                >
                  Kembali
                </Button>
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