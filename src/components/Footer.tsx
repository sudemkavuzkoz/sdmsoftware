'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Shield, Cpu, Globe, Mail, MapPin, ExternalLink, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#05070a', borderTop: '1px solid var(--border-subtle)', marginTop: '5rem', position: 'relative' }}>
      <div className="glow-accent" />
      <div className="container" style={{ padding: '4rem 1.5rem 2rem' }}>
        <div className="grid-cols-4" style={{ marginBottom: '3.5rem' }}>
          {/* Kolon 1: Marka & Açıklama */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Terminal size={18} color="#07090e" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>SDM <span className="text-cyan">SOFTWARE</span></span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              Yapay zeka (AI Travel Planner), ADSP protez takip ve klinik randevu otomasyonları ile derin öğrenme tabanlı zaman serisi tahmin sistemleri geliştiren yazılım ekosistemi.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={14} color="var(--primary)" />
                <span>sdmsoftware.com.tr</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={14} color="var(--accent-purple)" />
                <a 
                  href="https://github.com/sudemkavuzkoz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-main)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  github.com/sudemkavuzkoz
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="var(--primary)" />
                <a
                  href="mailto:sudemkavuzkoz005@gmail.com"
                  style={{ color: 'var(--text-main)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  sudemkavuzkoz005@gmail.com
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="var(--primary)" />
                <span>İstanbul / Türkiye</span>
              </div>
            </div>
          </div>

          {/* Kolon 2: GitHub Portföyü & Geliştirilen Projeler */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Geliştirilen Projeler
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li>
                <Link href="/demos/ai-travel-planner-demo" style={{ transition: 'color 0.2s' }}>
                  AI Travel Planner (RAG &amp; Harita)
                </Link>
              </li>
              <li>
                <Link href="/demos/protez-takip-sistemi-demo" style={{ transition: 'color 0.2s' }}>
                  ADSP Protez Takip Sistemi
                </Link>
              </li>
              <li>
                <Link href="/demos/stock-price-prediction-demo" style={{ transition: 'color 0.2s' }}>
                  Zaman Serisi Tahmin Mimarisi
                </Link>
              </li>
              <li>
                <Link href="/demos/pati-bahcesi-demo" style={{ transition: 'color 0.2s' }}>
                  Pati Bahçesi (2D Evcil Hayvan Dünyası)
                </Link>
              </li>
              <li>
                <Link href="/demos/veteriner-klinik-demo" style={{ transition: 'color 0.2s' }}>
                  Veteriner Randevu &amp; Klinik Sistemi
                </Link>
              </li>
              <li>
                <Link href="/demos/sdm-clinic-system-demo" style={{ transition: 'color 0.2s' }}>
                  Dental Klinik Muayenehane Portalı
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolon 3: Canlı Sistem Vitrini */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Canlı Sistem Vitrini
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li>
                <a href="https://protez-takip-sistemi-adsp.vercel.app/dashboard/clinic" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Protez Takip Canlı Vercel Demosu</span>
                  <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <Link href="/live/ai-travel-planner-demo" style={{ transition: 'color 0.2s' }}>
                  AI Travel Planner Tam Ekran Demo
                </Link>
              </li>
              <li>
                <Link href="/live/stock-price-prediction-demo" style={{ transition: 'color 0.2s' }}>
                  Hisse Senedi &amp; Zaman Serisi Paneli
                </Link>
              </li>
              <li>
                <a href="/demos/pati-bahcesi/index.html" target="_blank" rel="noopener noreferrer" style={{ transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Pati Bahçesi Canlı Oyun</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <Link href="/demos/sdm-clinic-system-demo" style={{ transition: 'color 0.2s' }}>
                  Klinik &amp; Hekim Randevu Masası
                </Link>
              </li>
              <li>
                <a href="https://github.com/sudemkavuzkoz?tab=repositories" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>GitHub Repoları &amp; Kodlar →</span>
                  <ExternalLink size={13} />
                </a>
              </li>
            </ul>
          </div>

          {/* Kolon 4: Teknoloji & Standartlar */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Teknoloji & Standartlar
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Cpu size={16} color="var(--primary)" />
                <span>Next.js 16 & Modern TypeScript</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Layers size={16} color="var(--accent-purple)" />
                <span>Python & PyTorch AI Mimarisi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Shield size={16} color="var(--accent-emerald)" />
                <span>Vercel Bulut Dağıtımı & CI/CD</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
              Tüm açık kaynak projelere, veri modellerine ve canlı demolarımıza <strong style={{ color: 'var(--text-main)' }}>github.com/sudemkavuzkoz</strong> üzerinden doğrudan erişebilirsiniz.
            </div>
          </div>
        </div>

        {/* Alt Telif ve Yasal Haklar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <div>
            © {new Date().getFullYear()} SDM Software (sdmsoftware.com.tr). Tüm Hakları Saklıdır.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <Link href="/legal/kvkk" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/legal/mesafeli-satis" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link href="/legal/gizlilik-cerez" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
              Gizlilik & Çerez Politikası
            </Link>
            <Link href="/legal/iptal-iade" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
              İptal ve İade Koşulları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
