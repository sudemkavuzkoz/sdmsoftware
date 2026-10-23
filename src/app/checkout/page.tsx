'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  Building, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  Check, 
  Smartphone, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, total, clearCart } = useCart();
  const { user } = useAuth();

  // Müşteri ve Fatura Bilgileri
  const [customerName, setCustomerName] = useState(user?.name || 'Ahmet Yılmaz');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'ahmet@teknolojias.com');
  const [customerPhone, setCustomerPhone] = useState('+90 532 100 2030');
  const [companyName, setCompanyName] = useState('Teknoloji A.Ş.');
  const [taxNumber, setTaxNumber] = useState('1234567890');
  const [address, setAddress] = useState('Büyükdere Caddesi No: 195 Levent, İstanbul');

  // Ödeme Yöntemi ve Kart Bilgileri
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'iyzico' | 'stripe' | 'wire_transfer'>('credit_card');
  const [cardNumber, setCardNumber] = useState('5400 1234 5678 9010');
  const [cardHolder, setCardHolder] = useState('AHMET YILMAZ');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  // 3D Secure Modal Durumu
  const [is3DSecureOpen, setIs3DSecureOpen] = useState(false);
  const [smsCode, setSmsCode] = useState('192837');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempOrderData, setTempOrderData] = useState<any>(null);

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const orderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      taxNumber,
      items,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentStatus: 'paid' as const,
      orderStatus: 'completed' as const
    };

    setTempOrderData(orderPayload);
    setIs3DSecureOpen(true);
  };

  const handleConfirm3DSecure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (tempOrderData) {
        const createdOrder = db.createOrder(tempOrderData);
        clearCart();
        setIsProcessing(false);
        setIs3DSecureOpen(false);
        router.push(`/order-success/${createdOrder.id}`);
      }
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Sepetiniz Boş</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Ödeme yapabilmek için sepetinizde ürün bulunmalıdır.</p>
        <Link href="/products" className="btn btn-primary">
          Ürünleri İncele
        </Link>
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

      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>
        Güvenli <span className="text-gradient">Ödeme ve Fatura</span>
      </h1>

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
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Şirket Ünvanı (Opsiyonel)</label>
                <input
                  type="text"
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
                <span>256-Bit SSL Iyzico / Stripe</span>
              </div>
            </div>

            {/* Ödeme Seçenekleri Butonları */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                onClick={() => setPaymentMethod('credit_card')}
                style={{
                  border: `1px solid ${paymentMethod === 'credit_card' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: paymentMethod === 'credit_card' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-elevated)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Kredi / Banka Kartı</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Iyzico & Stripe 3D Secure Doğrulamalı
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('wire_transfer')}
                style={{
                  border: `1px solid ${paymentMethod === 'wire_transfer' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: paymentMethod === 'wire_transfer' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-elevated)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Kurumsal Havale / EFT</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Banka hesap bilgilerimize transfer
                </div>
              </div>
            </div>

            {/* Kart Formu */}
            {paymentMethod === 'credit_card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kart Numarası (Test kartı hazır girilmiştir)</label>
                  <input
                    type="text"
                    required
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
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Güvenlik Kodu (CVV)</label>
                    <input
                      type="text"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <div><strong>Banka:</strong> Garanti BBVA Maslak Ticari Şubesi</div>
                <div><strong>Hesap Sahibi:</strong> SDM Yazılım ve Bilişim Teknolojileri A.Ş.</div>
                <div><strong>IBAN:</strong> TR42 0006 2000 0001 2345 6789 01</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-amber)' }}>
                  * Açıklama kısmına sipariş oluşturulduktan sonra üretilecek Sipariş Numaranızı yazınız.
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
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ShieldCheck size={20} />
              <span>{total.toLocaleString('tr-TR')} ₺ Ödemeyi Onayla</span>
            </button>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '1rem', lineHeight: '1.5' }}>
              &quot;Ödemeyi Onayla&quot; butonuna basarak Mesafeli Satış Sözleşmesi ve İptal/İade koşullarını kabul etmiş olursunuz.
            </div>
          </div>
        </div>
      </form>

      {/* 3D SECURE SMS DOĞRULAMA MODALI (SİMÜLASYON) */}
      {is3DSecureOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Smartphone size={28} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>3D Secure Güvenlik Onayı</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Bankanız tarafından <strong>{customerPhone}</strong> numaralı telefonunuza iletilen 6 haneli güvenlik kodunu giriniz:
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
