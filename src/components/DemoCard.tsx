'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Heart, Play, ExternalLink, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { DemoProject } from '@/lib/types';

interface DemoCardProps {
  demo: DemoProject;
  onOpenDemo: (demo: DemoProject) => void;
}

export default function DemoCard({ demo, onOpenDemo }: DemoCardProps) {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'erp_crm':
        return 'Kurumsal ERP & CRM';
      case 'ai_bot':
        return 'Yapay Zeka Destek Botu';
      case 'fintech':
        return 'Finansal Analitik';
      case 'b2b':
        return 'B2B Toptan Ticaret';
      default:
        return 'Sistem Vitrini';
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glow-accent" />

      {/* Görsel ve Canlı Gösterge */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#090d16' }}>
        <img
          src={demo.imageUrl}
          alt={demo.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7, 9, 14, 0.95) 0%, rgba(7, 9, 14, 0.2) 60%, transparent 100%)' }} />

        {/* Üst Canlı Durum */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(7, 9, 14, 0.75)', backdropFilter: 'blur(6px)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <div className="live-indicator">
              <span className="live-dot" />
              <span>CANLI SİSTEM</span>
            </div>
          </div>
        </div>

        {/* Görüntülenme / Beğeni */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '0.4rem' }}>
          <span className="badge" style={{ background: 'rgba(7, 9, 14, 0.75)', color: 'var(--text-muted)', backdropFilter: 'blur(4px)' }}>
            <Eye size={12} /> {demo.viewsCount}
          </span>
        </div>

        {/* Görsel Üzerindeki Başlık */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
            {getCategoryLabel(demo.category)}
          </span>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.25' }}>
            {demo.title}
          </h3>
        </div>
      </div>

      {/* Kart Gövdesi */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          {demo.shortDescription}
        </p>

        {/* Önemli Yetenekler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
          {demo.features.slice(0, 3).map((feat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Teknoloji Rozetleri */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem', marginTop: 'auto' }}>
          {demo.techStack.map(t => (
            <span key={t} className="tech-tag">
              {t}
            </span>
          ))}
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onOpenDemo(demo)}
            className="btn btn-primary"
            style={{ width: '100%', gap: '0.5rem', fontSize: '0.92rem' }}
          >
            <Play size={16} fill="#041019" />
            <span>Canlı Demoyu Deneyimle</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              href={`/demos/${demo.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <ExternalLink size={13} />
              <span>Ayrı Sekmede Aç</span>
            </Link>

            {demo.productSlug && (
              <Link
                href={`/products/${demo.productSlug}`}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.78rem', justifyContent: 'center' }}
              >
                <span>Lisansı Al</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
