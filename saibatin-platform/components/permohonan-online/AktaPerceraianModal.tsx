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
  FileCheck,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AktaPerceraianModalProps {
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
  // Divorce data
  nokk: string;
  niksuami: string;
  nikistri: string;
  yangmengajukan: string;
  alasancerai: string;
  noputusanpengadilan: string;
  tglputusan: string;
  instansipemberiputusan: string;
  // Files
  filekkx: string;
  filektpsuamix: string;
  filektpistrix: string;
  fileputusanx: string;
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

export default function AktaPerceraianModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: AktaPerceraianModalProps) {
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
    nokk: "",
    niksuami: "",
    nikistri: "",
    yangmengajukan: "",
    alasancerai: "",
    noputusanpengadilan: "",
    tglputusan: "",
    instansipemberiputusan: "",
    filekkx: "",
    filektpsuamix: "",
    filektpistrix: "",
    fileputusanx: "",
    filependukung1x: "",
    filependukung2x: "",
    catatan: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    kk?: UploadedFile;
    ktpsuami?: UploadedFile;
    ktpistri?: UploadedFile;
    putusan?: UploadedFile;
    pendukung1?: UploadedFile;
    pendukung2?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Select options from PHP OptionModel references
  const yangMengajukanOptions = [
    { value: "1", label: "Suami" },
    { value: "2", label: "Istri" },
    { value: "3", label: "Wali" },
  ];

  const alasanCeraiOptions = [
    { value: "1", label: "Cerai Talak" },
    { value: "2", label: "Cerai Gugat" },
  ];

  const instansiOptions = [
    { value: "1", label: "Pengadilan Agama" },
    { value: "2", label: "Pengadilan Negeri" },
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
      case "niksuami":
        return validateNIK(value, "NIK Suami");
      case "nikistri":
        return validateNIK(value, "NIK Istri");
      case "pemohonkk":
        return validateKK(value, "Nomor KK Pemohon");
      case "nokk":
        return validateKK(value, "Nomor KK");
      case "pemohonhp":
        return validatePhone(value);
      case "pemohonnama":
        return validateRequired(value, "Nama Pemohon");
      case "yangmengajukan":
        return validateRequired(value, "Yang Mengajukan");
      case "alasancerai":
        return validateRequired(value, "Alasan Cerai");
      case "noputusanpengadilan":
        return validateRequired(value, "Nomor Putusan Pengadilan");
      case "tglputusan":
        return validateRequired(value, "Tanggal Putusan");
      case "instansipemberiputusan":
        return validateRequired(value, "Instansi Pemberi Putusan");
      case "filekkx":
        return validateRequired(value, "Upload KK");
      case "filektpsuamix":
        return validateRequired(value, "Upload KTP Suami");
      case "filektpistrix":
        return validateRequired(value, "Upload KTP Istri");
      case "fileputusanx":
        return validateRequired(value, "Upload Putusan Pengadilan");
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
        fieldsToValidate = ["nokk", "niksuami", "nikistri", "yangmengajukan", "alasancerai", "noputusanpengadilan", "tglputusan", "instansipemberiputusan"];
        break;
      case 3:
        fieldsToValidate = ["filekkx", "filektpsuamix", "filektpistrix", "fileputusanx"];
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
      const response = await fetch("/api/akta-perceraian/fetchDatas", {
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
          niksuami: data.niksuami || "",
          nikistri: data.nikistri || "",
          yangmengajukan: data.yangmengajukan || "",
          alasancerai: data.alasancerai || "",
          noputusanpengadilan: data.noputusanpengadilan || "",
          tglputusan: data.tglputusan || "",
          instansipemberiputusan: data.instansipemberiputusan || "",
          filekkx: data.filekk || "",
          filektpsuamix: data.filektpsuami || "",
          filektpistrix: data.filektpistri || "",
          fileputusanx: data.fileputusan || "",
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
        field === "niksuami" ||
        field === "nikistri" ||
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
    fileType: "kk" | "ktpsuami" | "ktpistri" | "putusan" | "pendukung1" | "pendukung2"
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
        ktpsuami: "filektpsuami",
        ktpistri: "filektpistri",
        putusan: "fileputusan",
        pendukung1: "filependukung1",
        pendukung2: "filependukung2",
      };
      formDataUpload.append(fieldNameMap[fileType], file);
      formDataUpload.append("typeset", fieldNameMap[fileType]);
      formDataUpload.append("uid", Date.now().toString());
      formDataUpload.append("groupset", fileType);

      const response = await fetch("/api/akta-perceraian/upload", {
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
          ktpsuami: "filektpsuamix",
          ktpistri: "filektpistrix",
          putusan: "fileputusanx",
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

  const removeFile = (
    fileType: "kk" | "ktpsuami" | "ktpistri" | "putusan" | "pendukung1" | "pendukung2"
  ) => {
    const fieldMap = {
      kk: "filekkx",
      ktpsuami: "filektpsuamix",
      ktpistri: "filektpistrix",
      putusan: "fileputusanx",
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
      const endpoint = "/api/akta-perceraian/postdata";
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
            nokk: "",
            niksuami: "",
            nikistri: "",
            yangmengajukan: "",
            alasancerai: "",
            noputusanpengadilan: "",
            tglputusan: "",
            instansipemberiputusan: "",
            filekkx: "",
            filektpsuamix: "",
            filektpistrix: "",
            fileputusanx: "",
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
      ["nokk", "niksuami", "nikistri", "yangmengajukan", "alasancerai", "noputusanpengadilan", "tglputusan", "instansipemberiputusan"],
      ["filekkx", "filektpsuamix", "filektpistrix", "fileputusanx"],
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
    { step: 2, label: "Data Perceraian", icon: Scale },
    { step: 3, label: "Dokumen", icon: FileCheck },
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
              ? "Edit Permohonan Akta Perceraian"
              : "Permohonan Akta Perceraian"}
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
                    <span>Nomor KK Pemohon *</span>
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

            {/* Step 2: Data Perceraian */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 2
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nomor KK */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nokk" className="flex items-center justify-between">
                    <span>Nomor KK *</span>
                    <span className={cn("text-xs font-normal", formData.nokk.length === 16 ? "text-green-600" : "text-muted-foreground")}>
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

                {/* NIK Suami */}
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

                {/* NIK Istri */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
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

                {/* Yang Mengajukan */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="yangmengajukan">Yang Mengajukan *</Label>
                  <Select 
                    value={formData.yangmengajukan} 
                    onValueChange={(value) => handleInputChange("yangmengajukan", value)}
                  >
                    <SelectTrigger className={getSelectClass("yangmengajukan")}>
                      <SelectValue placeholder="Pilih yang mengajukan" />
                    </SelectTrigger>
                    <SelectContent>
                      {yangMengajukanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("yangmengajukan")}
                </div>

                {/* Alasan Cerai */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                  <Label htmlFor="alasancerai">Alasan Cerai *</Label>
                  <Select 
                    value={formData.alasancerai} 
                    onValueChange={(value) => handleInputChange("alasancerai", value)}
                  >
                    <SelectTrigger className={getSelectClass("alasancerai")}>
                      <SelectValue placeholder="Pilih alasan cerai" />
                    </SelectTrigger>
                    <SelectContent>
                      {alasanCeraiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("alasancerai")}
                </div>

                {/* Nomor Putusan */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="noputusanpengadilan">Nomor Putusan Pengadilan *</Label>
                  <Input
                    id="noputusanpengadilan"
                    value={formData.noputusanpengadilan}
                    onChange={(e) => handleInputChange("noputusanpengadilan", e.target.value)}
                    placeholder="Masukkan nomor putusan"
                    className={getInputClass("noputusanpengadilan")}
                  />
                  {showFieldError("noputusanpengadilan")}
                </div>

                {/* Tanggal Putusan */}
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-500">
                  <Label htmlFor="tglputusan">Tanggal Putusan *</Label>
                  <Input
                    id="tglputusan"
                    type="date"
                    value={formData.tglputusan}
                    onChange={(e) => handleInputChange("tglputusan", e.target.value)}
                    className={getInputClass("tglputusan")}
                  />
                  {showFieldError("tglputusan")}
                </div>

                {/* Instansi Pemberi Putusan */}
                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-700">
                  <Label htmlFor="instansipemberiputusan">Instansi Pemberi Putusan *</Label>
                  <Select 
                    value={formData.instansipemberiputusan} 
                    onValueChange={(value) => handleInputChange("instansipemberiputusan", value)}
                  >
                    <SelectTrigger className={getSelectClass("instansipemberiputusan")}>
                      <SelectValue placeholder="Pilih instansi" />
                    </SelectTrigger>
                    <SelectContent>
                      {instansiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("instansipemberiputusan")}
                </div>

                {/* Catatan */}
                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-1000">
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

            {/* Step 3: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              {/* KK Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="filekk" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KK *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.kk ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.kk.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("kk")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
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
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filekkx") && !formData.filekkx && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filekkx") && !formData.filekkx && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KK wajib dilakukan
                      </p>
                    )}
                    {uploading === "kk" && (
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

              {/* KTP Istri Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
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

              {/* Putusan Pengadilan Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                <Label htmlFor="fileputusan" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Putusan Pengadilan *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.putusan ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.putusan.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("putusan")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="fileputusan"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "putusan")}
                      disabled={uploading === "putusan"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("fileputusanx") && !formData.fileputusanx && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("fileputusanx") && !formData.fileputusanx && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload Putusan Pengadilan wajib dilakukan
                      </p>
                    )}
                    {uploading === "putusan" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
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
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.pendukung1.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("pendukung1")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
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
                      className="cursor-pointer transition-all duration-200 hover:border-blue-500"
                    />
                    {uploading === "pendukung1" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
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
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.pendukung2.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("pendukung2")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
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
                      className="cursor-pointer transition-all duration-200 hover:border-blue-500"
                    />
                    {uploading === "pendukung2" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
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