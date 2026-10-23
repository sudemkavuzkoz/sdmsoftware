'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';

const DEFAULT_ADMIN_PASSWORD = 'sudem2026';

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, role?: 'customer' | 'admin') => void;
  loginAsAdmin: (password: string) => { success: boolean; message?: string };
  changeAdminPassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sdm_auth_user');
      const hasAdminSession = localStorage.getItem('sdm_admin_session') === 'true';

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'admin' && hasAdminSession) {
          setUser(parsed);
          setIsAdmin(true);
        } else {
          // Admin session yoksa müşteri olarak başlat
          parsed.role = 'customer';
          setUser(parsed);
          setIsAdmin(false);
        }
      } else {
        const defaultUser: User = {
          id: 'usr-demo-default',
          name: 'Ziyaretçi',
          email: 'ziyaretci@sdmsoftware.com.tr',
          role: 'customer',
          company: 'SDM Ziyaretçisi',
          createdAt: new Date().toISOString()
        };
        setUser(defaultUser);
        localStorage.setItem('sdm_auth_user', JSON.stringify(defaultUser));
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const login = (email: string, name: string = 'Kullanıcı', role: 'customer' | 'admin' = 'customer') => {
    // Normal login asla admin yapamaz, admin için loginAsAdmin çağrılmalıdır
    const safeRole = role === 'admin' ? 'customer' : role;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: safeRole,
      company: 'Kurumsal Müşteri',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    setIsAdmin(false);
    try {
      localStorage.setItem('sdm_auth_user', JSON.stringify(newUser));
      localStorage.removeItem('sdm_admin_session');
    } catch {}
  };

  const loginAsAdmin = (password: string): { success: boolean; message?: string } => {
    let savedPass = DEFAULT_ADMIN_PASSWORD;
    try {
      const customPass = localStorage.getItem('sdm_admin_secret_pwd');
      if (customPass) savedPass = customPass;
    } catch {}

    if (password.trim() === savedPass) {
      const adminUser: User = {
        id: 'usr-admin-sudem',
        name: 'Sudem Kavuzkoz',
        email: 'sudem@sdmsoftware.com.tr',
        role: 'admin',
        company: 'SDM Software HQ',
        createdAt: '2026-01-01T00:00:00Z'
      };
      setUser(adminUser);
      setIsAdmin(true);
      try {
        localStorage.setItem('sdm_auth_user', JSON.stringify(adminUser));
        localStorage.setItem('sdm_admin_session', 'true');
      } catch {}
      return { success: true };
    }

    return {
      success: false,
      message: 'Hatalı yönetici şifresi! Erişim engellendi.'
    };
  };

  const changeAdminPassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    let savedPass = DEFAULT_ADMIN_PASSWORD;
    try {
      const custom = localStorage.getItem('sdm_admin_secret_pwd');
      if (custom) savedPass = custom;
    } catch {}

    if (currentPass.trim() !== savedPass) {
      return { success: false, message: 'Mevcut yönetici şifreniz hatalı.' };
    }

    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'Yeni şifre en az 4 karakter olmalıdır.' };
    }

    try {
      localStorage.setItem('sdm_admin_secret_pwd', newPass.trim());
      return { success: true, message: 'Yönetici şifreniz başarıyla güncellendi!' };
    } catch {
      return { success: false, message: 'Şifre kaydedilirken bir hata oluştu.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    try {
      localStorage.removeItem('sdm_auth_user');
      localStorage.removeItem('sdm_admin_session');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginAsAdmin,
        changeAdminPassword,
        logout,
        isAuthenticated: !!user,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

