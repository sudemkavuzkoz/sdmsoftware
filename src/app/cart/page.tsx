'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, Headphones, MessageCircle, Mail } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { buildMailtoQuoteUrl, buildWhatsAppQuoteUrl, CUSTOMER_SUPPORT } from '@/lib/contact';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    total,
    couponCode,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [inputCoupon, setInputCoupon] = React.useState('');
  const [couponMsg, setCouponMsg] = React.useState<{ text: string; error?: boolean } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon) return;
    const res = applyCoupon(inputCoupon);
    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) setInputCoupon('');
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'standard': return 'Tekil Geliştirici Lisansı';
      case 'commercial': return 'Ticari Şirket Lisansı';
      case 'extended': return 'Genişletilmiş Kurumsal Lisans';
      default: return tier;
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShoppingBag size={32} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Teklif Listeniz Boş</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Web sitemizden ödeme alınmamaktadır. Yazılımları teklif listenize ekleyebilir veya doğrudan Müşteri Hizmetlerimizle ({CUSTOMER_SUPPORT.phoneDisplay} / {CUSTOMER_SUPPORT.email}) teklif görüşmesi yapabilirsiniz.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/products" className="btn btn-primary">
              Yazılım Kataloğunu İncele
            </Link>
            <Link href="/checkout" className="btn btn-secondary">
              Doğrudan Teklif Oluştur
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>
        Yazılım <span className="text-gradient">Teklif Listeniz</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="cart-grid">
        {/* Ürün Listesi */}
        <div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.licenseTier}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      width={70}
                      height={60}
                      unoptimized
                      style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.product.title}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                        {getTierLabel(item.licenseTier)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Birim: {item.unitPrice.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      <button
                        type="button"
                        aria-label="Adet azalt"
                        onClick={() => updateQuantity(item.product.id, item.licenseTier, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Adet artır"
                        onClick={() => updateQuantity(item.product.id, item.licenseTier, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ fontSize: '1.1rem', fontWeight: 800, minWidth: '100px', textAlign: 'right', color: 'var(--text-main)' }}>
                      {(item.unitPrice * item.quantity).toLocaleString('tr-TR')} ₺
                    </div>

                    <button
                      type="button"
                      aria-label={`${item.product.title} ürününü sepetten çıkar`}
                      onClick={() => removeFromCart(item.product.id, item.licenseTier)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.3rem' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teklif Özeti ve Kupon */}
        <div>
          <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Teklif Özeti</h2>

            {/* Kupon Alanı */}
            <form onSubmit={handleApply} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Kupon Kodu (örn: SDM10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  <Tag size={14} /> Uygula
                </button>
              </div>
              {couponMsg && (
                <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: couponMsg.error ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {couponMsg.text}
                </div>
              )}
              {couponCode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.5rem' }}>
                  <span>Aktif Kupon: <strong>{couponCode}</strong></span>
                  <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>
                    Kaldır
                  </button>
                </div>
              )}
            </form>

            {/* Tutar Kırılımı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Ara Toplam</span>
                <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>Kupon İndirimi</span>
                  <span>-{discountAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span>Liste Tutarı</span>
                <span className="text-cyan">{total.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link
                href="/checkout"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Teklif Talebine Geç</span>
                <ArrowRight size={18} />
              </Link>

              <a
                href={buildWhatsAppQuoteUrl({ items, totalAmount: total })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: '#03150e',
                  fontWeight: 800,
                  padding: '0.7rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp&apos;tan Teklif Ver ({CUSTOMER_SUPPORT.phoneDisplay})</span>
              </a>

              <a
                href={buildMailtoQuoteUrl({ items, totalAmount: total })}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <Mail size={15} />
                <span>E-Posta ile Teklif Gönder</span>
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '1rem', textAlign: 'center' }}>
              <Headphones size={15} color="var(--accent-emerald)" />
              <span>Web sitemizden ödeme alınmaz • {CUSTOMER_SUPPORT.phoneDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 850px) {
          :global(.cart-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
