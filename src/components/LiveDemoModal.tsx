'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  Compass, 
  TrendingUp, 
  Activity, 
  Plus, 
  CheckCircle2, 
  RefreshCw,
  Stethoscope,
  PawPrint
} from 'lucide-react';
import { DemoProject } from '@/lib/types';
import {
  STOCK_DATA,
  getProjectionBars,
  PROTEZ_STAGES,
  VET_STATUS_COLOR,
  KNOWN_DEMO_SLUGS
} from '@/lib/demoSimulations';

export default function LiveDemoModal({ demo, onClose }: { demo: DemoProject | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'tech_specs' | 'credentials'>('simulation');

  // Farklı bir demo açıldığında her zaman canlı simülatör sekmesiyle başla
  const [prevDemoId, setPrevDemoId] = useState(demo?.id);
  if (demo?.id !== prevDemoId) {
    setPrevDemoId(demo?.id);
    setActiveTab('simulation');
  }

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

  const activeStockInfo = STOCK_DATA[selectedStock] || STOCK_DATA['THYAO.IS'];
  const potentialGain = (((activeStockInfo.predicted - activeStockInfo.current) / activeStockInfo.current) * 100).toFixed(1);
  const projectionBars = getProjectionBars(selectedStock, selectedHorizon);

  // 3. KLİNİK SİSTEMİ SİMÜLATÖRÜ
  const [clinicDoctor, setClinicDoctor] = useState('Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)');
  const clinicDate = '14 Ekim 2026';
  const [clinicTime, setClinicTime] = useState('11:30');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+90 532 ');
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

  // 4. PROTEZ TAKİP SİMÜLATÖRÜ
  const [protezPatient, setProtezPatient] = useState('');
  const [protezType, setProtezType] = useState('Tam Protez (Üst Çene)');
  const [protezDoctor, setProtezDoctor] = useState('Dr. Selin Yılmaz');
  const [protezOrders, setProtezOrders] = useState([
    { id: 1, patient: 'Ahmet Yıldız', type: 'Parsiyel Protez (Alt Çene)', doctor: 'Dr. Selin Yılmaz', stage: 3 },
    { id: 2, patient: 'Fatma Kara', type: 'Tam Protez (Üst Çene)', doctor: 'Dt. Caner Eren', stage: 1 },
    { id: 3, patient: 'Mehmet Demir', type: 'İmplant Üstü Protez', doctor: 'Dr. Selin Yılmaz', stage: 4 }
  ]);
  const [protezAlert, setProtezAlert] = useState<string | null>(null);

  const handleCreateProtezOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protezPatient) return;
    setProtezOrders(prev => [{ id: Date.now(), patient: protezPatient, type: protezType, doctor: protezDoctor, stage: 0 }, ...prev]);
    setProtezAlert(`${protezPatient} için ${protezType} iş emri oluşturuldu ve laboratuvara iletildi.`);
    setProtezPatient('');
    setTimeout(() => setProtezAlert(null), 5000);
  };

  const advanceProtezStage = (id: number) => {
    setProtezOrders(prev => prev.map(o => o.id === id && o.stage < PROTEZ_STAGES.length - 1 ? { ...o, stage: o.stage + 1 } : o));
  };

  // 5. VETERİNER KLİNİK SİMÜLATÖRÜ
  const [vetPetName, setVetPetName] = useState('');
  const [vetOwnerName, setVetOwnerName] = useState('');
  const [vetPetType, setVetPetType] = useState('Köpek');
  const [vetDoctor, setVetDoctor] = useState('Dr. Elif Arslan');
  const [vetTime, setVetTime] = useState('10:00');
  const [vetAppointments, setVetAppointments] = useState([
    { id: 1, petName: 'Boncuk', ownerName: 'Ayşe Demir', petType: 'Kedi', doctor: 'Dr. Elif Arslan', time: '09:00', status: 'Muayenede' },
    { id: 2, petName: 'Max', ownerName: 'Kemal Öz', petType: 'Köpek', doctor: 'Dr. Can Yılmaz', time: '10:30', status: 'Beklemede' },
    { id: 3, petName: 'Pamuk', ownerName: 'Zeynep Kaya', petType: 'Tavşan', doctor: 'Dr. Elif Arslan', time: '11:15', status: 'Tamamlandı' }
  ]);
  const [vetAlert, setVetAlert] = useState<string | null>(null);

  const handleCreateVetAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetPetName || !vetOwnerName) return;
    setVetAppointments(prev => [{ id: Date.now(), petName: vetPetName, ownerName: vetOwnerName, petType: vetPetType, doctor: vetDoctor, time: vetTime, status: 'Onaylandı' }, ...prev]);
    setVetAlert(`${vetOwnerName} — ${vetPetName} (${vetPetType}) için saat ${vetTime} randevusu oluşturuldu. SMS bildirimi gönderildi.`);
    setVetPetName('');
    setVetOwnerName('');
    setTimeout(() => setVetAlert(null), 5000);
  };

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
                  {isGeneratingPlan && (
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <RefreshCw size={24} color="var(--primary)" className="spin" style={{ marginBottom: '0.6rem' }} />
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Yapay zeka {travelCity} rotasını oluşturuyor...</div>
                    </div>
                  )}
                  {travelGenerated && !isGeneratingPlan && (
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
                        {activeStockInfo.signal} (%{activeStockInfo.confidence})
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
                      {projectionBars.map((val, idx) => (
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

              {/* 4. PROTEZ TAKİP SİSTEMİ DEMO */}
              {demo.slug === 'protez-takip-sistemi-demo' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Stethoscope size={20} color="var(--primary)" />
                      ADSP Protez Takip — Laboratuvar İş Akışı Simülatörü
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Hekim olarak yeni protez iş emri oluşturun, ardından laboratuvar teknisyeni gibi aşamaları ilerletin.
                    </p>
                  </div>

                  {protezAlert && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                      🦷 {protezAlert}
                    </div>
                  )}

                  <form onSubmit={handleCreateProtezOrder} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label className="form-label">Hasta Adı Soyadı</label>
                        <input type="text" required placeholder="örn: Ayşe Kaya" value={protezPatient} onChange={(e) => setProtezPatient(e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Protez Türü</label>
                        <select value={protezType} onChange={(e) => setProtezType(e.target.value)} className="form-select">
                          <option>Tam Protez (Üst Çene)</option>
                          <option>Tam Protez (Alt Çene)</option>
                          <option>Parsiyel Protez (Alt Çene)</option>
                          <option>İmplant Üstü Protez</option>
                          <option>Zirkonyum Köprü</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Hekim</label>
                        <select value={protezDoctor} onChange={(e) => setProtezDoctor(e.target.value)} className="form-select">
                          <option>Dr. Selin Yılmaz</option>
                          <option>Dt. Caner Eren</option>
                          <option>Dt. Burcu Aydın</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      <Plus size={14} />
                      <span>İş Emri Oluştur & Laboratuvara Gönder</span>
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {protezOrders.map((o) => {
                      const done = o.stage === PROTEZ_STAGES.length - 1;
                      return (
                        <div key={o.id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '1rem', animation: 'fadeIn 0.3s ease' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.patient}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.type} • {o.doctor}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => advanceProtezStage(o.id)}
                              disabled={done}
                              className={`btn btn-sm ${done ? 'btn-secondary' : 'btn-purple'}`}
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', opacity: done ? 0.6 : 1, cursor: done ? 'default' : 'pointer' }}
                            >
                              {done ? <><CheckCircle2 size={13} /> Teslim Edildi</> : <>Sonraki Aşama →</>}
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {PROTEZ_STAGES.map((s, i) => (
                              <div key={s} style={{ flex: 1 }}>
                                <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: i <= o.stage ? (done ? 'var(--accent-emerald)' : 'linear-gradient(90deg, #6366f1, #00f0ff)') : 'rgba(255,255,255,0.08)', transition: 'background 0.4s ease' }} />
                                <div style={{ fontSize: '0.62rem', marginTop: '0.3rem', color: i === o.stage ? 'var(--primary)' : 'var(--text-dim)', fontWeight: i === o.stage ? 700 : 400, textAlign: 'center' }}>{s}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. VETERİNER KLİNİK DEMO */}
              {demo.slug === 'veteriner-klinik-demo' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PawPrint size={20} color="var(--primary)" />
                      Veteriner Klinik — Randevu & Muayene Simülatörü
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Evcil hayvan sahibi olarak randevu oluşturun, hekim panelinden durumunu güncelleyin.
                    </p>
                  </div>

                  {vetAlert && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                      🐾 {vetAlert}
                    </div>
                  )}

                  <form onSubmit={handleCreateVetAppointment} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label className="form-label">Pet Adı</label>
                        <input type="text" required placeholder="örn: Zeytin" value={vetPetName} onChange={(e) => setVetPetName(e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Sahibi</label>
                        <input type="text" required placeholder="örn: Ali Can" value={vetOwnerName} onChange={(e) => setVetOwnerName(e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Tür</label>
                        <select value={vetPetType} onChange={(e) => setVetPetType(e.target.value)} className="form-select">
                          <option>Köpek</option>
                          <option>Kedi</option>
                          <option>Kuş</option>
                          <option>Tavşan</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Hekim</label>
                        <select value={vetDoctor} onChange={(e) => setVetDoctor(e.target.value)} className="form-select">
                          <option>Dr. Elif Arslan</option>
                          <option>Dr. Can Yılmaz</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Saat</label>
                        <select value={vetTime} onChange={(e) => setVetTime(e.target.value)} className="form-select">
                          {['09:00', '10:00', '11:30', '13:30', '15:00', '16:30'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      <Plus size={14} />
                      <span>Randevu Oluştur & SMS Gönder</span>
                    </button>
                  </form>

                  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: 700 }}>
                      Hekim Paneli — Günün Randevuları
                    </div>
                    {vetAppointments.map((a) => {
                      const color = VET_STATUS_COLOR[a.status] || 'var(--primary)';
                      return (
                        <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '60px 1.2fr 1fr 110px 150px', gap: '0.5rem', alignItems: 'center', padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', animation: 'fadeIn 0.3s ease' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{a.time}</span>
                          <span><strong>{a.petName}</strong> <span style={{ color: 'var(--text-dim)' }}>({a.petType})</span></span>
                          <span style={{ color: 'var(--text-muted)' }}>{a.ownerName}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.5rem', borderRadius: 'var(--radius-full)', background: `color-mix(in srgb, ${color} 12%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`, textAlign: 'center' }}>{a.status}</span>
                          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                            {a.status !== 'Tamamlandı' && (
                              <button
                                type="button"
                                onClick={() => setVetAppointments(prev => prev.map(x => x.id === a.id ? { ...x, status: x.status === 'Muayenede' ? 'Tamamlandı' : 'Muayenede' } : x))}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.68rem', padding: '0.25rem 0.55rem' }}
                              >
                                {a.status === 'Muayenede' ? 'Tamamla' : 'Muayeneye Al'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Simülatörü olmayan demolar için yedek görünüm */}
              {!KNOWN_DEMO_SLUGS.includes(demo.slug as (typeof KNOWN_DEMO_SLUGS)[number]) && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <Sparkles size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>Bu demonun canlı sürümünü ayrı sekmede deneyimleyebilirsiniz.</p>
                  {demo.liveUrl && (
                    <a href={demo.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                      <ExternalLink size={14} /> Canlı Sistemi Aç
                    </a>
                  )}
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
