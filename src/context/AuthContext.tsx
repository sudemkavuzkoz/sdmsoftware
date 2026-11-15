'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { User } from '@/lib/types';

const DEFAULT_ADMIN_PASSWORD = 'sudem2026';
const AUTH_CHANGE_EVENT = 'sdm-auth-change';

const DEFAULT_GUEST_USER: User = {
  id: 'usr-demo-default',
  name: 'Ziyaretçi',
  email: 'ziyaretci@sdmsoftware.com.tr',
  role: 'customer',
  company: 'SDM Ziyaretçisi',
  createdAt: '2026-01-01T00:00:00Z'
};

interface AuthSnapshot {
  user: User | null;
  isAdmin: boolean;
}

const EMPTY_AUTH_SNAPSHOT: AuthSnapshot = { user: null, isAdmin: false };
const GUEST_AUTH_SNAPSHOT: AuthSnapshot = { user: DEFAULT_GUEST_USER, isAdmin: false };

let isLoggedOutSession = false;
let cachedRawUser: string | null | undefined;
let cachedRawAdmin: string | null | undefined;
let cachedAuthSnapshot: AuthSnapshot = EMPTY_AUTH_SNAPSHOT;

function subscribeAuth(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener();
  window.addEventListener(AUTH_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function getAuthSnapshot(): AuthSnapshot {
  if (typeof window === 'undefined' || isLoggedOutSession) {
    return EMPTY_AUTH_SNAPSHOT;
  }
  try {
    const rawUser = localStorage.getItem('sdm_auth_user');
    const rawAdmin = localStorage.getItem('sdm_admin_session');
    if (rawUser === cachedRawUser && rawAdmin === cachedRawAdmin) {
      return cachedAuthSnapshot;
    }

    cachedRawUser = rawUser;
    cachedRawAdmin = rawAdmin;

    if (!rawUser) {
      cachedAuthSnapshot = GUEST_AUTH_SNAPSHOT;
      return cachedAuthSnapshot;
    }

    const parsed = JSON.parse(rawUser) as User;
    const isValidAdmin = parsed.role === 'admin' && rawAdmin === 'true';
    cachedAuthSnapshot = {
      user: isValidAdmin ? parsed : { ...parsed, role: 'customer' },
      isAdmin: isValidAdmin
    };
    return cachedAuthSnapshot;
  } catch {
    cachedAuthSnapshot = GUEST_AUTH_SNAPSHOT;
    return cachedAuthSnapshot;
  }
}

function getAuthServerSnapshot(): AuthSnapshot {
  return EMPTY_AUTH_SNAPSHOT;
}

function emitAuthChange() {
  cachedRawUser = undefined;
  cachedRawAdmin = undefined;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, role?: 'customer' | 'admin', company?: string) => void;
  loginAsAdmin: (password: string) => { success: boolean; message?: string };
  changeAdminPassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  const login = (
    email: string,
    name: string = 'Kullanıcı',
    role: 'customer' | 'admin' = 'customer',
    company: string = 'Kurumsal Müşteri'
  ) => {
    // Normal login asla admin yapamaz, admin için loginAsAdmin çağrılmalıdır
    const safeRole = role === 'admin' ? 'customer' : role;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: safeRole,
      company,
      createdAt: new Date().toISOString()
    };
    isLoggedOutSession = false;
    try {
      localStorage.setItem('sdm_auth_user', JSON.stringify(newUser));
      localStorage.removeItem('sdm_admin_session');
    } catch {
      // Depolama erişim hatası yok sayılır
    }
    emitAuthChange();
  };

  const loginAsAdmin = (password: string): { success: boolean; message?: string } => {
    let savedPass = DEFAULT_ADMIN_PASSWORD;
    try {
      const customPass = localStorage.getItem('sdm_admin_secret_pwd');
      if (customPass) savedPass = customPass;
    } catch {
      // Varsayılan şifre ile devam edilir
    }

    if (password.trim() === savedPass) {
      const adminUser: User = {
        id: 'usr-admin-sudem',
        name: 'Sudem Kavuzkoz',
        email: 'sudem@sdmsoftware.com.tr',
        role: 'admin',
        company: 'SDM Software HQ',
        createdAt: '2026-01-01T00:00:00Z'
      };
      isLoggedOutSession = false;
      try {
        localStorage.setItem('sdm_auth_user', JSON.stringify(adminUser));
        localStorage.setItem('sdm_admin_session', 'true');
      } catch {
        // Depolama erişim hatası yok sayılır
      }
      emitAuthChange();
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
    } catch {
      // Varsayılan şifre ile devam edilir
    }

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
    isLoggedOutSession = true;
    try {
      localStorage.removeItem('sdm_auth_user');
      localStorage.removeItem('sdm_admin_session');
    } catch {
      // Depolama erişim hatası yok sayılır
    }
    emitAuthChange();
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
