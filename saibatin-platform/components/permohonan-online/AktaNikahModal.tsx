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
  Users,
  Heart,
  Calendar,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AktaNikahModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

// Adjusted to match PHP structure - AktaNikahController.php
interface FormData {
  // Setup fields (from PHP setup 1)
  permohonanType: string;
  permohonanKet: string;
  permohonanInitial: string;
  
  // Pemohon data
  pemohonnik: string;
  pemohonnama: string;
  pemohonkk: string;
  pemohonhp: string;
  pemohonemail: string;
  
  // Akta Perkawinan data (from PHP: aktaPerkawinan_nokksuami, etc)
  nokksuami: string;
  niksuami: string;
  suamianakke: string;
  nokkistri: string;
  nikistri: string;
  istrianakke: string;
  niksaksi1: string;
  niksaksi2: string;
  tglpemberkatan: string;
  tmptpemberkatan: string;
  
  // Dokumen syarat (from PHP: syaratDok_KKSuami, etc)
  filekksuamix: string;
  filektpsuamix: string;
  filekkistrix: string;
  filektpistrix: string;
  filesuamiistrix: string;
  filebukunikahagamax: string;
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

export default function AktaNikahModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: AktaNikahModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize with PHP-matching structure
  const [formData, setFormData] = useState<FormData>({
    permohonanType: "perkawinan",
    permohonanKet: "Akta Perkawinan",
    permohonanInitial: "AKW01",
    
    pemohonnik: "",
    pemohonnama: "",
    pemohonkk: "",
    pemohonhp: "",
    pemohonemail: "",
    
    nokksuami: "",
    niksuami: "",
    suamianakke: "",
    nokkistri: "",
    nikistri: "",
    istrianakke: "",
    niksaksi1: "",
    niksaksi2: "",
    tglpemberkatan: "",
    tmptpemberkatan: "",
    
    filekksuamix: "",
    filektpsuamix: "",
    filekkistrix: "",
    filektpistrix: "",
    filesuamiistrix: "",
    filebukunikahagamax: "",
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
    kksuami?: UploadedFile;
    ktpsuami?: UploadedFile;
    kkistri?: UploadedFile;
    ktpistri?: UploadedFile;
    suamiistri?: UploadedFile;
    bukunikahagama?: UploadedFile;
    pendukung1?: UploadedFile;
    pendukung2?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validation functions matching AktaKelahiranNikAdaModal pattern
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
      case "niksuami":
        return validateNIK(value, "NIK Suami");
      case "nikistri":
        return validateNIK(value, "NIK Istri");
      case "niksaksi1":
        return validateNIK(value, "NIK Saksi 1");
      case "niksaksi2":
        return validateNIK(value, "NIK Saksi 2");
      case "pemohonkk":
        return validateKK(value, "Nomor KK Pemohon");
      case "nokksuami":
        return validateKK(value, "No KK Suami");
      case "nokkistri":
        return validateKK(value, "No KK Istri");
      case "pemohonhp":
        return validatePhone(value);
      case "pemohonnama":
        return validateRequired(value, "Nama Pemohon");
      case "suamianakke":
        return validateRequired(value, "Anak Ke (Suami)");
      case "istrianakke":
        return validateRequired(value, "Anak Ke (Istri)");
      case "tglpemberkatan":
        return validateRequired(value, "Tanggal Pemberkatan");
      case "tmptpemberkatan":
        return validateRequired(value, "Tempat Pemberkatan");
      case "filekksuamix":
        return validateRequired(value, "Upload KK Suami");
      case "filektpsuamix":
        return validateRequired(value, "Upload KTP Suami");
      case "filekkistrix":
        return validateRequired(value, "Upload KK Istri");
      case "filektpistrix":
        return validateRequired(value, "Upload KTP Istri");
      case "filesuamiistrix":
        return validateRequired(value, "Upload Foto Suami-Istri");
      case "filebukunikahagamax":
        return validateRequired(value, "Upload Buku Nikah Agama");
      default:
        return null;
    }
  };

  // Validate entire step matching AktaKelahiranNikAdaModal pattern
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
        fieldsToValidate = ["nokksuami", "niksuami", "suamianakke"];
        break;
      case 3:
        fieldsToValidate = ["nokkistri", "nikistri", "istrianakke"];
        break;
      case 4:
        fieldsToValidate = ["niksaksi1", "niksaksi2", "tglpemberkatan", "tmptpemberkatan"];
        break;
      case 5:
        fieldsToValidate = ["filekksuamix", "filektpsuamix", "filekkistrix", "filektpistrix", "filesuamiistrix", "filebukunikahagamax"];
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

  // Fetch data matching PHP fetchDatas method structure
  const fetchPermohonanData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/akta-nikah/fetch", {
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
          
          nokksuami: data.nokksuami || "",
          niksuami: data.niksuami || "",
          suamianakke: data.suamianakke || "",
          nokkistri: data.nokkistri || "",
          nikistri: data.nikistri || "",
          istrianakke: data.istrianakke || "",
          niksaksi1: data.niksaksi1 || "",
          niksaksi2: data.niksaksi2 || "",
          tglpemberkatan: data.tglpemberkatan || "",
          tmptpemberkatan: data.tmptpemberkatan || "",
          
          filekksuamix: data.filekksuami || "",
          filektpsuamix: data.filektpsuami || "",
          filekkistrix: data.filekkistri || "",
          filektpistrix: data.filektpistri || "",
          filesuamiistrix: data.filesuamiistri || "",
          filebukunikahagamax: data.filebukunikahagama || "",
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
        field === "niksuami" ||
        field === "nikistri" ||
        field === "niksaksi1" ||
        field === "niksaksi2" ||
        field === "nokksuami" ||
        field === "nokkistri") &&
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

  // File upload matching PHP upload method
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
        kksuami: "filekksuami",
        ktpsuami: "filektpsuami",
        kkistri: "filekkistri",
        ktpistri: "filektpistri",
        suamiistri: "filesuamiistri",
        bukunikahagama: "filebukunikahagama",
        pendukung1: "filependukung1",
        pendukung2: "filependukung2",
      };
      
      formDataUpload.append(fieldNameMap[fileType], file);
      formDataUpload.append("typeset", fieldNameMap[fileType]);
      formDataUpload.append("uid", Date.now().toString());
      formDataUpload.append("groupset", fileType);

      const response = await fetch("/api/akta-nikah/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.error && result.error.length > 0) {
        setErrors(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        const serverFileName = result.success[0];

        const fieldMap = {
          kksuami: "filekksuamix",
          ktpsuami: "filektpsuamix",
          kkistri: "filekkistrix",
          ktpistri: "filektpistrix",
          suamiistri: "filesuamiistrix",
          bukunikahagama: "filebukunikahagamax",
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
      kksuami: "filekksuamix",
      ktpsuami: "filektpsuamix",
      kkistri: "filekkistrix",
      ktpistri: "filektpistrix",
      suamiistri: "filesuamiistrix",
      bukunikahagama: "filebukunikahagamax",
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

  // Validation matching PHP validation rules
  const validateForm = (): boolean => {
    // Validate all steps
    for (let step = 1; step <= 5; step++) {
      const { isValid, errors: stepErrors } = validateStep(step);
      if (!isValid) {
        setErrors(stepErrors);
        setCurrentStep(step);
        return false;
      }
    }
    return true;
  };

  // Submit matching PHP postdata structure
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess([]);

    try {
      const endpoint = "/api/akta-nikah/postdata";
      
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
      } else if (result.success && result.success.length > 0) {
        setSuccess(result.success.flat());
        setTimeout(() => {
          onOpenChange(false);
          // Reset form
          setFormData({
            permohonanType: "perkawinan",
            permohonanKet: "Akta Perkawinan",
            permohonanInitial: "AKW01",
            pemohonnik: "",
            pemohonnama: "",
            pemohonkk: "",
            pemohonhp: "",
            pemohonemail: "",
            nokksuami: "",
            niksuami: "",
            suamianakke: "",
            nokkistri: "",
            nikistri: "",
            istrianakke: "",
            niksaksi1: "",
            niksaksi2: "",
            tglpemberkatan: "",
            tmptpemberkatan: "",
            filekksuamix: "",
            filektpsuamix: "",
            filekkistrix: "",
            filektpistrix: "",
            filesuamiistrix: "",
            filebukunikahagamax: "",
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
      ["nokksuami", "niksuami", "suamianakke"],
      ["nokkistri", "nikistri", "istrianakke"],
      ["niksaksi1", "niksaksi2", "tglpemberkatan", "tmptpemberkatan"],
      ["filekksuamix", "filektpsuamix", "filekkistrix", "filektpistrix", "filesuamiistrix", "filebukunikahagamax"],
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
    { step: 2, label: "Data Suami", icon: User },
    { step: 3, label: "Data Istri", icon: User },
    { step: 4, label: "Saksi & Acara", icon: Calendar },
    { step: 5, label: "Dokumen", icon: FileCheck },
  ];

  // Helper to show field error
  const showFieldError = (field: keyof FormData) => {
    return touchedFields.has(field) && fieldErrors[field] ? (
      <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 mt-1">
        {fieldErrors[field]}
      </p>
    ) : null;
  };

  // Helper for input class with error state
  const getInputClass = (field: keyof FormData) => {
    return cn(
      "transition-all duration-200 focus:ring-2 focus:ring-blue-500",
      touchedFields.has(field) && fieldErrors[field] && "border-red-500 focus:border-red-500 focus:ring-red-500"
    );
  };

  // Helper for select class with error state
  const getSelectClass = (field: keyof FormData) => {
    return cn(
      "transition-all duration-200 focus:ring-2 focus:ring-blue-500",
      touchedFields.has(field) && fieldErrors[field] && "border-red-500 focus:border-red-500 focus:ring-red-500"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col w-full">
        <DialogHeader className="space-y-1 pb-1 border-b">
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {mode === "edit"
              ? "Edit Permohonan"
              : "Permohonan Akta Perkawinan"}
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
                      ? "text-blue-600 scale-110 font-bold"
                      : currentStep > step
                        ? "text-green-600"
                        : "text-gray-400",
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
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out",
                  "bg-linear-to-r from-blue-600 to-purple-600",
                )}
                style={{
                  width: `${((currentStep - 1) / 4) * 100}%`,
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
              <Alert className="border-green-500 bg-green-50 text-green-800 animate-in slide-in-from-top-2 duration-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
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
                    <span className={cn("text-xs font-normal", formData.pemohonnik.length === 16 ? "text-green-600" : "text-muted-foreground")}>
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
                    <span>Nomor KK *</span>
                    <span className={cn("text-xs font-normal", formData.pemohonkk.length === 16 ? "text-green-600" : "text-muted-foreground")}>
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
                    <span className={cn("text-xs font-normal", formData.pemohonhp.length >= 10 && formData.pemohonhp.length <= 13 ? "text-green-600" : "text-muted-foreground")}>
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
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step1}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step1)}%</span>
                </div>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>

            {/* Step 2: Data Suami */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 2 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nokksuami" className="flex items-center justify-between">
                    <span>No KK Suami *</span>
                    <span className={cn("text-xs font-normal", formData.nokksuami.length === 16 ? "text-green-600" : "text-muted-foreground")}>
                      {formData.nokksuami.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nokksuami"
                    value={formData.nokksuami}
                    onChange={(e) => handleInputChange("nokksuami", e.target.value)}
                    placeholder="Masukkan 16 digit No KK Suami"
                    maxLength={16}
                    className={getInputClass("nokksuami")}
                  />
                  {showFieldError("nokksuami")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="niksuami" className="flex items-center justify-between">
                    <span>NIK Suami *</span>
                    <span className={cn("text-xs font-normal", formData.niksuami.length === 16 ? "text-green-600" : "text-muted-foreground")}>
                      {formData.niksuami.length}/16
                    </span>
                  </Label>
                  <Input
                    id="niksuami"
                    value={formData.niksuami}
                    onChange={(e) => handleInputChange("niksuami", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Suami"
                    maxLength={16}
                    className={getInputClass("niksuami")}
                  />
                  {showFieldError("niksuami")}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="suamianakke">Anak Ke (Suami) *</Label>
                  <Input
                    id="suamianakke"
                    type="number"
                    value={formData.suamianakke}
                    onChange={(e) => handleInputChange("suamianakke", e.target.value)}
                    placeholder="Masukkan anak ke-"
                    min="1"
                    className={getInputClass("suamianakke")}
                  />
                  {showFieldError("suamianakke")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step2}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step2)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3: Data Istri */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nokkistri" className="flex items-center justify-between">
                    <span>No KK Istri *</span>
                    <span className={cn("text-xs font-normal", formData.nokkistri.length === 16 ? "text-green-600" : "text-muted-foreground")}>
                      {formData.nokkistri.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nokkistri"
                    value={formData.nokkistri}
                    onChange={(e) => handleInputChange("nokkistri", e.target.value)}
                    placeholder="Masukkan 16 digit No KK Istri"
                    maxLength={16}
                    className={getInputClass("nokkistri")}
                  />
                  {showFieldError("nokkistri")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="nikistri" className="flex items-center justify-between">
                    <span>NIK Istri *</span>
                    <span className={cn("text-xs font-normal", formData.nikistri.length === 16 ? "text-green-600" : "text-muted-foreground")}>
                      {formData.nikistri.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikistri"
                    value={formData.nikistri}
                    onChange={(e) => handleInputChange("nikistri", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Istri"
                    maxLength={16}
                    className={getInputClass("nikistri")}
                  />
                  {showFieldError("nikistri")}
                </div>

                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="istrianakke">Anak Ke (Istri) *</Label>
                  <Input
                    id="istrianakke"
                    type="number"
                    value={formData.istrianakke}
                    onChange={(e) => handleInputChange("istrianakke", e.target.value)}
                    placeholder="Masukkan anak ke-"
                    min="1"
                    className={getInputClass("istrianakke")}
                  />
                  {showFieldError("istrianakke")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step3}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step3)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 4: Saksi & Acara */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 4 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="niksaksi1" className="flex items-center justify-between">
                    <span>NIK Saksi 1 *</span>
                    <span className={cn("text-xs font-normal", formData.niksaksi1.length === 16 ? "text-green-600" : "text-muted-foreground")}>
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
                  <Label htmlFor="niksaksi2" className="flex items-center justify-between">
                    <span>NIK Saksi 2 *</span>
                    <span className={cn("text-xs font-normal", formData.niksaksi2.length === 16 ? "text-green-600" : "text-muted-foreground")}>
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

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="tglpemberkatan">Tanggal Pemberkatan *</Label>
                  <Input
                    id="tglpemberkatan"
                    type="date"
                    value={formData.tglpemberkatan}
                    onChange={(e) => handleInputChange("tglpemberkatan", e.target.value)}
                    className={getInputClass("tglpemberkatan")}
                  />
                  {showFieldError("tglpemberkatan")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="tmptpemberkatan">Tempat Pemberkatan *</Label>
                  <Input
                    id="tmptpemberkatan"
                    value={formData.tmptpemberkatan}
                    onChange={(e) => handleInputChange("tmptpemberkatan", e.target.value)}
                    placeholder="Masukkan tempat pemberkatan"
                    className={getInputClass("tmptpemberkatan")}
                  />
                  {showFieldError("tmptpemberkatan")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step4}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step4)}%</span>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 5: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 5 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              {/* KK Suami Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="filekksuami" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KK Suami *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.kksuami ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.kksuami.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("kksuami")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filekksuami"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "kksuami")}
                      disabled={uploading === "kksuami"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filekksuamix") && !formData.filekksuamix && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filekksuamix") && !formData.filekksuamix && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KK Suami wajib dilakukan
                      </p>
                    )}
                    {uploading === "kksuami" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KTP Suami Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                <Label htmlFor="filektpsuami" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Suami *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktpsuami ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.ktpsuami.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktpsuami")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektpsuami"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktpsuami")}
                      disabled={uploading === "ktpsuami"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filektpsuamix") && !formData.filektpsuamix && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filektpsuamix") && !formData.filektpsuamix && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KTP Suami wajib dilakukan
                      </p>
                    )}
                    {uploading === "ktpsuami" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KK Istri Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                <Label htmlFor="filekkistri" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KK Istri *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.kkistri ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.kkistri.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("kkistri")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filekkistri"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "kkistri")}
                      disabled={uploading === "kkistri"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filekkistrix") && !formData.filekkistrix && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filekkistrix") && !formData.filekkistrix && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KK Istri wajib dilakukan
                      </p>
                    )}
                    {uploading === "kkistri" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KTP Istri Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                <Label htmlFor="filektpistri" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Istri *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktpistri ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.ktpistri.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktpistri")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektpistri"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktpistri")}
                      disabled={uploading === "ktpistri"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filektpistrix") && !formData.filektpistrix && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filektpistrix") && !formData.filektpistrix && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KTP Istri wajib dilakukan
                      </p>
                    )}
                    {uploading === "ktpistri" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Foto Suami-Istri Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                <Label htmlFor="filesuamiistri" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Foto Suami-Istri *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.suamiistri ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.suamiistri.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("suamiistri")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filesuamiistri"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "suamiistri")}
                      disabled={uploading === "suamiistri"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filesuamiistrix") && !formData.filesuamiistrix && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filesuamiistrix") && !formData.filesuamiistrix && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload Foto Suami-Istri wajib dilakukan
                      </p>
                    )}
                    {uploading === "suamiistri" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buku Nikah Agama Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                <Label htmlFor="filebukunikahagama" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Buku Nikah Agama *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.bukunikahagama ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.bukunikahagama.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("bukunikahagama")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filebukunikahagama"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "bukunikahagama")}
                      disabled={uploading === "bukunikahagama"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filebukunikahagamax") && !formData.filebukunikahagamax && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filebukunikahagamax") && !formData.filebukunikahagamax && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload Buku Nikah Agama wajib dilakukan
                      </p>
                    )}
                    {uploading === "bukunikahagama" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional: Dokumen Pendukung 1-2 */}
              {[1, 2].map((num, index) => (
                <div 
                  key={`pendukung${num}`}
                  className={`space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-${(index + 4) * 100}`}
                >
                  <Label htmlFor={`filependukung${num}`} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload Dokumen Pendukung {num} (Opsional)
                    <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                  </Label>
                  {uploadedFiles[`pendukung${num}` as keyof typeof uploadedFiles] ? (
                    <div className="relative group">
                      <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              {uploadedFiles[`pendukung${num}` as keyof typeof uploadedFiles]?.name}
                            </p>
                            <p className="text-xs text-green-600">Berhasil diupload</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(`pendukung${num}` as keyof typeof uploadedFiles)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id={`filependukung${num}`}
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleFileUpload(e, `pendukung${num}` as keyof typeof uploadedFiles)}
                        disabled={uploading === `pendukung${num}`}
                        className="cursor-pointer transition-all duration-200 hover:border-blue-500"
                      />
                      {uploading === `pendukung${num}` && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Catatan */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
                <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) => handleInputChange("catatan", e.target.value)}
                  placeholder="Masukkan catatan tambahan jika diperlukan"
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="transition-all duration-300">
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step5}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step5)}%</span>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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