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
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Baby,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notifyError, notifySuccess } from "@/lib/notify";

interface KIAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

/**
 * Form KIA (Kartu Identitas Anak) — field & dokumen mengikuti form asli
 * app.pesbar.002 (fronts/permohonans/kia.blade.php + KIAController):
 * data pemohon, data anak (nikanak, namalengkap, tgllahir, tempatlahir,
 * jeniskelamin), data orang tua (nikayah/namaayah/nikibu/namaibu), dokumen
 * wajib akta kelahiran + KK + pas foto anak, pendukung I/II opsional.
 */
interface FormData {
  pemohonnik: string;
  pemohonnama: string;
  pemohonkk: string;
  pemohonhp: string;
  pemohonemail: string;

  nikanak: string;
  namalengkap: string;
  tgllahir: string;
  tempatlahir: string;
  jeniskelamin: string;

  nikayah: string;
  namaayah: string;
  nikibu: string;
  namaibu: string;

  fileaktakelahiranx: string;
  filekkx: string;
  filepassfotox: string;
  filependukung1x: string;
  filependukung2x: string;

  catatan: string;
}

const EMPTY_FORM: FormData = {
  pemohonnik: "",
  pemohonnama: "",
  pemohonkk: "",
  pemohonhp: "",
  pemohonemail: "",
  nikanak: "",
  namalengkap: "",
  tgllahir: "",
  tempatlahir: "",
  jeniskelamin: "",
  nikayah: "",
  namaayah: "",
  nikibu: "",
  namaibu: "",
  fileaktakelahiranx: "",
  filekkx: "",
  filepassfotox: "",
  filependukung1x: "",
  filependukung2x: "",
  catatan: "",
};

interface UploadedFile {
  name: string;
  serverName: string;
}

/** fileType → field payload (akhiran x menyimpan URL berkas). */
const FILE_FIELDS: Record<string, keyof FormData> = {
  aktakelahiran: "fileaktakelahiranx",
  kk: "filekkx",
  passfoto: "filepassfotox",
  pendukung1: "filependukung1x",
  pendukung2: "filependukung2x",
};

const NIK_FIELDS: (keyof FormData)[] = [
  "pemohonnik", "pemohonkk", "pemohonhp", "nikanak", "nikayah", "nikibu",
];

export default function KIAModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: KIAModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const jenisKelaminOptions = [
    { value: "1", label: "Laki-laki" },
    { value: "2", label: "Perempuan" },
  ];

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep(1);
        setErrors([]);
        setTouchedFields(new Set());
        setFieldErrors({});
      }, 300);
    }
  }, [open]);

  const validateField = (field: keyof FormData, value: string): string | null => {
    const required: Partial<Record<keyof FormData, string>> = {
      pemohonnik: "NIK Pemohon",
      pemohonnama: "Nama Pemohon",
      pemohonkk: "No. KK Pemohon",
      pemohonhp: "No. HP Pemohon",
      pemohonemail: "Email Pemohon",
      nikanak: "NIK Anak",
      namalengkap: "Nama Lengkap Anak",
      tgllahir: "Tanggal Lahir",
      tempatlahir: "Tempat Lahir",
      jeniskelamin: "Jenis Kelamin",
      nikayah: "NIK Ayah",
      namaayah: "Nama Ayah",
      nikibu: "NIK Ibu",
      namaibu: "Nama Ibu",
      fileaktakelahiranx: "Upload Akta Kelahiran",
      filekkx: "Upload Kartu Keluarga",
      filepassfotox: "Upload Pas Foto Anak",
    };
    const label = required[field];
    if (label && !value.trim()) return `${label} harus diisi`;

    if (["pemohonnik", "pemohonkk", "nikanak", "nikayah", "nikibu"].includes(field) && value) {
      if (!/^\d{16}$/.test(value)) return "Harus 16 digit angka";
    }
    if (field === "pemohonhp" && value && !/^0\d{9,12}$/.test(value)) {
      return "No. HP harus 10-13 digit dan diawali 0";
    }
    if (field === "pemohonemail" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Format email tidak valid";
    }
    return null;
  };

  const STEP_FIELDS: (keyof FormData)[][] = [
    ["pemohonnik", "pemohonnama", "pemohonkk", "pemohonhp", "pemohonemail"],
    ["nikanak", "namalengkap", "tgllahir", "tempatlahir", "jeniskelamin", "nikayah", "namaayah", "nikibu", "namaibu"],
    ["fileaktakelahiranx", "filekkx", "filepassfotox"],
  ];

  const validateStep = (step: number) => {
    const stepErrors: string[] = [];
    const newTouched = new Set(touchedFields);
    const newFieldErrors = { ...fieldErrors };
    for (const field of STEP_FIELDS[step - 1]) {
      newTouched.add(field);
      const error = validateField(field, formData[field] ?? "");
      if (error) {
        stepErrors.push(error);
        newFieldErrors[field] = error;
      } else {
        delete newFieldErrors[field];
      }
    }
    setTouchedFields(newTouched);
    setFieldErrors(newFieldErrors);
    return stepErrors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length) {
      setErrors(stepErrors);
      notifyError(stepErrors, "Data belum lengkap");
      return;
    }
    setErrors([]);
    setCurrentStep((p) => p + 1);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (NIK_FIELDS.includes(field) && value) value = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));
    const error = validateField(field, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
    if (errors.length > 0) setErrors([]);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      setErrors(["Jenis file harus PNG, JPG, atau JPEG"]);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(["Ukuran file maksimal 2MB"]);
      return;
    }
    setUploading(fileType);
    setErrors([]);
    try {
      const fd = new FormData();
      fd.append(`file${fileType}`, file);
      fd.append("typeset", `file${fileType}`);
      const response = await fetch("/api/kia/upload", { method: "POST", body: fd });
      const result = await response.json();
      if (result.error?.length) {
        setErrors(result.error.flat());
        notifyError(result.error.flat());
      } else if (result.success?.length) {
        handleInputChange(FILE_FIELDS[fileType], result.success[0]);
        setUploadedFiles((prev) => ({
          ...prev,
          [fileType]: { name: file.name, serverName: result.success[0] },
        }));
      }
    } catch {
      setErrors(["Gagal mengupload file"]);
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (fileType: string) => {
    handleInputChange(FILE_FIELDS[fileType], "");
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[fileType];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    for (let step = 1; step <= STEP_FIELDS.length; step++) {
      const stepErrors = validateStep(step);
      if (stepErrors.length) {
        setErrors(stepErrors);
        notifyError(stepErrors, "Data belum lengkap");
        setCurrentStep(step);
        return;
      }
    }
    setLoading(true);
    setErrors([]);
    try {
      const response = await fetch(
        mode === "edit" ? "/api/kia/update" : "/api/kia/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            act: mode === "edit" ? "upd" : "ins",
            key: mode === "edit" ? permohonanId : "",
          }),
        },
      );
      const result = await response.json();
      if (result.error?.length) {
        setErrors(result.error.flat());
        notifyError(result.error.flat());
      } else if (result.success?.length) {
        notifySuccess(result.success.flat());
        setTimeout(() => { window.location.href = "/riwayat"; }, 1200);
        setTimeout(() => {
          onOpenChange(false);
          setFormData({ ...EMPTY_FORM });
          setUploadedFiles({});
        }, 1500);
      }
    } catch {
      setErrors(["Terjadi kesalahan saat menyimpan data"]);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { step: 1, label: "Data Pemohon", icon: User },
    { step: 2, label: "Data Anak & Ortu", icon: Baby },
    { step: 3, label: "Dokumen", icon: FileText },
  ];

  const showFieldError = (field: keyof FormData) =>
    touchedFields.has(field) && fieldErrors[field] ? (
      <p className="text-xs text-destructive mt-1">{fieldErrors[field]}</p>
    ) : null;

  const getInputClass = (field: keyof FormData) =>
    cn(
      "transition-all duration-200 focus:ring-2 focus:ring-primary",
      touchedFields.has(field) && fieldErrors[field] && "border-destructive",
    );

  const renderFileUpload = (fileType: string, label: string, required: boolean) => {
    const fieldName = FILE_FIELDS[fileType];
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {label}
          {required && <span className="text-destructive">*</span>}
          <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
        </Label>
        {uploadedFiles[fileType] ? (
          <div className="flex items-center justify-between p-4 border-2 border-success rounded-lg bg-success/10 group">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-success">{uploadedFiles[fileType].name}</p>
                <p className="text-xs text-success">Berhasil diupload</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeFile(fileType)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              onChange={(e) => handleFileUpload(e, fileType)}
              disabled={uploading === fileType}
              className={cn(
                "cursor-pointer",
                touchedFields.has(fieldName) && !formData[fieldName] && required && "border-destructive",
              )}
            />
            {touchedFields.has(fieldName) && !formData[fieldName] && required && (
              <p className="text-xs text-destructive mt-1">{label} wajib diupload</p>
            )}
            {uploading === fileType && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
          <DialogTitle className="text-2xl font-bold text-primary">
            {mode === "edit" ? "Edit Permohonan" : "Permohonan KIA (Kartu Identitas Anak)"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lengkapi formulir di bawah ini dengan data yang akurat
          </DialogDescription>

          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between px-2">
              {steps.map(({ step, label, icon: Icon }) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-all cursor-pointer",
                    currentStep === step
                      ? "text-primary scale-110 font-bold"
                      : currentStep > step
                        ? "text-success"
                        : "text-muted-foreground",
                  )}
                  onClick={() => {
                    if (step < currentStep) {
                      setCurrentStep(step);
                      setErrors([]);
                    }
                  }}
                >
                  {currentStep > step && <CheckCircle className="h-4 w-4" />}
                  {currentStep <= step && <Icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-1">
          <div className="space-y-4 py-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
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

            {/* Step 1: Data Pemohon */}
            <div className={cn("space-y-4", currentStep !== 1 && "hidden")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kia-pemohonnik">NIK Pemohon *</Label>
                  <PemohonNikField
                    id="kia-pemohonnik"
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
                <div className="space-y-2">
                  <Label htmlFor="kia-pemohonnama">Nama Pemohon *</Label>
                  <Input
                    id="kia-pemohonnama"
                    value={formData.pemohonnama}
                    onChange={(e) => handleInputChange("pemohonnama", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={getInputClass("pemohonnama")}
                  />
                  {showFieldError("pemohonnama")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-pemohonkk">Nomor KK *</Label>
                  <KkScanField
                    id="kia-pemohonkk"
                    value={formData.pemohonkk}
                    onChange={(v) => handleInputChange("pemohonkk", v)}
                    className={getInputClass("pemohonkk")}
                  />
                  {showFieldError("pemohonkk")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-pemohonhp">Nomor HP *</Label>
                  <Input
                    id="kia-pemohonhp"
                    type="tel"
                    value={formData.pemohonhp}
                    onChange={(e) => handleInputChange("pemohonhp", e.target.value)}
                    placeholder="Contoh: 081234567890"
                    maxLength={13}
                    className={getInputClass("pemohonhp")}
                  />
                  {showFieldError("pemohonhp")}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="kia-pemohonemail">Email *</Label>
                  <Input
                    id="kia-pemohonemail"
                    type="email"
                    value={formData.pemohonemail}
                    onChange={(e) => handleInputChange("pemohonemail", e.target.value)}
                    placeholder="Contoh: email@domain.com"
                    className={getInputClass("pemohonemail")}
                  />
                  {showFieldError("pemohonemail")}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                  Selanjutnya
                </Button>
              </div>
            </div>

            {/* Step 2: Data Anak & Orang Tua */}
            <div className={cn("space-y-4", currentStep !== 2 && "hidden")}>
              <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <Baby className="h-5 w-5" /> Data Anak
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kia-nikanak">NIK Anak *</Label>
                  <Input
                    id="kia-nikanak"
                    value={formData.nikanak}
                    onChange={(e) => handleInputChange("nikanak", e.target.value)}
                    placeholder="Masukkan 16 digit NIK anak"
                    maxLength={16}
                    className={getInputClass("nikanak")}
                  />
                  {showFieldError("nikanak")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-namalengkap">Nama Lengkap Anak *</Label>
                  <Input
                    id="kia-namalengkap"
                    value={formData.namalengkap}
                    onChange={(e) => handleInputChange("namalengkap", e.target.value)}
                    placeholder="Masukkan nama lengkap anak"
                    className={getInputClass("namalengkap")}
                  />
                  {showFieldError("namalengkap")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-tgllahir">Tanggal Lahir *</Label>
                  <DatePicker
                    id="kia-tgllahir"
                    value={formData.tgllahir}
                    onChange={(v) => handleInputChange("tgllahir", v)}
                    maxToday
                    className={getInputClass("tgllahir")}
                  />
                  {showFieldError("tgllahir")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-tempatlahir">Tempat Lahir *</Label>
                  <Input
                    id="kia-tempatlahir"
                    value={formData.tempatlahir}
                    onChange={(e) => handleInputChange("tempatlahir", e.target.value)}
                    placeholder="Masukkan tempat lahir"
                    className={getInputClass("tempatlahir")}
                  />
                  {showFieldError("tempatlahir")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-jeniskelamin">Jenis Kelamin *</Label>
                  <Select
                    value={formData.jeniskelamin}
                    onValueChange={(value) => handleInputChange("jeniskelamin", value)}
                  >
                    <SelectTrigger className={getInputClass("jeniskelamin")}>
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
              </div>

              <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2 pt-2">
                <Users className="h-5 w-5" /> Data Orang Tua
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kia-nikayah">NIK Ayah *</Label>
                  <Input
                    id="kia-nikayah"
                    value={formData.nikayah}
                    onChange={(e) => handleInputChange("nikayah", e.target.value)}
                    placeholder="Masukkan 16 digit NIK ayah"
                    maxLength={16}
                    className={getInputClass("nikayah")}
                  />
                  {showFieldError("nikayah")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-namaayah">Nama Ayah *</Label>
                  <Input
                    id="kia-namaayah"
                    value={formData.namaayah}
                    onChange={(e) => handleInputChange("namaayah", e.target.value)}
                    placeholder="Masukkan nama ayah"
                    className={getInputClass("namaayah")}
                  />
                  {showFieldError("namaayah")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-nikibu">NIK Ibu *</Label>
                  <Input
                    id="kia-nikibu"
                    value={formData.nikibu}
                    onChange={(e) => handleInputChange("nikibu", e.target.value)}
                    placeholder="Masukkan 16 digit NIK ibu"
                    maxLength={16}
                    className={getInputClass("nikibu")}
                  />
                  {showFieldError("nikibu")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kia-namaibu">Nama Ibu *</Label>
                  <Input
                    id="kia-namaibu"
                    value={formData.namaibu}
                    onChange={(e) => handleInputChange("namaibu", e.target.value)}
                    placeholder="Masukkan nama ibu"
                    className={getInputClass("namaibu")}
                  />
                  {showFieldError("namaibu")}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Kembali
                </Button>
                <Button type="button" onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                  Selanjutnya
                </Button>
              </div>
            </div>

            {/* Step 3: Dokumen + Catatan */}
            <div className={cn("space-y-4", currentStep !== 3 && "hidden")}>
              {renderFileUpload("aktakelahiran", "Akta Kelahiran", true)}
              {renderFileUpload("kk", "Kartu Keluarga", true)}
              {renderFileUpload("passfoto", "Pas Foto Anak Terbaru", true)}
              {renderFileUpload("pendukung1", "Dokumen Pendukung I (Opsional)", false)}
              {renderFileUpload("pendukung2", "Dokumen Pendukung II (Opsional)", false)}

              <div className="space-y-2">
                <Label htmlFor="kia-catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="kia-catatan"
                  rows={3}
                  value={formData.catatan}
                  onChange={(e) => handleInputChange("catatan", e.target.value)}
                  placeholder="Pesan untuk petugas bila ada..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  Kembali
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Permohonan
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
