'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';

export function LogoutButton() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Berhasil keluar');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Gagal keluar, coba lagi');
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      <span className="ml-1">Keluar</span>
    </Button>
  );
}
