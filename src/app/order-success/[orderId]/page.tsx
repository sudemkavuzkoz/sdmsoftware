'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileText,
  Key,
  Landmark
} from 'lucide-react';
import {
  downloadInvoiceDocument,
  downloadLicensePackage,
  useIsClientHydrated,
  useOrders
} from '@/lib/orderStorage';
import { useAuth } from '@/context/AuthContext';
import { PaymentSettings } from '@/lib/types';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const clientOrders = useOrders();
  const { dbOrders } = useAuth();
  const isHydrated = useIsClientHydrated();

  const order = [...dbOrders, ...clientOrders].find(
    (o) => o.id === orderId || o.orderNumber === orderId
  );

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

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

  const handleCopy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedText(val);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (isHydrated && !order) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Sipariş Kaydı Bulunamadı
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            <strong>{orderId}</strong> numaralı sipariş kaydına bu oturumda ulaşılamadı. Geçmiş siparişlerinizi üye panelinizden kontrol edebilirsiniz.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Üye Paneline Git
            </Link>
            <Link href="/products" className="btn btn-secondary btn-sm">
              Ürün Kataloğuna Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPendingTransfer = order?.paymentStatus === 'pending';

  return (
    <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        {/* Header Status Card */}
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div className="glow-accent" />
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: isPendingTransfer ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${isPendingTransfer ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            {isPendingTransfer ? (
              <Clock size={36} color="var(--accent-amber)" />
            ) : (
              <CheckCircle2 size={38} color="var(--accent-emerald)" />
            )}
          </div>

          <span className={`badge ${isPendingTransfer ? 'badge-amber' : 'badge-emerald'}`} style={{ marginBottom: '0.75rem' }}>
            {isPendingTransfer ? 'HAVALE / EFT ÖDEMESİ BEKLENİYOR' : 'ÖDEME ONAYLANDI'}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            {isPendingTransfer ? 'Siparişiniz Kaydedildi!' : 'Siparişiniz ve Lisansınız Aktif!'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            {isPendingTransfer ? (
              <>
                Aşağıdaki banka hesabına açıklama kısmına sipariş numaranızı yazarak{' '}
                <strong>{order?.total.toLocaleString('tr-TR')} ₺</strong> tutarındaki ödemeyi gerçekleştirdikten sonra yönetici onayıyla birlikte{' '}
                <strong>{order?.customerEmail}</strong> hesabınızdaki lisanslar aktif edilir.
              </>
            ) : (
              <>
                Ödemeniz onaylandı ve yazılım lisanslarınız <strong>{order?.customerEmail}</strong> hesabınıza aktif olarak tanımlandı.
              </>
            )}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-elevated)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sipariş No:</span>
            <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {order?.orderNumber || orderId}
            </strong>
            {order?.orderNumber && (
              <button
                type="button"
                onClick={() => handleCopy(order.orderNumber)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                title="Sipariş numarasını kopyala"
              >
                {copiedText === order.orderNumber ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Pending Wire Transfer: Bank IBAN Card */}
        {isPendingTransfer && (
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
              <Landmark size={20} color="var(--accent-amber)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Havale / EFT / FAST Banka Bilgileri</h2>
            </div>

            {paymentSettings?.iban ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.86rem' }}>
                  <div style={{ background: 'var(--bg-elevated)', padding: '0.8rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Banka Adı</div>
                    <strong style={{ color: 'var(--text-main)' }}>{paymentSettings.bankName || 'Belirtilmedi'}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: '0.8rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Alıcı Adı / Ünvanı</div>
                    <strong style={{ color: 'var(--text-main)' }}>{paymentSettings.accountHolder || 'Belirtilmedi'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', background: '#070b14', border: '1px solid rgba(0,240,255,0.25)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Kopyalanabilir IBAN</div>
                    <code style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {paymentSettings.iban}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentSettings.iban.replace(/\s+/g, ''))}
                    className="btn btn-primary btn-sm"
                  >
                    {copiedText === paymentSettings.iban.replace(/\s+/g, '') ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedText === paymentSettings.iban.replace(/\s+/g, '') ? 'IBAN Kopyalandı' : 'IBAN Kopyala'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  Açıklama alanına <strong style={{ color: 'var(--primary)' }}>{order?.orderNumber}</strong> kodunu eklemeyi unutmayın.{' '}
                  {paymentSettings.transferNote}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Banka IBAN bilgileri yönetici panelinden henüz eklenmemiştir. Siparişiniz kaydedilmiştir; ödeme hesabı bilgisi için{' '}
                <strong>sudemkavuzkoz005@gmail.com</strong> adresi üzerinden iletişime geçebilirsiniz.
              </div>
            )}
          </div>
        )}

        {/* License Keys Section (only active once payment confirmed!) */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Key size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {isPendingTransfer ? 'Sipariş Kapsamındaki Ürünler (Onay Bekliyor)' : 'Aktif Lisans Anahtarlarınız'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order?.items ? (
              order.items.map((item) => {
                const licenseKey = order.licenseKeys[item.product.id] || '';
                return (
                  <div
                    key={`${item.product.id}-${item.licenseTier}`}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.product.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                        Paket: {item.licenseTier.toUpperCase()} • {item.quantity} Adet
                      </div>
                    </div>

                    {isPendingTransfer ? (
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        Ödeme Onayı Sonrası Açılır
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <code style={{ background: 'rgba(0,0,0,0.5)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {licenseKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(licenseKey)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.4rem 0.6rem' }}
                          aria-label="Lisans anahtarını kopyala"
                          title="Kopyala"
                        >
                          {copiedText === licenseKey ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Sipariş bilgileri yükleniyor...</div>
            )}
          </div>

          {downloadNotice && (
            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              ✓ {downloadNotice}
            </div>
          )}

          {order && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              {!isPendingTransfer && (
                <button
                  type="button"
                  onClick={() => {
                    downloadLicensePackage(order);
                    setDownloadNotice('Lisans anahtarı ve kurulum rehberi dosyası indirildi.');
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download size={15} />
                  <span>Lisans &amp; Kurulum Paketi İndir (.TXT)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  downloadInvoiceDocument(order);
                  setDownloadNotice('Sipariş & Fatura özeti indirildi.');
                }}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileText size={15} />
                <span>Sipariş Özeti İndir (HTML)</span>
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/products" className="btn btn-secondary">
            Kataloğa Dön
          </Link>

          <Link href="/dashboard" className="btn btn-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Üye Paneline Git</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
