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
  Baby,
  User,
  Users,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AktaKelahiranNikAdaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  permohonanId?: string;
}

// Adjusted to match PHP structure - AktaKelahiranNikAdaController.php
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
  
  // Biodata Anak (from PHP: biodata_anakNik, biodata_anakNama, etc)
  nikbayi: string;
  namalengkap: string;
  jeniskelamin: string;
  tgllahir: string;
  
  // Biodata Ayah (from PHP: biodata_ayahNik, biodata_ayahNama, etc)
  nikayah: string;
  namaayah: string;
  pekerjaan: string;
  
  // Biodata Ibu (from PHP: biodata_ibuNik, biodata_ibuNama)
  nikibu: string;
  namaibu: string;
  
  // Data Kelahiran (from PHP: dataKelahiran_anakKe, etc)
  anakke: string;
  tempatdilahirkan: string;
  tempatkelahiran: string;
  jamkelahiran: string;
  jeniskelahiran: string;
  berat: string;
  panjang: string;
  penolong: string;
  
  // Saksi (from PHP: saksi1_nik, saksi1_nama, etc)
  niksaksi1: string;
  namasaksi1: string;
  niksaksi2: string;
  namasaksi2: string;
  
  // Dokumen syarat (from PHP: syaratDok_bukuNikah, etc)
  filebukunikahx: string;
  filekkx: string;
  fileketeranganlahirx: string;
  filektpsaksi1x: string;
  filektpsaksi2x: string;
  filektpayahx: string;
  filektpibux: string;
  filependukung1x: string;
  filependukung2x: string;
  filependukung3x: string;
  filependukung4x: string;
  filependukung5x: string;
  
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

export default function AktaKelahiranNikAdaModal({
  open,
  onOpenChange,
  mode = "create",
  permohonanId,
}: AktaKelahiranNikAdaModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize with PHP-matching structure
  const [formData, setFormData] = useState<FormData>({
    permohonanType: "kelahiran_2",
    permohonanKet: "Akta Kelahiran (Ada NIK)",
    permohonanInitial: "AKL02",
    
    pemohonnik: "",
    pemohonnama: "",
    pemohonkk: "",
    pemohonhp: "",
    pemohonemail: "",
    
    nikbayi: "",
    namalengkap: "",
    jeniskelamin: "",
    tgllahir: "",
    
    nikayah: "",
    namaayah: "",
    pekerjaan: "",
    
    nikibu: "",
    namaibu: "",
    
    anakke: "",
    tempatdilahirkan: "",
    tempatkelahiran: "",
    jamkelahiran: "",
    jeniskelahiran: "",
    berat: "",
    panjang: "",
    penolong: "",
    
    niksaksi1: "",
    namasaksi1: "",
    niksaksi2: "",
    namasaksi2: "",
    
    filebukunikahx: "",
    filekkx: "",
    fileketeranganlahirx: "",
    filektpsaksi1x: "",
    filektpsaksi2x: "",
    filektpayahx: "",
    filektpibux: "",
    filependukung1x: "",
    filependukung2x: "",
    filependukung3x: "",
    filependukung4x: "",
    filependukung5x: "",
    
    catatan: "",
    prgsts: "",
    rjkalasan: "",
    alasandetail: "",
    key: "",
    act: "ins",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    bukunikah?: UploadedFile;
    kk?: UploadedFile;
    keteranganlahir?: UploadedFile;
    ktpsaksi1?: UploadedFile;
    ktpsaksi2?: UploadedFile;
    ktpayah?: UploadedFile;
    ktpibu?: UploadedFile;
    pendukung1?: UploadedFile;
    pendukung2?: UploadedFile;
    pendukung3?: UploadedFile;
    pendukung4?: UploadedFile;
    pendukung5?: UploadedFile;
  }>({});

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Options matching PHP OptionModel lookups
  const jenisKelaminOptions = [
    { value: "1", label: "Laki-laki" },
    { value: "2", label: "Perempuan" },
  ];

  const tempatDilahirkanOptions = [
    { value: "1", label: "Rumah Sakit" },
    { value: "2", label: "Puskesmas" },
    { value: "3", label: "Rumah Bersalin" },
    { value: "4", label: "Di Rumah" },
    { value: "5", label: "Lainnya" },
  ];

  const jenisKelahiranOptions = [
    { value: "1", label: "Tunggal" },
    { value: "2", label: "Kembar 2" },
    { value: "3", label: "Kembar 3" },
    { value: "4", label: "Kembar 4" },
    { value: "5", label: "Lainnya" },
  ];

  const penolongOptions = [
    { value: "1", label: "Dokter" },
    { value: "2", label: "Bidan/Perawat" },
    { value: "3", label: "Dukun" },
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
      case "nikbayi":
        return validateNIK(value, "NIK Bayi");
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
        return validateRequired(value, "Nama Lengkap Bayi");
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
      case "tempatdilahirkan":
        return validateRequired(value, "Tempat Dilahirkan");
      case "tempatkelahiran":
        return validateRequired(value, "Tempat Kelahiran");
      case "jamkelahiran":
        return validateRequired(value, "Jam Kelahiran");
      case "jeniskelahiran":
        return validateRequired(value, "Jenis Kelahiran");
      case "berat":
        return validateRequired(value, "Berat");
      case "panjang":
        return validateRequired(value, "Panjang");
      case "penolong":
        return validateRequired(value, "Penolong");
      case "namasaksi1":
        return validateRequired(value, "Nama Saksi 1");
      case "namasaksi2":
        return validateRequired(value, "Nama Saksi 2");
      case "filebukunikahx":
        return validateRequired(value, "Upload Buku Nikah");
      case "filekkx":
        return validateRequired(value, "Upload KK");
      case "fileketeranganlahirx":
        return validateRequired(value, "Upload Keterangan Lahir");
      case "filektpsaksi1x":
        return validateRequired(value, "Upload KTP Saksi 1");
      case "filektpsaksi2x":
        return validateRequired(value, "Upload KTP Saksi 2");
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
        fieldsToValidate = ["nikbayi", "namalengkap", "jeniskelamin", "tgllahir"];
        break;
      case 3:
        fieldsToValidate = ["nikayah", "namaayah", "pekerjaan", "nikibu", "namaibu"];
        break;
      case 4:
        fieldsToValidate = ["anakke", "tempatdilahirkan", "tempatkelahiran", "jamkelahiran", "jeniskelahiran", "berat", "panjang", "penolong"];
        break;
      case 5:
        fieldsToValidate = ["niksaksi1", "namasaksi1", "niksaksi2", "namasaksi2"];
        break;
      case 6:
        fieldsToValidate = ["filebukunikahx", "filekkx", "fileketeranganlahirx", "filektpsaksi1x", "filektpsaksi2x"];
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
      const response = await fetch("/api/akta-kelahiran-nik-ada/fetchDatas", {
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
          
          nikbayi: data.nikbayi || "",
          namalengkap: data.anakNama || "",
          jeniskelamin: data.anakJenisKelamin || "",
          tgllahir: data.anakTanggalLahir || "",
          
          nikayah: data.ayahNik || "",
          namaayah: data.ayahNama || "",
          pekerjaan: data.ayahPekerjaan || "",
          
          nikibu: data.ibuNik || "",
          namaibu: data.ibuNama || "",
          
          anakke: data.anakKe || "",
          tempatdilahirkan: data.tmptDilahirkan || "",
          tempatkelahiran: data.tmptKelahiran || "",
          jamkelahiran: data.jamKelahiran || "",
          jeniskelahiran: data.jenisKelahiran || "",
          berat: data.berat || "",
          panjang: data.panjang || "",
          penolong: data.penolong || "",
          
          niksaksi1: data.niksaksi1 || "",
          namasaksi1: data.namasaksi1 || "",
          niksaksi2: data.niksaksi2 || "",
          namasaksi2: data.namasaksi2 || "",
          
          filebukunikahx: data.filebukunikah || "",
          filekkx: data.filekk || "",
          fileketeranganlahirx: data.fileketeranganlahir || "",
          filektpsaksi1x: data.filektpsaksi1 || "",
          filektpsaksi2x: data.filektpsaksi2 || "",
          filektpayahx: data.filektpayah || "",
          filektpibux: data.filektpibu || "",
          filependukung1x: data.filependukung1 || "",
          filependukung2x: data.filependukung2 || "",
          filependukung3x: data.filependukung3 || "",
          filependukung4x: data.filependukung4 || "",
          filependukung5x: data.filependukung5 || "",
          
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
        field === "nikbayi" ||
        field === "nikayah" ||
        field === "nikibu" ||
        field === "niksaksi1" ||
        field === "niksaksi2") &&
      value
    ) {
      value = value.replace(/\D/g, "");
    }

    // For berat and panjang - only allow numbers and decimal
    if ((field === "berat" || field === "panjang") && value) {
      value = value.replace(/[^\d.]/g, "");
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
        bukunikah: "filebukunikah",
        kk: "filekk",
        keteranganlahir: "fileketeranganlahir",
        ktpsaksi1: "filektpsaksi1",
        ktpsaksi2: "filektpsaksi2",
        ktpayah: "filektpayah",
        ktpibu: "filektpibu",
        pendukung1: "filependukung1",
        pendukung2: "filependukung2",
        pendukung3: "filependukung3",
        pendukung4: "filependukung4",
        pendukung5: "filependukung5",
      };
      
      formDataUpload.append(fieldNameMap[fileType], file);
      formDataUpload.append("typeset", fieldNameMap[fileType]);
      formDataUpload.append("uid", Date.now().toString());
      formDataUpload.append("groupset", fileType);

      const response = await fetch("/api/akta-kelahiran-nik-ada/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.error && result.error.length > 0) {
        setErrors(result.error.flat());
      } else if (result.success && result.success.length > 0) {
        const serverFileName = result.success[0];

        const fieldMap = {
          bukunikah: "filebukunikahx",
          kk: "filekkx",
          keteranganlahir: "fileketeranganlahirx",
          ktpsaksi1: "filektpsaksi1x",
          ktpsaksi2: "filektpsaksi2x",
          ktpayah: "filektpayahx",
          ktpibu: "filektpibux",
          pendukung1: "filependukung1x",
          pendukung2: "filependukung2x",
          pendukung3: "filependukung3x",
          pendukung4: "filependukung4x",
          pendukung5: "filependukung5x",
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
      bukunikah: "filebukunikahx",
      kk: "filekkx",
      keteranganlahir: "fileketeranganlahirx",
      ktpsaksi1: "filektpsaksi1x",
      ktpsaksi2: "filektpsaksi2x",
      ktpayah: "filektpayahx",
      ktpibu: "filektpibux",
      pendukung1: "filependukung1x",
      pendukung2: "filependukung2x",
      pendukung3: "filependukung3x",
      pendukung4: "filependukung4x",
      pendukung5: "filependukung5x",
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
      const endpoint = "/api/akta-kelahiran-nik-ada/postdata";
      
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
            permohonanType: "kelahiran_2",
            permohonanKet: "Akta Kelahiran (Ada NIK)",
            permohonanInitial: "AKL02",
            pemohonnik: "",
            pemohonnama: "",
            pemohonkk: "",
            pemohonhp: "",
            pemohonemail: "",
            nikbayi: "",
            namalengkap: "",
            jeniskelamin: "",
            tgllahir: "",
            nikayah: "",
            namaayah: "",
            pekerjaan: "",
            nikibu: "",
            namaibu: "",
            anakke: "",
            tempatdilahirkan: "",
            tempatkelahiran: "",
            jamkelahiran: "",
            jeniskelahiran: "",
            berat: "",
            panjang: "",
            penolong: "",
            niksaksi1: "",
            namasaksi1: "",
            niksaksi2: "",
            namasaksi2: "",
            filebukunikahx: "",
            filekkx: "",
            fileketeranganlahirx: "",
            filektpsaksi1x: "",
            filektpsaksi2x: "",
            filektpayahx: "",
            filektpibux: "",
            filependukung1x: "",
            filependukung2x: "",
            filependukung3x: "",
            filependukung4x: "",
            filependukung5x: "",
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
      ["nikbayi", "namalengkap", "jeniskelamin", "tgllahir"],
      ["nikayah", "namaayah", "pekerjaan", "nikibu", "namaibu"],
      ["anakke", "tempatdilahirkan", "tempatkelahiran", "jamkelahiran", "jeniskelahiran", "berat", "panjang", "penolong"],
      ["niksaksi1", "namasaksi1", "niksaksi2", "namasaksi2"],
      ["filebukunikahx", "filekkx", "fileketeranganlahirx", "filektpsaksi1x", "filektpsaksi2x"],
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
    { step: 2, label: "Biodata Anak", icon: Baby },
    { step: 3, label: "Data Ortu", icon: Users },
    { step: 4, label: "Kelahiran", icon: FileCheck },
    { step: 5, label: "Saksi", icon: Users },
    { step: 6, label: "Dokumen", icon: FileText },
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
              : "Permohonan Akta Kelahiran (Ada NIK)"}
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

            {/* Step 2: Biodata Anak */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 2 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nikbayi" className="flex items-center justify-between">
                    <span>NIK Bayi *</span>
                    <span className={cn("text-xs font-normal", formData.nikbayi.length === 16 ? "text-green-600" : "text-muted-foreground")}>
                      {formData.nikbayi.length}/16
                    </span>
                  </Label>
                  <Input
                    id="nikbayi"
                    value={formData.nikbayi}
                    onChange={(e) => handleInputChange("nikbayi", e.target.value)}
                    placeholder="Masukkan 16 digit NIK Bayi"
                    maxLength={16}
                    className={getInputClass("nikbayi")}
                  />
                  {showFieldError("nikbayi")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="namalengkap">Nama Lengkap Bayi *</Label>
                  <Input
                    id="namalengkap"
                    value={formData.namalengkap}
                    onChange={(e) => handleInputChange("namalengkap", e.target.value)}
                    placeholder="Masukkan nama lengkap bayi"
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
                  <Input
                    id="tgllahir"
                    type="date"
                    value={formData.tgllahir}
                    onChange={(e) => handleInputChange("tgllahir", e.target.value)}
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

            {/* Step 3: Data Orang Tua */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 3 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <h3 className="text-lg font-semibold text-gray-700">Data Ayah</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nikayah" className="flex items-center justify-between">
                    <span>NIK Ayah *</span>
                    <span className={cn("text-xs font-normal", formData.nikayah.length === 16 ? "text-green-600" : "text-muted-foreground")}>
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

              <h3 className="text-lg font-semibold text-gray-700 pt-4">Data Ibu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="nikibu" className="flex items-center justify-between">
                    <span>NIK Ibu *</span>
                    <span className={cn("text-xs font-normal", formData.nikibu.length === 16 ? "text-green-600" : "text-muted-foreground")}>
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

            {/* Step 4: Data Kelahiran */}
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
                  <Label htmlFor="tempatdilahirkan">Tempat Dilahirkan *</Label>
                  <Select 
                    value={formData.tempatdilahirkan} 
                    onValueChange={(value) => handleInputChange("tempatdilahirkan", value)}
                  >
                    <SelectTrigger className={getSelectClass("tempatdilahirkan")}>
                      <SelectValue placeholder="Pilih tempat dilahirkan" />
                    </SelectTrigger>
                    <SelectContent>
                      {tempatDilahirkanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("tempatdilahirkan")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                  <Label htmlFor="tempatkelahiran">Tempat Kelahiran *</Label>
                  <Input
                    id="tempatkelahiran"
                    value={formData.tempatkelahiran}
                    onChange={(e) => handleInputChange("tempatkelahiran", e.target.value)}
                    placeholder="Masukkan tempat kelahiran"
                    className={getInputClass("tempatkelahiran")}
                  />
                  {showFieldError("tempatkelahiran")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                  <Label htmlFor="jamkelahiran">Jam Kelahiran *</Label>
                  <Input
                    id="jamkelahiran"
                    type="time"
                    value={formData.jamkelahiran}
                    onChange={(e) => handleInputChange("jamkelahiran", e.target.value)}
                    className={getInputClass("jamkelahiran")}
                  />
                  {showFieldError("jamkelahiran")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                  <Label htmlFor="jeniskelahiran">Jenis Kelahiran *</Label>
                  <Select 
                    value={formData.jeniskelahiran} 
                    onValueChange={(value) => handleInputChange("jeniskelahiran", value)}
                  >
                    <SelectTrigger className={getSelectClass("jeniskelahiran")}>
                      <SelectValue placeholder="Pilih jenis kelahiran" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisKelahiranOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("jeniskelahiran")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                  <Label htmlFor="penolong">Penolong *</Label>
                  <Select 
                    value={formData.penolong} 
                    onValueChange={(value) => handleInputChange("penolong", value)}
                  >
                    <SelectTrigger className={getSelectClass("penolong")}>
                      <SelectValue placeholder="Pilih penolong" />
                    </SelectTrigger>
                    <SelectContent>
                      {penolongOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showFieldError("penolong")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="berat">Berat (kg) *</Label>
                  <Input
                    id="berat"
                    type="number"
                    step="0.1"
                    value={formData.berat}
                    onChange={(e) => handleInputChange("berat", e.target.value)}
                    placeholder="Contoh: 3.5"
                    className={getInputClass("berat")}
                  />
                  {showFieldError("berat")}
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                  <Label htmlFor="panjang">Panjang (cm) *</Label>
                  <Input
                    id="panjang"
                    type="number"
                    step="0.1"
                    value={formData.panjang}
                    onChange={(e) => handleInputChange("panjang", e.target.value)}
                    placeholder="Contoh: 50"
                    className={getInputClass("panjang")}
                  />
                  {showFieldError("panjang")}
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

            {/* Step 5: Data Saksi */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 5 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              <h3 className="text-lg font-semibold text-gray-700">Saksi 1</h3>
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

              <h3 className="text-lg font-semibold text-gray-700 pt-4">Saksi 2</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
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
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step5}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step5)}%</span>
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

            {/* Step 6: Upload Documents */}
            <div
              className={cn(
                "space-y-4 transition-all duration-500 ease-in-out",
                currentStep === 6 ? "animate-in slide-in-from-top-4 fade-in" : "hidden",
              )}
            >
              {/* Buku Nikah Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <Label htmlFor="filebukunikah" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Buku Nikah *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
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

              {/* KK Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
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

              {/* Keterangan Lahir Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-100">
                <Label htmlFor="fileketeranganlahir" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Keterangan Lahir *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.keteranganlahir ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.keteranganlahir.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("keteranganlahir")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="fileketeranganlahir"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "keteranganlahir")}
                      disabled={uploading === "keteranganlahir"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("fileketeranganlahirx") && !formData.fileketeranganlahirx && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("fileketeranganlahirx") && !formData.fileketeranganlahirx && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload Keterangan Lahir wajib dilakukan
                      </p>
                    )}
                    {uploading === "keteranganlahir" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KTP Saksi 1 Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                <Label htmlFor="filektpsaksi1" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Saksi 1 *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktpsaksi1 ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.ktpsaksi1.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktpsaksi1")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektpsaksi1"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktpsaksi1")}
                      disabled={uploading === "ktpsaksi1"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filektpsaksi1x") && !formData.filektpsaksi1x && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filektpsaksi1x") && !formData.filektpsaksi1x && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KTP Saksi 1 wajib dilakukan
                      </p>
                    )}
                    {uploading === "ktpsaksi1" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KTP Saksi 2 Upload - Required */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-200">
                <Label htmlFor="filektpsaksi2" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Saksi 2 *
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktpsaksi2 ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.ktpsaksi2.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktpsaksi2")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektpsaksi2"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktpsaksi2")}
                      disabled={uploading === "ktpsaksi2"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:border-blue-500",
                        touchedFields.has("filektpsaksi2x") && !formData.filektpsaksi2x && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {touchedFields.has("filektpsaksi2x") && !formData.filektpsaksi2x && (
                      <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
                        Upload KTP Saksi 2 wajib dilakukan
                      </p>
                    )}
                    {uploading === "ktpsaksi2" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional: KTP Ayah */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-300">
                <Label htmlFor="filektpayah" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Ayah (Opsional)
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktpayah ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.ktpayah.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktpayah")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektpayah"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktpayah")}
                      disabled={uploading === "ktpayah"}
                      className="cursor-pointer transition-all duration-200 hover:border-blue-500"
                    />
                    {uploading === "ktpayah" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional: KTP Ibu */}
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-500">
                <Label htmlFor="filektpibu" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload KTP Ibu (Opsional)
                  <span className="text-xs text-muted-foreground">(PNG/JPG/JPEG, Max 2MB)</span>
                </Label>
                {uploadedFiles.ktpibu ? (
                  <div className="relative group">
                    <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{uploadedFiles.ktpibu.name}</p>
                          <p className="text-xs text-green-600">Berhasil diupload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("ktpibu")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="filektpibu"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "ktpibu")}
                      disabled={uploading === "ktpibu"}
                      className="cursor-pointer transition-all duration-200 hover:border-blue-500"
                    />
                    {uploading === "ktpibu" && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional: Dokumen Pendukung 1-5 */}
              {[1, 2, 3, 4, 5].map((num, index) => (
                <div 
                  key={`pendukung${num}`}
                  className={`space-y-2 animate-in slide-in-from-top-2 fade-in duration-300 delay-${(index + 3) * 100}`}
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
                    <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress.step6}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(progress.step6)}%</span>
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