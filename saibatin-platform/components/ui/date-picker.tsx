"use client";

import * as React from "react";
import { format, parse, isValid, isAfter, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  id?: string;
  /** Nilai dalam format "yyyy-MM-dd" (sama seperti input type="date"). */
  value: string;
  /** Menerima string "yyyy-MM-dd", atau "" saat dikosongkan. */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Batasi tanggal yang bisa dipilih, mis. tidak boleh melebihi hari ini. */
  maxToday?: boolean;
  className?: string;
}

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const date = parse(value, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : undefined;
}

/** Ubah "yyyy-MM-dd" → "dd/MM/yyyy" untuk ditampilkan di kotak ketik. */
function keTampilan(value: string): string {
  const d = parseValue(value);
  return d ? format(d, "dd/MM/yyyy") : "";
}

/**
 * Masker ketik: ambil angkanya saja lalu sisipkan "/" otomatis, sehingga
 * pengguna cukup mengetik "17081945" dan menjadi "17/08/1945".
 */
function masker(input: string): string {
  const angka = input.replace(/\D/g, "").slice(0, 8);
  const bagian = [angka.slice(0, 2), angka.slice(2, 4), angka.slice(4, 8)];
  return bagian.filter(Boolean).join("/");
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled,
  maxToday,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  // Teks mentah yang sedang diketik — dipisah dari `value` supaya pengguna
  // bisa mengetik sebagian ("17/08") tanpa nilainya ikut berubah.
  const [teks, setTeks] = React.useState(() => keTampilan(value));
  const selected = parseValue(value);

  // Selaraskan kembali bila nilai diubah dari luar (reset form, isi otomatis).
  React.useEffect(() => {
    setTeks(keTampilan(value));
  }, [value]);

  const terimaTeks = (mentah: string) => {
    const bertopeng = masker(mentah);
    setTeks(bertopeng);

    if (!bertopeng) {
      onChange("");
      return;
    }
    // Baru commit kalau tanggalnya sudah lengkap DAN masuk akal — mengetik
    // "17/08/19" tidak boleh diam-diam jadi tahun 19.
    if (bertopeng.length === 10) {
      const d = parse(bertopeng, "dd/MM/yyyy", new Date());
      if (!isValid(d)) return;
      if (maxToday && isAfter(startOfDay(d), startOfDay(new Date()))) return;
      onChange(format(d, "yyyy-MM-dd"));
    }
  };

  // Ketikan setengah jadi dikembalikan ke nilai terakhir yang sah, supaya
  // kotak tidak ditinggal dalam keadaan menggantung.
  const rapikan = () => setTeks(keTampilan(value));

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        value={teks}
        onChange={(e) => terimaTeks(e.target.value)}
        onBlur={rapikan}
        disabled={disabled}
        placeholder={placeholder === "Pilih tanggal" ? "hh/bb/tttt" : placeholder}
        inputMode="numeric"
        autoComplete="off"
        aria-label={placeholder}
        className="h-9 pr-10"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Buka kalender"
            className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            locale={localeId}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
            selected={selected}
            defaultMonth={selected ?? new Date()}
            disabled={maxToday ? { after: new Date() } : undefined}
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
