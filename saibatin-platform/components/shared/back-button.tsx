import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Tautan "Kembali" sederhana untuk header halaman. */
export function BackButton({
  href,
  label = 'Kembali',
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
