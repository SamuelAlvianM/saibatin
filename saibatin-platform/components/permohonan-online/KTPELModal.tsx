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
  CreditCard,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KTPELModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

// Updated interface matching PHP KTPEL structure
interface FormData {
  // Pemohon Data
  pemohonnik: string;
  pemohonnama: string;
  pemohonkk: string;
  pemohonhp: string;
  pemohonemail: string;
  
  // KTP-El Data
  nokk: string;
  nik: string;
  nama: string;
  alasancetak: string;
  
  // Files
  filekkx: string;
  filektplamax: string;
  filesuratkehilanganx: string;
  fileketeranganx: string;
  
  // Notes
  catatan: string;
}

interface UploadedFile {
  name: string;
  serverName: string;
  type: string;
}

export default function KTPELModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: KTPELModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Updated initial state matching PHP KTPEL structure
  const [formData, setFormData] = useState<FormData>({
    pemohonnik: "",
    pemohonnama: "",
    pemohonkk: "",
    pemohonhp: "",
    pemohonemail: "",
    nokk: "",
    nik: "",
    nama: "",
    alasancetak: "",
    filekkx: "",
    filektplamax: "",
    filesuratkehilanganx: "",
    fileketeranganx: "",
    catatan: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    kk?: UploadedFile;
    ktplama?: UploadedFile;
    suratkehilangan?: UploadedFile;
    keterangan?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Alasan cetak options matching PHP logic
  const alasanCetakOptions = [
    { value: "1", label: "Baru (Pemula)" },
    { value: "2", label: "Hilang" },
    { value: "3", label: "Rusak" },
    { value: "4", label: "Pindah Datang" },
    { value: "5", label: "Perubahan Data" },
    { value: "6", label: "Cetak Ulang" },
  ];

  // Validation functions (same as before)
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

  const validateField = (
    field: keyof FormData,
    value: string,
  ): string | null => {
    switch (field) {
      case "pemohonemail":
        return validateEmail(value);
      case "pemohonnik":
        return validateNIK(value, "NIK Pemohon");
      case "nik":
        return validateNIK(value, "NIK");
      case "pemohonkk":
        return validateKK(value, "Nomor KK Pemohon");
      case "nokk":
        return validateKK(value, "Nomor KK");
      case "pemohonhp":
        return validatePhone(value);
      case "pemohonnama":
        return validateRequired(value, "Nama Pemohon");
      case "nama":
        return validateRequired(value, "Nama Lengkap");
      case "alasancetak":
        return validateRequired(value, "Alasan Cetak");
      case "filekkx":
        return validateRequired(value, "Upload KK");
      case "filektplamax":
        if (isFileRequired("ktplama")) {
          return validateRequired(value, "Upload KTP Lama");
        }
        return null;
      case "filesuratkehilanganx":
        if (isFileRequired("suratkehilangan")) {
          return validateRequired(value, "Upload Surat Kehilangan");
        }
        return null;
      case "fileketeranganx":
        if (isFileRequired("keterangan")) {
          return validateRequired(value, "Upload Surat Keterangan");
        }
        return null;
      default:
        return null;
    }
  };

  // Helper to check if file is required based on alasancetak
  const isFileRequired = (fileType: "ktplama" | "suratkehilangan" | "keterangan"): boolean => {
    const alasan = formData.alasancetak;
    switch (fileType) {
      case "ktplama":
        return alasan === "1" || alasan === "6"; // Baru or Cetak Ulang
      case "suratkehilangan":
        return alasan === "2"; // Hilang
      case "keterangan":
        return alasan === "3"; // Rusak
      default:
        return false;
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
        fieldsToValidate = ["nokk", "nik", "nama", "alasancetak"];
        break;
      case 3:
        fieldsToValidate = ["filekkx"];
        if (isFileRequired("ktplama")) {
          fieldsToValidate.push("filektplamax");
        }
        if (isFileRequired("suratkehilangan")) {
          fieldsToValidate.push("filesuratkehilanganx");
        }
        if (isFileRequired("keterangan")) {
          fieldsToValidate.push("fileketeranganx");
        }
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
      const response = await fetch("/api/ktpel/fetch", {
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
          nokk: data.nokk || "",
          nik: data.nik || "",
          nama: data.nama || "",
          alasancetak: data.alasancetak || "",
          filekkx: data.filekk || "",
          filektplamax: data.filektplama || "",
          filesuratkehilanganx: data.filesuratkehilangan || "",
          fileketeranganx: data.fileketerangan || "",
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
        field === "nik" ||
        field === "nokk") &&
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
    fileType: "kk" | "ktplama" | "suratkehilangan" | "keterangan",
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

      const response = await fetch("/api/ktpel/upload", {
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
          ktplama: "filektplamax",
          suratkehilangan: "filesuratkehilanganx",
          keterangan: "fileketeranganx",
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

  const removeFile = (fileType: "kk" | "ktplama" | "suratkehilangan" | "keterangan") => {
    const fieldMap = {
      kk: "filekkx",
      ktplama: "filektplamax",
      suratkehilangan: "filesuratkehilanganx",
      keterangan: "fileketeranganx",
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
          ? "/api/ktpel/update"
          : "/api/ktpel/create";

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
          // Reset form
          setFormData({
            pemohonnik: "",
            pemohonnama: "",
            pemohonkk: "",
            pemohonhp: "",
            pemohonemail: "",
            nokk: "",
            nik: "",
            nama: "",
            alasancetak: "",
            filekkx: "",
            filektplamax: "",
            filesuratkehilanganx: "",
            fileketeranganx: "",
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
    const step2Fields = ["nokk", "nik", "nama", "alasancetak"];
    
    const step1Filled = step1Fields.filter(
      (field) => formData[field as keyof FormData],
    ).length;
    const step2Filled = step2Fields.filter(
      (field) => formData[field as keyof FormData],
    ).length;
    
    // Calculate step 3 progress based on required files for selected alasan
    let step3Required = 1; // KK always required
    let step3Filled = formData.filekkx ? 1 : 0;
    
    if (isFileRequired("ktplama")) {
      step3Required++;
      if (formData.filektplamax) step3Filled++;
    }
    if (isFileRequired("suratkehilangan")) {
      step3Required++;
      if (formData.filesuratkehilanganx) step3Filled++;
    }
    if (isFileRequired("keterangan")) {
      step3Required++;
      if (formData.fileketeranganx) step3Filled++;
    }

    return {
      step1: (step1Filled / step1Fields.length) * 100,
      step2: (step2Filled / step2Fields.length) * 100,
      step3: (step3Filled / step3Required) * 100,
    };
  };

  const progress = getStepProgress();

  const steps = [
    { step: 1, label: "Data Pemohon", icon: User },
    { step: 2, label: "Data KTP-El", icon: CreditCard },
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col w-full">
        <DialogHeader className="space-y-1 pb-1 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            {mode === "edit"
              ? "Edit Permohonan"
              : "Permohonan KTP-El"}
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
                  <Label htmlFor="pemohonnik" className="flex items-center justify-between">
                    <span>NIK Pemohon *</span>
                    <span className={cn("text-xs font-normal", formData.pemohonnik.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.pemohonnik.length}/16
                    </span>
                  </Label>
                  <Input
                    id="pemohonnik"
                    value={formData.pemohonnik}
                    onChange={(e) => handleInputChange("pemohonnik", e.target.value)}
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
                    onChange={(e) => handleInputChange("pemohonnama", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={getInputClass("pemohonnama")}
                  />
                  {showFieldError("pemohonnama")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="pemohonkk" className="flex items-center justify-between">
                    <span>Nomor KK Pemohon *</span>
                    <span className={cn("text-xs font-normal", formData.pemohonkk.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.pemohonkk.length}/16
                    </span>
                  </Label>
                  <Input
                    id="pemohonkk"
                    value={formData.pemohonkk}
                    onChange={(e) => handleInputChange("pemohonkk", e.target.value)}
                    placeholder="Masukkan 16 digit KK"
                    maxLength={16}
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

            {/* Step 2: Data KTP-El */}
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
                  <Label htmlFor="nokk" className="flex items-center justify-between">
                    <span>Nomor KK *</span>
                    <span className={cn("text-xs font-normal", formData.nokk.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.nokk.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nokk"
                    value={formData.nokk}
                    onChange={(e) => handleInputChange("nokk", e.target.value)}
                    placeholder="Masukkan 16 digit KK"
                    maxLength={16}
                    className={getInputClass("nokk")}
                  />
                  {showFieldError("nokk")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="nik" className="flex items-center justify-between">
                    <span>NIK *</span>
                    <span className={cn("text-xs font-normal", formData.nik.length === 16 ? "text-success" : "text-muted-foreground")}>
                      {formData.nik.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nik"
                    value={formData.nik}
                    onChange={(e) => handleInputChange("nik", e.target.value)}
                    placeholder="Masukkan 16 digit NIK"
                    maxLength={16}
                    className={getInputClass("nik")}
                  />
                  {showFieldError("nik")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => handleInputChange("nama", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={getInputClass("nama")}
                  />
                  {showFieldError("nama")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="alasancetak">Alasan Cetak *</Label>
                  <Select 
                    value={formData.alasancetak} 
                    onValueChange={(value) => handleInputChange("alasancetak", value)}
                  >
                    <SelectTrigger className={getSelectClass("alasancetak")}>
                      <SelectValue placeholder="Pilih alasan cetak" />
                    </SelectTrigger>
                    <SelectContent>
                      {alasanCetakOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("alasancetak")}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
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

            {/* Step 3: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              {/* KK Upload - Always Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="filekk" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Kartu Keluarga (KK) *
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

              {/* KTP Lama Upload - Required for Baru (1) or Cetak Ulang (6) */}
              {(formData.alasancetak === "1" || formData.alasancetak === "6") && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="filektplama" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    KTP Lama *
                    <span className="text-xs text-muted-foreground">
                      (PNG/JPG/JPEG, Max 2MB)
                    </span>
                  </Label>
                  {uploadedFiles.ktplama ? (
                    <div className="relative group">
                      <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-success/10 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-success">
                              {uploadedFiles.ktplama.name}
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
                          onClick={() => removeFile("ktplama")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="filektplama"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleFileUpload(e, "ktplama")}
                        disabled={uploading === "ktplama"}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:border-primary",
                          touchedFields.has("filektplamax") && !formData.filektplamax && "border-destructive focus:border-destructive"
                        )}
                      />
                      {touchedFields.has("filektplamax") && !formData.filektplamax && (
                        <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                          Upload KTP Lama wajib dilakukan
                        </p>
                      )}
                      {uploading === "ktplama" && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Surat Kehilangan Upload - Required for Hilang (2) */}
              {formData.alasancetak === "2" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="filesuratkehilangan" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Surat Kehilangan *
                    <span className="text-xs text-muted-foreground">
                      (PNG/JPG/JPEG, Max 2MB)
                    </span>
                  </Label>
                  {uploadedFiles.suratkehilangan ? (
                    <div className="relative group">
                      <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-success/10 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-success">
                              {uploadedFiles.suratkehilangan.name}
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
                          onClick={() => removeFile("suratkehilangan")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="filesuratkehilangan"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleFileUpload(e, "suratkehilangan")}
                        disabled={uploading === "suratkehilangan"}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:border-primary",
                          touchedFields.has("filesuratkehilanganx") && !formData.filesuratkehilanganx && "border-destructive focus:border-destructive"
                        )}
                      />
                      {touchedFields.has("filesuratkehilanganx") && !formData.filesuratkehilanganx && (
                        <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                          Upload Surat Kehilangan wajib dilakukan
                        </p>
                      )}
                      {uploading === "suratkehilangan" && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Surat Keterangan Upload - Required for Rusak (3) */}
              {formData.alasancetak === "3" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="fileketerangan" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Surat Keterangan *
                    <span className="text-xs text-muted-foreground">
                      (PNG/JPG/JPEG, Max 2MB)
                    </span>
                  </Label>
                  {uploadedFiles.keterangan ? (
                    <div className="relative group">
                      <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-success/10 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-success">
                              {uploadedFiles.keterangan.name}
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
                          onClick={() => removeFile("keterangan")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="fileketerangan"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleFileUpload(e, "keterangan")}
                        disabled={uploading === "keterangan"}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:border-primary",
                          touchedFields.has("fileketeranganx") && !formData.fileketeranganx && "border-destructive focus:border-destructive"
                        )}
                      />
                      {touchedFields.has("fileketeranganx") && !formData.fileketeranganx && (
                        <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
                          Upload Surat Keterangan wajib dilakukan
                        </p>
                      )}
                      {uploading === "keterangan" && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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