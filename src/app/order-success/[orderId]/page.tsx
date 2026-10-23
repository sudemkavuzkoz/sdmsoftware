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
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { db } from '@/lib/db';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const order = db.getOrderById(orderId);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (keyText: string) => {
    navigator.clipboard?.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        {/* Tebrikler Kartı */}
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div className="glow-accent" />
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={38} color="var(--accent-emerald)" />
          </div>

          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
            ÖDEME BAŞARIYLA ALINDI
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Siparişiniz Onaylandı!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            Yazılım lisanslarınız üretildi ve <strong>{order?.customerEmail || 'e-posta adresinize'}</strong> teslim edildi.
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
                const licenseKey = order.licenseKeys[item.product.id] || 'SDM-PRO-KEY-9988-7766';
                return (
                  <div
                    key={item.product.id}
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
                        Lisans: {item.licenseTier.toUpperCase()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <code style={{ background: 'rgba(0,0,0,0.5)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {licenseKey}
                      </code>
                      <button
                        onClick={() => handleCopy(licenseKey)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.6rem' }}
                        title="Kopyala"
                      >
                        {copiedKey === licenseKey ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Lisans bilgisi hazırlanıyor...</div>
            )}
          </div>

          {/* İndirme Butonları */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Kaynak kod arşivi ve Docker compose şablonu indirilmeye başlandı.'); }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={15} />
              <span>Kaynak Kod & Kurulum Arşivini İndir (.ZIP)</span>
            </a>

            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('E-Fatura PDF belgesi oluşturuldu.'); }}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileText size={15} />
              <span>E-Fatura İndir (PDF)</span>
            </a>
          </div>
        </div>

        {/* Müşteri Paneline Git */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
