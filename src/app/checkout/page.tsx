'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  Check,
  Copy,
  CreditCard,
  Landmark,
  Lock,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { persistClientOrder } from '@/lib/orderStorage';
import { DemoProject, Order, PaymentSettings } from '@/lib/types';
import DemoCard from '@/components/DemoCard';
import LiveDemoModal from '@/components/LiveDemoModal';

type PendingOrderData = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'licenseKeys'>;

export default function CheckoutPage() {
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

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);

  // Customer & Billing Fields (pre-filled only when real logged-in user exists)
  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? '');
  const [companyName, setCompanyName] = useState(user?.company ?? '');
  const [taxNumber, setTaxNumber] = useState('');
  const [address, setAddress] = useState('');
  const [transferReference, setTransferReference] = useState('');

  // Coupon Input
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'wire_transfer' | 'credit_card'>('wire_transfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Empty-cart Demo Showcase Modal
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);
  const allDemos = db.getDemos();

  useEffect(() => {
    let active = true;
    fetch('/api/settings/payment', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { success?: boolean; settings?: PaymentSettings }) => {
        if (active && data.success && data.settings) {
          setPaymentSettings(data.settings);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const taxRate = paymentSettings?.taxRatePct ?? 20;
  const pricesIncludeTax = paymentSettings?.pricesIncludeTax ?? true;
  const computedTaxAmount =
    taxRate > 0
      ? pricesIncludeTax
        ? Math.round(total - total / (1 + taxRate / 100))
        : Math.round((total * taxRate) / 100)
      : 0;
  const finalPayableTotal = pricesIncludeTax ? total : total + computedTaxAmount;

  const handleCopyIban = () => {
    if (!paymentSettings?.iban) return;
    navigator.clipboard?.writeText(paymentSettings.iban.replace(/\s+/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2200);
  };

  const handleApplyCoupon = () => {
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (paymentMethod === 'credit_card' && !paymentSettings?.virtualPosEnabled) {
      setCheckoutError('Sanal POS henüz aktif olmadığı için lütfen Banka Havalesi / EFT / FAST ile devam ediniz.');
      return;
    }

    setCheckoutError(null);
    setIsProcessing(true);

    const orderPayload: PendingOrderData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      companyName: companyName.trim() || undefined,
      taxNumber: taxNumber.trim() || undefined,
      items,
      subtotal,
      discount: discountAmount,
      total: finalPayableTotal,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing',
      transferReference: transferReference.trim() || undefined
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = (await res.json()) as { success?: boolean; order?: Order; error?: string };
      if (!res.ok || !data.success || !data.order) {
        setCheckoutError(data.error || 'Sipariş kaydedilemedi. Lütfen bilgileri kontrol edin.');
        setIsProcessing(false);
        return;
      }
      persistClientOrder(data.order);
      await refreshSession();
      clearCart();
      router.push(`/order-success/${data.order.id}`);
    } catch {
      setCheckoutError('Sipariş sunucusuna bağlanırken hata oluştu.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Sepetiniz Boş</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Ödeme yapabilmek için sepetinizde ürün veya üyelik paketi bulunmalıdır. Öncesinde gerçek çalışan sistem demolarımızı doğrudan deneyimleyebilirsiniz.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center' }}>
            <Link href="/products" className="btn btn-primary">
              Ürünleri İncele
            </Link>
            <Link href="/demos" className="btn btn-secondary">
              Tüm Canlı Demoları Gör
            </Link>
          </div>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <div className="live-indicator" style={{ marginBottom: '0.4rem' }}>
            <span className="live-dot" />
            <span>GITHUB REPOLARINDAN CANLI SİSTEM DEMOLARI</span>
          </div>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
            Satın Almadan Önce <span className="text-gradient">Gerçek Demoları Deneyin</span>
          </h3>
        </div>

        <div className="grid-cols-3">
          {allDemos.map((demo) => (
            <DemoCard key={demo.id} demo={demo} onOpenDemo={(d) => setSelectedDemo(d)} />
          ))}
        </div>

        <LiveDemoModal demo={selectedDemo} onClose={() => setSelectedDemo(null)} />
      </div>
    );
  }

  const posEnabled = Boolean(paymentSettings?.virtualPosEnabled && paymentSettings.virtualPosProvider !== 'none');

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <Link
        href="/cart"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Sepete Geri Dön
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>
          Sipariş, Fatura ve <span className="text-gradient">IBAN Ödeme</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
          Siparişinizi oluşturup banka havalesi / EFT ile ödemenizi tamamladığınızda yönetici onayı sonrası lisansınız aktive edilir.
        </p>
      </div>

      {checkoutError && (
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
          {checkoutError}
        </div>
      )}

      <form onSubmit={handleSubmitCheckout} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.25rem' }} className="checkout-layout">
        {/* Left: Customer Invoice & Bank IBAN Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.35rem' }}>
              <Building size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Müşteri &amp; Fatura Bilgileri</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.9rem' }}>
              <div className="form-group">
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

              <div className="form-group">
                <label className="form-label">E-Posta Adresi (Lisans buraya tanımlanır) *</label>
                <input
                  type="email"
                  required
                  placeholder="eposta@adresiniz.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  placeholder="+90 5XX XXX XX XX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Şirket / Klinik Ünvanı (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Şirket veya Klinik Adı"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.9rem', marginTop: '0.25rem' }}>
              <div className="form-group">
                <label className="form-label">Vergi No / T.C. Kimlik</label>
                <input
                  type="text"
                  placeholder="Opsiyonel"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fatura Adresi *</label>
                <input
                  type="text"
                  required
                  placeholder="Açık fatura adresi, İlçe / İl"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card" style={{ padding: '1.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Landmark size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ödeme Yöntemi</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)', fontSize: '0.76rem' }}>
                <Lock size={13} />
                <span>Doğrulanmış Banka Transferi</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('wire_transfer')}
                style={{
                  border: `1.5px solid ${paymentMethod === 'wire_transfer' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: paymentMethod === 'wire_transfer' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-elevated)',
                  padding: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Banka Havalesi / EFT / FAST</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  IBAN ile 7/24 komisyonsuz güvenli ödeme
                </div>
              </button>

              <button
                type="button"
                disabled={!posEnabled}
                onClick={() => posEnabled && setPaymentMethod('credit_card')}
                style={{
                  border: `1px solid ${paymentMethod === 'credit_card' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: 'var(--bg-elevated)',
                  opacity: posEnabled ? 1 : 0.55,
                  padding: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: posEnabled ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  color: 'var(--text-main)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CreditCard size={15} /> Kredi / Banka Kartı
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  {posEnabled
                    ? `Aktif Sanal POS (${paymentSettings?.virtualPosProvider.toUpperCase()})`
                    : 'Yakında (Sanal POS henüz aktif değildir)'}
                </div>
              </button>
            </div>

            {/* Bank IBAN Details Box */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(0, 240, 255, 0.22)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {paymentSettings?.iban ? (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Banka &amp; Hesap Sahibi</div>
                      <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)' }}>
                        {paymentSettings.bankName || 'Banka Hesabı'} — {paymentSettings.accountHolder || 'Hesap Sahibi'}
                      </div>
                      {paymentSettings.branchOrSwift && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{paymentSettings.branchOrSwift}</div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.6rem',
                      background: '#070b14',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '0.75rem 0.9rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>IBAN</div>
                      <code style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        {paymentSettings.iban}
                      </code>
                    </div>
                    <button type="button" onClick={handleCopyIban} className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem' }}>
                      {copiedIban ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                      <span>{copiedIban ? 'IBAN Kopyalandı' : 'IBAN Kopyala'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-amber)' }}>
                  IBAN bilgisi yönetici panelinden henüz girilmemiştir. Siparişi oluşturduğunuzda ödeme hesap bilgileri yetkili iletişim adresinizle paylaşılır (sudemkavuzkoz005@gmail.com).
                </div>
              )}

              {paymentSettings?.transferNote && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  * {paymentSettings.transferNote}
                </p>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Havale Gönderen Adı / Dekont Referans Notu (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Ödemeyi yapacak kişi veya dekont referans no"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="glass-card" style={{ padding: '1.85rem', position: 'sticky', top: '6rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.15rem' }}>Ödenecek Sipariş Özeti</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.2rem', maxHeight: '220px', overflowY: 'auto' }}>
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
            <div style={{ marginBottom: '1.15rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '0.45rem' }}>
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="İndirim kuponu"
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', marginBottom: '1.35rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Ara Toplam</span>
                <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>İndirim ({couponCode})</span>
                  <span>-{discountAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              {taxRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>{pricesIncludeTax ? `KDV (Dahil %${taxRate})` : `KDV (+%${taxRate})`}</span>
                  <span>{computedTaxAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span>Ödenecek Toplam</span>
                <span className="text-cyan">{finalPayableTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ShieldCheck size={19} />
              <span>
                {isProcessing
                  ? 'Sipariş Oluşturuluyor...'
                  : `Havale / EFT Siparişini Oluştur (${finalPayableTotal.toLocaleString('tr-TR')} ₺)`}
              </span>
            </button>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.9rem', lineHeight: '1.5' }}>
              Devam ederek{' '}
              <Link href="/legal/mesafeli-satis" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                Mesafeli Satış Sözleşmesi
              </Link>{' '}
              ve{' '}
              <Link href="/legal/iptal-iade" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                İptal/İade Koşulları
              </Link>
              nı kabul etmiş olursunuz.
            </div>
          </div>
        </div>
      </form>

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
