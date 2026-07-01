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
import { Checkbox } from "@/components/ui/checkbox";
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
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KKPerubahanBiodataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

// Adjusted to match PHP structure - KKPerubahanBiodataController.php
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
  
  // KK data (from PHP: kk_kk, kk_nik, kk_jenisbiodata, etc)
  kk: string;
  nik: string;
  jenisbiodata: string;
  
  // Biodata fields (dynamic based on jenisbiodata)
  namalengkap: string;
  jeniskelamin: string;
  tempatlahir: string;
  tanggallahir: string;
  golongandarah: string;
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  namaayah: string;
  namaibu: string;
  statusperkawinan: string;
  
  // Dokumen syarat (from PHP: syaratDok_KK, etc)
  filekkx: string;
  fileaktalahirx: string;
  fileijazahx: string;
  filebukunikahx: string;
  filependukung1x: string;
  filependukung2x: string;
  filependukung3x: string;
  filependukung4x: string;
  
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

interface JenisBiodataOption {
  value: string;
  label: string;
}

export default function KKPerubahanBiodataModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: KKPerubahanBiodataModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [jenisBiodataOptions, setJenisBiodataOptions] = useState<JenisBiodataOption[]>([]);
  const [selectedBiodataTypes, setSelectedBiodataTypes] = useState<string[]>([]);

  // Initialize with PHP-matching structure
  const [formData, setFormData] = useState<FormData>({
    permohonanType: "kkperubahanbiodata",
    permohonanKet: "Perubahan Biodata KK",
    permohonanInitial: "KKU01",
    
    pemohonnik: "",
    pemohonnama: "",
    pemohonkk: "",
    pemohonhp: "",
    pemohonemail: "",
    
    kk: "",
    nik: "",
    jenisbiodata: "",
    
    namalengkap: "",
    jeniskelamin: "",
    tempatlahir: "",
    tanggallahir: "",
    golongandarah: "",
    agama: "",
    pendidikan: "",
    pekerjaan: "",
    namaayah: "",
    namaibu: "",
    statusperkawinan: "",
    
    filekkx: "",
    fileaktalahirx: "",
    fileijazahx: "",
    filebukunikahx: "",
    filependukung1x: "",
    filependukung2x: "",
    filependukung3x: "",
    filependukung4x: "",
    
    catatan: "",
    prgsts: "",
    rjkalasan: "",
    alasandetail: "",
    key: "",
    act: "ins",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    kk?: UploadedFile;
    aktalahir?: UploadedFile;
    ijazah?: UploadedFile;
    bukunikah?: UploadedFile;
    pendukung1?: UploadedFile;
    pendukung2?: UploadedFile;
    pendukung3?: UploadedFile;
    pendukung4?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Options matching PHP OptionModel lookups
  const jenisKelaminOptions = [
    { value: "1", label: "Laki-laki" },
    { value: "2", label: "Perempuan" },
  ];

  const golonganDarahOptions = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "AB", label: "AB" },
    { value: "O", label: "O" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "Tidak Tahu", label: "Tidak Tahu" },
  ];

  const agamaOptions = [
    { value: "1", label: "Islam" },
    { value: "2", label: "Kristen" },
    { value: "3", label: "Katholik" },
    { value: "4", label: "Hindu" },
    { value: "5", label: "Budha" },
    { value: "6", label: "Konghucu" },
    { value: "7", label: "Kepercayaan Lainnya" },
  ];

  const pendidikanOptions = [
    { value: "1", label: "Tidak/Belum Sekolah" },
    { value: "2", label: "Belum Tamat SD/Sederajat" },
    { value: "3", label: "Tamat SD/Sederajat" },
    { value: "4", label: "SLTP/Sederajat" },
    { value: "5", label: "SLTA/Sederajat" },
    { value: "6", label: "Diploma I/II" },
    { value: "7", label: "Akademi/Diploma III/Sarjana Muda" },
    { value: "8", label: "Diploma IV/Strata I" },
    { value: "9", label: "Strata II" },
    { value: "10", label: "Strata III" },
  ];

  const statusPerkawinanOptions = [
    { value: "1", label: "Belum Kawin" },
    { value: "2", label: "Kawin" },
    { value: "3", label: "Cerai Hidup" },
    { value: "4", label: "Cerai Mati" },
  ];

  // ==================== VALIDATION FUNCTIONS (Matching AktaKelahiranNikAdaModal pattern) ====================

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

  // Main field validation function (matching AktaKelahiranNikAdaModal pattern)
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
        return validateKK(value);
      case "kk":
        return validateKK(value);
      case "pemohonhp":
        return validatePhone(value);
      case "pemohonnama":
        return validateRequired(value, "Nama Pemohon");
      case "namalengkap":
        return validateRequired(value, "Nama Lengkap");
      case "jeniskelamin":
        return validateRequired(value, "Jenis Kelamin");
      case "tempatlahir":
        return validateRequired(value, "Tempat Lahir");
      case "tanggallahir":
        return validateRequired(value, "Tanggal Lahir");
      case "golongandarah":
        return validateRequired(value, "Golongan Darah");
      case "agama":
        return validateRequired(value, "Agama");
      case "pendidikan":
        return validateRequired(value, "Pendidikan");
      case "pekerjaan":
        return validateRequired(value, "Pekerjaan");
      case "namaayah":
        return validateRequired(value, "Nama Ayah");
      case "namaibu":
        return validateRequired(value, "Nama Ibu");
      case "statusperkawinan":
        return validateRequired(value, "Status Perkawinan");
      case "filekkx":
        return validateRequired(value, "Upload KK");
      case "fileaktalahirx":
        return validateRequired(value, "Upload Akta Lahir");
      case "fileijazahx":
        return validateRequired(value, "Upload Ijazah");
      case "filebukunikahx":
        return validateRequired(value, "Upload Buku Nikah");
      default:
        return null;
    }
  };

  // ==================== STEP VALIDATION (New - Matching AktaKelahiranNikAdaModal) ====================

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
        fieldsToValidate = ["kk", "nik"];
        // Also validate jenisbiodata selection
        if (selectedBiodataTypes.length === 0) {
          stepErrors.push("Pilih minimal satu jenis biodata yang akan diubah");
        }
        break;
      case 3:
        // Dynamic fields based on selected biodata types
        if (isBiodataTypeSelected("namalengkap")) fieldsToValidate.push("namalengkap");
        if (isBiodataTypeSelected("jeniskelamin")) fieldsToValidate.push("jeniskelamin");
        if (isBiodataTypeSelected("tempatlahir")) fieldsToValidate.push("tempatlahir");
        if (isBiodataTypeSelected("tanggallahir")) fieldsToValidate.push("tanggallahir");
        if (isBiodataTypeSelected("golongandarah")) fieldsToValidate.push("golongandarah");
        if (isBiodataTypeSelected("agama")) fieldsToValidate.push("agama");
        if (isBiodataTypeSelected("pendidikan")) fieldsToValidate.push("pendidikan");
        if (isBiodataTypeSelected("pekerjaan")) fieldsToValidate.push("pekerjaan");
        if (isBiodataTypeSelected("namaayah")) fieldsToValidate.push("namaayah");
        if (isBiodataTypeSelected("namaibu")) fieldsToValidate.push("namaibu");
        if (isBiodataTypeSelected("statusperkawinan")) fieldsToValidate.push("statusperkawinan");
        break;
      case 4:
        // Documents - always require KK
        fieldsToValidate = ["filekkx"];
        
        // Conditional required documents based on selected biodata types
        const jenisBiodata = formData.jenisbiodata;
        const aktaLahirPattern = /namalengkap|jeniskelamin|tempatlahir|tanggallahir|namaayah|namaibu/;
        const ijazahPattern = /namalengkap|tempatlahir|tanggallahir|pendidikan/;
        
        if (aktaLahirPattern.test(jenisBiodata)) {
          fieldsToValidate.push("fileaktalahirx");
        }
        if (ijazahPattern.test(jenisBiodata)) {
          fieldsToValidate.push("fileijazahx");
        }
        if (jenisBiodata.includes("statusperkawinan")) {
          fieldsToValidate.push("filebukunikahx");
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

    return { isValid: !hasErrors && stepErrors.length === 0, errors: stepErrors };
  };

  // ==================== NAVIGATION HANDLERS (New - Matching AktaKelahiranNikAdaModal) ====================

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

  // Check if a biodata type is selected
  const isBiodataTypeSelected = (type: string): boolean => {
    return selectedBiodataTypes.includes(type) || formData.jenisbiodata.includes(type);
  };

  // Handle biodata type checkbox change
  const handleBiodataTypeChange = (type: string, checked: boolean) => {
    let newTypes: string[];
    if (checked) {
      newTypes = [...selectedBiodataTypes, type];
    } else {
      newTypes = selectedBiodataTypes.filter((t) => t !== type);
    }
    setSelectedBiodataTypes(newTypes);
    handleInputChange("jenisbiodata", newTypes.join(""));
  };

  // Fetch jenis biodata options from PHP jenis method
  useEffect(() => {
    if (open) {
      fetchJenisBiodataOptions();
    }
  }, [open]);

  const fetchJenisBiodataOptions = async () => {
    try {
      const response = await fetch("/api/kk-perubahan-biodata/jenis");
      
      // Check for JSON error before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from /api/kk-perubahan-biodata/jenis:', text.substring(0, 500));
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setJenisBiodataOptions(data.map((item: any) => ({
          value: item.opt_val,
          label: item.opt_name,
        })));
      }
    } catch (error) {
      console.error("Error fetching jenis biodata:", error);
      setErrors(["Gagal memuat opsi jenis biodata. Silakan refresh halaman."]);
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
        setSelectedBiodataTypes([]);
      }, 300);
    }
  }, [open]);

  // Fetch data matching PHP fetchDatas method structure
  const fetchPermohonanData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/kk-perubahan-biodata/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prm2: permohonanId,
        }),
      });

      // Check for JSON error before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 500));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      if (data) {
        // Parse jenisbiodata string into array
        const biodataTypes = data.jenisbiodata ? data.jenisbiodata.split(/(?=[A-Z])/).filter(Boolean) : [];
        setSelectedBiodataTypes(biodataTypes);

        setFormData({
          ...formData,
          pemohonnik: data.pemohonnik || "",
          pemohonnama: data.pemohonnama || "",
          pemohonkk: data.pemohonkk || "",
          pemohonhp: data.pemohonhp || "",
          pemohonemail: data.pemohonemail || "",
          
          kk: data.kk || "",
          nik: data.nik || "",
          jenisbiodata: data.jenisbiodata || "",
          
          namalengkap: data.namalengkap || "",
          jeniskelamin: data.jeniskelamin || "",
          tempatlahir: data.tempatlahir || "",
          tanggallahir: data.tanggallahir || "",
          golongandarah: data.golongandarah || "",
          agama: data.agama || "",
          pendidikan: data.pendidikan || "",
          pekerjaan: data.pekerjaan || "",
          namaayah: data.namaayah || "",
          namaibu: data.namaibu || "",
          statusperkawinan: data.statusperkawinan || "",
          
          filekkx: data.filekk || "",
          fileaktalahirx: data.fileaktalahir || "",
          fileijazahx: data.fileijazah || "",
          filebukunikahx: data.filebukunikah || "",
          filependukung1x: data.filependukung1 || "",
          filependukung2x: data.filependukung2 || "",
          filependukung3x: data.filependukung3 || "",
          filependukung4x: data.filependukung4 || "",
          
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
        field === "nik" ||
        field === "kk") &&
      value
    ) {
      value = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setTouchedFields((prev) => new Set(prev).add(field));

    // Real-time validation (matching AktaKelahiranNikAdaModal pattern)
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
        kk: "filekk",
        aktalahir: "fileaktalahir",
        ijazah: "fileijazah",
        bukunikah: "filebukunikah",
        pendukung1: "filependukung1",
        pendukung2: "filependukung2",
        pendukung3: "filependukung3",
        pendukung4: "filependukung4",
      };
      
      formDataUpload.append(fieldNameMap[fileType], file);
      formDataUpload.append("typeset", fieldNameMap[fileType]);
      formDataUpload.append("uid", Date.now().toString());
      formDataUpload.append("groupset", fileType);

      const response = await fetch("/api/kk-perubahan-biodata/upload", {
        method: "POST",
        body: formDataUpload,
      });

      // Check for JSON error before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from upload:', text.substring(0, 500));
        throw new Error('Server returned non-JSON response');
      }

      const result = await response.json();

      if (result.error && result.error.length > 0) {
        setErrors(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        const serverFileName = result.success[0];

        const fieldMap = {
          kk: "filekkx",
          aktalahir: "fileaktalahirx",
          ijazah: "fileijazahx",
          bukunikah: "filebukunikahx",
          pendukung1: "filependukung1x",
          pendukung2: "filependukung2x",
          pendukung3: "filependukung3x",
          pendukung4: "filependukung4x",
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
      kk: "filekkx",
      aktalahir: "fileaktalahirx",
      ijazah: "fileijazahx",
      bukunikah: "filebukunikahx",
      pendukung1: "filependukung1x",
      pendukung2: "filependukung2x",
      pendukung3: "filependukung3x",
      pendukung4: "filependukung4x",
    };

    handleInputChange(fieldMap[fileType] as keyof FormData, "");
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fileType];
      return newFiles;
    });
  };

  // ==================== FORM VALIDATION (Updated - Matching AktaKelahiranNikAdaModal) ====================

  const validateForm = (): boolean => {
    // Validate all steps
    for (let step = 1; step <= 4; step++) {
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
      const endpoint = "/api/kk-perubahan-biodata/postdata";
      
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

      // Check for JSON error before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from submit:', text.substring(0, 500));
        throw new Error('Server returned non-JSON response');
      }

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
            permohonanType: "kkperubahanbiodata",
            permohonanKet: "Perubahan Biodata KK",
            permohonanInitial: "KKU01",
            pemohonnik: "",
            pemohonnama: "",
            pemohonkk: "",
            pemohonhp: "",
            pemohonemail: "",
            kk: "",
            nik: "",
            jenisbiodata: "",
            namalengkap: "",
            jeniskelamin: "",
            tempatlahir: "",
            tanggallahir: "",
            golongandarah: "",
            agama: "",
            pendidikan: "",
            pekerjaan: "",
            namaayah: "",
            namaibu: "",
            statusperkawinan: "",
            filekkx: "",
            fileaktalahirx: "",
            fileijazahx: "",
            filebukunikahx: "",
            filependukung1x: "",
            filependukung2x: "",
            filependukung3x: "",
            filependukung4x: "",
            catatan: "",
            prgsts: "",
            rjkalasan: "",
            alasandetail: "",
            key: "",
            act: "ins",
          });
          setUploadedFiles({});
          setSelectedBiodataTypes([]);
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
      ["kk", "nik"],
      [], // Step 3 is dynamic
      ["filekkx"], // Step 4 starts with KK
    ];

    // Calculate step 3 fields dynamically
    const step3Fields: string[] = [];
    if (isBiodataTypeSelected("namalengkap")) step3Fields.push("namalengkap");
    if (isBiodataTypeSelected("jeniskelamin")) step3Fields.push("jeniskelamin");
    if (isBiodataTypeSelected("tempatlahir")) step3Fields.push("tempatlahir");
    if (isBiodataTypeSelected("tanggallahir")) step3Fields.push("tanggallahir");
    if (isBiodataTypeSelected("golongandarah")) step3Fields.push("golongandarah");
    if (isBiodataTypeSelected("agama")) step3Fields.push("agama");
    if (isBiodataTypeSelected("pendidikan")) step3Fields.push("pendidikan");
    if (isBiodataTypeSelected("pekerjaan")) step3Fields.push("pekerjaan");
    if (isBiodataTypeSelected("namaayah")) step3Fields.push("namaayah");
    if (isBiodataTypeSelected("namaibu")) step3Fields.push("namaibu");
    if (isBiodataTypeSelected("statusperkawinan")) step3Fields.push("statusperkawinan");

    // Calculate step 4 fields dynamically
    const step4Fields: string[] = ["filekkx"];
    const jenisBiodata = formData.jenisbiodata;
    const aktaLahirPattern = /namalengkap|jeniskelamin|tempatlahir|tanggallahir|namaayah|namaibu/;
    const ijazahPattern = /namalengkap|tempatlahir|tanggallahir|pendidikan/;
    
    if (aktaLahirPattern.test(jenisBiodata)) step4Fields.push("fileaktalahirx");
    if (ijazahPattern.test(jenisBiodata)) step4Fields.push("fileijazahx");
    if (jenisBiodata.includes("statusperkawinan")) step4Fields.push("filebukunikahx");

    const progress: Record<string, number> = {};
    
    // Step 1
    const step1Filled = steps[0].filter((field) => formData[field as keyof FormData]).length;
    progress.step1 = (step1Filled / steps[0].length) * 100;
    
    // Step 2
    const step2Filled = steps[1].filter((field) => formData[field as keyof FormData]).length;
    progress.step2 = (step2Filled / steps[1].length) * 100;
    
    // Step 3
    if (step3Fields.length > 0) {
      const step3Filled = step3Fields.filter((field) => formData[field as keyof FormData]).length;
      progress.step3 = (step3Filled / step3Fields.length) * 100;
    } else {
      progress.step3 = selectedBiodataTypes.length > 0 ? 100 : 0;
    }
    
    // Step 4
    const step4Filled = step4Fields.filter((field) => formData[field as keyof FormData]).length;
    progress.step4 = (step4Filled / step4Fields.length) * 100;

    return progress;
  };

  const progress = getStepProgress();

  const steps = [
    { step: 1, label: "Data Pemohon", icon: User },
    { step: 2, label: "Pilih Biodata", icon: FileCheck },
    { step: 3, label: "Isi Biodata", icon: Edit3 },
    { step: 4, label: "Dokumen", icon: FileText },
  ];

  // Helper to show field error (matching AktaKelahiranNikAdaModal)
  const showFieldError = (field: keyof FormData) => {
    return touchedFields.has(field) && fieldErrors[field] ? (
      <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 mt-1">
        {fieldErrors[field]}
      </p>
    ) : null;
  };

  // Helper for input class with error state (matching AktaKelahiranNikAdaModal)
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

  // Render biodata input fields based on selection
  const renderBiodataFields = () => {
    const fields = [];
    
    if (isBiodataTypeSelected("namalengkap")) {
      fields.push(
        <div key="namalengkap" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
          <Label htmlFor="namalengkap">Nama Lengkap *</Label>
          <Input
            id="namalengkap"
            value={formData.namalengkap}
            onChange={(e) => handleInputChange("namalengkap", e.target.value)}
            placeholder="Masukkan nama lengkap"
            className={getInputClass("namalengkap")}
          />
          {showFieldError("namalengkap")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("jeniskelamin")) {
      fields.push(
        <div key="jeniskelamin" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
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
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showFieldError("jeniskelamin")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("tempatlahir")) {
      fields.push(
        <div key="tempatlahir" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
          <Label htmlFor="tempatlahir">Tempat Lahir *</Label>
          <Input
            id="tempatlahir"
            value={formData.tempatlahir}
            onChange={(e) => handleInputChange("tempatlahir", e.target.value)}
            placeholder="Masukkan tempat lahir"
            className={getInputClass("tempatlahir")}
          />
          {showFieldError("tempatlahir")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("tanggallahir")) {
      fields.push(
        <div key="tanggallahir" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
          <Label htmlFor="tanggallahir">Tanggal Lahir *</Label>
          <Input
            id="tanggallahir"
            type="date"
            value={formData.tanggallahir}
            onChange={(e) => handleInputChange("tanggallahir", e.target.value)}
            className={getInputClass("tanggallahir")}
          />
          {showFieldError("tanggallahir")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("golongandarah")) {
      fields.push(
        <div key="golongandarah" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
          <Label htmlFor="golongandarah">Golongan Darah *</Label>
          <Select
            value={formData.golongandarah}
            onValueChange={(value) => handleInputChange("golongandarah", value)}
          >
            <SelectTrigger className={getSelectClass("golongandarah")}>
              <SelectValue placeholder="Pilih golongan darah" />
            </SelectTrigger>
            <SelectContent>
              {golonganDarahOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showFieldError("golongandarah")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("agama")) {
      fields.push(
        <div key="agama" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
          <Label htmlFor="agama">Agama *</Label>
          <Select
            value={formData.agama}
            onValueChange={(value) => handleInputChange("agama", value)}
          >
            <SelectTrigger className={getSelectClass("agama")}>
              <SelectValue placeholder="Pilih agama" />
            </SelectTrigger>
            <SelectContent>
              {agamaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showFieldError("agama")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("pendidikan")) {
      fields.push(
        <div key="pendidikan" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
          <Label htmlFor="pendidikan">Pendidikan *</Label>
          <Select
            value={formData.pendidikan}
            onValueChange={(value) => handleInputChange("pendidikan", value)}
          >
            <SelectTrigger className={getSelectClass("pendidikan")}>
              <SelectValue placeholder="Pilih pendidikan" />
            </SelectTrigger>
            <SelectContent>
              {pendidikanOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showFieldError("pendidikan")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("pekerjaan")) {
      fields.push(
        <div key="pekerjaan" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
          <Label htmlFor="pekerjaan">Pekerjaan *</Label>
          <Input
            id="pekerjaan"
            value={formData.pekerjaan}
            onChange={(e) => handleInputChange("pekerjaan", e.target.value)}
            placeholder="Masukkan pekerjaan"
            className={getInputClass("pekerjaan")}
          />
          {showFieldError("pekerjaan")}
        </div>
      );
    }
    
    if (isBiodataTypeSelected("namaayah")) {
      fields.push(
        <div key="namaayah" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
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
      );
    }
    
    if (isBiodataTypeSelected("namaibu")) {
      fields.push(
        <div key="namaibu" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
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
      );
    }
    
    if (isBiodataTypeSelected("statusperkawinan")) {
      fields.push(
        <div key="statusperkawinan" className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
          <Label htmlFor="statusperkawinan">Status Perkawinan *</Label>
          <Select
            value={formData.statusperkawinan}
            onValueChange={(value) => handleInputChange("statusperkawinan", value)}
          >
            <SelectTrigger className={getSelectClass("statusperkawinan")}>
              <SelectValue placeholder="Pilih status perkawinan" />
            </SelectTrigger>
            <SelectContent>
              {statusPerkawinanOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showFieldError("statusperkawinan")}
        </div>
      );
    }
    
    return fields;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col w-full">
        <DialogHeader className="space-y-1 pb-1 border-b">
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {mode === "edit"
              ? "Edit Permohonan"
              : "Permohonan Perubahan Biodata KK"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lengkapi formulir di bawah ini dengan data yang akurat
          </DialogDescription>

          {/* Progress Steps - Updated for 4 steps with icons */}
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
                  width: `${((currentStep - 1) / 3) * 100}%`,
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

            {/* Step 2: Pilih Jenis Biodata */}
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
                  <Label htmlFor="kk" className="flex items-center justify-between">
                    <span>No KK *</span>
                    <span className={cn("text-xs font-normal", formData.kk.length === 16 ? "text-green-600" : "text-muted-foreground")}>
                      {formData.kk.length}/16
                    </span>
                  </Label>
                  <Input
                    id="kk"
                    value={formData.kk}
                    onChange={(e) => handleInputChange("kk", e.target.value)}
                    placeholder="Masukkan 16 digit No KK"
                    maxLength={16}
                    className={getInputClass("kk")}
                  />
                  {showFieldError("kk")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="nik" className="flex items-center justify-between">
                    <span>NIK *</span>
                    <span className={cn("text-xs font-normal", formData.nik.length === 16 ? "text-green-600" : "text-muted-foreground")}>
                      {formData.nik.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nik"
                    value={formData.nik}
                    onChange={(e) => handleInputChange("nik", e.target.value)}
                    placeholder="Masukkan 16 digit NIK yang akan diubah"
                    maxLength={16}
                    className={getInputClass("nik")}
                  />
                  {showFieldError("nik")}
                </div>
              </div>

              <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                <Label>Pilih Jenis Biodata yang akan diubah *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                  {jenisBiodataOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`biodata-${option.value}`}
                        checked={isBiodataTypeSelected(option.value)}
                        onCheckedChange={(checked) => 
                          handleBiodataTypeChange(option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`biodata-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedBiodataTypes.length === 0 && touchedFields.has("jenisbiodata") && (
                  <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200">
                    Pilih minimal satu jenis biodata yang akan diubah
                  </p>
                )}
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

            {/* Step 3: Isi Biodata (Dynamic based on selection) */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              {selectedBiodataTypes.length === 0 ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Tidak ada biodata yang dipilih. Silakan kembali ke step sebelumnya.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderBiodataFields()}
                </div>
              )}

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

            {/* Step 4: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 4
                  ? "animate-in slide-in-from-top-4 fade-in"
                  : "hidden",
              )}
            >
              {/* KK Upload - Always Required */}
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

              {/* Akta Lahir - Conditional Required */}
              {(isBiodataTypeSelected("namalengkap") || 
                isBiodataTypeSelected("jeniskelamin") || 
                isBiodataTypeSelected("tempatlahir") || 
                isBiodataTypeSelected("tanggallahir") || 
                isBiodataTypeSelected("namaayah") || 
                isBiodataTypeSelected("namaibu")) && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="fileaktalahir" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload Akta Lahir *
                    <span className="text-xs text-muted-foreground">(Wajib untuk perubahan data yang dipilih)</span>
                  </Label>
                  {uploadedFiles.aktalahir ? (
                    <div className="relative group">
                      <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">{uploadedFiles.aktalahir.name}</p>
                            <p className="text-xs text-green-600">Berhasil diupload</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile("aktalahir")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="fileaktalahir"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleFileUpload(e, "aktalahir")}
                        disabled={uploading === "aktalahir"}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:border-blue-500",
                          touchedFields.has("fileaktalahirx") && !formData.fileaktalahirx && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {touchedFields.has("fileaktalahirx") && !formData.fileaktalahirx && (
                        <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                          Upload Akta Lahir wajib dilakukan
                        </p>
                      )}
                      {uploading === "aktalahir" && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Ijazah - Conditional Required */}
              {(isBiodataTypeSelected("namalengkap") || 
                isBiodataTypeSelected("tempatlahir") || 
                isBiodataTypeSelected("tanggallahir") || 
                isBiodataTypeSelected("pendidikan")) && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="fileijazah" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload Ijazah *
                    <span className="text-xs text-muted-foreground">(Wajib untuk perubahan data yang dipilih)</span>
                  </Label>
                  {uploadedFiles.ijazah ? (
                    <div className="relative group">
                      <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">{uploadedFiles.ijazah.name}</p>
                            <p className="text-xs text-green-600">Berhasil diupload</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile("ijazah")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="fileijazah"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => handleFileUpload(e, "ijazah")}
                        disabled={uploading === "ijazah"}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:border-blue-500",
                          touchedFields.has("fileijazahx") && !formData.fileijazahx && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {touchedFields.has("fileijazahx") && !formData.fileijazahx && (
                        <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                          Upload Ijazah wajib dilakukan
                        </p>
                      )}
                      {uploading === "ijazah" && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Buku Nikah - Conditional Required */}
              {isBiodataTypeSelected("statusperkawinan") && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="filebukunikah" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload Buku Nikah *
                    <span className="text-xs text-muted-foreground">(Wajib untuk perubahan status perkawinan)</span>
                  </Label>
                  {uploadedFiles.bukunikah ? (
                    <div className="relative group">
                      <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">{uploadedFiles.bukunikah.name}</p>
                            <p className="text-xs text-green-600">Berhasil diupload</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile("bukunikah")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
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
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:border-blue-500",
                          touchedFields.has("filebukunikahx") && !formData.filebukunikahx && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {touchedFields.has("filebukunikahx") && !formData.filebukunikahx && (
                        <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                          Upload Buku Nikah wajib dilakukan
                        </p>
                      )}
                      {uploading === "bukunikah" && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Optional: Dokumen Pendukung 1-4 */}
              {[1, 2, 3, 4].map((num, index) => (
                <div 
                  key={`pendukung${num}`}
                  className={`space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-${(index + 2) * 100}`}
                >
                  <Label htmlFor={`filependukung${num}`} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload Dokumen Pendukung {num}
                    <span className="text-xs text-muted-foreground">(Opsional)</span>
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
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
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
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step4}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step4)}%</span>
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