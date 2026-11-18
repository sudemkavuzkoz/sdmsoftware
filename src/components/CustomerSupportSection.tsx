'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Copy,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck
} from 'lucide-react';
import {
  buildMailtoQuoteUrl,
  buildWhatsAppQuoteUrl,
  CUSTOMER_SUPPORT,
  QuoteMessageParams
} from '@/lib/contact';

interface CustomerSupportSectionProps {
  id?: string;
  quoteParams?: QuoteMessageParams;
  showQuoteFormLink?: boolean;
  compact?: boolean;
}

export default function CustomerSupportSection({
  id = 'musteri-hizmetleri',
  quoteParams,
  showQuoteFormLink = true,
  compact = false
}: CustomerSupportSectionProps) {
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);

  const handleCopy = (field: 'phone' | 'email', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const whatsappUrl = buildWhatsAppQuoteUrl(
    quoteParams ?? { subject: 'Yazılım Lisansı & Özel Teklif Talebi' }
  );
  const mailtoUrl = buildMailtoQuoteUrl(
    quoteParams ?? { subject: 'Yazılım Lisansı & Özel Teklif Talebi' }
  );

  return (
    <section id={id} style={{ scrollMarginTop: '6rem' }}>
      <div
        className="glass-card"
        style={{
          padding: compact ? '1.75rem' : '2.75rem 2.25rem',
          background: 'linear-gradient(135deg, #0b111e 0%, #131c31 100%)',
          border: '1px solid rgba(0, 240, 255, 0.28)'
        }}
      >
        <div className="glow-accent" />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
              <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Headphones size={12} /> MÜŞTERİ HİZMETLERİ &amp; TEKLİF HATTI
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                {CUSTOMER_SUPPORT.hours}
              </span>
            </div>
            <h2 style={{ fontSize: compact ? '1.35rem' : 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.55rem' }}>
              Web Sitesinden Ödeme Alınmaz — <span className="text-gradient">Doğrudan Teklif Verin</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {CUSTOMER_SUPPORT.noWebPaymentNotice}
            </p>
          </div>

          {showQuoteFormLink && (
            <Link
              href="/checkout"
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Send size={16} />
              <span>Teklif Talebi Oluştur</span>
            </Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
          {/* WhatsApp / Telefon Kartı */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.9rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  WhatsApp &amp; Telefon Müşteri Hizmetleri
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('phone', CUSTOMER_SUPPORT.phoneDigits)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                  title="Telefon numarasını kopyala"
                >
                  {copiedField === 'phone' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  <span>{copiedField === 'phone' ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                {CUSTOMER_SUPPORT.phoneDisplay}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                WhatsApp üzerinden seçtiğiniz ürün/paket için anında fiyat teklifi yazabilirsiniz.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: '#03150e',
                  fontWeight: 800,
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp&apos;tan Teklif Ver</span>
              </a>
              <a
                href={CUSTOMER_SUPPORT.telHref}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Phone size={14} />
                <span>Ara</span>
              </a>
            </div>
          </div>

          {/* E-Posta Kartı */}
          <div
            style={{
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.9rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  E-Posta Teklif &amp; Destek
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('email', CUSTOMER_SUPPORT.email)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                  title="E-posta adresini kopyala"
                >
                  {copiedField === 'email' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  <span>{copiedField === 'email' ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', marginBottom: '0.25rem' }}>
                {CUSTOMER_SUPPORT.email}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Kurumsal şartname, özel geliştirme veya lisans teklif taleplerinizi e-posta ile iletebilirsiniz.
              </p>
            </div>

            <a
              href={mailtoUrl}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                borderColor: 'rgba(0, 240, 255, 0.4)',
                color: 'var(--primary)',
                fontWeight: 700,
                justifyContent: 'center'
              }}
            >
              <Mail size={15} />
              <span>E-Posta ile Teklif Gönder</span>
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>Görüşme ve teklif mutabakatı sağlandığında lisans anahtarınız ve Premium hesabınız yönetici tarafından anında tanımlanır.</span>
        </div>
      </div>
    </section>
  );
}
