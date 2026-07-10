'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// react-leaflet mengakses `window` → hanya di klien. ssr:false HARUS di dalam
// Client Component (tidak boleh di Server Component seperti page.tsx).
const PetaDemografi = dynamic(() => import('./peta-demografi'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  ),
});

export default function PetaDemografiLoader() {
  return <PetaDemografi />;
}
