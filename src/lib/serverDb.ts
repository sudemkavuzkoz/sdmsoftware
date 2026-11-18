import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  MembershipTier,
  Order,
  PaymentSettings,
  User,
  UserBrandingConfig,
  UserLicenseGrant
} from './types';
import { canCustomizeBranding, formatIban, MEMBERSHIP_PLANS } from './membership';
import { db as memoryCatalogDb } from './db';

interface StoredUserRecord extends User {
  passwordHash: string;
}

interface PersistedDatabase {
  version: number;
  sessionSecret: string;
  users: StoredUserRecord[];
  orders: Order[];
  paymentSettings: PaymentSettings;
}

function defaultPaymentSettings(): PaymentSettings {
  return {
    wireTransferEnabled: false,
    bankName: '',
    accountHolder: '',
    iban: '',
    branchOrSwift: '',
    transferNote: 'Web sitemiz üzerinden ödeme alınmamaktadır. Teklif için WhatsApp: 0546 401 14 51 | Mail: sudemkavuzkoz005@gmail.com',
    virtualPosEnabled: false,
    virtualPosProvider: 'none',
    taxRatePct: 20,
    pricesIncludeTax: true,
    updatedAt: '2026-11-18T00:00:00.000Z'
  };
}

export const SESSION_COOKIE_NAME = 'sdm_session';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, hashHex] = parts;
  if (!salt || !hashHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

function sanitizeUser(record: StoredUserRecord): User {
  const copy = { ...record };
  delete (copy as { passwordHash?: string }).passwordHash;
  return copy;
}

function buildDefaultBranding(name: string, company?: string): UserBrandingConfig {
  const label = (company?.trim() || name.trim() || 'SDM Kurumsal').slice(0, 48);
  const words = label.split(/\s+/).filter(Boolean);
  const logoText =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : label.slice(0, 3).toUpperCase();

  return {
    brandName: label,
    tagline: 'Kişiselleştirilmiş Kurumsal Çalışma Alanı',
    accentColor: '#00f0ff',
    logoText: logoText || 'SDM',
    welcomeMessage: `${label} özel lisanslı sistem arayüzüne hoş geldiniz.`,
    enabledModules: ['dental_emr', 'clinic_billing', 'vet_triage', 'stock_upload', 'travel_rag'],
    updatedAt: new Date().toISOString()
  };
}

function createInitialSeed(): PersistedDatabase {
  return {
    version: 1,
    sessionSecret: process.env.SDM_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    users: [
      {
        id: 'usr-1',
        name: 'Sudem Kavuzkoz',
        email: 'admin@sdmsoftware.com.tr',
        role: 'admin',
        company: 'SDM Software HQ',
        membershipTier: 'enterprise_license',
        demoActionsUsed: 0,
        demoTrialLimit: 9999,
        licenses: [
          {
            id: 'lic-admin-master',
            licenseKey: 'SDM-ENT-ADMIN-2026-MASTER',
            targetSlug: 'all',
            productTitle: 'SDM Kurumsal Tam Paket',
            tier: 'premium',
            status: 'active',
            grantedAt: '2026-01-01T00:00:00.000Z'
          }
        ],
        branding: {
          brandName: 'SDM Software HQ',
          tagline: 'Kurumsal Yönetim Platformu',
          accentColor: '#00f0ff',
          logoText: 'SDM',
          welcomeMessage: 'Yönetici tam yetkili kurumsal çalışma alanı.',
          enabledModules: ['dental_emr', 'clinic_billing', 'vet_triage', 'stock_upload', 'travel_rag'],
          updatedAt: '2026-01-01T00:00:00.000Z'
        },
        passwordHash: hashPassword('sudem2026'),
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    orders: [],
    paymentSettings: defaultPaymentSettings()
  };
}

class PersistentDatabase {
  private dbFilePath: string;
  private state: PersistedDatabase;

  constructor() {
    this.dbFilePath = this.resolveWritablePath();
    this.state = this.loadFromDisk();
  }

  private resolveWritablePath(): string {
    const primaryDir = path.join(process.cwd(), 'data');
    try {
      fs.mkdirSync(primaryDir, { recursive: true });
      const testPath = path.join(primaryDir, '.write-check');
      fs.writeFileSync(testPath, 'ok', 'utf8');
      fs.unlinkSync(testPath);
      return path.join(primaryDir, 'sdm-database.json');
    } catch {
      const tmpDir = path.join(os.tmpdir(), 'sdm-platform-data');
      fs.mkdirSync(tmpDir, { recursive: true });
      return path.join(tmpDir, 'sdm-database.json');
    }
  }

  private loadFromDisk(): PersistedDatabase {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf8');
        const parsed = JSON.parse(raw) as PersistedDatabase;
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.orders)) {
          return {
            ...parsed,
            paymentSettings: parsed.paymentSettings ?? defaultPaymentSettings()
          };
        }
      }
    } catch {
      // Corrupt or missing DB re-initializes cleanly
    }
    const seed = createInitialSeed();
    this.saveToDisk(seed);
    return seed;
  }

  private saveToDisk(data: PersistedDatabase = this.state): void {
    try {
      const tmpFile = `${this.dbFilePath}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpFile, this.dbFilePath);
    } catch {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }

  // Reload latest file state when running across Next.js route workers
  private syncRead(): void {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf8');
        const parsed = JSON.parse(raw) as PersistedDatabase;
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.orders)) {
          this.state = {
            ...parsed,
            paymentSettings: parsed.paymentSettings ?? defaultPaymentSettings()
          };
        }
      }
    } catch {
      // Keep in-memory state
    }
  }

  signSessionToken(userId: string): string {
    const payload = Buffer.from(
      JSON.stringify({ uid: userId, iat: Date.now() }),
      'utf8'
    ).toString('base64url');
    const sig = crypto
      .createHmac('sha256', this.state.sessionSecret)
      .update(payload)
      .digest('base64url');
    return `${payload}.${sig}`;
  }

  verifySessionToken(token: string | undefined): string | null {
    if (!token) return null;
    this.syncRead();
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, sigB64] = parts;
    if (!payloadB64 || !sigB64) return null;
    try {
      const expected = crypto
        .createHmac('sha256', this.state.sessionSecret)
        .update(payloadB64)
        .digest('base64url');
      const a = Buffer.from(sigB64, 'utf8');
      const b = Buffer.from(expected, 'utf8');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
      const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as { uid?: string };
      return decoded.uid ?? null;
    } catch {
      return null;
    }
  }

  registerUser(input: {
    name: string;
    email: string;
    password: string;
    company?: string;
    phone?: string;
  }): { user?: User; error?: string; status?: number } {
    this.syncRead();
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    if (!name || name.length < 2) {
      return { error: 'Ad soyad en az 2 karakter olmalıdır.', status: 400 };
    }
    if (!email || !email.includes('@')) {
      return { error: 'Geçerli bir e-posta adresi giriniz.', status: 400 };
    }
    if (!input.password || input.password.length < 6) {
      return { error: 'Şifreniz en az 6 karakter olmalıdır.', status: 400 };
    }

    if (this.state.users.some((u) => u.email.toLowerCase() === email)) {
      return {
        error: 'Bu e-posta adresiyle kayıtlı bir hesap zaten mevcut. Giriş yapmayı deneyin.',
        status: 409
      };
    }

    const newRecord: StoredUserRecord = {
      id: `usr-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      name,
      email,
      phone: input.phone?.trim() || undefined,
      role: 'customer',
      company: input.company?.trim() || undefined,
      membershipTier: 'free',
      demoActionsUsed: 0,
      demoTrialLimit: 5,
      licenses: [],
      branding: buildDefaultBranding(name, input.company),
      passwordHash: hashPassword(input.password),
      createdAt: new Date().toISOString()
    };

    this.state.users.unshift(newRecord);
    this.saveToDisk();
    return { user: sanitizeUser(newRecord) };
  }

  authenticateUser(email: string, password: string): User | null {
    this.syncRead();
    const normalized = email.trim().toLowerCase();
    const found = this.state.users.find((u) => u.email.toLowerCase() === normalized);
    if (!found) return null;
    if (!verifyPassword(password, found.passwordHash)) return null;
    return sanitizeUser(found);
  }

  getUserById(userId: string): User | null {
    this.syncRead();
    const found = this.state.users.find((u) => u.id === userId);
    return found ? sanitizeUser(found) : null;
  }

  listUsers(): User[] {
    this.syncRead();
    return this.state.users.map(sanitizeUser);
  }

  updateUserTierByAdmin(userId: string, tier: MembershipTier): User | null {
    this.syncRead();
    const idx = this.state.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    this.state.users[idx].membershipTier = tier;
    this.state.users[idx].demoTrialLimit = tier === 'free' ? 5 : 9999;
    this.saveToDisk();
    return sanitizeUser(this.state.users[idx]);
  }

  incrementDemoUsage(userId: string): {
    allowed: boolean;
    demoActionsUsed: number;
    demoTrialLimit: number;
    membershipTier: MembershipTier;
  } | null {
    this.syncRead();
    const idx = this.state.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    const u = this.state.users[idx];
    const hasUnlimited = u.role === 'admin' || u.membershipTier !== 'free' || u.licenses.some((l) => l.status === 'active');

    u.demoActionsUsed += 1;
    this.saveToDisk();

    return {
      allowed: hasUnlimited || u.demoActionsUsed <= u.demoTrialLimit,
      demoActionsUsed: u.demoActionsUsed,
      demoTrialLimit: u.demoTrialLimit,
      membershipTier: u.membershipTier
    };
  }

  upgradeUserMembership(
    userId: string,
    tier: Exclude<MembershipTier, 'free'>,
    paymentMethod: Order['paymentMethod'] = 'credit_card',
    targetSlug: string = 'all'
  ): { user: User; order: Order } | null {
    this.syncRead();
    const idx = this.state.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const u = this.state.users[idx];
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === tier);
    const price = plan?.price ?? 790;
    const now = new Date();
    const expires = new Date(now);
    if (tier === 'pro_monthly') expires.setMonth(expires.getMonth() + 1);
    if (tier === 'pro_yearly') expires.setFullYear(expires.getFullYear() + 1);

    const licenseCode = `SDM-${tier === 'enterprise_license' ? 'ENT' : 'PRO'}-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const productTitle = plan?.name ?? 'Premium Üyelik Paketi';

    const syntheticOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SDM-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: u.name,
      customerEmail: u.email,
      customerPhone: u.phone || '+90 500 000 00 00',
      companyName: u.company,
      items: [
        {
          product: {
            id: `plan-${tier}`,
            title: productTitle,
            slug: tier,
            shortDescription: plan?.tagline || '',
            description: plan?.tagline || '',
            category: 'saas',
            price,
            rating: 5,
            reviewsCount: 1,
            features: plan?.features || [],
            techStack: ['SDM Cloud', 'White-Label Engine'],
            demoSlug: targetSlug === 'all' ? 'sdm-clinic-system-demo' : targetSlug,
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            inStock: true,
            version: 'v4.0'
          },
          licenseTier: tier === 'enterprise_license' ? 'extended' : 'commercial',
          unitPrice: price,
          quantity: 1
        }
      ],
      subtotal: price,
      discount: 0,
      total: price,
      paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'completed',
      licenseKeys: { [`plan-${tier}`]: licenseCode },
      createdAt: now.toISOString()
    };

    const grant: UserLicenseGrant = {
      id: `lic-${Date.now()}`,
      licenseKey: licenseCode,
      targetSlug,
      productTitle,
      tier: 'premium',
      status: 'active',
      grantedAt: now.toISOString(),
      expiresAt: tier === 'enterprise_license' ? undefined : expires.toISOString()
    };

    u.membershipTier = tier;
    u.membershipExpiresAt = tier === 'enterprise_license' ? undefined : expires.toISOString();
    u.demoTrialLimit = 9999;
    u.licenses.unshift(grant);

    this.state.orders.unshift(syntheticOrder);
    this.saveToDisk();

    return { user: sanitizeUser(u), order: syntheticOrder };
  }

  activateLicenseForUser(
    userId: string,
    rawKey: string,
    targetSlug: string = 'all'
  ): { user?: User; error?: string } {
    this.syncRead();
    const idx = this.state.users.findIndex((u) => u.id === userId);
    if (idx === -1) return { error: 'Kullanıcı oturumu bulunamadı.' };

    const key = rawKey.trim().toUpperCase();
    if (!key.startsWith('SDM-') || key.length < 10) {
      return { error: 'Geçersiz lisans formatı. Örnek format: SDM-CLN-XXXX-XXXX' };
    }

    const u = this.state.users[idx];
    if (u.licenses.some((l) => l.licenseKey.toUpperCase() === key)) {
      return { error: 'Bu lisans anahtarı hesabınızda zaten tanımlı.' };
    }

    // Verify license key against persisted orders in database
    let matchedOrder: Order | null = null;
    let matchedTitle = '';
    let matchedSlug = targetSlug;
    for (const ord of this.state.orders) {
      for (const item of ord.items) {
        if (ord.licenseKeys[item.product.id]?.toUpperCase() === key) {
          matchedOrder = ord;
          matchedTitle = item.product.title;
          matchedSlug = item.product.demoSlug || item.product.slug;
          break;
        }
      }
      if (matchedOrder) break;
    }

    if (!matchedOrder) {
      return { error: 'Bu lisans anahtarı sipariş veritabanında bulunamadı.' };
    }
    if (matchedOrder.paymentStatus !== 'paid' || matchedOrder.orderStatus !== 'completed') {
      return {
        error:
          'Bu teklif/sipariş talebi yönetici tarafından henüz onaylanmamıştır. Onaylandığında lisansınız aktif edilecektir (Müşteri Hizmetleri: 0546 401 14 51).'
      };
    }

    const grant: UserLicenseGrant = {
      id: `lic-${Date.now()}`,
      licenseKey: key,
      targetSlug: matchedSlug,
      productTitle: matchedTitle,
      tier: key.includes('ENT') ? 'extended' : 'commercial',
      status: 'active',
      grantedAt: new Date().toISOString()
    };

    u.licenses.unshift(grant);
    if (u.membershipTier === 'free') {
      u.membershipTier = 'enterprise_license';
      u.demoTrialLimit = 9999;
    }

    this.saveToDisk();
    return { user: sanitizeUser(u) };
  }

  updateUserBranding(
    userId: string,
    updates: Partial<UserBrandingConfig>
  ): { user?: User; error?: string; status?: number } {
    this.syncRead();
    const idx = this.state.users.findIndex((u) => u.id === userId);
    if (idx === -1) return { error: 'Kullanıcı bulunamadı.', status: 404 };

    const userRecord = this.state.users[idx];
    if (!canCustomizeBranding(sanitizeUser(userRecord))) {
      return {
        error: 'Kendi firma/klinik adınıza göre kişiselleştirme için Premium üyelik veya ürün lisansı gereklidir.',
        status: 403
      };
    }

    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    const cleanAccent =
      updates.accentColor && hexRegex.test(updates.accentColor.trim())
        ? updates.accentColor.trim()
        : userRecord.branding.accentColor;

    userRecord.branding = {
      ...userRecord.branding,
      brandName: updates.brandName?.trim().slice(0, 60) || userRecord.branding.brandName,
      tagline: updates.tagline?.trim().slice(0, 90) || userRecord.branding.tagline,
      logoText: (updates.logoText?.trim().slice(0, 5) || userRecord.branding.logoText).toUpperCase(),
      accentColor: cleanAccent,
      welcomeMessage: updates.welcomeMessage?.trim().slice(0, 140) ?? userRecord.branding.welcomeMessage,
      customDomain: updates.customDomain?.trim().slice(0, 80) || undefined,
      enabledModules: Array.isArray(updates.enabledModules)
        ? updates.enabledModules.slice(0, 10)
        : userRecord.branding.enabledModules,
      updatedAt: new Date().toISOString()
    };

    this.saveToDisk();
    return { user: sanitizeUser(userRecord) };
  }

  createOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'licenseKeys'>,
    activeUserId?: string | null
  ): Order {
    this.syncRead();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SDM-${new Date().getFullYear()}-${randomSuffix}`;
    const licenseKeys: { [productId: string]: string } = {};

    orderData.items.forEach((item) => {
      const seg1 = item.product.slug.substring(0, 4).toUpperCase();
      const seg2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase();
      licenseKeys[item.product.id] = `SDM-${seg1}-${seg2}-${seg3}`;
    });

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      licenseKeys,
      createdAt: new Date().toISOString()
    };

    this.state.orders.unshift(newOrder);
    this.syncOrderGrantsToUser(newOrder, activeUserId);
    this.saveToDisk();
    return newOrder;
  }

  private syncOrderGrantsToUser(order: Order, activeUserId?: string | null): void {
    const emailLower = order.customerEmail?.trim().toLowerCase();
    const userIdx = this.state.users.findIndex(
      (u) => (activeUserId && u.id === activeUserId) || (emailLower && u.email.toLowerCase() === emailLower)
    );
    if (userIdx === -1) return;

    const targetUser = this.state.users[userIdx];
    const grantStatus: UserLicenseGrant['status'] =
      order.paymentStatus === 'paid' && order.orderStatus === 'completed'
        ? 'active'
        : order.orderStatus === 'refunded' || order.paymentStatus === 'failed'
        ? 'revoked'
        : 'pending';

    for (const item of order.items) {
      const key = order.licenseKeys[item.product.id];
      const existingGrant = targetUser.licenses.find((l) => l.licenseKey === key);
      if (existingGrant) {
        existingGrant.status = grantStatus;
      } else {
        const productMeta = memoryCatalogDb.getProductBySlug(item.product.slug);
        const expiresAt =
          item.product.slug === 'pro_monthly'
            ? new Date(Date.now() + 30 * 86400 * 1000).toISOString()
            : item.product.slug === 'pro_yearly'
            ? new Date(Date.now() + 365 * 86400 * 1000).toISOString()
            : undefined;
        targetUser.licenses.unshift({
          id: `lic-${Date.now()}-${item.product.id}`,
          licenseKey: key,
          targetSlug: productMeta?.demoSlug || item.product.demoSlug || item.product.slug,
          productTitle: item.product.title,
          tier: item.licenseTier,
          status: grantStatus,
          grantedAt: order.createdAt,
          expiresAt
        });
      }

      if (grantStatus === 'active') {
        const slug = item.product.slug;
        if (slug === 'pro_monthly' || slug === 'pro_yearly' || slug === 'enterprise_license') {
          targetUser.membershipTier = slug;
          targetUser.demoTrialLimit = 9999;
        } else if (targetUser.membershipTier === 'free') {
          targetUser.membershipTier = 'enterprise_license';
          targetUser.demoTrialLimit = 9999;
        }
      }
    }
  }

  updateOrderStatus(
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ): Order | null {
    this.syncRead();
    const idx = this.state.orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) return null;

    const target = this.state.orders[idx];
    target.orderStatus = orderStatus;
    if (paymentStatus) {
      target.paymentStatus = paymentStatus;
    } else if (orderStatus === 'completed' && target.paymentStatus === 'pending') {
      target.paymentStatus = 'paid';
    } else if (orderStatus === 'refunded') {
      target.paymentStatus = 'failed';
    }

    this.syncOrderGrantsToUser(target);
    this.saveToDisk();
    return target;
  }

  getPaymentSettings(): PaymentSettings {
    this.syncRead();
    return this.state.paymentSettings ?? defaultPaymentSettings();
  }

  updatePaymentSettings(updates: Partial<PaymentSettings>): { settings?: PaymentSettings; error?: string } {
    this.syncRead();
    const current = this.state.paymentSettings ?? defaultPaymentSettings();
    const cleanedIban =
      typeof updates.iban === 'string'
        ? updates.iban.replace(/\s+/g, '').toUpperCase()
        : current.iban.replace(/\s+/g, '').toUpperCase();

    if (cleanedIban && (!cleanedIban.startsWith('TR') || cleanedIban.length !== 26 || !/^TR\d{24}$/.test(cleanedIban))) {
      return {
        error: 'Geçerli bir Türkiye IBAN numarası giriniz (TR ile başlamalı ve toplam 26 karakter olmalıdır).'
      };
    }

    const taxRate =
      typeof updates.taxRatePct === 'number' && Number.isFinite(updates.taxRatePct)
        ? Math.min(40, Math.max(0, Math.round(updates.taxRatePct)))
        : current.taxRatePct;

    this.state.paymentSettings = {
      wireTransferEnabled: updates.wireTransferEnabled ?? current.wireTransferEnabled,
      bankName: updates.bankName !== undefined ? updates.bankName.trim().slice(0, 80) : current.bankName,
      accountHolder: updates.accountHolder !== undefined ? updates.accountHolder.trim().slice(0, 80) : current.accountHolder,
      iban: cleanedIban ? formatIban(cleanedIban) : '',
      branchOrSwift: updates.branchOrSwift !== undefined ? updates.branchOrSwift.trim().slice(0, 40) : current.branchOrSwift,
      transferNote: updates.transferNote !== undefined ? updates.transferNote.trim().slice(0, 240) : current.transferNote,
      virtualPosEnabled: updates.virtualPosEnabled ?? current.virtualPosEnabled,
      virtualPosProvider: updates.virtualPosProvider ?? current.virtualPosProvider,
      taxRatePct: taxRate,
      pricesIncludeTax: updates.pricesIncludeTax ?? current.pricesIncludeTax,
      updatedAt: new Date().toISOString()
    };

    this.saveToDisk();
    return { settings: this.state.paymentSettings };
  }

  getOrders(): Order[] {
    this.syncRead();
    return this.state.orders;
  }

  getOrdersForUser(user: User): Order[] {
    this.syncRead();
    const emailLower = user.email.toLowerCase();
    return this.state.orders.filter(
      (o) => o.customerEmail.toLowerCase() === emailLower || o.items.some((i) => user.licenses.some((l) => l.licenseKey === o.licenseKeys[i.product.id]))
    );
  }
}

const globalForServerDb = globalThis as unknown as { persistentServerDb: PersistentDatabase | undefined };
export const serverDb = globalForServerDb.persistentServerDb ?? new PersistentDatabase();
globalForServerDb.persistentServerDb = serverDb;
