"use client";

import * as React from "react";
import * as UI from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Pembungkus form permohonan yang bisa tampil sebagai MODAL atau HALAMAN PENUH.
 *
 * Latar: 15 form permohonan warga (KIAModal, KTPELModal, dsb) masing-masing
 * ~700 baris dan seluruhnya dibungkus `Dialog` dari components/ui/dialog.
 * Permintaan client: pembuatan permohonan pindah ke dashboard sebagai halaman
 * penuh, tanpa modal.
 *
 * Daripada membedah tiap form, komponen di sini meniru API `Dialog` persis.
 * Tiap form cukup mengganti satu baris import (`@/components/ui/dialog` →
 * `@/components/permohonan-online/form-shell`) dan perilakunya tidak berubah:
 * - TANPA <FormPageMode> → tetap modal seperti sebelumnya.
 * - DI DALAM <FormPageMode> → dirender inline sebagai halaman penuh.
 */

const PageModeContext = React.createContext(false);

/** Menandai subtree agar form di dalamnya dirender sebagai halaman, bukan modal. */
export function FormPageMode({ children }: { children: React.ReactNode }) {
  return (
    <PageModeContext.Provider value={true}>{children}</PageModeContext.Provider>
  );
}

export const useFormPageMode = () => React.useContext(PageModeContext);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  if (useFormPageMode()) return <>{children}</>;
  return (
    <UI.Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </UI.Dialog>
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof UI.DialogContent>) {
  // Di mode halaman className modal (max-w-4xl, max-h-[95vh], overflow-hidden)
  // sengaja dibuang — pembatas tinggi itu yang bikin form ikut ter-scroll
  // di dalam kotak; sebagai halaman biarkan halaman yang men-scroll.
  if (useFormPageMode()) {
    return (
      <div className="flex w-full flex-col rounded-2xl border bg-card p-5 shadow-sm md:p-7">
        {children}
      </div>
    );
  }
  return (
    <UI.DialogContent className={className} {...props}>
      {children}
    </UI.DialogContent>
  );
}

export function DialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  if (useFormPageMode()) {
    return (
      <div className={cn("space-y-1 border-b pb-4", className)} {...props}>
        {children}
      </div>
    );
  }
  return (
    <UI.DialogHeader className={className} {...props}>
      {children}
    </UI.DialogHeader>
  );
}

export function DialogTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  if (useFormPageMode()) {
    return (
      <h1 className={cn("text-2xl font-bold text-primary", className)} {...props}>
        {children}
      </h1>
    );
  }
  return (
    <UI.DialogTitle className={className} {...props}>
      {children}
    </UI.DialogTitle>
  );
}

export function DialogDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  if (useFormPageMode()) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)} {...props}>
        {children}
      </p>
    );
  }
  return (
    <UI.DialogDescription className={className} {...props}>
      {children}
    </UI.DialogDescription>
  );
}

// Re-ekspor sisa primitif apa adanya supaya import satu pintu tetap cukup.
export const DialogFooter = UI.DialogFooter;
export const DialogTrigger = UI.DialogTrigger;
export const DialogClose = UI.DialogClose;
