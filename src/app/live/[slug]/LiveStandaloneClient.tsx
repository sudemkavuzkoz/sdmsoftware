'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2 } from 'lucide-react';
import { DemoProject } from '@/lib/types';
import DemoRunner from '@/components/demos/DemoRunner';

export default function LiveStandaloneClient({ demo }: { demo: DemoProject }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050811' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.6rem 1.25rem',
          background: '#090d16',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link href={`/demos/${demo.slug}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}>
            <ArrowLeft size={13} /> Demo Detayı
          </Link>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{demo.title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {demo.githubUrl && (
            <a
              href={demo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
            >
              <Code2 size={13} /> GitHub Kaynağı
            </a>
          )}
          <Link href="/demos" className="btn btn-primary btn-sm" style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}>
            Tüm Demolar
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, padding: demo.slug === 'ai-travel-planner-demo' || demo.slug === 'protez-takip-sistemi-demo' || demo.slug === 'pati-bahcesi-demo' ? '0' : '1.5rem' }}>
        <DemoRunner demo={demo} fullHeight />
      </div>
    </div>
  );
}
