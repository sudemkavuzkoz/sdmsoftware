'use client';

import React, { useState } from 'react';
import { ShieldCheck, MessageCircle, Mail } from 'lucide-react';
import { db } from '@/lib/db';
import { DemoProject } from '@/lib/types';
import DemoCard from '@/components/DemoCard';
import LiveDemoModal from '@/components/LiveDemoModal';
import { buildMailtoQuoteUrl, buildWhatsAppQuoteUrl, CUSTOMER_SUPPORT } from '@/lib/contact';

export default function DemosPage() {
  const allDemos = db.getDemos();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);

  const categories = [
    { id: 'all', label: 'Tüm Canlı Demolar' },
    { id: 'travel_ai', label: 'AI Travel Planner' },
    { id: 'stock_prediction', label: 'Hisse Senedi Tahmini' },
    { id: 'clinic_system', label: 'Klinik & Sağlık Sistemleri' },
    { id: 'game', label: '2D Oyun & Simülasyon' }
  ];

  const filteredDemos = allDemos.filter(d => selectedCategory === 'all' || d.category === selectedCategory);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Başlık Bölümü */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3.5rem' }}>
        <div className="live-indicator" style={{ marginBottom: '0.75rem', justifyContent: 'center' }}>
          <span className="live-dot" />
          <span>İNTERAKTİF SİSTEM DEMOLARI</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Geliştirdiğimiz Sistemlerin <span className="text-gradient">Canlı Vitrini</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          GitHub repolarımızdan çekilen AI Travel Planner (200 ülke RAG &amp; Harita), Zaman Serisi Tahmin Mimarisi, ADSP Protez Takip, Pati Bahçesi ve Klinik sistemlerimizi tarayıcınızda canlı deneyimleyin.
        </p>
      </div>

      {/* Kategori Seçici */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '3rem' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1.1rem' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Demo Kartları Izgarası */}
      <div className="grid-cols-3" style={{ marginBottom: '4rem' }}>
        {filteredDemos.map((demo) => (
          <DemoCard
            key={demo.id}
            demo={demo}
            onOpenDemo={(d) => setSelectedDemo(d)}
          />
        ))}
      </div>

      {/* Canlı Demo Modalı */}
      <LiveDemoModal
        demo={selectedDemo}
        onClose={() => setSelectedDemo(null)}
      />

      {/* Alt Bilgi & Sandbox Güvenlik Notu */}
      <div className="glass-card" style={{ padding: '2.5rem', background: 'rgba(13, 18, 29, 0.6)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>İzole Sandbox ve Güvenli Test Ortamı</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '650px', lineHeight: '1.5' }}>
              Demolarımız izole konteynerlerde (Docker sandbox) çalışır. Eklediğiniz test verileri periyodik olarak temizlenir. Gerçek müşteri projelerinizin altyapısına kurulurken bağımsız dedicated sunucular tahsis edilir.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <a
              href={buildWhatsAppQuoteUrl({ subject: 'Özel Şirket Demosu & Teklif Talebi' })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{ background: '#10b981', color: '#03150e', fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              <MessageCircle size={15} /> WhatsApp ({CUSTOMER_SUPPORT.phoneDisplay})
            </a>
            <a
              href={buildMailtoQuoteUrl({ subject: 'Özel Şirket Demosu Talebi' })}
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              <Mail size={15} /> E-Posta ile Talep Et
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
