'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Download,
  Key,
  Copy,
  Check,
  FileText,
  ArrowRight,
  Clock
} from 'lucide-react';
import {
  useOrders,
  useIsClientHydrated,
  downloadLicensePackage,
  downloadInvoiceDocument
} from '@/lib/orderStorage';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const orders = useOrders();
  const isHydrated = useIsClientHydrated();
  const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleCopy = (keyText: string) => {
    navigator.clipboard?.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isHydrated && !order) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Sipariş Kaydı Bulunamadı
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            <strong>{orderId}</strong> numaralı sipariş kaydına bu tarayıcı oturumunda ulaşılamadı. Geçmiş siparişlerinizi müşteri panelinden kontrol edebilirsiniz.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Müşteri Paneline Git
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
        {/* Tebrikler / Onay Kartı */}
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
            {isPendingTransfer ? 'HAVALE / EFT ONAYI BEKLENİYOR' : 'ÖDEME BAŞARIYLA ALINDI'}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            {isPendingTransfer ? 'Siparişiniz Oluşturuldu!' : 'Siparişiniz Onaylandı!'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            {isPendingTransfer ? (
              <>
                Sipariş kaydınız alındı. Havale/EFT açıklamanıza sipariş numaranızı yazarak ödemeyi tamamladığınızda lisanslarınız{' '}
                <strong>{order?.customerEmail || 'e-posta adresinize'}</strong> aktive edilir.
              </>
            ) : (
              <>
                Yazılım lisanslarınız üretildi ve <strong>{order?.customerEmail || 'e-posta adresinize'}</strong> tanımlandı.
              </>
            )}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-elevated)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sipariş No:</span>
            <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {order?.orderNumber || orderId}
            </strong>
          </div>
        </div>

        {/* Lisans Anahtarları ve İndirme Bölümü */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Key size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Üretilen Lisans Anahtarları</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order?.items ? (
              order.items.map((item) => {
                const licenseKey = order.licenseKeys[item.product.id] || `SDM-${item.product.slug.substring(0, 4).toUpperCase()}-KEY-2026`;
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
                        Lisans: {item.licenseTier.toUpperCase()} • {item.quantity} Adet
                      </div>
                    </div>

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
                        {copiedKey === licenseKey ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                      </button>
                    </div>
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

          {/* İndirme Butonları */}
          {order && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
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
                <span>Lisans & Kurulum Paketi İndir (.TXT)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  downloadInvoiceDocument(order);
                  setDownloadNotice('E-Fatura özet belgesi indirildi.');
                }}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileText size={15} />
                <span>E-Fatura Özeti İndir (HTML)</span>
              </button>
            </div>
          )}
        </div>

        {/* Müşteri Paneline Git */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/products" className="btn btn-secondary">
            Kataloğa Dön
          </Link>

          <Link href="/dashboard" className="btn btn-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Müşteri Paneline Git</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
