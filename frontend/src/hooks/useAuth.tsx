'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Verify with backend and get fresh populated data (e.g. storeName)
          const res = await api.get('/auth/me');
          if (res.data) {
            const freshUser = {
              ...parsedUser,
              ...res.data,
              storeId: res.data.storeId?._id || res.data.storeId || parsedUser.storeId,
              storeName: res.data.storeId?.name || parsedUser.storeName,
              subscriptionPlan: res.data.storeId?.subscriptionPlan || parsedUser.subscriptionPlan
            };
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        }
      } catch (error) {
        console.error('Auth error', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const data = res.data;
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      if (data.role === 'superadmin') {
        router.push('/superadmin');
      } else if (data.role === 'staff') {
        router.push('/billing');
      } else {
        router.push('/dashboard');
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await api.post('/auth/register', userData);
      const data = res.data;
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const sendOtp = async (email: string) => {
    try {
      await api.post('/auth/send-otp', { email });
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const freshUser = {
          ...storedUser,
          ...res.data,
          storeId: res.data.storeId?._id || res.data.storeId || storedUser.storeId,
          storeName: res.data.storeId?.name || storedUser.storeName,
          subscriptionPlan: res.data.storeId?.subscriptionPlan || storedUser.subscriptionPlan
        };
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sendOtp, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
