'use client';

import React from 'react';
import { ExternalLink, Gamepad2 } from 'lucide-react';

export default function PatiBahcesiEmbed({ fullHeight = false }: { fullHeight?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: fullHeight ? '0' : 'var(--radius-lg)',
        overflow: 'hidden',
        border: fullHeight ? 'none' : '1px solid var(--border-subtle)',
        background: '#090d16',
        height: fullHeight ? '100vh' : '680px',
        minHeight: '560px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          background: '#0d1322',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
          <Gamepad2 size={17} color="#10b981" />
          <span>Pati Bahçesi — Gerçek Çalışan 2D Web Uygulaması</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href="/demos/pati-bahcesi/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.74rem', padding: '0.32rem 0.7rem' }}
          >
            <ExternalLink size={12} /> Tam Ekran Oyna
          </a>
          <a
            href="https://github.com/sudemkavuzkoz/Pati-Bah-esi"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '0.32rem 0.7rem' }}
          >
            <ExternalLink size={12} /> GitHub Kodu
          </a>
        </div>
      </div>

      <iframe
        src="/demos/pati-bahcesi/index.html"
        title="Pati Bahçesi Canlı Demo"
        style={{
          width: '100%',
          flex: 1,
          border: 'none',
          background: '#ffffff'
        }}
      />
    </div>
  );
}
