'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Play, ShieldCheck, Key, CheckCircle2, ShoppingCart,
  Compass, TrendingUp, Activity, Sparkles, RefreshCw, Plus,
  Star, Eye, Mail, Terminal, Zap, Clock, User, Phone
} from 'lucide-react';
import { DemoProject, Product } from '@/lib/types';

interface DemoDetailClientProps {
  demo: DemoProject;
  linkedProduct: Product | null;
}

export default function DemoDetailClient({ demo, linkedProduct }: DemoDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'simulator' | 'features' | 'credentials'>('simulator');

  // ── AI Travel Planner state ──────────────────────────────────────────
  const [travelCity, setTravelCity] = useState('Roma, İtalya');
  const [travelDays, setTravelDays] = useState('3');
  const [travelStyle, setTravelStyle] = useState('Tarih & Gastronomi');
  const [travelBudget, setTravelBudget] = useState(1200);
  const [travelGenerated, setTravelGenerated] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTravelPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTravelGenerated(false);
    setTimeout(() => { setIsGenerating(false); setTravelGenerated(true); }, 900);
  };

  // ── StockPred AI state ───────────────────────────────────────────────
  const [selectedStock, setSelectedStock] = useState('THYAO.IS');
  const [selectedHorizon, setSelectedHorizon] = useState('1 Ay');

  const stockDataMap: Record<string, { current: number; predicted: number; signal: string; rsi: number; sentiment: number; currency: string; change: number }> = {
    'THYAO.IS': { current: 318.5, predicted: 364.2, signal: 'GÜÇLÜ AL', rsi: 58.4, sentiment: 88, currency: '₺', change: 2.4 },
    'ASELS.IS': { current: 62.4,  predicted: 71.8,  signal: 'AL',        rsi: 54.1, sentiment: 84, currency: '₺', change: 1.1 },
    'EREGL.IS': { current: 48.9,  predicted: 53.2,  signal: 'TUT',       rsi: 49.3, sentiment: 62, currency: '₺', change: -0.3 },
    'AAPL':     { current: 232.0, predicted: 258.5, signal: 'GÜÇLÜ AL', rsi: 61.2, sentiment: 92, currency: '$', change: 1.8 },
    'NVDA':     { current: 138.5, predicted: 162.0, signal: 'GÜÇLÜ AL', rsi: 67.8, sentiment: 95, currency: '$', change: 3.2 },
  };
  const sd = stockDataMap[selectedStock] || stockDataMap['THYAO.IS'];
  const gain = (((sd.predicted - sd.current) / sd.current) * 100).toFixed(1);
  const signalColor = sd.signal.includes('GÜÇLÜ AL') ? 'var(--accent-emerald)' : sd.signal === 'AL' ? '#4ade80' : 'var(--accent-amber)';
  const barData = [38, 44, 42, 52, 58, 55, 67, 76, 84, 94];

  // ── Clinic state ─────────────────────────────────────────────────────
  const [clinicDoctor, setClinicDoctor] = useState('Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)');
  const [clinicTime, setClinicTime] = useState('11:30');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+90 532 ');
  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Selin Yılmaz', patient: 'Ahmet Karaca', time: '09:30', status: 'Onaylandı', color: 'var(--accent-emerald)' },
    { id: 2, doctor: 'Dt. Caner Eren', patient: 'Merve Tan', time: '10:15', status: 'Muayenede', color: 'var(--primary)' },
    { id: 3, doctor: 'Dr. Meltem Akın', patient: 'Burak Demir', time: '14:00', status: 'Beklemede', color: 'var(--accent-amber)' },
  ]);
  const [smsAlert, setSmsAlert] = useState<string | null>(null);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) return;
    setAppointments(prev => [
      { id: Date.now(), doctor: clinicDoctor.split('(')[0].trim(), patient: patientName, time: clinicTime, status: 'Onaylandı', color: 'var(--accent-emerald)' },
      ...prev
    ]);
    setSmsAlert(`Sayın ${patientName}, ${clinicDoctor.split('(')[0].trim()} için saat ${clinicTime} randevunuz oluşturulmuştur. ✓ SMS bildirimi gönderildi.`);
    setPatientName('');
    setTimeout(() => setSmsAlert(null), 5000);
  };

  const categoryEmoji: Record<string, string> = {
    travel_ai: '✈️', stock_prediction: '📈', clinic_system: '🏥'
  };
  const categoryLabel: Record<string, string> = {
    travel_ai: 'Yapay Zeka Seyahat', stock_prediction: 'Finansal AI Analizi', clinic_system: 'Sağlık Yönetimi'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>

      {/* ── TOP HERO BANNER ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #07090e 0%, #0d1220 50%, #07090e 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '2.5rem 0 0'
      }}>
        <div className="container">
          {/* Geri */}
          <Link href="/demos" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem',
            transition: 'color 0.2s'
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <ArrowLeft size={15} /> Tüm Demolara Dön
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', paddingBottom: '2rem' }}>
            {/* Sol: Meta Bilgisi */}
            <div style={{ flex: '1 1 400px' }}>
              {/* Canlı badge + kategori */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div className="live-indicator" style={{ background: 'rgba(0,240,255,0.06)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,240,255,0.18)' }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em' }}>CANLI İNTERAKTİF DEMO</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                  {categoryEmoji[demo.category]} {categoryLabel[demo.category] || 'Sistem Demo'}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
                {demo.title}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: '580px', marginBottom: '1.5rem' }}>
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
                  <ShieldCheck size={14} /> İzole Sandbox Ortamı
                </div>
              </div>

              {/* CTA butonları */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.92rem' }}
                >
                  <Play size={16} fill="#041019" /> Simülasyonu Başlat
                </button>
                {linkedProduct && (
                  <Link
                    href={`/products/${linkedProduct.slug}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.92rem' }}
                  >
                    <ShoppingCart size={16} /> Lisansı Satın Al — {linkedProduct.price.toLocaleString('tr-TR')} ₺
                  </Link>
                )}
                {linkedProduct && (
                  <a
                    href={`mailto:iletisim@sdmsoftware.com.tr?subject=Teklif%20-%20${encodeURIComponent(linkedProduct.title)}`}
                    className="btn btn-sm"
                    style={{
                      background: 'linear-gradient(135deg,rgba(168,85,247,.15),rgba(99,102,241,.15))',
                      border: '1px solid rgba(168,85,247,.4)', color: '#c084fc',
                      fontSize: '0.82rem'
                    }}
                  >
                    <Mail size={14} /> Teklif Al
                  </a>
                )}
              </div>
            </div>

            {/* Sağ: Demo görsel */}
            <div style={{ flex: '0 0 auto', width: 'clamp(280px,35%,420px)', position: 'relative' }}>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,240,255,0.12)', position: 'relative' }}>
                <img src={demo.imageUrl} alt={demo.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,9,14,0.85) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {demo.techStack.slice(0, 4).map(t => (
                      <span key={t} className="tech-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigasyon */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border-subtle)' }}>
            {[
              { key: 'simulator', label: '⚡ Canlı Simülatör' },
              { key: 'features', label: '🛠 Özellikler & Mimari' },
              ...(demo.credentials ? [{ key: 'credentials', label: '🔑 Giriş Bilgileri' }] : []),
            ].map(tab => (
              <button
                key={tab.key}
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
      <div className="container" style={{ padding: '2.5rem 0 5rem' }}>

        {/* ── SIMULATOR TAB ───────────────────────────────────────────── */}
        {activeTab === 'simulator' && (
          <div>

            {/* ══ AI TRAVEL PLANNER ══════════════════════════════════ */}
            {demo.slug === 'ai-travel-planner-demo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.75rem', alignItems: 'start' }}>
                {/* Form Paneli */}
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Compass size={20} color="var(--primary)" />
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Rota Parametrelerini Ayarla</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Destinasyon, gün sayısı ve temanı seç — yapay zeka anlık kişisel plan oluştursun.
                    </p>
                  </div>

                  <form onSubmit={handleGenerateTravelPlan} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label className="form-label">🌍 Destinasyon</label>
                      <select value={travelCity} onChange={e => setTravelCity(e.target.value)} className="form-select">
                        <option>Roma, İtalya</option>
                        <option>Tokyo, Japonya</option>
                        <option>Paris, Fransa</option>
                        <option>Kapadokya, Türkiye</option>
                        <option>Barselona, İspanya</option>
                        <option>Kyoto, Japonya</option>
                        <option>Dubai, BAE</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label className="form-label">📅 Süre</label>
                        <select value={travelDays} onChange={e => setTravelDays(e.target.value)} className="form-select">
                          <option value="1">1 Gün — Ekspres</option>
                          <option value="3">3 Gün — Tam Plan</option>
                          <option value="5">5 Gün — Detaylı</option>
                          <option value="7">7 Gün — Tam Tur</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">🎨 Tema</label>
                        <select value={travelStyle} onChange={e => setTravelStyle(e.target.value)} className="form-select">
                          <option>Tarih & Gastronomi</option>
                          <option>Doğa & Macera</option>
                          <option>Sanat & Mimari</option>
                          <option>Romantik Gezi</option>
                          <option>Aile Tatili</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">💰 Bütçe: ${travelBudget}</label>
                      <input type="range" min={400} max={4000} step={100} value={travelBudget}
                        onChange={e => setTravelBudget(+e.target.value)}
                        style={{ width: '100%', marginTop: '0.4rem', accentColor: 'var(--primary)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        <span>$400 Ekonomik</span><span>$4000 Lüks</span>
                      </div>
                    </div>
                    <button type="submit" disabled={isGenerating} className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
                      {isGenerating ? <><RefreshCw size={15} className="spin" /> Yapay Zeka Rota Çiziyor...</> : <><Sparkles size={15} /> Yapay Zeka ile Plan Oluştur</>}
                    </button>
                  </form>
                </div>

                {/* Sonuç Paneli */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>📍 Oluşturulan Seyahat Planı</h2>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>GPT-4o Tarafından Üretildi</span>
                  </div>

                  {isGenerating && (
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '3rem', textAlign: 'center' }}>
                      <RefreshCw size={32} color="var(--primary)" className="spin" style={{ marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Yapay zeka rotanızı analiz ediyor...</p>
                    </div>
                  )}

                  {travelGenerated && !isGenerating && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {/* Özet Kart */}
                      <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{travelCity} · {travelDays} Gün · {travelStyle}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>💸 Tahmini Bütçe: <strong style={{ color: 'var(--text-main)' }}>${travelBudget}</strong></div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🗓 Toplam Gün: <strong style={{ color: 'var(--text-main)' }}>{travelDays}</strong></div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⭐ Kalite: <strong style={{ color: 'var(--accent-amber)' }}>Premium</strong></div>
                        </div>
                      </div>

                      {/* Gün 1 */}
                      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderLeft: '3px solid var(--primary)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>GÜN 1 · Şehrin Kalbi & Tarihi Başlangıç</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {[
                            { time: '09:00', act: 'Yerel butik kafede geleneksel kahvaltı ve şehir orientasyonu' },
                            { time: '10:30', act: 'Tarihi anıtlar ve antik meydanlar rehberli yürüyüş turu' },
                            { time: '13:00', act: 'Bölgenin en popüler yerel lezzet restoranında öğle yemeği' },
                            { time: '15:30', act: 'Panoramik manzara noktası, gün batımı fotoğraf durağı' },
                            { time: '20:00', act: 'Canlı müzikli akşam yemeği ve gece kültür rotası' },
                          ].map(item => (
                            <div key={item.time} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(0,240,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>{item.time}</span>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.act}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gün 2+ */}
                      {travelDays !== '1' && (
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderLeft: '3px solid var(--accent-purple)' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>GÜN 2 · Sanat, Müzeler & Gastronomi Deneyimi</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                              { time: '10:00', act: 'Ulusal Sanat Müzesi ve mimari harikaları ziyareti' },
                              { time: '14:00', act: 'Yerel şef eşliğinde mutfak atölyesi ve lezzet tadım turu' },
                              { time: '18:30', act: 'Nehir veya sahil yürüyüşü, butik hediyelik alışveriş rotası' },
                            ].map(item => (
                              <div key={item.time} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-purple)', background: 'rgba(168,85,247,0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>{item.time}</span>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Konaklama Önerisi */}
                      <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <CheckCircle2 size={18} color="var(--accent-emerald)" />
                        <div style={{ fontSize: '0.82rem' }}>
                          <strong style={{ color: 'var(--accent-emerald)' }}>AI Konaklama Önerisi:</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>Şehir merkezine 5 dak. mesafede, 4 yıldızlı butik otel — ortalama ${Math.round(travelBudget * 0.35)} / gece</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ STOCKPRED AI ════════════════════════════════════════ */}
            {demo.slug === 'stock-price-prediction-demo' && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <TrendingUp size={20} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>StockPred AI — Derin Öğrenme Fiyat Analiz Paneli</h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    LSTM & Transformer modeliyle eğitilmiş finansal analiz motorunun anlık tahminlerini test edin.
                  </p>
                </div>

                {/* Kontrol Çubuğu */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>HİSSE:</span>
                    {['THYAO.IS', 'ASELS.IS', 'EREGL.IS', 'AAPL', 'NVDA'].map(s => (
                      <button key={s} onClick={() => setSelectedStock(s)}
                        className={`btn btn-sm ${selectedStock === s ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>VADE:</span>
                    {['1 Hafta', '1 Ay', '3 Ay'].map(h => (
                      <button key={h} onClick={() => setSelectedHorizon(h)}
                        className={`btn btn-sm ${selectedHorizon === h ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>{h}</button>
                    ))}
                  </div>
                </div>

                {/* Metrik Kartlar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Mevcut Fiyat', value: `${sd.current.toFixed(2)} ${sd.currency}`, sub: 'Son Kapanış', color: 'var(--text-main)', change: null },
                    { label: 'AI Hedef Fiyat', value: `${sd.predicted.toFixed(2)} ${sd.currency}`, sub: `↑ +%${gain} Beklenen`, color: 'var(--primary)', change: null },
                    { label: 'Model Sinyali', value: sd.signal, sub: 'Transformer Güveni', color: signalColor, change: null },
                    { label: 'Sentiment Skoru', value: `%${sd.sentiment}`, sub: 'Pozitif Haber', color: 'var(--accent-purple)', change: null },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: m.color, lineHeight: 1.1 }}>{m.value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Grafik Simülasyonu */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedStock} — {selectedHorizon} Projeksiyon Eğrisi</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>LSTM-Attention Transformer v3 · Günlük güncelleme</div>
                    </div>
                    <span className="badge badge-cyan" style={{ alignSelf: 'flex-start' }}>Model: LSTM-Attention v3</span>
                  </div>

                  {/* Bar Grafik */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '130px', gap: '0.4rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                    {/* Yatay çizgiler */}
                    {[25, 50, 75].map(p => (
                      <div key={p} style={{ position: 'absolute', left: '1rem', right: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', bottom: `calc(${p}% + 1rem)' ` }} />
                    ))}
                    {barData.map((val, idx) => (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{
                          width: '100%', height: `${val}%`,
                          background: idx >= 7
                            ? 'linear-gradient(to top, #6366f1, #00f0ff)'
                            : idx >= 5
                              ? 'rgba(0,240,255,0.35)'
                              : 'rgba(255,255,255,0.12)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.5s ease',
                          position: 'relative'
                        }}>
                          {idx >= 7 && (
                            <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              AI ↑
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                          {idx >= 7 ? `+${idx - 6}h` : `t-${7 - idx}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Açıklama */}
                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                      { color: 'rgba(255,255,255,0.12)', label: 'Geçmiş Veri' },
                      { color: 'rgba(0,240,255,0.35)', label: 'Geçiş Dönemi' },
                      { color: 'linear-gradient(90deg,#6366f1,#00f0ff)', label: 'AI Projeksiyon' },
                    ].map(l => (
                      <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        <div style={{ width: '14px', height: '8px', borderRadius: '2px', background: l.color }} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* RSI Göstergesi */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>RSI Teknik Göstergesi — {selectedStock}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '8px', background: 'linear-gradient(90deg,#f43f5e,#f59e0b,#10b981)', borderRadius: 'var(--radius-full)', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: `${sd.rsi}%`, top: '50%', transform: 'translate(-50%,-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--text-main)', border: '2px solid var(--bg-main)', boxShadow: '0 0 8px rgba(0,240,255,0.5)', transition: 'left 0.4s ease' }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: sd.rsi > 60 ? 'var(--accent-emerald)' : sd.rsi < 40 ? '#f43f5e' : 'var(--accent-amber)', minWidth: '50px', textAlign: 'right' }}>RSI {sd.rsi}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                    <span>0 — Aşırı Satım</span><span>50 — Nötr</span><span>100 — Aşırı Alım</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══ SDM KLİNİK ══════════════════════════════════════════ */}
            {demo.slug === 'sdm-clinic-system-demo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.75rem', alignItems: 'start' }}>
                {/* Form */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Activity size={20} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Yeni Randevu Oluştur</h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    Formu doldurun — sistem takvime ekler, SMS bildirimi simüle eder.
                  </p>

                  {smsAlert && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', gap: '0.5rem' }}>
                      <span>📲</span><span>{smsAlert}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateAppointment} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label className="form-label">👨‍⚕️ Hekim & Branş</label>
                      <select value={clinicDoctor} onChange={e => setClinicDoctor(e.target.value)} className="form-select">
                        <option>Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)</option>
                        <option>Dt. Caner Eren (Diş Hekimi)</option>
                        <option>Dr. Meltem Akın (Dermatoloji)</option>
                        <option>Dr. Kemal Özturk (Ortopedi)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">⏰ Randevu Saati</label>
                      <select value={clinicTime} onChange={e => setClinicTime(e.target.value)} className="form-select">
                        {['08:30','09:00','09:30','10:00','10:30','11:30','13:00','14:15','15:00','16:00','16:30'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">👤 Hasta Adı Soyadı</label>
                      <input type="text" required placeholder="örn: Mehmet Kaya" value={patientName}
                        onChange={e => setPatientName(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">📱 Telefon (SMS)</label>
                      <input type="text" value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)} className="form-input" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      <Plus size={15} /> Randevu Ekle & SMS Gönder
                    </button>
                  </form>
                </div>

                {/* Randevu Listesi */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>📋 Günün Randevu Takvimi</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    {/* Tablo Başlığı */}
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1.5fr 100px', padding: '0.65rem 1.25rem', background: 'var(--bg-elevated)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <div>SAAT</div><div>HASTA</div><div>HEKİM</div><div>DURUM</div>
                    </div>

                    {appointments.map((a, idx) => (
                      <div key={a.id} style={{
                        display: 'grid', gridTemplateColumns: '70px 1fr 1.5fr 100px',
                        padding: '0.85rem 1.25rem', alignItems: 'center',
                        borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        transition: 'background 0.2s',
                        animation: idx === 0 && appointments.length > 3 ? 'fadeIn 0.4s ease' : 'none'
                      }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>{a.time}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{a.patient}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{a.doctor}</div>
                        <div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: `${a.color}18`, color: a.color,
                            border: `1px solid ${a.color}40`
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.color }} />
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* İstatistik Kartları */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                    {[
                      { label: 'Toplam Randevu', value: appointments.length, color: 'var(--primary)' },
                      { label: 'Muayenede', value: appointments.filter(a => a.status === 'Muayenede').length, color: 'var(--accent-emerald)' },
                      { label: 'Beklemede', value: appointments.filter(a => a.status === 'Beklemede').length, color: 'var(--accent-amber)' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FEATURES TAB ────────────────────────────────────────────── */}
        {activeTab === 'features' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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
                  {demo.techStack.map(t => (
                    <span key={t} className="tech-tag" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="var(--accent-emerald)" /> Güvenlik & Altyapı
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Demo ortamı izole Docker sandbox içinde çalışır. Eklenen test verileri 24 saatte bir temizlenir.
                  Canlı üretim ortamı için dedicated sunucu tahsis edilir ve SLA %99.9 uptime garantisi verilir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── CREDENTIALS TAB ─────────────────────────────────────────── */}
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
                  { label: 'Yetki Seviyesi', value: demo.credentials.role, color: 'var(--accent-amber)' },
                ].map(item => (
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

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
