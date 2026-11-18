'use client';

import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { DemoProject } from '@/lib/types';
import AiTravelPlannerApp from './AiTravelPlannerApp';
import StockPredictionApp from './StockPredictionApp';
import ProtezTakipApp from './ProtezTakipApp';
import PatiBahcesiEmbed from './PatiBahcesiEmbed';
import { DentalClinicApp, VeterinerClinicApp } from './ClinicAndVetApps';

interface DemoRunnerProps {
  demo: DemoProject;
  fullHeight?: boolean;
}

export default function DemoRunner({ demo, fullHeight = false }: DemoRunnerProps) {
  switch (demo.slug) {
    case 'ai-travel-planner-demo':
      return <AiTravelPlannerApp fullHeight={fullHeight} />;
    case 'stock-price-prediction-demo':
      return <StockPredictionApp fullHeight={fullHeight} />;
    case 'protez-takip-sistemi-demo':
      return <ProtezTakipApp fullHeight={fullHeight} />;
    case 'pati-bahcesi-demo':
      return <PatiBahcesiEmbed fullHeight={fullHeight} />;
    case 'sdm-clinic-system-demo':
      return <DentalClinicApp fullHeight={fullHeight} />;
    case 'veteriner-klinik-demo':
      return <VeterinerClinicApp fullHeight={fullHeight} />;
    default:
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Sparkles size={32} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>{demo.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Bu demonun canlı arayüzünü yeni sekmede açarak inceleyebilirsiniz.
          </p>
          {demo.liveUrl && (
            <a href={demo.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              <ExternalLink size={14} /> Canlı Sistemi Aç
            </a>
          )}
        </div>
      );
  }
}
