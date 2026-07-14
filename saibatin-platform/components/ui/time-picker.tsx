"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface TimePickerProps {
  id?: string;
  /** Nilai dalam format "HH:mm" (sama seperti input type="time"). */
  value: string;
  /** Menerima string "HH:mm". */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** Kolom angka (jam/menit) yang bisa discroll, item aktif disorot. */
function ScrollColumn({
  label,
  items,
  active,
  onPick,
}: {
  label: string;
  items: string[];
  active?: string;
  onPick: (v: string) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLButtonElement>(
      `[data-value="${active}"]`,
    );
    el?.scrollIntoView({ block: "center" });
  }, [active]);

  return (
    <div className="flex flex-col">
      <p className="pb-1 text-center text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <div
        ref={listRef}
        className="h-52 w-16 overflow-y-auto rounded-md border border-input"
      >
        {items.map((v) => (
          <button
            key={v}
            type="button"
            data-value={v}
            onClick={() => onPick(v)}
            className={cn(
              "block w-full px-2 py-1.5 text-center text-sm transition-colors hover:bg-accent",
              v === active &&
                "bg-primary text-primary-foreground hover:bg-primary",
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Pemilih jam (HH:mm) bergaya sama dengan DatePicker — pengganti
 * input type="time" bawaan browser.
 */
export function TimePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih jam",
  disabled,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const valid = /^\d{2}:\d{2}$/.test(value);
  const [hour, minute] = valid ? value.split(":") : [undefined, undefined];

  const pick = (h?: string, m?: string) => {
    onChange(`${h ?? hour ?? "00"}:${m ?? minute ?? "00"}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 px-3",
            !valid && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          {valid ? value : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex gap-2">
          <ScrollColumn
            label="Jam"
            items={HOURS}
            active={hour}
            onPick={(v) => pick(v, undefined)}
          />
          <ScrollColumn
            label="Menit"
            items={MINUTES}
            active={minute}
            onPick={(v) => {
              pick(undefined, v);
              setOpen(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
