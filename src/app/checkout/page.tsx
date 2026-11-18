'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { persistClientOrder } from '@/lib/orderStorage';
import {
  buildMailtoQuoteUrl,
  buildWhatsAppQuoteUrl,
  CUSTOMER_SUPPORT
} from '@/lib/contact';
import { CartItem, DemoProject, Order, Product } from '@/lib/types';
import DemoCard from '@/components/DemoCard';
import LiveDemoModal from '@/components/LiveDemoModal';
import CustomerSupportSection from '@/components/CustomerSupportSection';

type PendingQuoteOrderData = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'licenseKeys'>;

const CUSTOM_PROJECT_PRODUCT: Product = {
  id: 'custom-quote-request',
  title: 'Özel Yazılım / Lisans Teklif Talebi',
  slug: 'custom-quote-request',
  shortDescription: 'Müşteri Hizmetleri üzerinden iletilen özel fiyat ve proje teklifi talebi',
  description: 'Müşteri Hizmetleri üzerinden iletilen özel fiyat ve proje teklifi talebi',
  category: 'enterprise',
  price: 0,
  rating: 5,
  reviewsCount: 0,
  features: ['Birebir Müşteri Hizmetleri Görüşmesi', 'Özel Fiyatlandırma ve Kurulum Planı'],
  techStack: ['SDM Software'],
  imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  inStock: true,
  version: '2026'
};

export default function QuoteCenterPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discountAmount,
    total,
    clearCart,
    couponCode,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { user, refreshSession } = useAuth();

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? '');
  const [companyName, setCompanyName] = useState(user?.company ?? '');
  const [proposedBudget, setProposedBudget] = useState('');
  const [quoteNote, setQuoteNote] = useState('');

  // Optional Coupon for List Estimate
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Demo Showcase Modal
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);
  const allDemos = db.getDemos();

  const hasCartItems = items.length > 0;
  const effectiveItems: CartItem[] = hasCartItems
    ? items
    : [
        {
          product: CUSTOM_PROJECT_PRODUCT,
          licenseTier: 'standard',
          unitPrice: 0,
          quantity: 1
        }
      ];

  const quotePreviewParams = {
    subject: hasCartItems ? 'Seçili Paketler İçin Fiyat Teklifi' : 'Özel Yazılım / Lisans Teklifi',
    customerName: customerName.trim() || undefined,
    customerEmail: customerEmail.trim() || undefined,
    customerPhone: customerPhone.trim() || undefined,
    companyName: companyName.trim() || undefined,
    proposedBudget: proposedBudget.trim() || undefined,
    quoteNote: quoteNote.trim() || undefined,
    items: hasCartItems ? items : undefined,
    totalAmount: hasCartItems ? total : undefined
  };

  const whatsappDirectUrl = buildWhatsAppQuoteUrl(quotePreviewParams);
  const mailtoDirectUrl = buildMailtoQuoteUrl(quotePreviewParams);

  const handleApplyCoupon = () => {
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError(null);
    setIsProcessing(true);

    const payload: PendingQuoteOrderData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      companyName: companyName.trim() || undefined,
      items: effectiveItems,
      subtotal: hasCartItems ? subtotal : 0,
      discount: hasCartItems ? discountAmount : 0,
      total: hasCartItems ? total : 0,
      paymentMethod: 'quote_request',
      paymentStatus: 'pending',
      orderStatus: 'processing',
      proposedBudget: proposedBudget.trim() || undefined,
      quoteNote: quoteNote.trim() || undefined
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = (await res.json()) as { success?: boolean; order?: Order; error?: string };
      if (!res.ok || !data.success || !data.order) {
        setQuoteError(data.error || 'Teklif talebi kaydedilemedi. Lütfen alanları kontrol ediniz.');
        setIsProcessing(false);
        return;
      }
      persistClientOrder(data.order);
      await refreshSession();
      if (hasCartItems) {
        clearCart();
      }
      router.push(`/order-success/${data.order.id}`);
    } catch {
      setQuoteError('Sunucuya bağlanırken bir hata oluştu.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <Link
        href={hasCartItems ? '/cart' : '/products'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> {hasCartItems ? 'Teklif Listesine Dön' : 'Yazılım Kataloğuna Dön'}
      </Link>

      {/* Top Info Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '0.55rem' }}>
          MÜŞTERİ HİZMETLERİ &amp; TEKLİF MERKEZİ
        </span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', fontWeight: 800 }}>
          Fiyat Teklifi Ver &amp; <span className="text-gradient">İletişime Geç</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '760px', lineHeight: 1.6 }}>
          {CUSTOMER_SUPPORT.noWebPaymentNotice}
        </p>
      </div>

      {/* Prominent Customer Support Channels Banner */}
      <div style={{ marginBottom: '2.25rem' }}>
        <CustomerSupportSection
          id="musteri-hizmetleri-kanal"
          quoteParams={quotePreviewParams}
          showQuoteFormLink={false}
          compact
        />
      </div>

      {quoteError && (
        <div
          role="alert"
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: 'var(--accent-rose)',
            fontSize: '0.86rem'
          }}
        >
          {quoteError}
        </div>
      )}

      {/* Quote Request Form + Direct Channels */}
      <form
        onSubmit={handleSubmitQuote}
        style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '2rem', marginBottom: '4rem' }}
        className="checkout-layout"
      >
        {/* Left: Customer & Quote Form */}
        <div className="glass-card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Teklif Talebi &amp; İletişim Bilgileriniz</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.9rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ad Soyad / Yetkili *</label>
              <input
                type="text"
                required
                placeholder="Ad Soyad"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-Posta Adresi *</label>
              <input
                type="email"
                required
                placeholder="eposta@adresiniz.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Telefon / WhatsApp Numaranız *</label>
              <input
                type="tel"
                required
                placeholder="05XX XXX XX XX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Kurum / Klinik / Şirket Adı</label>
              <input
                type="text"
                placeholder="Opsiyonel"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Teklif / Bütçe Öneriniz (Opsiyonel)</label>
            <input
              type="text"
              placeholder="Örn: Yıllık lisans + kurulum için bütçe / teklif tutarınız"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Talep Ettiğiniz Özelleştirmeler &amp; Notunuz</label>
            <textarea
              rows={4}
              placeholder="Hangi yazılım/lisans için teklif verdiğinizi, kullanıcı sayısını veya özel isteklerinizi yazabilirsiniz..."
              value={quoteNote}
              onChange={(e) => setQuoteNote(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '105px' }}
            />
          </div>

          <div
            style={{
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.22)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <Headphones size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>
              Web sitesi üzerinden herhangi bir kart veya ödeme tahsilatı yapılmaz. Teklifiniz doğrudan{' '}
              <strong style={{ color: 'var(--text-main)' }}>{CUSTOMER_SUPPORT.phoneDisplay}</strong> (WhatsApp) ve{' '}
              <strong style={{ color: 'var(--text-main)' }}>{CUSTOMER_SUPPORT.email}</strong> hatlarımıza yönlendirilir.
            </span>
          </div>
        </div>

        {/* Right: Selected Products & Send Options */}
        <div>
          <div className="glass-card" style={{ padding: '1.85rem', position: 'sticky', top: '6rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
              {hasCartItems ? 'Teklif Listesi Özeti' : 'Doğrudan Teklif Özeti'}
            </h2>

            {hasCartItems ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.1rem', maxHeight: '220px', overflowY: 'auto' }}>
                  {items.map((i) => (
                    <div key={`${i.product.id}-${i.licenseTier}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', gap: '0.6rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{i.product.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                          {i.licenseTier.toUpperCase()} x {i.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {(i.unitPrice * i.quantity).toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Box */}
                <div style={{ marginBottom: '1.1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="İndirim kodu (varsa)"
                      className="form-input"
                      style={{ fontSize: '0.78rem', padding: '0.42rem 0.65rem' }}
                    />
                    {couponCode ? (
                      <button type="button" onClick={removeCoupon} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap', fontSize: '0.74rem' }}>
                        Kaldır
                      </button>
                    ) : (
                      <button type="button" onClick={handleApplyCoupon} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap', fontSize: '0.74rem' }}>
                        <Tag size={12} /> Uygula
                      </button>
                    )}
                  </div>
                  {couponFeedback && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{couponFeedback}</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Liste Ara Toplam</span>
                    <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                      <span>İndirim ({couponCode})</span>
                      <span>-{discountAmount.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '0.45rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Tahmini Liste Tutarı</span>
                    <span className="text-cyan">{total.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                Listenizde henüz hazır bir ürün bulunmuyor. Sol taraftan talebinizi yazarak özel yazılım teklifi gönderebilir ya da ürün kataloğumuzdan sistem ekleyebilirsiniz.
              </div>
            )}

            {/* Primary Save Quote Button + Direct WhatsApp / Email Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.96rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Send size={17} />
                <span>{isProcessing ? 'Talep Kaydediliyor...' : 'Teklif Talebini Kaydet & Kod Al'}</span>
              </button>

              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: '#03150e',
                  fontWeight: 800,
                  padding: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem'
                }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp&apos;tan Teklif Ver ({CUSTOMER_SUPPORT.phoneDisplay})</span>
              </a>

              <a
                href={mailtoDirectUrl}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem'
                }}
              >
                <Mail size={15} />
                <span>E-Posta ile Teklif Gönder ({CUSTOMER_SUPPORT.email})</span>
              </a>

              <a
                href={CUSTOMER_SUPPORT.telHref}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Phone size={14} />
                <span>Müşteri Hizmetlerini Ara: {CUSTOMER_SUPPORT.phoneDisplay}</span>
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.95rem' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" />
              <span>Ödeme alınmaz • Karşılıklı onay sonrası lisans aktive edilir</span>
            </div>
          </div>
        </div>
      </form>

      {/* Demos Preview */}
      {!hasCartItems && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="live-indicator" style={{ marginBottom: '0.4rem' }}>
              <span className="live-dot" />
              <span>CANLI SİSTEM DEMOLARI</span>
            </div>
            <h3 style={{ fontSize: '1.55rem', fontWeight: 800 }}>
              Teklif Vermeden Önce <span className="text-gradient">Canlı Demoları İnceleyin</span>
            </h3>
          </div>

          <div className="grid-cols-3">
            {allDemos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} onOpenDemo={(d) => setSelectedDemo(d)} />
            ))}
          </div>

          <LiveDemoModal demo={selectedDemo} onClose={() => setSelectedDemo(null)} />
        </div>
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.checkout-layout) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
