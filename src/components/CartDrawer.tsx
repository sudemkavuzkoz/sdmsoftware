'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    total,
    couponCode,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon) return;
    const res = applyCoupon(inputCoupon);
    setCouponMessage({ text: res.message, error: !res.success });
    if (res.success) {
      setInputCoupon('');
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'standard':
        return 'Tekil Geliştirici Lisansı';
      case 'commercial':
        return 'Ticari Şirket Lisansı';
      case 'extended':
        return 'Genişletilmiş Kurumsal Lisans';
      default:
        return tier;
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={closeCart} />
      <div className="drawer-panel">
        {/* Üst Başlık */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Alışveriş Sepeti</h3>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
              {items.length} Ürün
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Kapat"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.3rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sepet İçi Liste */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}
              >
                <ShoppingBag size={28} color="var(--text-dim)" />
              </div>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Sepetiniz Boş</h4>
              <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Kataloğumuzdaki kurumsal yazılımları ve modülleri inceleyip sepetinize ekleyebilirsiniz.
              </p>
              <Link href="/products" onClick={closeCart} className="btn btn-primary btn-sm">
                Yazılımları İncele
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.licenseTier}`}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3' }}>
                        {item.product.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                        {getTierLabel(item.licenseTier)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.licenseTier)}
                      aria-label="Sil"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    {/* Adet Butonları */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.4rem' }}>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.licenseTier, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.licenseTier, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {(item.unitPrice * item.quantity).toLocaleString('tr-TR')} ₺
                      </div>
                      {item.quantity > 1 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Birim: {item.unitPrice.toLocaleString('tr-TR')} ₺
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kupon ve Özet Alt Bölüm */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-main)' }}>
            {/* Kupon Kodu Alanı */}
            <form onSubmit={handleApplyCoupon} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="İndirim Kodu (örn: SDM10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  <Tag size={13} /> Uygula
                </button>
              </div>
              {couponMessage && (
                <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: couponMessage.error ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {couponMessage.text}
                </div>
              )}
              {couponCode && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
                  <span>Kupon Uygulandı: <strong>{couponCode}</strong></span>
                  <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline' }}>
                    Kaldır
                  </button>
                </div>
              )}
            </form>

            {/* Fiyat Kırılımı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span>Genel Toplam</span>
                <span className="text-cyan">{total.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            {/* Checkout Aksiyonu */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
            >
              <span>Ödemeye İlerle</span>
              <ArrowRight size={17} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '0.75rem' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" />
              <span>Iyzico & Stripe 256-Bit SSL Korumalı Güvenli Ödeme</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
