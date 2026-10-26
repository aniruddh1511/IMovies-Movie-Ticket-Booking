import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('imovies_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin'); // 'signin' | 'register'

  useEffect(() => {
    // If token exists, verify session with backend
    if (token) {
      api.getProfile().then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
        }
      });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        setAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: res.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const res = await api.register(name, email, password, phone);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        setAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: res.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name, email, phone) => {
    setLoading(true);
    try {
      const res = await api.updateProfile(name, email, phone);
      if (res.success) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setUser(null);
    setToken(null);
  };

  const openAuthModal = (tab = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        loading,
        authModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
