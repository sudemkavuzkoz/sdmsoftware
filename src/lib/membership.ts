import { MembershipTier, User } from './types';

export interface MembershipPlanMeta {
  id: MembershipTier;
  name: string;
  price: number;
  periodLabel: string;
  badge: string;
  color: string;
  tagline: string;
  features: string[];
  allowCustomization: boolean;
  unlimitedDemos: boolean;
}

export const MEMBERSHIP_PLANS: MembershipPlanMeta[] = [
  {
    id: 'free',
    name: 'Ücretsiz Deneme Üyeliği',
    price: 0,
    periodLabel: 'Başlangıç',
    badge: 'Ücretsiz',
    color: '#94a3b8',
    tagline: 'Demoları keşfetmek için her hesapta 5 ücretsiz etkileşim hakkı',
    features: [
      'Tüm canlı demolarda 5 adımlık ücretsiz deneme hakkı',
      'Klinik, StockPred AI ve AI Travel özelliklerini test etme',
      'Kayıt olduğunuzda veritabanına kalıcı profil kaydı'
    ],
    allowCustomization: false,
    unlimitedDemos: false
  },
  {
    id: 'pro_monthly',
    name: 'Premium Pro Üyelik (Aylık)',
    price: 790,
    periodLabel: '₺790 / ay',
    badge: 'Popüler',
    color: '#00f0ff',
    tagline: 'Tüm canlı sistemlere sınırsız erişim + firma/klinik adıyla kişiselleştirme',
    features: [
      '6 canlı sistemin tamamında sınırsız kullanım (kotadan muaf)',
      'Klinik/Şirket adı, logo monogramı ve kurumsal renk teması özelleştirme',
      'StockPred AI sınırsız şirket CSV analizi & projeksiyon',
      'Dijital e-Fatura / Üyelik anahtarı'
    ],
    allowCustomization: true,
    unlimitedDemos: true
  },
  {
    id: 'pro_yearly',
    name: 'Premium Pro Üyelik (Yıllık)',
    price: 6900,
    periodLabel: '₺6.900 / yıl',
    badge: '%27 Avantaj',
    color: '#a855f7',
    tagline: 'Yıllık kesintisiz kurumsal erişim, özel alan adı markalama ve modül kontrolü',
    features: [
      'Aylık plandaki tüm özellikler + %27 yıllık indirim',
      'Özel alt alan adı (örn: klinik.firmaniz.com.tr) white-label rozeti',
      'Modül açma/kapatma ve karşılama bannerı kişiselleştirme',
      'Öncelikli teknik destek ve güncelleme erişimi'
    ],
    allowCustomization: true,
    unlimitedDemos: true
  },
  {
    id: 'enterprise_license',
    name: 'Kurumsal White-Label Tam Lisans',
    price: 14900,
    periodLabel: '₺14.900 Tek Sefer',
    badge: 'Süresiz Lisans',
    color: '#10b981',
    tagline: 'Tüm platformlarda süresiz ticari lisans + tam marka sahipliği',
    features: [
      'Süresiz tüm modüllere kurumsal lisans anahtarı (SDM-ENT-...)',
      'Tam white-label özelleştirme & müşteri sunum modu',
      'Kaynak kod & kurulum paketi indirme hakkı',
      'Çoklu klinik/şube uyarlama desteği'
    ],
    allowCustomization: true,
    unlimitedDemos: true
  }
];

export const BRAND_COLOR_PRESETS = [
  { name: 'Siber Cyan', hex: '#00f0ff' },
  { name: 'Medikal Zümrüt', hex: '#10b981' },
  { name: 'Kraliyet Moru', hex: '#a855f7' },
  { name: 'Altın Amber', hex: '#f59e0b' },
  { name: 'Safir Mavi', hex: '#3b82f6' },
  { name: 'Mercan Gül', hex: '#f43f5e' }
] as const;

export const CUSTOM_MODULE_OPTIONS = [
  { id: 'dental_emr', label: '32 Diş FDI Odontogram & e-Reçete' },
  { id: 'clinic_billing', label: 'GİB e-SMM & Kasa Otomasyonu' },
  { id: 'vet_triage', label: 'Veteriner Aşı Karnesi & Müşahede' },
  { id: 'stock_upload', label: 'StockPred Şirket CSV Yükleme Motoru' },
  { id: 'travel_rag', label: '200 Ülke RAG Seyahat Asistanı' }
] as const;

export function getTierLabel(tier: MembershipTier): string {
  switch (tier) {
    case 'pro_monthly':
      return 'Premium Pro (Aylık)';
    case 'pro_yearly':
      return 'Premium Pro (Yıllık)';
    case 'enterprise_license':
      return 'Kurumsal Tam Lisans';
    default:
      return 'Ücretsiz Deneme';
  }
}

export function canCustomizeBranding(user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.membershipTier !== 'free') return true;
  return user.licenses.some((l) => l.status === 'active');
}

export function hasDemoUnlock(user: User | null, demoSlug: string, productSlug?: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.membershipTier !== 'free') return true;
  return user.licenses.some(
    (l) =>
      l.status === 'active' &&
      (l.targetSlug === 'all' || l.targetSlug === demoSlug || (productSlug && l.targetSlug === productSlug))
  );
}
