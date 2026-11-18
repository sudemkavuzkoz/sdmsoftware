'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Building,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Smartphone,
  X
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { persistClientOrder } from '@/lib/orderStorage';
import { DemoProject, Order } from '@/lib/types';
import DemoCard from '@/components/DemoCard';
import LiveDemoModal from '@/components/LiveDemoModal';

type PendingOrderData = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'licenseKeys'>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, total, clearCart } = useCart();
  const { user, refreshSession } = useAuth();

  const initialName = user && user.id !== 'usr-demo-default' ? user.name : '';
  const initialEmail = user && user.id !== 'usr-demo-default' ? user.email : '';

  // Müşteri ve Fatura Bilgileri
  const [customerName, setCustomerName] = useState(initialName);
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerPhone, setCustomerPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [address, setAddress] = useState('');

  // Ödeme Yöntemi ve Kart Bilgileri
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'wire_transfer'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // 3D Secure Modal Durumu
  const [is3DSecureOpen, setIs3DSecureOpen] = useState(false);
  const [smsCode, setSmsCode] = useState('192837');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempOrderData, setTempOrderData] = useState<PendingOrderData | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);
  const allDemos = db.getDemos();

  useEffect(() => {
    if (!is3DSecureOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        setIs3DSecureOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [is3DSecureOpen, isProcessing]);

  const handleFillDemoValues = () => {
    setCustomerName(initialName || 'Örnek Müşteri');
    setCustomerEmail(initialEmail || 'musteri@ornekfirma.com');
    setCustomerPhone('+90 532 000 0000');
    setCompanyName('Örnek Teknoloji Ltd.');
    setTaxNumber('1234567890');
    setAddress('Büyükdere Cad. No: 195 Levent, İstanbul');
    setCardHolder('ÖRNEK MÜŞTERİ');
    setCardNumber('5400 1234 5678 9010');
    setCardExpiry('12/28');
    setCardCvv('321');
  };

  const finalizeOrder = async (orderPayload: PendingOrderData) => {
    const fallbackOrder = db.createOrder(orderPayload);
    let finalOrder = fallbackOrder;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = (await res.json()) as { success?: boolean; order?: Order };
      if (data.success && data.order) {
        finalOrder = data.order;
      }
      await refreshSession();
    } catch {
      // Ağ hatasında yerel sipariş ile devam edilir
    }
    persistClientOrder(finalOrder);

    clearCart();
    setIsProcessing(false);
    setIs3DSecureOpen(false);
    router.push(`/order-success/${finalOrder.id}`);
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const orderPayload: PendingOrderData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      companyName: companyName.trim() || undefined,
      taxNumber: taxNumber.trim() || undefined,
      items,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'wire_transfer' ? 'pending' : 'paid',
      orderStatus: paymentMethod === 'wire_transfer' ? 'processing' : 'completed'
    };

    if (paymentMethod === 'wire_transfer') {
      setIsProcessing(true);
      finalizeOrder(orderPayload);
      return;
    }

    setTempOrderData(orderPayload);
    setIs3DSecureOpen(true);
  };

  const handleConfirm3DSecure = () => {
    if (!tempOrderData) return;
    setIsProcessing(true);
    setTimeout(() => {
      finalizeOrder(tempOrderData);
    }, 900);
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Sepetiniz Boş</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Ödeme yapabilmek için sepetinizde ürün bulunmalıdır. Öncesinde gerçek çalışan sistem demolarımızı doğrudan deneyimleyebilirsiniz.
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

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Güvenli <span className="text-gradient">Ödeme ve Fatura</span>
        </h1>
        <button
          type="button"
          onClick={handleFillDemoValues}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem' }}
        >
          Demo Test Bilgilerini Doldur
        </button>
      </div>

      <form onSubmit={handleSubmitCheckout} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.5rem' }} className="checkout-layout">
        {/* Sol Sütun: Fatura & Ödeme Formu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Fatura Bilgileri */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <Building size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Müşteri & Fatura Bilgileri</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Ad Soyad / Yetkili</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Sudem Yılmaz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-Posta Adresi (Lisans buraya iletilir)</label>
                <input
                  type="email"
                  required
                  placeholder="ad@sirketiniz.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Telefon Numarası</label>
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
                <label className="form-label">Şirket Ünvanı (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Şirket / Klinik Adı"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vergi No / TC No</label>
                <input
                  type="text"
                  placeholder="Opsiyonel"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fatura Adresi</label>
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

          {/* Ödeme Yöntemi ve Kart Formu */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ödeme Yöntemi</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)', fontSize: '0.78rem' }}>
                <Lock size={13} />
                <span>256-Bit SSL Güvenli Bağlantı</span>
              </div>
            </div>

            {/* Ödeme Seçenekleri Butonları */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                style={{
                  border: `1px solid ${paymentMethod === 'credit_card' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: paymentMethod === 'credit_card' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-elevated)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Kredi / Banka Kartı</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  3D Secure Doğrulamalı Anında Teslimat
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wire_transfer')}
                style={{
                  border: `1px solid ${paymentMethod === 'wire_transfer' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: paymentMethod === 'wire_transfer' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-elevated)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Kurumsal Havale / EFT</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Banka transferi ile faturalı sipariş
                </div>
              </button>
            </div>

            {/* Kart Formu */}
            {paymentMethod === 'credit_card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    required
                    placeholder="AD SOYAD"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kart Numarası</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={19}
                    placeholder="4543 6000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Son Kullanma (AA/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="AA/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Güvenlik Kodu (CVV)</label>
                    <input
                      type="password"
                      required
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <div><strong>Alıcı:</strong> SDM Software Yazılım Çözümleri</div>
                <div><strong>İletişim & Fatura Onayı:</strong> sudemkavuzkoz005@gmail.com</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-amber)' }}>
                  * Kurumsal Havale / EFT talebi oluşturulduktan sonra üretilen sipariş numaranızı ödeme açıklamasına ekleyebilirsiniz; fatura ve IBAN detayları destek ekibimizce teyit edilir.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Sütun: Sipariş Özeti ve Onay Butonu */}
        <div>
          <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Ödenecek Sipariş Özeti</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '220px', overflowY: 'auto' }}>
              {items.map((i) => (
                <div key={`${i.product.id}-${i.licenseTier}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{i.product.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                      {i.licenseTier} x {i.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {(i.unitPrice * i.quantity).toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Ara Toplam</span>
                <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>İndirim Tutarı</span>
                  <span>-{discountAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span>Genel Toplam</span>
                <span className="text-cyan">{total.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ShieldCheck size={20} />
              <span>
                {paymentMethod === 'wire_transfer'
                  ? `Havale Siparişi Oluştur (${total.toLocaleString('tr-TR')} ₺)`
                  : `${total.toLocaleString('tr-TR')} ₺ Ödemeyi Onayla`}
              </span>
            </button>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '1rem', lineHeight: '1.5' }}>
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

      {/* 3D SECURE SMS DOĞRULAMA MODALI (SİMÜLASYON) */}
      {is3DSecureOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="3D Secure Güvenlik Onayı"
          onClick={() => !isProcessing && setIs3DSecureOpen(false)}
        >
          <div className="modal-content" style={{ maxWidth: '440px', padding: '2rem', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Kapat"
              disabled={isProcessing}
              onClick={() => setIs3DSecureOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Smartphone size={28} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>3D Secure Güvenlik Onayı</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Bankanız tarafından <strong>{customerPhone}</strong> numaralı telefonunuza iletilen 6 haneli doğrulama kodunu giriniz (Simülasyon: 192837):
              </p>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Ödeme Tutarı:</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                {total.toLocaleString('tr-TR')} ₺
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>İşyeri: SDM Software (sdmsoftware.com.tr)</div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>SMS Onay Kodu</label>
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.3rem', fontWeight: 800 }}
                className="form-input"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirm3DSecure}
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {isProcessing ? 'Ödeme Doğrulanıyor...' : 'Doğrula ve Siparişi Tamamla'}
            </button>
          </div>
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
