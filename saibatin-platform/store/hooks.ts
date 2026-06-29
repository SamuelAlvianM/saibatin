import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Basic Redux hooks with types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook to get auth state
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

// Custom hook to protect routes (redirect if not authenticated)
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Custom hook to redirect authenticated users (useful for login/register pages)
export const useGuestOnly = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Custom hook to get user information
export const useUser = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    user,
    isAuthenticated,
    userId: user?.user_id || null,
    userName: user?.name || null,
  };
};