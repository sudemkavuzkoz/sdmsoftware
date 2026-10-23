'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Key, 
  Download, 
  Package, 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';

export default function CustomerDashboardPage() {
  const { user, isAdmin } = useAuth();
  const orders = db.getOrders();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (keyText: string) => {
    navigator.clipboard?.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Üst Karşılama Çubuğu */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div className="glow-accent" />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#07090e',
                fontSize: '1.3rem'
              }}
            >
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SD'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  Hoş Geldiniz, {user?.name || 'Müşteri'}
                </h1>
                <span className="badge badge-cyan">{user?.role === 'admin' ? 'Yönetici' : 'Kurumsal Müşteri'}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                {user?.company || 'SDM Software Müşterisi'} • {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isAdmin && (
              <Link href="/admin" className="btn btn-purple btn-sm">
                Yönetici Paneline Geç →
              </Link>
            )}
            <Link href="/products" className="btn btn-primary btn-sm">
              Yeni Yazılım İncele
            </Link>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
          <Package size={48} color="var(--primary)" style={{ margin: '0 auto 1.25rem', opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            Aktif Lisans veya Sipariş Kaydı Bulunmuyor
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Hesabınızda kayıtlı herhangi bir lisans veya geçmiş sipariş kaydı yoktur. Geliştirdiğimiz projeleri ve canlı demoları inceleyebilirsiniz.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/products" className="btn btn-primary btn-sm">
              Yazılımları İncele
            </Link>
            <Link href="/demos" className="btn btn-secondary btn-sm">
              Canlı Demolar
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }} className="dash-grid">
          {/* Sol Taraf: Aktif Lisanslar */}
          <div>
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <Key size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aktif Yazılım Lisanslarınız</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.flatMap(o => o.items.map(item => ({ item, order: o }))).map(({ item, order }, idx) => {
                  const key = order.licenseKeys[item.product.id] || `SDM-${item.product.slug.toUpperCase().substring(0, 4)}-KEY-2026`;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.product.title}
                          </h3>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                            Lisans Tipi: {item.licenseTier.toUpperCase()} • Sürüm {item.product.version}
                          </div>
                        </div>
                        <span className="badge badge-emerald">Aktif / Süresiz</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                        <code style={{ fontSize: '0.85rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                          {key}
                        </code>
                        <button
                          onClick={() => handleCopy(key)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          {copiedKey === key ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                          <span>{copiedKey === key ? 'Kopyalandı' : 'Kopyala'}</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => alert(`${item.product.title} kaynak kod arşivi indirilmeye başlandı.`)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          <Download size={13} /> Kaynak Kodu İndir
                        </button>
                        {item.product.demoSlug && (
                          <Link
                            href={`/demos`}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
                          >
                            <ExternalLink size={13} /> Canlı Demosunu Gör
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ Taraf: Geçmiş Siparişler */}
          <div>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <Package size={20} color="var(--accent-purple)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sipariş Geçmişi</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ord.orderNumber}</span>
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                        {ord.orderStatus === 'completed' ? 'Tamamlandı' : ord.orderStatus}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                      Tarih: {new Date(ord.createdAt).toLocaleDateString('tr-TR')} • {ord.items.length} Kalem Ürün
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Ödenen:</span>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                        {ord.total.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 850px) {
          :global(.dash-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
