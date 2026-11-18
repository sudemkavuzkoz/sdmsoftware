'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MembershipTier, Order, User, UserBrandingConfig } from '@/lib/types';
import { persistClientOrder } from '@/lib/orderStorage';

const DEFAULT_ADMIN_PASSWORD = 'sudem2026';
const GUEST_DEMO_STORAGE_KEY = 'sdm_guest_demo_actions';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

interface UpgradeResult {
  success: boolean;
  error?: string;
  order?: Order;
}

interface DemoTrackResult {
  allowed: boolean;
  demoActionsUsed: number;
  demoTrialLimit: number;
}

interface AuthContextType {
  user: User | null;
  dbOrders: Order[];
  authLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshSession: () => Promise<void>;
  registerAccount: (payload: RegisterPayload) => Promise<AuthResult>;
  loginAccount: (email: string, password: string) => Promise<AuthResult>;
  login: (email: string, name?: string, role?: 'customer' | 'admin', company?: string) => void;
  loginAsAdmin: (password: string) => { success: boolean; message?: string };
  changeAdminPassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  logout: () => Promise<void>;
  upgradeMembership: (tier: Exclude<MembershipTier, 'free'>, targetSlug?: string) => Promise<UpgradeResult>;
  activateLicenseKey: (licenseKey: string, targetSlug?: string) => Promise<{ success: boolean; error?: string }>;
  saveBrandingConfig: (updates: Partial<UserBrandingConfig>) => Promise<{ success: boolean; error?: string }>;
  trackDemoAction: () => Promise<DemoTrackResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readGuestUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = Number.parseInt(localStorage.getItem(GUEST_DEMO_STORAGE_KEY) ?? '0', 10);
    return Number.isFinite(val) && val >= 0 ? val : 0;
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbOrders, setDbOrders] = useState<Order[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [localAdminFlag, setLocalAdminFlag] = useState(false);

  const syncOrdersToClientCache = useCallback((orders: Order[]) => {
    orders.forEach((o) => persistClientOrder(o));
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = (await res.json()) as {
        authenticated?: boolean;
        user?: User | null;
        orders?: Order[];
      };
      if (data.authenticated && data.user) {
        setUser(data.user);
        setDbOrders(data.orders ?? []);
        if (data.orders?.length) syncOrdersToClientCache(data.orders);
        setLocalAdminFlag(data.user.role === 'admin');
      } else {
        setUser(null);
        setDbOrders([]);
        setLocalAdminFlag(false);
      }
    } catch {
      // Ağ hatasında oturum sıfırlanmaz
    } finally {
      setAuthLoading(false);
    }
  }, [syncOrdersToClientCache]);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: User | null; orders?: Order[] }) => {
        if (!active) return;
        if (data.authenticated && data.user) {
          setUser(data.user);
          setDbOrders(data.orders ?? []);
          if (data.orders?.length) syncOrdersToClientCache(data.orders);
          setLocalAdminFlag(data.user.role === 'admin');
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, [syncOrdersToClientCache]);

  const registerAccount = async (payload: RegisterPayload): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = (await res.json()) as { success?: boolean; user?: User; orders?: Order[]; error?: string };
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error || 'Kayıt başarısız.' };
      }
      setUser(data.user);
      setDbOrders(data.orders ?? []);
      setLocalAdminFlag(false);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Sunucuya bağlanılamadı.' };
    }
  };

  const loginAccount = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = (await res.json()) as { success?: boolean; user?: User; orders?: Order[]; error?: string };
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error || 'Giriş başarısız.' };
      }
      setUser(data.user);
      setDbOrders(data.orders ?? []);
      if (data.orders?.length) syncOrdersToClientCache(data.orders);
      setLocalAdminFlag(data.user.role === 'admin');
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Sunucuya bağlanılamadı.' };
    }
  };

  // Backwards-compatible fallback signature
  const login = (email: string, name: string = 'Kullanıcı', role?: 'customer' | 'admin', company?: string) => {
    void role;
    const fallbackUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'customer',
      company,
      membershipTier: 'free',
      demoActionsUsed: 0,
      demoTrialLimit: 5,
      licenses: [],
      branding: {
        brandName: company || name,
        tagline: 'Kurumsal Çalışma Alanı',
        accentColor: '#00f0ff',
        logoText: name.slice(0, 2).toUpperCase(),
        welcomeMessage: 'Hoş geldiniz.',
        enabledModules: ['dental_emr', 'clinic_billing', 'vet_triage', 'stock_upload', 'travel_rag'],
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
    setUser(fallbackUser);
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
      setLocalAdminFlag(true);
      // Sync admin cookie session cleanly in background
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@sdmsoftware.com.tr', password: DEFAULT_ADMIN_PASSWORD })
      })
        .then((r) => r.json())
        .then((d: { success?: boolean; user?: User; orders?: Order[] }) => {
          if (d.success && d.user) {
            setUser(d.user);
            setDbOrders(d.orders ?? []);
          }
        })
        .catch(() => {});
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

  const logout = async () => {
    setUser(null);
    setDbOrders([]);
    setLocalAdminFlag(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Çerez temizliği
    }
  };

  const upgradeMembership = async (
    tier: Exclude<MembershipTier, 'free'>,
    targetSlug: string = 'all'
  ): Promise<UpgradeResult> => {
    try {
      const res = await fetch('/api/user/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade_membership', tier, targetSlug })
      });
      const data = (await res.json()) as {
        success?: boolean;
        user?: User;
        order?: Order;
        orders?: Order[];
        error?: string;
      };
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error || 'Üyelik yükseltilemedi.' };
      }
      setUser(data.user);
      if (data.orders) {
        setDbOrders(data.orders);
        syncOrdersToClientCache(data.orders);
      } else if (data.order) {
        persistClientOrder(data.order);
      }
      return { success: true, order: data.order };
    } catch {
      return { success: false, error: 'Ödeme/üyelik sunucusuna bağlanılamadı.' };
    }
  };

  const activateLicenseKey = async (
    licenseKey: string,
    targetSlug: string = 'all'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/user/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_license', licenseKey, targetSlug })
      });
      const data = (await res.json()) as { success?: boolean; user?: User; orders?: Order[]; error?: string };
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error || 'Lisans anahtarı doğrulanamadı.' };
      }
      setUser(data.user);
      if (data.orders) {
        setDbOrders(data.orders);
        syncOrdersToClientCache(data.orders);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Lisans doğrulama hatası.' };
    }
  };

  const saveBrandingConfig = async (
    updates: Partial<UserBrandingConfig>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/user/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = (await res.json()) as { success?: boolean; user?: User; error?: string };
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error || 'Kişiselleştirme kaydedilemedi.' };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Ayarlar kaydedilirken bağlantı hatası oluştu.' };
    }
  };

  const trackDemoAction = async (): Promise<DemoTrackResult> => {
    if (!user) {
      const next = readGuestUsageCount() + 1;
      try {
        localStorage.setItem(GUEST_DEMO_STORAGE_KEY, String(next));
      } catch {
        // yoksay
      }
      return { allowed: next <= 5, demoActionsUsed: next, demoTrialLimit: 5 };
    }

    if (user.role === 'admin' || user.membershipTier !== 'free' || user.licenses.some((l) => l.status === 'active')) {
      return { allowed: true, demoActionsUsed: user.demoActionsUsed, demoTrialLimit: user.demoTrialLimit };
    }

    try {
      const res = await fetch('/api/user/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'track_demo_usage' })
      });
      const data = (await res.json()) as {
        success?: boolean;
        usage?: DemoTrackResult;
        user?: User;
      };
      if (data.success && data.usage) {
        if (data.user) setUser(data.user);
        return data.usage;
      }
    } catch {
      // yerel sayım
    }
    return {
      allowed: user.demoActionsUsed < user.demoTrialLimit,
      demoActionsUsed: user.demoActionsUsed,
      demoTrialLimit: user.demoTrialLimit
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbOrders,
        authLoading,
        isAuthenticated: Boolean(user),
        isAdmin: localAdminFlag || user?.role === 'admin',
        refreshSession,
        registerAccount,
        loginAccount,
        login,
        loginAsAdmin,
        changeAdminPassword,
        logout,
        upgradeMembership,
        activateLicenseKey,
        saveBrandingConfig,
        trackDemoAction
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
