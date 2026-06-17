import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('yui_token');
    const storedUser = localStorage.getItem('yui_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        // Clear corrupt storage
        localStorage.removeItem('yui_token');
        localStorage.removeItem('yui_user');
      }
    }
    setLoading(false);
  }, []);

  // Fetch the current user profile from the server to keep it synced
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/user');
      const updatedUser = {
        id: response.data.userId,
        name: response.data.name,
      };
      setUser(updatedUser);
      localStorage.setItem('yui_user', JSON.stringify(updatedUser));
    } catch (err: any) {
      console.error('Failed to sync user profile:', err);
      // If unauthorized, logout
      if (err.response?.status === 401) {
        logout();
      }
    }
  }, []);

  // Run fetchUserProfile once authenticated
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token, fetchUserProfile]);

  // Helper to resolve error message (handles backend offline cases)
  const getErrorMessage = (err: any, defaultMsg: string): string => {
    if (err.message === 'Network Error') {
      return 'Koneksi gagal! Pastikan server backend berjalan di port 3001 (tidak crash/terblokir).';
    }
    return err.response?.data?.error || defaultMsg;
  };

  // Request a 6-digit OTP to be sent via Telegram bot
  const requestOTP = async (telegramId: string): Promise<boolean> => {
    setAuthLoading(true);
    setError(null);
    try {
      await api.post('/auth/request-otp', { telegramId });
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      setError(getErrorMessage(err, 'Gagal mengirim OTP. Coba lagi.'));
      setAuthLoading(false);
      return false;
    }
  };

  // Verify the 6-digit OTP requested by the user on the web
  const verifyOTP = async (telegramId: string, otp: string): Promise<boolean> => {
    setAuthLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify-otp', { telegramId, otp });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      setToken(receivedToken);
      setUser(receivedUser);
      
      localStorage.setItem('yui_token', receivedToken);
      localStorage.setItem('yui_user', JSON.stringify(receivedUser));
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      setError(getErrorMessage(err, 'Verifikasi OTP gagal (T_T)'));
      setAuthLoading(false);
      return false;
    }
  };

  // Verify the 8-character OTP generated directly by the Telegram bot
  const verifyBotOTP = async (otp: string): Promise<boolean> => {
    setAuthLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/otp/verify', { otp });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      setToken(receivedToken);
      setUser(receivedUser);
      
      localStorage.setItem('yui_token', receivedToken);
      localStorage.setItem('yui_user', JSON.stringify(receivedUser));
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      setError(getErrorMessage(err, 'OTP tidak valid atau kedaluwarsa (T_T)'));
      setAuthLoading(false);
      return false;
    }
  };

  // Logout current session
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('yui_token');
    localStorage.removeItem('yui_user');
  };

  return {
    user,
    token,
    loading,
    authLoading,
    error,
    isAuthenticated: !!token,
    requestOTP,
    verifyOTP,
    verifyBotOTP,
    logout,
    refreshUser: fetchUserProfile,
  };
};
export type UseAuthType = ReturnType<typeof useAuth>;
