import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  user_id: string;
  name?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string[] | null;
  success: string[] | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  success: null,
};

// API base URL — kosong = panggil Route Handler Next.js sendiri (relatif).
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    credentials: { user_id: string; password: string; recaptchaToken?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        error: ['Terjadi kesalahan. Silakan coba lagi.'],
        success: [],
        data: {},
      });
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    userData: {
      nama: string;
      nik: string;
      kk: string;
      hp: string;
      email: string;
      pass: string;
      pass2: string;
      recaptchaToken?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        error: ['Terjadi kesalahan. Silakan coba lagi.'],
        success: [],
        data: {},
      });
    }
  }
);

// Async thunk for checking NIK and KK
export const checkNikKk = createAsyncThunk(
  'auth/checkNikKk',
  async (
    data: { nik: string; kk: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/check-nik`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue({
        error: ['Gagal memeriksa NIK. Silakan coba lagi.'],
        success: [],
      });
    }
  }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (
    data: { nik: string; recaptchaToken?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue({
        error: ['Gagal mengirim link reset password. Silakan coba lagi.'],
        success: [],
      });
    }
  }
);

// Async thunk for reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    data: { pass1: string; pass2: string; key: string; recaptchaToken?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue({
        error: ['Gagal mereset password. Silakan coba lagi.'],
        success: [],
      });
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        error: ['Gagal logout'],
        success: [],
      });
    }
  }
);

// Async thunk to check/verify session
export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear all messages (error and success)
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    // Clear only error messages
    clearError: (state) => {
      state.error = null;
    },
    // Clear only success messages
    clearSuccess: (state) => {
      state.success = null;
    },
    // Set user manually (useful for session restoration)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    // Clear user data
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    // Reset entire auth state to initial
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.success = null;
    },
    // Add a specific error message
    setError: (state, action: PayloadAction<string[]>) => {
      state.error = action.payload;
    },
    // Add a specific success message
    setSuccess: (state, action: PayloadAction<string[]>) => {
      state.success = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user || null;
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.error || ['Login gagal'];
        state.success = null;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success || ['Pendaftaran berhasil! Silakan cek email untuk aktivasi.'];
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || ['Pendaftaran gagal'];
        state.success = null;
      });

    // Check NIK/KK
    builder
      .addCase(checkNikKk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(checkNikKk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success || ['NIK dan KK valid'];
        state.error = null;
      })
      .addCase(checkNikKk.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || ['Gagal memeriksa NIK'];
        state.success = null;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success || ['Link reset password telah dikirim ke email Anda'];
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || ['Gagal mengirim link reset password'];
        state.success = null;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success || ['Password berhasil direset'];
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || ['Gagal mereset password'];
        state.success = null;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.success = ['Berhasil logout'];
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || ['Logout gagal'];
      });

    // Verify Session
    builder
      .addCase(verifySession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(verifySession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { 
  clearMessages, 
  clearError, 
  clearSuccess, 
  setUser, 
  clearUser, 
  resetAuth,
  setError,
  setSuccess 
} = authSlice.actions;

export default authSlice.reducer;