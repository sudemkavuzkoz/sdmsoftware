'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Crown,
  ExternalLink,
  Globe,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X
} from 'lucide-react';
import { DemoProject, MembershipTier } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { buildMailtoQuoteUrl, buildWhatsAppQuoteUrl, CUSTOMER_SUPPORT } from '@/lib/contact';
import {
  BRAND_COLOR_PRESETS,
  canCustomizeBranding,
  CUSTOM_MODULE_OPTIONS,
  getTierLabel,
  hasDemoUnlock,
  MEMBERSHIP_PLANS,
  planToCartProduct
} from '@/lib/membership';
import AiTravelPlannerApp from './AiTravelPlannerApp';
import StockPredictionApp from './StockPredictionApp';
import ProtezTakipApp from './ProtezTakipApp';
import PatiBahcesiEmbed from './PatiBahcesiEmbed';
import { DentalClinicApp, VeterinerClinicApp } from './ClinicAndVetApps';

interface DemoRunnerProps {
  demo: DemoProject;
  fullHeight?: boolean;
}

export default function DemoRunner({ demo, fullHeight = false }: DemoRunnerProps) {
  const router = useRouter();
  const { addToCart, closeCart } = useCart();
  const {
    user,
    authLoading,
    isAuthenticated,
    registerAccount,
    loginAccount,
    activateLicenseKey,
    saveBrandingConfig,
    trackDemoAction
  } = useAuth();

  const isUnlocked = hasDemoUnlock(user, demo.slug, demo.productSlug);
  const canCustomize = canCustomizeBranding(user);

  // Guest / Free Trial Tracking
  const [guestActions, setGuestActions] = useState(0);
  const usedCount = user ? user.demoActionsUsed : guestActions;
  const trialLimit = user ? user.demoTrialLimit : 5;
  const isTrialExhausted = !isUnlocked && usedCount >= trialLimit;

  // Modals: Upgrade / License Paywall vs Quick Customizer
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCustomizeDrawer, setShowCustomizeDrawer] = useState(false);

  // Inline Quick Auth inside Upgrade Modal
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [qName, setQName] = useState('');
  const [qCompany, setQCompany] = useState('');
  const [qEmail, setQEmail] = useState('');
  const [qPass, setQPass] = useState('');

  // License Input & Status
  const [licenseInput, setLicenseInput] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Custom Branding Form Drafts (initialized lazily when opening customizer)
  const [draftBrandName, setDraftBrandName] = useState('');
  const [draftLogoText, setDraftLogoText] = useState('');
  const [draftTagline, setDraftTagline] = useState('');
  const [draftAccent, setDraftAccent] = useState('#00f0ff');
  const [draftWelcome, setDraftWelcome] = useState('');
  const [draftDomain, setDraftDomain] = useState('');
  const [draftModules, setDraftModules] = useState<string[]>([]);

  const openCustomizer = () => {
    if (!canCustomize) {
      setShowUpgradeModal(true);
      return;
    }
    if (user?.branding) {
      setDraftBrandName(user.branding.brandName);
      setDraftLogoText(user.branding.logoText);
      setDraftTagline(user.branding.tagline);
      setDraftAccent(user.branding.accentColor);
      setDraftWelcome(user.branding.welcomeMessage);
      setDraftDomain(user.branding.customDomain ?? '');
      setDraftModules(user.branding.enabledModules ?? []);
    }
    setModalFeedback(null);
    setShowCustomizeDrawer(true);
  };

  const handleContainerInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isUnlocked) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const clickedButton = target.closest('button');
    if (!clickedButton) return;

    if (isTrialExhausted) {
      e.preventDefault();
      e.stopPropagation();
      setShowUpgradeModal(true);
      return;
    }

    if (!user) {
      const next = guestActions + 1;
      setGuestActions(next);
      void trackDemoAction().then((res) => {
        if (!res.allowed) {
          setShowUpgradeModal(true);
        }
      });
    } else {
      void trackDemoAction().then((res) => {
        if (!res.allowed) {
          setShowUpgradeModal(true);
        }
      });
    }
  };

  const handleQuickAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBusy(true);
    setModalFeedback(null);
    const res =
      authMode === 'register'
        ? await registerAccount({ name: qName, email: qEmail, password: qPass, company: qCompany })
        : await loginAccount(qEmail, qPass);
    setActionBusy(false);

    if (!res.success) {
      setModalFeedback({ type: 'err', text: res.error || 'Oturum işlemi başarısız.' });
      return;
    }
    setModalFeedback({
      type: 'ok',
      text: `${res.user?.name} hesabınız veritabanına işlendi! Şimdi üyelik veya lisans seçerek tüm kısıtlamaları kaldırabilirsiniz.`
    });
  };

  const handleUpgradePlan = (tier: Exclude<MembershipTier, 'free'>) => {
    addToCart(planToCartProduct(tier, demo.slug), 'standard');
    closeCart();
    setShowUpgradeModal(false);
    router.push('/checkout');
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setModalFeedback({ type: 'err', text: 'Lisans anahtarını hesabınıza bağlamak için önce giriş yapın veya kaydolun.' });
      return;
    }
    setActionBusy(true);
    setModalFeedback(null);
    const res = await activateLicenseKey(licenseInput, demo.slug);
    setActionBusy(false);
    if (!res.success) {
      setModalFeedback({ type: 'err', text: res.error || 'Lisans doğrulanamadı.' });
      return;
    }
    setLicenseInput('');
    setModalFeedback({
      type: 'ok',
      text: 'Lisans anahtarı doğrulandı ve veritabanına işlendi! Artık sistemi markanıza göre kişiselleştirebilirsiniz.'
    });
    setTimeout(() => {
      setShowUpgradeModal(false);
      setModalFeedback(null);
    }, 1000);
  };

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionBusy(true);
    setModalFeedback(null);
    const res = await saveBrandingConfig({
      brandName: draftBrandName,
      logoText: draftLogoText,
      tagline: draftTagline,
      accentColor: draftAccent,
      welcomeMessage: draftWelcome,
      customDomain: draftDomain,
      enabledModules: draftModules
    });
    setActionBusy(false);
    if (!res.success) {
      setModalFeedback({ type: 'err', text: res.error || 'Kaydedilemedi.' });
      return;
    }
    setModalFeedback({ type: 'ok', text: 'Özel marka ayarlarınız veritabanına kaydedildi ve canlı sisteme uygulandı!' });
  };

  const toggleDraftModule = (modId: string) => {
    setDraftModules((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );
  };

  const renderDemoBody = () => {
    switch (demo.slug) {
      case 'ai-travel-planner-demo':
        return <AiTravelPlannerApp fullHeight={fullHeight} />;
      case 'stock-price-prediction-demo':
        return <StockPredictionApp fullHeight={fullHeight} />;
      case 'protez-takip-sistemi-demo':
        return <ProtezTakipApp fullHeight={fullHeight} />;
      case 'pati-bahcesi-demo':
        return <PatiBahcesiEmbed fullHeight={fullHeight} />;
      case 'sdm-clinic-system-demo':
        return <DentalClinicApp fullHeight={fullHeight} />;
      case 'veteriner-klinik-demo':
        return <VeterinerClinicApp fullHeight={fullHeight} />;
      default:
        return (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <Sparkles size={32} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>{demo.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Bu demonun canlı arayüzünü yeni sekmede açarak inceleyebilirsiniz.
            </p>
            {demo.liveUrl && (
              <a href={demo.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                <ExternalLink size={14} /> Canlı Sistemi Aç
              </a>
            )}
          </div>
        );
    }
  };

  const activeAccent = isUnlocked && user?.branding?.accentColor ? user.branding.accentColor : '#00f0ff';

  if (authLoading) {
    return (
      <div
        style={{
          background: '#080d18',
          border: '1px solid var(--border-subtle)',
          borderRadius: fullHeight ? '0' : '16px',
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}
      >
        Üyelik oturumunuz doğrulanıyor...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #070b14 0%, #0d1526 100%)',
          border: '1px solid rgba(0, 240, 255, 0.28)',
          borderRadius: fullHeight ? '0' : '16px',
          padding: '2.5rem 1.5rem',
          minHeight: fullHeight ? 'calc(100vh - 60px)' : '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '490px',
            padding: '2rem 1.75rem',
            borderColor: 'rgba(0, 240, 255, 0.35)'
          }}
        >
          <div className="glow-accent" />
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.85rem'
              }}
            >
              <Mail size={22} color="#00f0ff" />
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem', marginBottom: '0.45rem' }}>
              E-POSTA İLE DEMO ERİŞİMİ
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              Demoyu Kullanmak İçin Giriş Yapın
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              <strong>{demo.title}</strong> sistemini kullanmadan önce e-posta adresinizle giriş yapın veya ücretsiz hesap oluşturun. Kaydınız veritabanına işlenir ve 5 ücretsiz deneme hakkı tanımlanır.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.45rem',
              background: '#080c15',
              padding: '0.3rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setModalFeedback(null);
              }}
              className={`btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', fontSize: '0.78rem' }}
            >
              <LogIn size={13} /> Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setModalFeedback(null);
              }}
              className={`btn btn-sm ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', fontSize: '0.78rem' }}
            >
              <UserPlus size={13} /> Kaydol
            </button>
          </div>

          {modalFeedback && (
            <div
              role="alert"
              style={{
                marginBottom: '0.85rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                background: modalFeedback.type === 'ok' ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)',
                border: `1px solid ${modalFeedback.type === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                color: modalFeedback.type === 'ok' ? '#6ee7b7' : '#fda4af'
              }}
            >
              {modalFeedback.text}
            </div>
          )}

          <form onSubmit={handleQuickAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {authMode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="form-label">Ad Soyad *</label>
                  <input type="text" required minLength={2} placeholder="Ad Soyad" value={qName} onChange={(e) => setQName(e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Firma / Klinik</label>
                  <input type="text" placeholder="Opsiyonel" value={qCompany} onChange={(e) => setQCompany(e.target.value)} className="form-input" />
                </div>
              </div>
            )}

            <div>
              <label className="form-label">E-Posta Adresi *</label>
              <input
                type="email"
                required
                placeholder="eposta@adresiniz.com"
                value={qEmail}
                onChange={(e) => setQEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Şifre *</label>
              <input
                type="password"
                required
                minLength={authMode === 'register' ? 6 : 4}
                placeholder={authMode === 'register' ? 'En az 6 karakter' : 'Şifreniz'}
                value={qPass}
                onChange={(e) => setQPass(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={actionBusy} className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
              {actionBusy ? 'Doğrulanıyor...' : authMode === 'register' ? 'E-Posta ile Kaydol & Demoyu Aç' : 'E-Posta ile Giriş Yap & Demoyu Aç'}
            </button>
          </form>

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
            Tam ekran giriş sayfasına gitmek için{' '}
            <Link href={`/auth/login?redirect=/live/${demo.slug}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Giriş Sayfası
            </Link>
            {' • '}
            <Link href={`/auth/register?redirect=/live/${demo.slug}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Kayıt Sayfası
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        ...(isUnlocked && user?.branding?.accentColor ? ({ '--primary': activeAccent } as React.CSSProperties) : {})
      }}
    >
      {/* White-Label / Membership / Trial Status Bar */}
      <div
        style={{
          background: isUnlocked
            ? `linear-gradient(90deg, ${activeAccent}18 0%, #0d1526 60%, ${activeAccent}10 100%)`
            : '#0c1322',
          border: `1px solid ${isUnlocked ? `${activeAccent}55` : 'rgba(255,255,255,0.08)'}`,
          borderRadius: fullHeight ? '0' : '12px',
          padding: '0.65rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        {isUnlocked && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: activeAccent,
                color: '#041019',
                fontWeight: 900,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.03em'
              }}
            >
              {user.branding.logoText}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>{user.branding.brandName}</strong>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '0.12rem 0.5rem',
                    borderRadius: '999px',
                    background: `${activeAccent}22`,
                    color: activeAccent,
                    border: `1px solid ${activeAccent}55`
                  }}
                >
                  <ShieldCheck size={11} style={{ display: 'inline', marginRight: '0.2rem' }} />
                  {getTierLabel(user.membershipTier)}
                </span>
                {user.branding.customDomain && (
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Globe size={11} color={activeAccent} /> {user.branding.customDomain}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {user.branding.welcomeMessage || user.branding.tagline}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.18rem 0.55rem',
                borderRadius: '999px',
                background: isTrialExhausted ? 'rgba(244,63,94,0.16)' : 'rgba(0,240,255,0.12)',
                color: isTrialExhausted ? '#fda4af' : '#00f0ff',
                border: `1px solid ${isTrialExhausted ? 'rgba(244,63,94,0.4)' : 'rgba(0,240,255,0.35)'}`
              }}
            >
              {isTrialExhausted ? 'Deneme Limiti Doldu' : `Ücretsiz Deneme (${Math.max(0, trialLimit - usedCount)} / ${trialLimit} hak)`}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isAuthenticated
                ? `${user?.name} • Deneme sonrası Premium veya Lisans alarak sınırsız kullanın ve markanıza uyarlayın.`
                : 'Demoyu test edin; ardından kaydolarak Premium üyelik veya kişiselleştirilebilir lisans alın.'}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {!isAuthenticated && (
            <Link
              href={`/auth/register?redirect=/live/${demo.slug}`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.32rem 0.65rem' }}
            >
              <UserPlus size={12} /> Kaydol / Giriş
            </Link>
          )}

          {canCustomize ? (
            <button
              type="button"
              onClick={openCustomizer}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.32rem 0.72rem' }}
            >
              <Palette size={13} /> Sistemi Kendine Göre Kişiselleştir
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.32rem 0.72rem' }}
            >
              <Crown size={13} /> Premium Al / Lisansla Kişiselleştir
            </button>
          )}
        </div>
      </div>

      {/* Demo Viewport Container with Trial Tracking */}
      <div style={{ position: 'relative' }} onClickCapture={handleContainerInteraction}>
        {renderDemoBody()}

        {isTrialExhausted && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 8, 16, 0.84)',
              backdropFilter: 'blur(6px)',
              zIndex: 35,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <div style={{ maxWidth: '460px', textAlign: 'center', background: '#0c1322', border: '1px solid rgba(0,240,255,0.35)', borderRadius: '14px', padding: '1.6rem' }}>
              <Lock size={34} color="#00f0ff" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>
                Ücretsiz Demo Deneme Hakkınız Tamamlandı
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: '1rem' }}>
                Sistemi başarıyla deneyimlediniz! Kesintisiz tam erişim için <strong>Premium Üyeliğe</strong> geçin ya da{' '}
                <strong>Özel Lisans</strong> alarak firmanızın adı ve renkleriyle kişiselleştirin.
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShowUpgradeModal(true)} className="btn btn-primary btn-sm">
                  <Crown size={14} /> Teklif İste / Lisans Gir
                </button>
                {demo.productSlug && (
                  <Link href={`/products/${demo.productSlug}`} className="btn btn-secondary btn-sm">
                    Paketi İncele &amp; Teklif Al →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Upgrade Membership / Activate License / Quick Sign Up */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 7, 14, 0.82)',
            backdropFilter: 'blur(6px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#0b1220',
              border: '1px solid rgba(0,240,255,0.35)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.75)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Crown size={18} color="#00f0ff" /> Premium Üyelik &amp; Kişiselleştirilebilir Lisans Merkezi
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Web sitemizden ödeme alınmaz; Müşteri Hizmetlerimizden ({CUSTOMER_SUPPORT.phoneDisplay} / {CUSTOMER_SUPPORT.email}) teklif alarak lisansınızı aktif edebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Direct Customer Support Banner inside Modal */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem'
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>
                <strong>Müşteri Hizmetleri:</strong> {CUSTOMER_SUPPORT.phoneDisplay} (WhatsApp) • {CUSTOMER_SUPPORT.email}
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                <a
                  href={buildWhatsAppQuoteUrl({ subject: `${demo.title} - Premium / Lisans Teklifi` })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#10b981', color: '#03150e', fontWeight: 800, fontSize: '0.72rem' }}
                >
                  <MessageCircle size={13} /> WhatsApp Teklif
                </a>
                <a
                  href={buildMailtoQuoteUrl({ subject: `${demo.title} - Premium / Lisans Teklifi` })}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem' }}
                >
                  <Mail size={13} /> Mail Gönder
                </a>
                <a
                  href={CUSTOMER_SUPPORT.telHref}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem' }}
                >
                  <Phone size={12} /> Ara
                </a>
              </div>
            </div>

            {modalFeedback && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  background: modalFeedback.type === 'ok' ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)',
                  border: `1px solid ${modalFeedback.type === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                  color: modalFeedback.type === 'ok' ? '#6ee7b7' : '#fda4af'
                }}
              >
                {modalFeedback.text}
              </div>
            )}

            {/* Step 1 if unauthenticated: Quick Register / Login inline */}
            {!isAuthenticated && (
              <form
                onSubmit={handleQuickAuthSubmit}
                style={{
                  background: '#111a2e',
                  border: '1px solid rgba(168,85,247,0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.84rem', color: '#f8fafc' }}>
                    1. Adım: Veritabanına Üye Kaydınızı Oluşturun / Giriş Yapın
                  </strong>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button type="button" onClick={() => setAuthMode('register')} className={`btn btn-sm ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}>
                      Hızlı Kaydol
                    </button>
                    <button type="button" onClick={() => setAuthMode('login')} className={`btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}>
                      Giriş Yap
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.55rem' }}>
                  {authMode === 'register' && (
                    <>
                      <input type="text" required placeholder="Ad Soyad" value={qName} onChange={(e) => setQName(e.target.value)} className="form-input" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} />
                      <input type="text" placeholder="Firma / Klinik Adı" value={qCompany} onChange={(e) => setQCompany(e.target.value)} className="form-input" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} />
                    </>
                  )}
                  <input type="email" required placeholder="E-posta" value={qEmail} onChange={(e) => setQEmail(e.target.value)} className="form-input" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} />
                  <input type="password" required minLength={4} placeholder="Şifre (min 6 krk)" value={qPass} onChange={(e) => setQPass(e.target.value)} className="form-input" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} />
                </div>

                <button type="submit" disabled={actionBusy} className="btn btn-purple btn-sm" style={{ marginTop: '0.65rem', fontSize: '0.75rem' }}>
                  {actionBusy ? 'Kaydediliyor...' : authMode === 'register' ? 'Hesabı Veritabanına Kaydet' : 'Giriş Yap'}
                </button>
              </form>
            )}

            {/* Membership Tiers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.1rem' }}>
              {MEMBERSHIP_PLANS.filter((p) => p.id !== 'free').map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    background: '#111a2e',
                    border: `1px solid ${plan.color}44`,
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.7rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: plan.color, background: `${plan.color}18`, padding: '0.15rem 0.45rem', borderRadius: '999px' }}>
                        {plan.badge}
                      </span>
                      <strong style={{ fontSize: '0.92rem', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>{plan.periodLabel}</strong>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>{plan.name}</h4>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.6rem' }}>{plan.tagline}</p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.71rem', color: '#cbd5e1' }}>
                      {plan.features.map((f) => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                          <Check size={12} color={plan.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => handleUpgradePlan(plan.id as Exclude<MembershipTier, 'free'>)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontSize: '0.74rem' }}
                  >
                    Teklif İste &amp; Talep Oluştur →
                  </button>
                </div>
              ))}
            </div>

            {/* Activate Existing License Key */}
            <form
              onSubmit={handleActivateLicense}
              style={{
                background: '#080c15',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.85rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
                <KeyRound size={15} color="#10b981" />
                <span>Zaten satın alınmış lisans anahtarınız varsa girin:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flex: '1 1 260px', maxWidth: '420px' }}>
                <input
                  type="text"
                  required
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  placeholder="Örn: SDM-CLN-9A12-B4C1"
                  className="form-input"
                  style={{ fontSize: '0.75rem', padding: '0.38rem 0.65rem', fontFamily: 'var(--font-mono)' }}
                />
                <button type="submit" disabled={actionBusy} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap', fontSize: '0.74rem' }}>
                  Lisansı Doğrula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Live White-Label System Customizer Drawer */}
      {showCustomizeDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 7, 14, 0.78)',
            backdropFilter: 'blur(5px)',
            zIndex: 120,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <form
            onSubmit={handleSaveCustomization}
            style={{
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              overflowY: 'auto',
              background: '#0b1220',
              borderLeft: '1px solid rgba(0,240,255,0.3)',
              padding: '1.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Settings2 size={16} color={draftAccent} /> Sistemi Markanıza Göre Özelleştirin
                </h4>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Kaydedilen ayarlar tüm lisanslı modüllerinizde uygulanır.</p>
              </div>
              <button type="button" onClick={() => setShowCustomizeDrawer(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {modalFeedback && (
              <div
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  background: modalFeedback.type === 'ok' ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)',
                  color: modalFeedback.type === 'ok' ? '#6ee7b7' : '#fda4af'
                }}
              >
                {modalFeedback.text}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.8fr', gap: '0.6rem' }}>
              <div>
                <label className="form-label">Klinik / Firma Başlığı</label>
                <input type="text" required value={draftBrandName} onChange={(e) => setDraftBrandName(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Monogram</label>
                <input type="text" maxLength={5} required value={draftLogoText} onChange={(e) => setDraftLogoText(e.target.value.toUpperCase())} className="form-input" style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }} />
              </div>
            </div>

            <div>
              <label className="form-label">Alt Başlık / Slogan</label>
              <input type="text" value={draftTagline} onChange={(e) => setDraftTagline(e.target.value)} className="form-input" />
            </div>

            <div>
              <label className="form-label">Karşılama Mesajı</label>
              <input type="text" value={draftWelcome} onChange={(e) => setDraftWelcome(e.target.value)} className="form-input" />
            </div>

            <div>
              <label className="form-label">Özel Domain (Opsiyonel)</label>
              <input type="text" placeholder="portal.firmaniz.com.tr" value={draftDomain} onChange={(e) => setDraftDomain(e.target.value)} className="form-input" />
            </div>

            <div>
              <label className="form-label">Kurumsal Vurgu Rengi</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                {BRAND_COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setDraftAccent(c.hex)}
                    title={c.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: c.hex,
                      border: draftAccent === c.hex ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={draftAccent}
                  onChange={(e) => setDraftAccent(e.target.value)}
                  style={{ width: '36px', height: '28px', background: 'none', border: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Aktif Sistem Modülleri</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {CUSTOM_MODULE_OPTIONS.map((mod) => {
                  const checked = draftModules.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#cbd5e1',
                        background: '#111a2e',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleDraftModule(mod.id)} />
                      <span>{mod.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={actionBusy} className="btn btn-primary btn-sm" style={{ marginTop: '0.4rem' }}>
              {actionBusy ? 'Kaydediliyor...' : 'Kaydet ve Sistemi Özelleştir'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
