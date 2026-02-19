import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  /* ===================== CHECK AUTH ===================== */
  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const res = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.data.user);
      setIsAuthenticated(true);
      return res.data.data.user;
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ===================== LOGIN ===================== */
  const login = async (credentials) => {
    try {
      // 🔥 role lowercase safety
      const payload = {
        ...credentials,
        role: credentials.role?.toLowerCase(),
      };

      const res = await api.post('/auth/login', payload);

      // OTP required
      if (res.data.requiresOTP) {
        toast.success('OTP sent to email');
        return {
          success: true,
          requiresOTP: true,
          email: res.data.email,
        };
      }

      // Direct login
      localStorage.setItem('token', res.data.token);

      const user = await checkAuth();

      toast.success('Login successful');

      return {
        success: true,
        role: user?.role,
      };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  /* ===================== REGISTER ===================== */
  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', {
        ...data,
        role: data.role?.toLowerCase(),
      });

      toast.success(res.data.message);

      return {
        success: true,
        requiresOTP: true,
        email: res.data.email,
      };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Register failed');
      return { success: false };
    }
  };

  /* ===================== VERIFY OTP ===================== */
  const verifyOTP = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });

      localStorage.setItem('token', res.data.token);

      const user = await checkAuth();

      toast.success('OTP verified successfully');

      return {
        success: true,
        role: user?.role,
      };
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
      return { success: false };
    }
  };

  /* ===================== LOGOUT ===================== */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out');
  };

  /* ===================== PASSWORD ===================== */
  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      return { success: true };
    } catch {
      toast.error('Failed to send reset email');
      return { success: false };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful');
      return { success: true };
    } catch {
      toast.error('Reset failed');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        verifyOTP,
        logout,
        forgotPassword,
        resetPassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
