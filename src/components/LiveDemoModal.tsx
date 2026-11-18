'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Check,
  Copy,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { DemoProject } from '@/lib/types';
import DemoRunner from './demos/DemoRunner';

export default function LiveDemoModal({ demo, onClose }: { demo: DemoProject | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'tech_specs' | 'credentials'>('simulation');

  const [prevDemoId, setPrevDemoId] = useState(demo?.id);
  if (demo?.id !== prevDemoId) {
    setPrevDemoId(demo?.id);
    setActiveTab('simulation');
  }

  useEffect(() => {
    if (!demo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demo, onClose]);

  if (!demo) return null;

  const handleCopyCredentials = () => {
    if (!demo.credentials) return;
    const text = `Kullanıcı: ${demo.credentials.user} | Şifre: ${demo.credentials.pass}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullScreenHref = demo.liveUrl || `/demos/${demo.slug}`;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={demo.title}
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1120px', width: '96%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="glow-accent" />

        {/* Modal Üst Çubuğu */}
        <div style={{ padding: '1rem 1.35rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="live-indicator">
              <span className="live-dot" />
              <span>CANLI ÇALIŞAN DEMO</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {demo.title}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {demo.githubUrl && (
              <a
                href={demo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.32rem 0.7rem' }}
              >
                <Code2 size={13} />
                <span>GitHub Repo</span>
              </a>
            )}
            <a
              href={fullScreenHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.32rem 0.7rem' }}
            >
              <span>Tam Ekran Aç</span>
              <ExternalLink size={13} />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Sekme Butonları */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.5rem 1.35rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('simulation')}
              className={`btn btn-sm ${activeTab === 'simulation' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              ⚡ Canlı Çalışan Sistem
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tech_specs')}
              className={`btn btn-sm ${activeTab === 'tech_specs' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              🛠 Mimari &amp; Özellikler
            </button>
            {demo.credentials && (
              <button
                type="button"
                onClick={() => setActiveTab('credentials')}
                className={`btn btn-sm ${activeTab === 'credentials' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem' }}
              >
                🔑 Demo Giriş Bilgileri
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Geliştirici: <strong>Sudem Kavuzkoz • SDM Software</strong>
          </div>
        </div>

        {/* Modal Gövdesi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#080c14' }}>
          {activeTab === 'simulation' && <DemoRunner demo={demo} />}

          {activeTab === 'tech_specs' && (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Teknik Mimari ve Özellikler</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {demo.fullDescription}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Kullanılan Teknoloji Yığını:
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {demo.techStack.map((t) => (
                    <span key={t} className="tech-tag" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Öne Çıkan Sistem Yetenekleri:
                </h5>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  {demo.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'credentials' && demo.credentials && (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Demo Giriş Yetkilendirme Bilgileri
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Harici demo sunucusuna bağlanırken aşağıdaki test kimlik bilgilerini kullanabilirsiniz:
              </p>

              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Kullanıcı E-Posta:</span>
                  <code style={{ background: 'rgba(0,0,0,0.4)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                    {demo.credentials.user}
                  </code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Demo Şifre:</span>
                  <code style={{ background: 'rgba(0,0,0,0.4)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
                    {demo.credentials.pass}
                  </code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Tanımlı Yetki / Rol:</span>
                  <span className="badge badge-cyan">{demo.credentials.role}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                >
                  {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  <span>{copied ? 'Bilgiler Kopyalandı!' : 'Giriş Bilgilerini Kopyala'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
