'use client';

import React, { useState } from 'react';
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
  Headphones,
  Key,
  Mail,
  MessageCircle,
  Phone
} from 'lucide-react';
import {
  downloadInvoiceDocument,
  downloadLicensePackage,
  useIsClientHydrated,
  useOrders
} from '@/lib/orderStorage';
import { useAuth } from '@/context/AuthContext';
import {
  buildMailtoQuoteUrl,
  buildWhatsAppQuoteUrl,
  CUSTOMER_SUPPORT
} from '@/lib/contact';

export default function QuoteSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const clientOrders = useOrders();
  const { dbOrders } = useAuth();
  const isHydrated = useIsClientHydrated();

  const order = [...dbOrders, ...clientOrders].find(
    (o) => o.id === orderId || o.orderNumber === orderId
  );

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleCopy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedText(val);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (isHydrated && !order) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
        <div className="glass-card" style={{ maxWidth: '620px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Teklif / Talep Kaydı Bulunamadı
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            <strong>{orderId}</strong> numaralı teklif kaydına bu oturumda ulaşılamadı. Geçmiş taleplerinizi müşteri panelinizden kontrol edebilir veya doğrudan{' '}
            <strong>{CUSTOMER_SUPPORT.phoneDisplay}</strong> / <strong>{CUSTOMER_SUPPORT.email}</strong> üzerinden bizimle iletişime geçebilirsiniz.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Müşteri Paneline Git
            </Link>
            <Link href="/checkout" className="btn btn-secondary btn-sm">
              Yeni Teklif Oluştur
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPendingApproval = order?.paymentStatus === 'pending';

  const quoteParams = order
    ? {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        companyName: order.companyName,
        proposedBudget: order.proposedBudget,
        quoteNote: order.quoteNote,
        items: order.items,
        totalAmount: order.total
      }
    : { orderNumber: orderId };

  const whatsappUrl = buildWhatsAppQuoteUrl(quoteParams);
  const mailtoUrl = buildMailtoQuoteUrl(quoteParams);

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
              background: isPendingApproval ? 'rgba(0, 240, 255, 0.14)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${isPendingApproval ? 'rgba(0, 240, 255, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            {isPendingApproval ? (
              <Clock size={36} color="var(--primary)" />
            ) : (
              <CheckCircle2 size={38} color="var(--accent-emerald)" />
            )}
          </div>

          <span className={`badge ${isPendingApproval ? 'badge-cyan' : 'badge-emerald'}`} style={{ marginBottom: '0.75rem' }}>
            {isPendingApproval ? 'TEKLİF TALEBİ KAYDEDİLDİ — MÜŞTERİ HİZMETLERİ İLETİŞİMİ' : 'TEKLİF ONAYLANDI & LİSANS AKTİF'}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            {isPendingApproval ? 'Teklif Talebiniz Alındı!' : 'Lisansınız ve Üyeliğiniz Aktif!'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            {isPendingApproval ? (
              <>
                Web sitemiz üzerinden ödeme tahsilatı yapılmamaktadır. Aşağıdaki referans kodunuz ile Müşteri Hizmetleri hattımızdan (
                <strong>WhatsApp: {CUSTOMER_SUPPORT.phoneDisplay}</strong> veya <strong>{CUSTOMER_SUPPORT.email}</strong>) teklif görüşmenizi hemen tamamlayabilirsiniz.
              </>
            ) : (
              <>
                Teklifiniz yönetici tarafından onaylandı ve yazılım lisanslarınız <strong>{order?.customerEmail}</strong> hesabınıza aktif olarak tanımlandı.
              </>
            )}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-elevated)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Teklif Referans No:</span>
            <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {order?.orderNumber || orderId}
            </strong>
            {order?.orderNumber && (
              <button
                type="button"
                onClick={() => handleCopy(order.orderNumber)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                title="Referans numarasını kopyala"
              >
                {copiedText === order.orderNumber ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Customer Service Action Card */}
        {isPendingApproval && (
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderColor: 'rgba(0, 240, 255, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Headphones size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Teklifi İletmek İçin Müşteri Hizmetlerine Bağlanın</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Aşağıdaki butonlardan birine tıkladığınızda teklif kodunuz (<strong>{order?.orderNumber}</strong>), seçtiğiniz sistemler ve iletişim bilgileriniz otomatik olarak mesaj içine eklenir.
            </p>

            {(order?.proposedBudget || order?.quoteNote) && (
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.15rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                {order.proposedBudget && (
                  <div>
                    <strong style={{ color: 'var(--primary)' }}>Bütçe / Teklif Öneriniz:</strong> {order.proposedBudget}
                  </div>
                )}
                {order.quoteNote && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>Talep Notunuz:</strong> {order.quoteNote}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  background: '#10b981',
                  color: '#03150e',
                  fontWeight: 800,
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={17} />
                <span>WhatsApp ile Gönder ({CUSTOMER_SUPPORT.phoneDisplay})</span>
              </a>

              <a
                href={mailtoUrl}
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <Mail size={16} />
                <span>E-Posta ile Gönder ({CUSTOMER_SUPPORT.email})</span>
              </a>

              <a
                href={CUSTOMER_SUPPORT.telHref}
                className="btn btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                <Phone size={15} />
                <span>Telefonla Ara ({CUSTOMER_SUPPORT.phoneDisplay})</span>
              </a>
            </div>
          </div>
        )}

        {/* License Keys / Requested Packages Section */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Key size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {isPendingApproval ? 'Teklif İstenen Paketler (Görüşme & Onay Bekleniyor)' : 'Aktif Lisans Anahtarlarınız'}
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
                        {item.unitPrice > 0
                          ? `Paket: ${item.licenseTier.toUpperCase()} • ${item.quantity} Adet • Liste: ${(item.unitPrice * item.quantity).toLocaleString('tr-TR')} ₺`
                          : 'Özel Proje / Danışmanlık Teklif Talebi'}
                      </div>
                    </div>

                    {isPendingApproval ? (
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        Teklif Onayı Sonrası Açılır
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
              <div style={{ color: 'var(--text-muted)' }}>Talep bilgileri yükleniyor...</div>
            )}
          </div>

          {downloadNotice && (
            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              ✓ {downloadNotice}
            </div>
          )}

          {order && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              {!isPendingApproval && (
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
                  setDownloadNotice('Teklif ve talep özeti indirildi.');
                }}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileText size={15} />
                <span>Teklif Özeti İndir (HTML)</span>
              </button>
            </div>
          )}
        </div>

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
