'use client';

import { Footer } from '@/components/shared/footer';
import { RiwayatList } from '@/components/shared/riwayat-list';
import { ClipboardList } from 'lucide-react';

export default function RiwayatPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl glass-card-blue flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Riwayat Permohonan</h1>
              <p className="text-primary-foreground/80 mt-1">Pantau status pengajuan dokumen Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10 max-w-4xl">
        <RiwayatList />
      </div>

      <Footer />
    </div>
  );
}
