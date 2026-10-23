'use client';

import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  Send, 
  Sparkles, 
  MapPin, 
  Compass, 
  Calendar, 
  TrendingUp, 
  Activity, 
  User, 
  Phone, 
  Clock, 
  Plus, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { DemoProject } from '@/lib/types';

interface LiveDemoModalProps {
  demo: DemoProject | null;
  onClose: () => void;
}

export default function LiveDemoModal({ demo, onClose }: { demo: DemoProject | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'tech_specs' | 'credentials'>('simulation');

  // 1. AI TRAVEL PLANNER SİMÜLATÖRÜ
  const [travelCity, setTravelCity] = useState('Roma, İtalya');
  const [travelDays, setTravelDays] = useState('3');
  const [travelStyle, setTravelStyle] = useState('Tarih & Gastronomi');
  const [travelBudget, setTravelBudget] = useState(1200);
  const [travelGenerated, setTravelGenerated] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleGenerateTravelPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setIsGeneratingPlan(false);
      setTravelGenerated(true);
    }, 700);
  };

  // 2. STOCK PRED AI SİMÜLATÖRÜ
  const [selectedStock, setSelectedStock] = useState('THYAO.IS');
  const [selectedHorizon, setSelectedHorizon] = useState('1 Ay');
  const [selectedModel, setSelectedModel] = useState('Transformer + LSTM');

  const stockDataMap: Record<string, { current: number; predicted: number; signal: string; rsi: number; sentiment: number; currency: string }> = {
    'THYAO.IS': { current: 318.5, predicted: 364.2, signal: 'GÜÇLÜ AL (%89)', rsi: 58.4, sentiment: 88, currency: '₺' },
    'ASELS.IS': { current: 62.4, predicted: 71.8, signal: 'AL (%82)', rsi: 54.1, sentiment: 84, currency: '₺' },
    'EREGL.IS': { current: 48.9, predicted: 53.2, signal: 'TUT (%68)', rsi: 49.3, sentiment: 62, currency: '₺' },
    'AAPL': { current: 232.0, predicted: 258.5, signal: 'GÜÇLÜ AL (%91)', rsi: 61.2, sentiment: 92, currency: '$' },
    'NVDA': { current: 138.5, predicted: 162.0, signal: 'GÜÇLÜ AL (%94)', rsi: 67.8, sentiment: 95, currency: '$' }
  };

  const activeStockInfo = stockDataMap[selectedStock] || stockDataMap['THYAO.IS'];
  const potentialGain = (((activeStockInfo.predicted - activeStockInfo.current) / activeStockInfo.current) * 100).toFixed(1);

  // 3. KLİNİK SİSTEMİ SİMÜLATÖRÜ
  const [clinicDoctor, setClinicDoctor] = useState('Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)');
  const [clinicDate, setClinicDate] = useState('14 Ekim 2026');
  const [clinicTime, setClinicTime] = useState('11:30');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+90 532 ');
  const [patientComplaint, setPatientComplaint] = useState('');
  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)', patient: 'Ahmet Karaca', time: '09:30', status: 'Onaylandı' },
    { id: 2, doctor: 'Dt. Caner Eren (Diş Hekimi)', patient: 'Merve Tan', time: '10:15', status: 'Muayenede' },
    { id: 3, doctor: 'Dr. Meltem Akın (Dermatoloji)', patient: 'Burak Demir', time: '14:00', status: 'Beklemede' }
  ]);
  const [clinicSmsAlert, setClinicSmsAlert] = useState<string | null>(null);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) return;
    const newApt = {
      id: Date.now(),
      doctor: clinicDoctor,
      patient: patientName,
      time: clinicTime,
      status: 'Onaylandı'
    };
    setAppointments([newApt, ...appointments]);
    setClinicSmsAlert(`Sayın ${patientName}, ${clinicDoctor} için ${clinicDate} saat ${clinicTime} randevunuz oluşturulmuştur. SMS bildirimi iletilmiştir.`);
    setPatientName('');
    setTimeout(() => setClinicSmsAlert(null), 5000);
  };

  if (!demo) return null;

  const handleCopyCredentials = () => {
    if (!demo.credentials) return;
    const text = `Kullanıcı: ${demo.credentials.user} | Şifre: ${demo.credentials.pass}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '980px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="glow-accent" />

        {/* Modal Üst Çubuğu */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="live-indicator">
              <span className="live-dot" />
              <span>CANLI SİSTEM VİTRİNİ</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {demo.title}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <a
              href={`/demos/${demo.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              <span>Ayrı Sekmede Aç</span>
              <ExternalLink size={13} />
            </a>
            <button
              onClick={onClose}
              aria-label="Kapat"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Sekme Butonları */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1.5rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`btn btn-sm ${activeTab === 'simulation' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              ⚡ Canlı İnteraktif Simülatör
            </button>
            <button
              onClick={() => setActiveTab('tech_specs')}
              className={`btn btn-sm ${activeTab === 'tech_specs' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              🛠 Mimari & Özellikler
            </button>
            {demo.credentials && (
              <button
                onClick={() => setActiveTab('credentials')}
                className={`btn btn-sm ${activeTab === 'credentials' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem' }}
              >
                🔑 Demo Giriş Bilgileri
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Geliştirici: <strong>SDM Software Mühendisliği</strong>
          </div>
        </div>

        {/* Modal Gövdesi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#080c14' }}>
          {activeTab === 'simulation' && (
            <div>
              {/* 1. AI TRAVEL PLANNER DEMO */}
              {demo.slug === 'ai-travel-planner-demo' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Compass size={20} color="var(--primary)" />
                      Yapay Zeka Destekli Rota & Seyahat Simülatörü
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Destinasyon, gün sayısı ve ilgi alanı seçerek yapay zekanın anlık kişiselleştirilmiş saatlik seyahat planı oluşturmasını test edin.
                    </p>
                  </div>

                  {/* Parametre Seçim Formu */}
                  <form onSubmit={handleGenerateTravelPlan} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <label className="form-label">Destinasyon Şehir</label>
                        <select value={travelCity} onChange={(e) => setTravelCity(e.target.value)} className="form-select">
                          <option value="Roma, İtalya">Roma, İtalya</option>
                          <option value="Tokyo, Japonya">Tokyo, Japonya</option>
                          <option value="Paris, Fransa">Paris, Fransa</option>
                          <option value="Kapadokya, Türkiye">Kapadokya, Türkiye</option>
                          <option value="Barselona, İspanya">Barselona, İspanya</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Süre (Gün)</label>
                        <select value={travelDays} onChange={(e) => setTravelDays(e.target.value)} className="form-select">
                          <option value="1">1 Günlük Ekspres</option>
                          <option value="3">3 Günlük Tam Plan</option>
                          <option value="5">5 Günlük Detaylı</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Seyahat Teması</label>
                        <select value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)} className="form-select">
                          <option value="Tarih & Gastronomi">Tarih & Gastronomi</option>
                          <option value="Doğa & Macera">Doğa & Macera</option>
                          <option value="Sanat & Mimari">Sanat & Mimari</option>
                          <option value="Romantik Gezi">Romantik Gezi</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Bütçe: ${travelBudget}</label>
                        <input
                          type="range"
                          min="400"
                          max="3000"
                          step="100"
                          value={travelBudget}
                          onChange={(e) => setTravelBudget(parseInt(e.target.value))}
                          style={{ width: '100%', marginTop: '0.4rem', accentColor: 'var(--primary)' }}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={isGeneratingPlan} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      {isGeneratingPlan ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                      <span>{isGeneratingPlan ? 'Yapay Zeka Rota Çiziyor...' : 'Yapay Zeka ile Rota ve Saatlik Planı Oluştur'}</span>
                    </button>
                  </form>

                  {/* Üretilen Plan Görünümü */}
                  {travelGenerated && (
                    <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>📍 {travelCity} — {travelDays} Günlük Optimize Rota</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tema: {travelStyle} • Tahmini Toplam Harcama: ~${travelBudget}</div>
                        </div>
                        <span className="badge badge-emerald">Yapay Zeka Tarafından Üretildi</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>GÜN 1: Şehrin Kalbi ve Tarihi Başlangıç</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.5' }}>
                            <strong>09:00</strong> — Yerel butik kafede geleneksel kahvaltı ve karşılama.<br />
                            <strong>10:30</strong> — Antik meydanlar ve tarihi anıtlar rehberli yürüyüş turu.<br />
                            <strong>13:00</strong> — Bölgenin en popüler yerel lezzet restoranında öğle yemeği.<br />
                            <strong>15:30</strong> — Panoramik manzara tepesinde gün batımı fotoğraf noktası.<br />
                            <strong>20:00</strong> — Canlı akustik müzikli akşam yemeği ve gece rotası.
                          </div>
                        </div>

                        {travelDays !== '1' && (
                          <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-purple)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>GÜN 2: Sanat, Müzeler ve Gastronomi Deneyimi</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.5' }}>
                              <strong>10:00</strong> — Ulusal Sanat Müzesi ve mimari harikaları ziyareti.<br />
                              <strong>14:00</strong> — Yerel şef eşliğinde gastronomi atölyesi ve tadım turu.<br />
                              <strong>18:30</strong> — Nehir kıyısında yürüyüş ve hediyelik alışveriş rotası.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. STOCK PRED AI DEMO */}
              {demo.slug === 'stock-price-prediction-demo' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={20} color="var(--primary)" />
                      StockPred AI — Derin Öğrenme Fiyat Tahmin Modeli
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      LSTM ve Transformer sinir ağları ile eğitilmiş modelin anlık fiyat tahminlerini, RSI ve duygu analizi skorlarını canlı test edin.
                    </p>
                  </div>

                  {/* Hisse ve Model Kontrolleri */}
                  <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Hisse Seç:</span>
                      {['THYAO.IS', 'ASELS.IS', 'EREGL.IS', 'AAPL', 'NVDA'].map((stock) => (
                        <button
                          key={stock}
                          onClick={() => setSelectedStock(stock)}
                          className={`btn btn-sm ${selectedStock === stock ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                        >
                          {stock}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Vade:</span>
                      {['1 Hafta', '1 Ay', '3 Ay'].map((hor) => (
                        <button
                          key={hor}
                          onClick={() => setSelectedHorizon(hor)}
                          className={`btn btn-sm ${selectedHorizon === hor ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                        >
                          {hor}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tahmin Kartları Metrikleri */}
                  <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mevcut Fiyat</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {activeStockInfo.current.toFixed(2)} {activeStockInfo.currency}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Son Kapanış Verisi</div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AI Model Hedef Fiyat</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {activeStockInfo.predicted.toFixed(2)} {activeStockInfo.currency}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        ↑ +%{potentialGain} Beklenen Getiri
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Model Sinyali</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        {activeStockInfo.signal}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Transformer Güveni</div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Haber Duygu Skoru</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                        %{activeStockInfo.sentiment}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>Pozitif Sentiment</div>
                    </div>
                  </div>

                  {/* Simüle Edilen Tahmin Eğrisi Çubuğu */}
                  <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{selectedStock} {selectedHorizon} Projeksiyon Eğrisi Simülasyonu</span>
                      <span className="badge badge-cyan">Model: LSTM-Attention v3</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '90px', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      {[40, 48, 45, 54, 62, 59, 70, 78, 85, 94].map((val, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div
                            style={{
                              width: '100%',
                              height: `${val}%`,
                              background: idx >= 7 ? 'linear-gradient(to top, #6366f1, #00f0ff)' : 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '3px 3px 0 0',
                              transition: 'height 0.4s ease'
                            }}
                          />
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                            {idx >= 7 ? `+${idx-6}h` : `t-${7-idx}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. KLİNİK VE POLİKLİNİK SİSTEMİ DEMO */}
              {demo.slug === 'sdm-clinic-system-demo' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={20} color="var(--primary)" />
                      SDM Klinik — Canlı Randevu & Hasta Takip Simülatörü
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Aşağıdaki formdan canlı sisteme hasta randevusu oluşturun, hekim takvimine anında düşmesini ve SMS bildirimini test edin.
                    </p>
                  </div>

                  {clinicSmsAlert && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                      📲 {clinicSmsAlert}
                    </div>
                  )}

                  {/* Yeni Randevu Formu */}
                  <form onSubmit={handleCreateAppointment} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label className="form-label">Hekim & Branş</label>
                        <select value={clinicDoctor} onChange={(e) => setClinicDoctor(e.target.value)} className="form-select">
                          <option value="Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)">Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)</option>
                          <option value="Dt. Caner Eren (Diş Hekimi)">Dt. Caner Eren (Diş Hekimi)</option>
                          <option value="Dr. Meltem Akın (Dermatoloji)">Dr. Meltem Akın (Dermatoloji)</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Randevu Saati</label>
                        <select value={clinicTime} onChange={(e) => setClinicTime(e.target.value)} className="form-select">
                          <option value="09:00">09:00</option>
                          <option value="11:30">11:30</option>
                          <option value="14:15">14:15</option>
                          <option value="16:00">16:00</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Hasta Adı Soyadı</label>
                        <input
                          type="text"
                          required
                          placeholder="örn: Mehmet Kaya"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">Telefon (SMS İçin)</label>
                        <input
                          type="text"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      <Plus size={14} />
                      <span>Randevuyu Takvime Ekle & SMS Gönder</span>
                    </button>
                  </form>

                  {/* Randevu Tablosu */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: 700 }}>
                      Günün Aktif Hasta & Randevu Listesi
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.6rem 1rem' }}>Saat</th>
                          <th style={{ padding: '0.6rem 1rem' }}>Hasta Adı</th>
                          <th style={{ padding: '0.6rem 1rem' }}>İlgili Hekim</th>
                          <th style={{ padding: '0.6rem 1rem' }}>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => (
                          <tr key={a.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '0.6rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>{a.time}</td>
                            <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{a.patient}</td>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)' }}>{a.doctor}</td>
                            <td style={{ padding: '0.6rem 1rem' }}>
                              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{a.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  {demo.techStack.map(t => (
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
                  {demo.features.map(f => (
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
