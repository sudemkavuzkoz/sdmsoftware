'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Play,
  ShieldCheck,
  Key,
  CheckCircle2,
  ShoppingCart,
  Star,
  Eye,
  Mail,
  MessageCircle,
  Terminal,
  Zap,
  ExternalLink,
  Code2
} from 'lucide-react';
import { DemoProject, Product } from '@/lib/types';
import DemoRunner from '@/components/demos/DemoRunner';
import { buildMailtoQuoteUrl, buildWhatsAppQuoteUrl, CUSTOMER_SUPPORT } from '@/lib/contact';

interface DemoDetailClientProps {
  demo: DemoProject;
  linkedProduct: Product | null;
}

export default function DemoDetailClient({ demo, linkedProduct }: DemoDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'simulator' | 'features' | 'credentials'>('simulator');
  const [simulatorActivePulse, setSimulatorActivePulse] = useState(false);
  const simulatorRef = useRef<HTMLDivElement>(null);

  const scrollToSimulator = () => {
    setActiveTab('simulator');
    setSimulatorActivePulse(true);
    setTimeout(() => setSimulatorActivePulse(false), 1800);
    setTimeout(() => {
      simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const categoryEmoji: Record<string, string> = {
    travel_ai: '✈️',
    stock_prediction: '📈',
    clinic_system: '🏥',
    game: '🐾'
  };
  const categoryLabel: Record<string, string> = {
    travel_ai: 'Yapay Zeka Seyahat',
    stock_prediction: 'Finansal AI Analizi',
    clinic_system: 'Sağlık Yönetimi',
    game: '2D Oyun & Simülasyon'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* ── TOP HERO BANNER ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #07090e 0%, #0d1220 50%, #07090e 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '2.5rem 0 0'
        }}
      >
        <div className="container">
          <Link
            href="/demos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              marginBottom: '1.5rem',
              transition: 'color 0.2s'
            }}
          >
            <ArrowLeft size={15} /> Tüm Demolara Dön
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', paddingBottom: '2rem' }}>
            {/* Sol: Meta Bilgisi */}
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div className="live-indicator" style={{ background: 'rgba(0,240,255,0.06)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,240,255,0.18)' }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em' }}>CANLI ÇALIŞAN DEMO</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                  {categoryEmoji[demo.category] || '⚡'} {categoryLabel[demo.category] || 'Sistem Demo'}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
                {demo.title}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: '620px', marginBottom: '1.5rem' }}>
                {demo.fullDescription}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Eye size={14} color="var(--primary)" /> {demo.viewsCount.toLocaleString('tr-TR')} görüntülenme
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Star size={14} color="var(--accent-amber)" fill="var(--accent-amber)" /> {demo.likesCount.toLocaleString('tr-TR')} beğeni
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--accent-emerald)' }}>
                  <ShieldCheck size={14} /> GitHub Repodan Senkronize
                </div>
              </div>

              {/* CTA butonları */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={scrollToSimulator}
                  className="btn btn-primary"
                  style={{ fontSize: '0.92rem' }}
                >
                  <Play size={16} fill="#041019" /> Canlı Demoyu Kullan
                </button>
                {demo.liveUrl && (
                  <a
                    href={demo.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <ExternalLink size={15} /> Tam Ekran Aç
                  </a>
                )}
                {demo.githubUrl && (
                  <a
                    href={demo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <Code2 size={15} /> GitHub Kodu
                  </a>
                )}
                {linkedProduct && (
                  <Link
                    href={`/products/${linkedProduct.slug}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <ShoppingCart size={15} /> Paketi İncele — {linkedProduct.price.toLocaleString('tr-TR')} ₺
                  </Link>
                )}
                <a
                  href={buildWhatsAppQuoteUrl({ subject: linkedProduct ? linkedProduct.title : demo.title })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(16, 185, 129, 0.16)',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    color: '#34d399',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}
                >
                  <MessageCircle size={14} /> WhatsApp Teklif ({CUSTOMER_SUPPORT.phoneDisplay})
                </a>
                <a
                  href={buildMailtoQuoteUrl({ subject: linkedProduct ? linkedProduct.title : demo.title })}
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg,rgba(168,85,247,.15),rgba(99,102,241,.15))',
                    border: '1px solid rgba(168,85,247,.4)',
                    color: '#c084fc',
                    fontSize: '0.82rem'
                  }}
                >
                  <Mail size={14} /> Mail ile Teklif Al
                </a>
              </div>
            </div>

            {/* Sağ: Demo görsel */}
            <div style={{ flex: '0 0 auto', width: 'clamp(280px,35%,420px)', position: 'relative' }}>
              <div style={{ height: '220px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,240,255,0.12)', position: 'relative' }}>
                <Image
                  src={demo.imageUrl}
                  alt={demo.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 420px"
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,9,14,0.85) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {demo.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="tech-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigasyon */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
            {[
              { key: 'simulator', label: '⚡ Canlı Çalışan Demo' },
              { key: 'features', label: '🛠 Özellikler & Mimari' },
              ...(demo.credentials ? [{ key: 'credentials', label: '🔑 Giriş Bilgileri' }] : [])
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                style={{
                  padding: '0.85rem 1.4rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────── */}
      <div
        ref={simulatorRef}
        className="container"
        style={{ padding: '2.25rem 1.5rem 5rem', scrollMarginTop: '115px' }}
      >
        {activeTab === 'simulator' && (
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              transition: 'box-shadow 0.4s ease',
              boxShadow: simulatorActivePulse ? '0 0 0 2px var(--primary), 0 0 32px rgba(0,240,255,0.2)' : 'none',
              padding: simulatorActivePulse ? '0.6rem' : '0'
            }}
          >
            <DemoRunner demo={demo} />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid-cols-2">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="var(--primary)" /> Sistem Yetenekleri
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {demo.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', background: 'rgba(0,240,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,240,255,0.06)' }}>
                    <CheckCircle2 size={16} color="var(--primary)" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={18} color="var(--accent-purple)" /> Teknoloji Yığını
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {demo.techStack.map((t) => (
                    <span key={t} className="tech-tag" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="var(--accent-emerald)" /> Kaynak Kod &amp; Altyapı
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Bu demo, GitHub portföyünüzdeki ilgili repodan çekilen gerçek veri ve bileşenlerle tarayıcıda çalışır.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credentials' && demo.credentials && (
          <div style={{ maxWidth: '540px' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Key size={18} color="var(--primary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Test Kullanıcı Bilgileri</h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Harici demo sunucusuna bağlanırken bu test kimlik bilgilerini kullanabilirsiniz.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {[
                  { label: 'Kullanıcı E-Posta', value: demo.credentials.user, color: 'var(--primary)' },
                  { label: 'Demo Şifre', value: demo.credentials.pass, color: 'var(--accent-purple)' },
                  { label: 'Yetki Seviyesi', value: demo.credentials.role, color: 'var(--accent-amber)' }
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{item.label}:</span>
                    <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', color: item.color, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {item.value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
