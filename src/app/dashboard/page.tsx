'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  Key,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  Package,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { buildMailtoQuoteUrl, buildWhatsAppQuoteUrl, CUSTOMER_SUPPORT } from '@/lib/contact';
import {
  downloadInvoiceDocument,
  downloadLicensePackage,
  useOrders
} from '@/lib/orderStorage';
import {
  BRAND_COLOR_PRESETS,
  canCustomizeBranding,
  CUSTOM_MODULE_OPTIONS,
  getTierLabel,
  MEMBERSHIP_PLANS,
  planToCartProduct
} from '@/lib/membership';
import { MembershipTier, User, UserBrandingConfig } from '@/lib/types';

function BrandingStudioForm({
  user,
  canCustomize,
  onSave,
  onGoToPlans
}: {
  user: User;
  canCustomize: boolean;
  onSave: (updates: Partial<UserBrandingConfig>) => Promise<{ success: boolean; error?: string }>;
  onGoToPlans: () => void;
}) {
  const [brandName, setBrandName] = useState(user.branding.brandName);
  const [logoText, setLogoText] = useState(user.branding.logoText);
  const [tagline, setTagline] = useState(user.branding.tagline);
  const [accentColor, setAccentColor] = useState(user.branding.accentColor);
  const [welcomeMessage, setWelcomeMessage] = useState(user.branding.welcomeMessage);
  const [customDomain, setCustomDomain] = useState(user.branding.customDomain ?? '');
  const [enabledModules, setEnabledModules] = useState<string[]>(user.branding.enabledModules ?? []);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const toggleModule = (modId: string) => {
    setEnabledModules((prev) => (prev.includes(modId) ? prev.filter((x) => x !== modId) : [...prev, modId]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const res = await onSave({
      brandName,
      logoText,
      tagline,
      accentColor,
      welcomeMessage,
      customDomain,
      enabledModules
    });
    setSaving(false);
    setFeedback(
      res.success
        ? { ok: true, msg: 'Özel marka & modül ayarlarınız veritabanına kaydedildi! Tüm demolarda aktif.' }
        : { ok: false, msg: res.error || 'Ayarlar kaydedilemedi.' }
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem' }}>
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Palette size={18} color={accentColor} /> Sistem White-Label Kişiselleştirme
          </h2>
          {!canCustomize && (
            <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
              <Lock size={11} /> Premium / Lisans Gerekli
            </span>
          )}
        </div>

        {!canCustomize && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '10px', padding: '0.8rem', fontSize: '0.78rem', color: '#fde68a' }}>
            Şu anda <strong>Ücretsiz Deneme</strong> paketindesiniz. Demoları firmanıza özel logo, renk ve modüllerle kaydetmek için Premium üyelik veya ürün lisansı alın.{' '}
            <button type="button" onClick={onGoToPlans} style={{ color: '#00f0ff', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>
              Paketlere Git →
            </button>
          </div>
        )}

        {feedback && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              background: feedback.ok ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)',
              border: `1px solid ${feedback.ok ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
              color: feedback.ok ? '#6ee7b7' : '#fda4af'
            }}
          >
            {feedback.msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.8fr', gap: '0.65rem' }}>
          <div>
            <label className="form-label">Klinik / Firma Başlığı</label>
            <input type="text" required disabled={!canCustomize} value={brandName} onChange={(e) => setBrandName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Logo Kısaltma</label>
            <input type="text" required maxLength={5} disabled={!canCustomize} value={logoText} onChange={(e) => setLogoText(e.target.value.toUpperCase())} className="form-input" style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }} />
          </div>
        </div>

        <div>
          <label className="form-label">Alt Başlık / Branş</label>
          <input type="text" disabled={!canCustomize} value={tagline} onChange={(e) => setTagline(e.target.value)} className="form-input" />
        </div>

        <div>
          <label className="form-label">Karşılama Mesajı</label>
          <input type="text" disabled={!canCustomize} value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} className="form-input" />
        </div>

        <div>
          <label className="form-label">Özel Alt Alan Adı</label>
          <input type="text" disabled={!canCustomize} placeholder="örn: klinik.marmaradis.com.tr" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} className="form-input" />
        </div>

        <div>
          <label className="form-label">Kurumsal Tema Rengi</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
            {BRAND_COLOR_PRESETS.map((c) => (
              <button
                key={c.hex}
                type="button"
                disabled={!canCustomize}
                onClick={() => setAccentColor(c.hex)}
                title={c.name}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: c.hex,
                  border: accentColor === c.hex ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                  cursor: canCustomize ? 'pointer' : 'not-allowed'
                }}
              />
            ))}
            <input type="color" disabled={!canCustomize} value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: '36px', height: '30px', background: 'none', border: 'none', cursor: 'pointer' }} />
          </div>
        </div>

        <div>
          <label className="form-label">Aktif Sistem Modülleri</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.4rem' }}>
            {CUSTOM_MODULE_OPTIONS.map((mod) => (
              <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#cbd5e1', background: '#111a2e', padding: '0.45rem 0.65rem', borderRadius: '8px', cursor: canCustomize ? 'pointer' : 'not-allowed' }}>
                <input type="checkbox" disabled={!canCustomize} checked={enabledModules.includes(mod.id)} onChange={() => toggleModule(mod.id)} />
                <span>{mod.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={!canCustomize || saving} className="btn btn-primary" style={{ marginTop: '0.4rem' }}>
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Veritabanına Kaydet'}
        </button>
      </form>

      {/* Live Preview Card */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignSelf: 'start' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>CANLI SİSTEM ÖNİZLEMESİ</div>
        <div
          style={{
            background: `linear-gradient(135deg, ${accentColor}22 0%, #090e1a 100%)`,
            border: `1.5px solid ${accentColor}`,
            borderRadius: '14px',
            padding: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: accentColor,
                color: '#041019',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {logoText || 'SDM'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>{brandName || 'Firma Adı'}</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{tagline}</div>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.75rem', borderRadius: '8px', borderLeft: `3px solid ${accentColor}` }}>
            {welcomeMessage}
          </p>

          {customDomain && (
            <div style={{ marginTop: '0.65rem', fontSize: '0.72rem', color: accentColor, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe size={12} /> https://{customDomain}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Özel Markanızı Canlı Sistemlerde Test Edin:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            <Link href="/live/sdm-clinic-system-demo" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem' }}>
              SDM Klinik OS →
            </Link>
            <Link href="/live/veteriner-klinik-demo" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem' }}>
              Veteriner Klinik OS →
            </Link>
            <Link href="/live/stock-price-prediction-demo" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem' }}>
              StockPred AI →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { addToCart, closeCart } = useCart();
  const {
    user,
    dbOrders,
    authLoading,
    isAuthenticated,
    isAdmin,
    activateLicenseKey,
    saveBrandingConfig,
    logout
  } = useAuth();
  const clientOrders = useOrders();

  const orders = useMemo(() => {
    const seen = new Set<string>();
    return [...dbOrders, ...clientOrders].filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [dbOrders, clientOrders]);

  const [activeTab, setActiveTab] = useState<'overview' | 'customize' | 'licenses' | 'orders'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const [licenseInput, setLicenseInput] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCopy = (keyText: string) => {
    navigator.clipboard?.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpgradePlan = (tier: Exclude<MembershipTier, 'free'>) => {
    addToCart(planToCartProduct(tier, 'all'), 'standard');
    closeCart();
    router.push('/checkout');
  };

  const handleActivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseInput.trim()) return;
    setBusy(true);
    setStatusBanner(null);
    const res = await activateLicenseKey(licenseInput.trim(), 'all');
    setBusy(false);
    if (!res.success) {
      setStatusBanner({ ok: false, msg: res.error || 'Lisans doğrulanamadı.' });
      return;
    }
    setLicenseInput('');
    setStatusBanner({ ok: true, msg: 'Lisans anahtarınız hesabınıza bağlandı ve kişiselleştirme kilidi açıldı.' });
  };

  if (authLoading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Üyelik veritabanı oturumu yükleniyor...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
          <div className="glow-accent" />
          <Sparkles size={38} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            Üye Paneli, Premium &amp; Kişiselleştirme Merkezi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Kayıt olarak tüm demoları test edin; ardından <strong>Premium Üyelik</strong> veya <strong>Kişiselleştirilebilir Lisans</strong> alarak
            klinik, laboratuvar ve AI sistemlerini kendi firmanızın adı ve renkleriyle kullanın.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center' }}>
            <Link href="/auth/register" className="btn btn-primary">
              <UserPlus size={16} /> Ücretsiz Kaydol
            </Link>
            <Link href="/auth/login" className="btn btn-secondary">
              <LogIn size={16} /> Giriş Yap
            </Link>
            <Link href="/demos" className="btn btn-secondary">
              Canlı Demoları Dene
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.1rem' }}>
          {MEMBERSHIP_PLANS.map((plan) => (
            <div key={plan.id} className="glass-card" style={{ padding: '1.35rem', borderColor: `${plan.color}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: plan.color }}>{plan.badge}</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{plan.periodLabel}</strong>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>{plan.name}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{plan.tagline}</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.74rem', color: '#cbd5e1' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
                    <Check size={12} color={plan.color} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const customizable = canCustomizeBranding(user);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Member Header Card */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
        <div className="glow-accent" />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: user.branding.accentColor || '#00f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#07090e',
                fontSize: '1.15rem'
              }}
            >
              {user.branding.logoText}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.name}</h1>
                <span className={`badge ${user.membershipTier === 'free' ? 'badge-cyan' : 'badge-emerald'}`}>
                  {getTierLabel(user.membershipTier)}
                </span>
                {user.membershipTier === 'free' && (
                  <span className="badge badge-amber">
                    Deneme: {user.demoActionsUsed} / {user.demoTrialLimit} kullanıldı
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.2rem' }}>
                {user.company || user.branding.brandName} • {user.email} • Aktif Lisans: {user.licenses.length}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {isAdmin && (
              <Link href="/admin" className="btn btn-purple btn-sm">
                Yönetici Paneline Geç →
              </Link>
            )}
            <Link href="/demos" className="btn btn-secondary btn-sm">
              Canlı Demolar
            </Link>
            <button type="button" onClick={() => void logout()} className="btn btn-secondary btn-sm">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {statusBanner && (
        <div
          className="glass-card"
          style={{
            padding: '0.85rem 1.15rem',
            marginBottom: '1.25rem',
            borderColor: statusBanner.ok ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)',
            color: statusBanner.ok ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            fontSize: '0.84rem',
            fontWeight: 600
          }}
        >
          {statusBanner.msg}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
        <button type="button" onClick={() => setActiveTab('overview')} className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}>
          <Crown size={14} /> Üyelik &amp; Premium Paketler
        </button>
        <button type="button" onClick={() => setActiveTab('customize')} className={`btn btn-sm ${activeTab === 'customize' ? 'btn-primary' : 'btn-secondary'}`}>
          <Palette size={14} /> Marka &amp; Sistem Kişiselleştirme
        </button>
        <button type="button" onClick={() => setActiveTab('licenses')} className={`btn btn-sm ${activeTab === 'licenses' ? 'btn-primary' : 'btn-secondary'}`}>
          <Key size={14} /> Lisans Anahtarları ({user.licenses.length})
        </button>
        <button type="button" onClick={() => setActiveTab('orders')} className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}>
          <Package size={14} /> Siparişler &amp; Faturalar ({orders.length})
        </button>
      </div>

      {/* TAB 1: MEMBERSHIP & UPGRADE */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.15rem' }}>
          {MEMBERSHIP_PLANS.map((plan) => {
            const isCurrent = user.membershipTier === plan.id;
            return (
              <div
                key={plan.id}
                className="glass-card"
                style={{
                  padding: '1.4rem',
                  borderColor: isCurrent ? plan.color : `${plan.color}33`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: plan.color, background: `${plan.color}18`, padding: '0.18rem 0.55rem', borderRadius: '999px' }}>
                      {isCurrent ? 'Mevcut Planınız' : plan.badge}
                    </span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{plan.periodLabel}</strong>
                  </div>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.35rem' }}>{plan.name}</h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{plan.tagline}</p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
                        <Check size={13} color={plan.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.id === 'free' ? (
                  <Link href="/demos" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    Demoları İncele
                  </Link>
                ) : isCurrent ? (
                  <button type="button" onClick={() => setActiveTab('customize')} className="btn btn-secondary btn-sm" style={{ width: '100%', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.4)' }}>
                    <ShieldCheck size={14} /> Aktif — Sistemi Özelleştir →
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleUpgradePlan(plan.id as Exclude<MembershipTier, 'free'>)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Teklif İste &amp; Talep Oluştur →
                  </button>
                )}
              </div>
            );
          })}
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '1.15rem 1.35rem', borderColor: 'rgba(16, 185, 129, 0.35)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              <Headphones size={18} color="#34d399" />
              <span>
                Web sitesinden ödeme yapılmaz. Doğrudan <strong style={{ color: 'var(--text-main)' }}>{CUSTOMER_SUPPORT.phoneDisplay}</strong> (WhatsApp) veya <strong style={{ color: 'var(--text-main)' }}>{CUSTOMER_SUPPORT.email}</strong> ile teklif verebilirsiniz.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a href={buildWhatsAppQuoteUrl({ subject: 'Üyelik & Lisans Teklifi', customerName: user.name, customerEmail: user.email })} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: '#10b981', color: '#03150e', fontWeight: 800 }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href={buildMailtoQuoteUrl({ subject: 'Üyelik & Lisans Teklifi', customerName: user.name, customerEmail: user.email })} className="btn btn-secondary btn-sm">
                <Mail size={14} /> Mail Gönder
              </a>
              <a href={CUSTOMER_SUPPORT.telHref} className="btn btn-secondary btn-sm">
                <Phone size={14} /> Ara
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMIZATION STUDIO */}
      {activeTab === 'customize' && (
        <BrandingStudioForm
          key={user.branding.updatedAt}
          user={user}
          canCustomize={customizable}
          onSave={saveBrandingConfig}
          onGoToPlans={() => setActiveTab('overview')}
        />
      )}

      {/* TAB 3: LICENSES & ACTIVATION */}
      {activeTab === 'licenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <form onSubmit={handleActivateKey} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: 700 }}>
              <KeyRound size={18} color="var(--primary)" /> Lisans Anahtarı Ekle / Aktifleştir
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px', maxWidth: '460px' }}>
              <input
                type="text"
                required
                placeholder="Örn: SDM-CLN-9A12-B4C1"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value)}
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
              />
              <button type="submit" disabled={busy} className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                Aktifleştir
              </button>
            </div>
          </form>

          {user.licenses.length === 0 ? (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Henüz aktif lisans anahtarınız bulunmuyor. Üyelik planı seçip teklif oluşturabilir veya <Link href="/products" style={{ color: 'var(--primary)' }}>yazılım ürünleri</Link> sayfasından teklif isteyebilirsiniz.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
              {user.licenses.map((lic) => {
                const isPending = lic.status === 'pending';
                const isRevoked = lic.status === 'revoked';
                return (
                  <div key={lic.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.94rem' }}>{lic.productTitle}</strong>
                      <span className={`badge ${isPending ? 'badge-amber' : isRevoked ? 'badge-purple' : 'badge-emerald'}`} style={{ fontSize: '0.66rem' }}>
                        {isPending ? 'Teklif Onayı Bekleniyor' : isRevoked ? 'İptal Edildi' : 'Aktif'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Tip: {lic.tier.toUpperCase()} • Tarih: {new Date(lic.grantedAt).toLocaleDateString('tr-TR')}
                    </div>
                    {isPending ? (
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.74rem', color: '#fde68a' }}>
                        Teklif talebiniz Müşteri Hizmetleri ({CUSTOMER_SUPPORT.phoneDisplay} / {CUSTOMER_SUPPORT.email}) onayı sonrasında aktif edilecektir.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '0.55rem 0.75rem', borderRadius: '8px' }}>
                          <code style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{lic.licenseKey}</code>
                          <button type="button" onClick={() => handleCopy(lic.licenseKey)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                            {copiedKey === lic.licenseKey ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <Link
                          href={lic.targetSlug === 'all' ? '/demos' : `/live/${lic.targetSlug}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.76rem' }}
                        >
                          <ExternalLink size={13} /> Özel Markalı Sistemi Aç
                        </Link>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORDERS & INVOICES */}
      {activeTab === 'orders' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Kayıtlı siparişiniz bulunmuyor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{ord.orderNumber}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(ord.createdAt).toLocaleString('tr-TR')} • {ord.items.map((i) => i.product.title).join(', ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', marginRight: '0.4rem' }}>{ord.total.toLocaleString('tr-TR')} ₺</strong>
                    <button
                      type="button"
                      onClick={() => {
                        downloadLicensePackage(ord);
                        setStatusBanner({ ok: true, msg: `${ord.orderNumber} lisans paketi indirildi.` });
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem' }}
                    >
                      <Download size={12} /> Lisans Paketi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadInvoiceDocument(ord);
                        setStatusBanner({ ok: true, msg: `${ord.orderNumber} fatura özeti indirildi.` });
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem' }}
                    >
                      <FileText size={12} /> e-Fatura
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
