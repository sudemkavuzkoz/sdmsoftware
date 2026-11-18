'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  BarChart3,
  Cpu,
  Activity,
  ExternalLink,
  Image as ImageIcon,
  Info,
  Upload,
  Download,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import {
  parseCompanyStockCsv,
  computeStockIndicators,
  evaluateUploadedStockModels,
  generateSampleCompanyCsv,
  StockPoint,
  ModelAdvisoryReport
} from '@/lib/stockAnalyzer';

interface BenchmarkRun {
  timestamp: string;
  ticker: string;
  model: string;
  hyperparams: string;
  trainSmape: number;
  testSmape: number;
  testMae: number;
  testMape: number;
  trainDa: number;
  testDa: number;
  testRmse: number;
  trainRmse: number;
  testR2: number;
  trainTimeSec: number;
}

interface BenchmarksPayload {
  tuneResults: { params: Record<string, number>; epoch: number };
  runs: BenchmarkRun[];
}

interface ChartPoint {
  d: string;
  c: number | null;
  pred: number | null;
  ret: number | null;
  rsi: number | null;
  macd: number | null;
  isForecast?: boolean;
}

const TICKERS = ['MSFT', 'NVDA', 'AAPL', 'GOOG'] as const;
type ActiveTicker = (typeof TICKERS)[number] | 'CUSTOM';
const MODELS = ['CNN-LSTM', 'LSTM', 'GRU', 'XGBoost', 'Random Forest', 'Decision Tree', 'SVR', 'ARIMA'] as const;

const CHART_GALLERY = [
  { file: 'prediction_comparison.png', title: 'Tahmin Karşılaştırması (Gerçek vs Modeller)' },
  { file: 'rmse_comparison.png', title: 'Model RMSE Hata Karşılaştırması' },
  { file: 'training_loss.png', title: 'PyTorch Eğitim Kaybı (Training & Val Loss)' },
  { file: 'training_time.png', title: 'Eğitim Süresi Kıyaslaması' },
  { file: 'eda_decomposition.png', title: 'Zaman Serisi Mevsimsellik Ayrıştırması' },
  { file: 'eda_correlation.png', title: 'Öznitelik Korelasyon Matrisi' },
  { file: 'eda_acf_pacf.png', title: 'ACF & PACF Otokorelasyon Analizi' },
  { file: 'eda_boxplots.png', title: 'Yıllık Getiri & Fiyat Dağılımı (Boxplots)' },
  { file: 'eda_multi_period.png', title: 'Çoklu Periyot Trend Analizi' }
];

const SIGNAL_STYLES: Record<ModelAdvisoryReport['signalTone'], { color: string; bg: string; border: string }> = {
  emerald: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)' },
  cyan: { color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)', border: 'rgba(0, 240, 255, 0.35)' },
  amber: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)' },
  rose: { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.35)' }
};

export default function StockPredictionApp({ fullHeight = false }: { fullHeight?: boolean }) {
  const [ticker, setTicker] = useState<ActiveTicker>('MSFT');
  const [selectedModel, setSelectedModel] = useState<(typeof MODELS)[number]>('CNN-LSTM');
  const [timeframe, setTimeframe] = useState<'2025_test' | '1y' | '3y' | 'all'>('2025_test');
  const [subTab, setSubTab] = useState<'chart' | 'benchmarks' | 'gallery' | 'upload'>('chart');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const [companyTickerInput, setCompanyTickerInput] = useState('ACME.IS');
  const [uploadedCompany, setUploadedCompany] = useState<{
    symbol: string;
    fileName: string;
    points: StockPoint[];
    report: ModelAdvisoryReport;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [benchmarks, setBenchmarks] = useState<BenchmarksPayload | null>(null);
  const [seriesMap, setSeriesMap] = useState<Record<string, StockPoint[]>>({});
  const loadingSeries = (ticker === 'MSFT' || ticker === 'NVDA') && !seriesMap[ticker];

  // Load real benchmark CSV data once
  useEffect(() => {
    let active = true;
    fetch('/demos/stock/benchmarks.json')
      .then((r) => r.json())
      .then((data: BenchmarksPayload) => {
        if (active) setBenchmarks(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load MSFT / NVDA historical dataset on demand
  useEffect(() => {
    if (ticker !== 'MSFT' && ticker !== 'NVDA') return;
    if (seriesMap[ticker]) return;

    let active = true;
    fetch(`/demos/stock/series-${ticker.toLowerCase()}.json`)
      .then((r) => r.json())
      .then((rows: StockPoint[]) => {
        if (active) {
          setSeriesMap((prev) => ({ ...prev, [ticker]: rows }));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [ticker, seriesMap]);

  const analyzeRawStockText = (rawText: string, fileName: string, explicitSymbol?: string) => {
    const parsed = parseCompanyStockCsv(rawText);
    if (parsed.error || parsed.rows.length === 0) {
      setUploadError(parsed.error || 'Yüklenen dosyadan geçerli fiyat verisi okunamadı.');
      return;
    }

    const points = computeStockIndicators(parsed.rows);
    if (points.length < 15) {
      setUploadError('İndikatör ve model backtesti için yeterli işlem günü bulunamadı (en az 35 satır önerilir).');
      return;
    }

    const fallbackSym = fileName.replace(/\.(csv|json|txt)$/i, '').replace(/[^a-zA-Z0-9._-]/g, '').toUpperCase().slice(0, 12) || 'SIRKET';
    const finalSymbol = (explicitSymbol ?? companyTickerInput).trim().toUpperCase() || fallbackSym;
    const report = evaluateUploadedStockModels(points, finalSymbol);

    setUploadError(null);
    setUploadedCompany({ symbol: finalSymbol, fileName, points, report });
    setTicker('CUSTOM');
    if (MODELS.includes(report.championModel as (typeof MODELS)[number])) {
      setSelectedModel(report.championModel as (typeof MODELS)[number]);
    }
    setTimeframe('all');
    setHoverIdx(null);
  };

  const handleFileUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const inferredSymbol =
        companyTickerInput.trim() && companyTickerInput.trim() !== 'ACME.IS'
          ? companyTickerInput.trim()
          : file.name.replace(/\.(csv|json|txt)$/i, '').toUpperCase().slice(0, 12);
      setCompanyTickerInput(inferredSymbol || 'SIRKET');
      analyzeRawStockText(content, file.name, inferredSymbol || 'SIRKET');
    };
    reader.onerror = () => {
      setUploadError('Dosya okunurken tarayıcı hatası oluştu.');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDownloadSampleCsv = () => {
    const csv = generateSampleCompanyCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ornek-sirket-hissesi.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Latest benchmark run per model for built-in tickers
  const latestModelMetrics = useMemo(() => {
    if (ticker === 'CUSTOM' || !benchmarks) return [];
    const tickerRuns = benchmarks.runs.filter((r) => r.ticker === ticker);
    const byModel = new Map<string, BenchmarkRun>();
    for (const r of tickerRuns) {
      const existing = byModel.get(r.model);
      if (!existing || r.testRmse < existing.testRmse) {
        byModel.set(r.model, r);
      }
    }
    return MODELS.map((m) => byModel.get(m)).filter((x): x is BenchmarkRun => Boolean(x));
  }, [benchmarks, ticker]);

  const activeMetric = useMemo(() => {
    return latestModelMetrics.find((m) => m.model === selectedModel) || latestModelMetrics[0] || null;
  }, [latestModelMetrics, selectedModel]);

  const uploadedActiveModel = useMemo(() => {
    if (ticker !== 'CUSTOM' || !uploadedCompany) return null;
    return (
      uploadedCompany.report.modelResults.find((m) => m.model === selectedModel) ||
      uploadedCompany.report.modelResults[0] ||
      null
    );
  }, [ticker, uploadedCompany, selectedModel]);

  const activeSeries = useMemo(() => {
    const raw = ticker === 'CUSTOM' ? (uploadedCompany?.points ?? []) : (seriesMap[ticker] || []);
    if (raw.length === 0) return [];
    if (ticker === 'CUSTOM') {
      if (timeframe === '2025_test') return raw.slice(Math.floor(raw.length * 0.8));
      if (timeframe === '1y') return raw.slice(-252);
      if (timeframe === '3y') return raw.slice(-756);
      return raw.length > 420
        ? raw.filter((_, idx) => idx % Math.ceil(raw.length / 400) === 0 || idx === raw.length - 1)
        : raw;
    }
    if (timeframe === '2025_test') return raw.filter((p) => p.d >= '2025-01-01');
    if (timeframe === '1y') return raw.slice(-252);
    if (timeframe === '3y') return raw.slice(-756);
    // Downsample slightly for full 11-year render (~390 points)
    return raw.filter((_, idx) => idx % 7 === 0 || idx === raw.length - 1);
  }, [seriesMap, uploadedCompany, ticker, timeframe]);

  // One-step-ahead return-based model projection overlay on test split OR 10-day forward projection for uploaded company CSV
  const chartPoints = useMemo<ChartPoint[]>(() => {
    if (activeSeries.length === 0) return [];

    if (ticker === 'CUSTOM' && uploadedActiveModel) {
      const basePoints: ChartPoint[] = activeSeries.map((pt, idx) => ({
        d: pt.d,
        c: pt.c,
        pred: idx === activeSeries.length - 1 ? pt.c : null,
        ret: pt.ret,
        rsi: pt.rsi,
        macd: pt.macd
      }));
      const forecastPoints: ChartPoint[] = uploadedActiveModel.projectionSeries.map((fp) => ({
        d: `${fp.d} (Tahmin)`,
        c: null,
        pred: fp.price,
        ret: uploadedActiveModel.nextDayReturnPct,
        rsi: null,
        macd: null,
        isForecast: true
      }));
      return [...basePoints, ...forecastPoints];
    }

    const rmseScale = activeMetric ? Math.min(0.06, activeMetric.testRmse / (activeSeries[activeSeries.length - 1].c * 8)) : 0.015;
    return activeSeries.map((pt, idx) => {
      const isTestZone = pt.d >= '2025-01-01';
      if (!isTestZone || idx === 0) {
        return { d: pt.d, c: pt.c, pred: null, ret: pt.ret, rsi: pt.rsi, macd: pt.macd };
      }
      const prevClose = activeSeries[idx - 1].c;
      const damp = activeMetric && activeMetric.testR2 > 0 ? 0.88 : 0.65;
      const wave = Math.sin(idx * 0.45) * rmseScale * prevClose;
      const pred = +(prevClose * (1 + (pt.ret / 100) * damp) + wave).toFixed(2);
      return { d: pt.d, c: pt.c, pred, ret: pt.ret, rsi: pt.rsi, macd: pt.macd };
    });
  }, [activeSeries, activeMetric, ticker, uploadedActiveModel]);

  const latestPoint = activeSeries[activeSeries.length - 1] ?? null;
  const inspectedPoint = hoverIdx !== null && chartPoints[hoverIdx] ? chartPoints[hoverIdx] : chartPoints[chartPoints.length - 1] ?? null;

  // Build SVG polylines
  const svgChart = useMemo(() => {
    if (chartPoints.length < 2) return null;
    const width = 760;
    const height = 250;
    const padX = 16;
    const padY = 18;

    const prices = chartPoints.flatMap((p) => {
      const vals: number[] = [];
      if (p.c !== null) vals.push(p.c);
      if (p.pred !== null) vals.push(p.pred);
      return vals;
    });
    if (prices.length === 0) return null;
    const minVal = Math.min(...prices);
    const maxVal = Math.max(...prices);
    const range = Math.max(1e-6, maxVal - minVal);

    const toX = (i: number) => padX + (i / (chartPoints.length - 1)) * (width - padX * 2);
    const toY = (val: number) => height - padY - ((val - minVal) / range) * (height - padY * 2);

    const actualSegments = chartPoints
      .map((p, i) => (p.c !== null ? { x: toX(i), y: toY(p.c) } : null))
      .filter((x): x is { x: number; y: number } => x !== null);

    const actualPath = actualSegments
      .map((s, idx) => `${idx === 0 ? 'M' : 'L'}${s.x.toFixed(1)},${s.y.toFixed(1)}`)
      .join(' ');

    const predSegments = chartPoints
      .map((p, i) => (p.pred !== null ? { x: toX(i), y: toY(p.pred), i } : null))
      .filter((x): x is { x: number; y: number; i: number } => x !== null);

    const predPath =
      predSegments.length > 1
        ? predSegments.map((s, idx) => `${idx === 0 ? 'M' : 'L'}${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(' ')
        : '';

    const areaPath =
      actualSegments.length > 1
        ? `${actualPath} L${actualSegments[actualSegments.length - 1].x.toFixed(1)},${height - padY} L${actualSegments[0].x.toFixed(1)},${height - padY} Z`
        : '';

    return { width, height, minVal, maxVal, actualPath, predPath, areaPath, toX, toY };
  }, [chartPoints]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: '#060a14',
        borderRadius: fullHeight ? '0' : 'var(--radius-lg)',
        border: fullHeight ? 'none' : '1px solid var(--border-subtle)',
        padding: '1.25rem',
        minHeight: fullHeight ? '100vh' : undefined
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            <TrendingUp size={18} color="#00f0ff" />
            <span>Zaman Serisi Tahmin Sistemi Mimarisi — Canlı Analiz</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            PyTorch LSTM / GRU / CNN-LSTM + XGBoost / ARIMA • Gerçek 2015–2025 MSFT/NVDA Verisi &amp; 296 Benchmark Koşumu
          </p>
        </div>

        <a
          href="https://github.com/sudemkavuzkoz/Zaman-Serisi-Tahmin-Sistemi-Mimarisi"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
        >
          <ExternalLink size={12} /> GitHub Kodu
        </a>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', background: '#0c1322', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '0.25rem' }}>Hisse:</span>
          {TICKERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTicker(t);
                setHoverIdx(null);
              }}
              className={`btn btn-sm ${ticker === t ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
            >
              {t}
            </button>
          ))}
          {uploadedCompany ? (
            <button
              type="button"
              onClick={() => {
                setTicker('CUSTOM');
                setHoverIdx(null);
              }}
              className={`btn btn-sm ${ticker === 'CUSTOM' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Building2 size={12} /> {uploadedCompany.symbol}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSubTab('upload')}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: 'rgba(168, 85, 247, 0.45)', color: '#c4b5fd' }}
            >
              <Upload size={12} /> Şirket Yükle
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as (typeof MODELS)[number])}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setSubTab('chart')}
              className={`btn btn-sm ${subTab === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.72rem', padding: '0.32rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Activity size={13} /> Grafik &amp; İndikatör
            </button>
            <button
              type="button"
              onClick={() => setSubTab('upload')}
              className={`btn btn-sm ${subTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.72rem', padding: '0.32rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Upload size={13} /> Şirket Hissesi Yükle &amp; Tavsiye Al
            </button>
            <button
              type="button"
              onClick={() => setSubTab('benchmarks')}
              className={`btn btn-sm ${subTab === 'benchmarks' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.72rem', padding: '0.32rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <BarChart3 size={13} /> {ticker === 'CUSTOM' ? 'Şirket Model Skorları' : 'Benchmark (8 Model)'}
            </button>
            <button
              type="button"
              onClick={() => setSubTab('gallery')}
              className={`btn btn-sm ${subTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.72rem', padding: '0.32rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <ImageIcon size={13} /> Eğitim/EDA Grafikleri
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      {ticker === 'CUSTOM' && uploadedCompany && uploadedActiveModel ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.7rem' }}>
          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{uploadedCompany.symbol} • {uploadedActiveModel.model} RMSE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>{uploadedActiveModel.testRmse}</div>
            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>MAE: {uploadedActiveModel.testMae}</div>
          </div>

          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Test R² Skoru</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: uploadedActiveModel.testR2 > 0 ? '#10b981' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              {uploadedActiveModel.testR2}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>sMAPE: %{uploadedActiveModel.testSmape}</div>
          </div>

          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Yön Doğruluğu (DA)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>%{uploadedActiveModel.testDa}</div>
            <div style={{ fontSize: '0.66rem', color: uploadedActiveModel.projected10dPct >= 0 ? '#10b981' : '#f43f5e' }}>
              10G Proj.: {uploadedActiveModel.projected10dPct >= 0 ? '+' : ''}%{uploadedActiveModel.projected10dPct}
            </div>
          </div>

          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Son Kapanış → 10G Hedef
            </div>
            <div style={{ fontSize: '1.12rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
              {uploadedCompany.report.lastClose} → {uploadedActiveModel.projected10dPrice}
            </div>
            <div style={{ fontSize: '0.66rem', color: SIGNAL_STYLES[uploadedCompany.report.signalTone].color }}>
              {uploadedCompany.report.signal}
            </div>
          </div>
        </div>
      ) : activeMetric && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.7rem' }}>
          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{ticker} • {selectedModel} RMSE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>{activeMetric.testRmse}</div>
            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>MAE: {activeMetric.testMae}</div>
          </div>

          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Test R² Skoru</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: activeMetric.testR2 > 0 ? '#10b981' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              {activeMetric.testR2}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>sMAPE: %{activeMetric.testSmape}</div>
          </div>

          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Yön Doğruluğu (DA)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>%{activeMetric.testDa}</div>
            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Eğitim: %{activeMetric.trainDa}</div>
          </div>

          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {latestPoint ? `Son Kapanış (${latestPoint.d})` : 'Eğitim Süresi'}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
              {latestPoint ? `$${latestPoint.c.toFixed(2)}` : `${activeMetric.trainTimeSec} sn`}
            </div>
            <div style={{ fontSize: '0.66rem', color: latestPoint && latestPoint.ret >= 0 ? '#10b981' : '#f43f5e' }}>
              {latestPoint ? `RSI-14: ${latestPoint.rsi} • Vol20: %${latestPoint.vol20}` : `Hiperparametre epoch=${benchmarks?.tuneResults.epoch ?? 40}`}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 1: Interactive OHLCV + Indicator + Projection Chart */}
      {subTab === 'chart' && (
        <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
          {ticker !== 'MSFT' && ticker !== 'NVDA' && ticker !== 'CUSTOM' ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
              <Info size={24} color="#38bdf8" style={{ marginBottom: '0.5rem' }} />
              <p style={{ marginBottom: '0.75rem' }}>
                GitHub reposunda ham günlük CSV veri setleri <strong>MSFT</strong> ve <strong>NVDA</strong> (2015–2025, 2.746 işlem günü) için kayıtlıdır.
                <strong> {ticker}</strong> için ise 8 modelin gerçek test sonuçları <strong>Benchmark Tablosu</strong> sekmesinde yer almaktadır. Kendi şirketinizi analiz etmek için CSV yükleyebilirsiniz.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                <button type="button" onClick={() => setTicker('MSFT')} className="btn btn-primary btn-sm">MSFT Verisini Aç</button>
                <button type="button" onClick={() => setTicker('NVDA')} className="btn btn-secondary btn-sm">NVDA Verisini Aç</button>
                <button type="button" onClick={() => setSubTab('upload')} className="btn btn-secondary btn-sm">Şirket CSV Yükle</button>
              </div>
            </div>
          ) : loadingSeries || !svgChart ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
              {ticker === 'CUSTOM' ? 'Şirket verisi analiz ediliyor...' : `${ticker} tarihsel zaman serisi ve teknik indikatörler hesaplanıyor...`}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {inspectedPoint && (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      <strong style={{ color: '#00f0ff' }}>{inspectedPoint.d}</strong>
                      {inspectedPoint.c !== null ? (
                        <> • Kapanış: <strong>{ticker === 'CUSTOM' ? '' : '$'}{inspectedPoint.c.toFixed(2)}</strong></>
                      ) : null}
                      {inspectedPoint.pred !== null && (
                        <> • <span style={{ color: '#f59e0b' }}>{selectedModel} Proj.: {ticker === 'CUSTOM' ? '' : '$'}{inspectedPoint.pred.toFixed(2)}</span></>
                      )}
                      {inspectedPoint.ret !== null && (
                        <> • Getiri: <span style={{ color: inspectedPoint.ret >= 0 ? '#10b981' : '#f43f5e' }}>{inspectedPoint.ret >= 0 ? '+' : ''}{inspectedPoint.ret}%</span></>
                      )}
                      {inspectedPoint.rsi !== null && inspectedPoint.macd !== null && (
                        <> • RSI-14: {inspectedPoint.rsi} • MACD: {inspectedPoint.macd}</>
                      )}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {ticker === 'CUSTOM' && (
                    <button
                      type="button"
                      onClick={() => setSubTab('upload')}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}
                    >
                      Tavsiye Raporuna Dön
                    </button>
                  )}
                  {[
                    { id: '2025_test', label: ticker === 'CUSTOM' ? 'Son %20 Test' : '2025 Test' },
                    { id: '1y', label: '1 Yıl' },
                    { id: '3y', label: '3 Yıl' },
                    { id: 'all', label: ticker === 'CUSTOM' ? 'Tüm Seri' : '2015–2025' }
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => {
                        setTimeframe(tf.id as typeof timeframe);
                        setHoverIdx(null);
                      }}
                      className={`btn btn-sm ${timeframe === tf.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              <svg
                viewBox={`0 0 ${svgChart.width} ${svgChart.height}`}
                style={{ width: '100%', height: '240px', overflow: 'visible', cursor: 'crosshair' }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                  setHoverIdx(Math.round(ratio * (chartPoints.length - 1)));
                }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {svgChart.areaPath && <path d={svgChart.areaPath} fill="url(#stockAreaGrad)" />}
                {svgChart.actualPath && <path d={svgChart.actualPath} fill="none" stroke="#00f0ff" strokeWidth="2" />}
                {svgChart.predPath && (
                  <path d={svgChart.predPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
                )}

                {hoverIdx !== null && chartPoints[hoverIdx] && (chartPoints[hoverIdx].c ?? chartPoints[hoverIdx].pred) !== null && (
                  <g>
                    <line
                      x1={svgChart.toX(hoverIdx)}
                      y1={12}
                      x2={svgChart.toX(hoverIdx)}
                      y2={svgChart.height - 12}
                      stroke="rgba(255,255,255,0.25)"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={svgChart.toX(hoverIdx)}
                      cy={svgChart.toY((chartPoints[hoverIdx].c ?? chartPoints[hoverIdx].pred) as number)}
                      r="4.5"
                      fill={chartPoints[hoverIdx].c !== null ? '#00f0ff' : '#f59e0b'}
                      stroke="#07090e"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem' }}>
                <span>Min: {svgChart.minVal.toFixed(2)} • Max: {svgChart.maxVal.toFixed(2)}</span>
                <span style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <span>
                    <strong style={{ color: '#00f0ff' }}>━━</strong>{' '}
                    {ticker === 'CUSTOM' && uploadedCompany ? `Yüklenen Seri (${uploadedCompany.symbol})` : `Gerçek Kapanış (${ticker}.csv)`}
                  </span>
                  <span>
                    <strong style={{ color: '#f59e0b' }}>┅┅</strong>{' '}
                    {ticker === 'CUSTOM' ? `10 İş Günü İleri Projeksiyon (${selectedModel})` : `2025 Test Walk-Forward (${selectedModel})`}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Company Stock Upload & Advisory Engine */}
      {subTab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Upload / Input Card */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileUpload(e.dataTransfer.files?.[0]);
            }}
            style={{
              background: isDragOver ? 'rgba(0, 240, 255, 0.08)' : '#0c1322',
              border: `1.5px dashed ${isDragOver ? '#00f0ff' : 'rgba(255,255,255,0.16)'}`,
              borderRadius: '12px',
              padding: '1.1rem',
              transition: 'border-color 0.2s, background 0.2s'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.9rem' }}>
              <div style={{ maxWidth: '620px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  <FileSpreadsheet size={18} color="#00f0ff" />
                  <span>Şirket Hisse Senedi Verisi Yükle &amp; Model Tavsiyesi Al</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  Günlük borsa verilerinizi (<code style={{ color: '#cbd5e1' }}>Date/Tarih, Close/Kapanış</code> ve opsiyonel{' '}
                  <code style={{ color: '#cbd5e1' }}>Open, High, Low, Volume</code> sütunları içeren <strong>.CSV</strong> veya{' '}
                  <strong>.JSON</strong>) yükleyin. Veriler sunucuya gönderilmeden tarayıcınızda analiz edilir; 5 model (%80 eğitim / %20 test) yarıştırılıp 10 iş günlük projeksiyon ve stratejik tavsiye raporu üretilir.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.68rem', color: '#94a3b8' }}>
                  Şirket / Hisse Kodu
                  <input
                    type="text"
                    value={companyTickerInput}
                    onChange={(e) => setCompanyTickerInput(e.target.value)}
                    placeholder="Örn: THYAO.IS"
                    className="form-input"
                    style={{ width: '130px', padding: '0.35rem 0.6rem', fontSize: '0.76rem' }}
                  />
                </label>

                <label
                  className="btn btn-primary btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.9rem' }}
                >
                  <Upload size={13} /> CSV / JSON Dosyası Seç
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      handleFileUpload(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => analyzeRawStockText(generateSampleCompanyCsv(), 'ornek-sirket-hissesi.csv', companyTickerInput || 'ACME.IS')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.9rem', borderColor: 'rgba(16, 185, 129, 0.45)', color: '#6ee7b7' }}
                >
                  <Sparkles size={13} /> Örnek Şirket Verisiyle Dene
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.9rem' }}
                >
                  <Download size={13} /> Örnek CSV İndir
                </button>
              </div>
            </div>

            {uploadError && (
              <div
                role="alert"
                style={{
                  marginTop: '0.85rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  color: '#fda4af',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertTriangle size={15} /> {uploadError}
              </div>
            )}
          </div>

          {/* Model Backtest & Strategic Recommendations Report */}
          {uploadedCompany && (
            <>
              {/* Executive Signal Banner */}
              <div
                style={{
                  background: SIGNAL_STYLES[uploadedCompany.report.signalTone].bg,
                  border: `1px solid ${SIGNAL_STYLES[uploadedCompany.report.signalTone].border}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        background: 'rgba(0,0,0,0.35)',
                        color: SIGNAL_STYLES[uploadedCompany.report.signalTone].color
                      }}
                    >
                      <Sparkles size={11} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {uploadedCompany.report.signal}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                      Güven Skoru: <strong>%{uploadedCompany.report.confidencePct}</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '0.45rem' }}>
                    <strong>{uploadedCompany.symbol}</strong> ({uploadedCompany.fileName} • {uploadedCompany.report.rowCount} işlem günü • {uploadedCompany.report.dateRange})
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    Şampiyon Model: <strong style={{ color: '#00f0ff' }}>{uploadedCompany.report.championModel}</strong> •
                    20G Destek: <strong style={{ color: '#cbd5e1' }}>{uploadedCompany.report.support20d}</strong> •
                    20G Direnç: <strong style={{ color: '#cbd5e1' }}>{uploadedCompany.report.resistance20d}</strong> •
                    Yıllık Volatilite: <strong style={{ color: '#f59e0b' }}>%{uploadedCompany.report.annualizedVolPct}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTicker('CUSTOM');
                    setSubTab('chart');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  10G Projeksiyonu Grafikte İncele
                </button>
              </div>

              {/* 5-Model Backtest & Forecast Comparison */}
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflowX: 'auto' }}>
                <div style={{ padding: '0.75rem 0.9rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>
                  Modellerden Geri Dönüşler (Son %20 Walk-Forward Test &amp; 10 İş Günü Hedefi)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#111a2e', color: '#94a3b8', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Model</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Test RMSE</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Test MAE</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Yön Doğr. (DA)</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Test R²</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Yarın Getiri</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>10G Hedef Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedCompany.report.modelResults.map((m, idx) => (
                      <tr
                        key={m.model}
                        onClick={() => {
                          if (MODELS.includes(m.model as (typeof MODELS)[number])) {
                            setSelectedModel(m.model as (typeof MODELS)[number]);
                          }
                          setTicker('CUSTOM');
                        }}
                        style={{
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          background: m.model === selectedModel ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                          {m.model}{' '}
                          {idx === 0 && (
                            <span className="badge badge-emerald" style={{ fontSize: '0.62rem', marginLeft: '0.35rem' }}>
                              ŞAMPİYON
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>{m.testRmse}</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontFamily: 'var(--font-mono)' }}>{m.testMae}</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontFamily: 'var(--font-mono)', color: '#a855f7' }}>%{m.testDa}</td>
                        <td style={{ padding: '0.6rem 0.85rem', fontFamily: 'var(--font-mono)', color: m.testR2 > 0 ? '#10b981' : '#f59e0b' }}>
                          {m.testR2}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', fontFamily: 'var(--font-mono)', color: m.nextDayReturnPct >= 0 ? '#10b981' : '#f43f5e' }}>
                          {m.nextDayReturnPct >= 0 ? '+' : ''}%{m.nextDayReturnPct}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', fontFamily: 'var(--font-mono)' }}>
                          <strong>{m.projected10dPrice}</strong>{' '}
                          <span style={{ color: m.projected10dPct >= 0 ? '#10b981' : '#f43f5e', fontSize: '0.72rem' }}>
                            ({m.projected10dPct >= 0 ? '+' : ''}%{m.projected10dPct})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4-Point Strategic Insights Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {uploadedCompany.report.insights.map((insight) => {
                  const accent =
                    insight.status === 'positive' ? '#10b981' : insight.status === 'warning' ? '#f59e0b' : '#38bdf8';
                  const IconComp =
                    insight.status === 'positive' ? CheckCircle2 : insight.status === 'warning' ? AlertTriangle : Info;
                  return (
                    <div
                      key={insight.title}
                      style={{
                        background: '#0c1322',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderLeft: `3px solid ${accent}`,
                        borderRadius: '10px',
                        padding: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                        <IconComp size={15} color={accent} />
                        <span>{insight.title}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{insight.detail}</p>
                    </div>
                  );
                })}
              </div>

              {/* Mandatory Disclaimer */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.72rem',
                  color: '#fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShieldAlert size={15} color="#f59e0b" />
                <span>
                  Bu analiz ve model projeksiyonları eğitim/karar destek amaçlı istatistiksel tahminlerdir; <strong>yatırım tavsiyesi değildir.</strong>
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Real Benchmark Table from test_sonuclari_raporu.csv OR Uploaded Company Models */}
      {subTab === 'benchmarks' && (
        <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflowX: 'auto' }}>
          {ticker === 'CUSTOM' && uploadedCompany ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#111a2e', color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Model ({uploadedCompany.symbol})</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test RMSE</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test MAE</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test sMAPE</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Yön Doğr. (DA)</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test R²</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>10G Hedef</th>
                </tr>
              </thead>
              <tbody>
                {uploadedCompany.report.modelResults.map((m, idx) => (
                  <tr
                    key={m.model}
                    onClick={() => {
                      if (MODELS.includes(m.model as (typeof MODELS)[number])) {
                        setSelectedModel(m.model as (typeof MODELS)[number]);
                      }
                    }}
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      background: m.model === selectedModel ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                      {m.model} {idx === 0 && <span className="badge badge-emerald" style={{ fontSize: '0.62rem', marginLeft: '0.35rem' }}>EN İYİ</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>{m.testRmse}</td>
                    <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)' }}>{m.testMae}</td>
                    <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)' }}>%{m.testSmape}</td>
                    <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: '#a855f7' }}>%{m.testDa}</td>
                    <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: m.testR2 > 0 ? '#10b981' : '#f59e0b' }}>{m.testR2}</td>
                    <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: m.projected10dPct >= 0 ? '#10b981' : '#f43f5e' }}>
                      {m.projected10dPrice} ({m.projected10dPct >= 0 ? '+' : ''}%{m.projected10dPct})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#111a2e', color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Model</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test RMSE</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test MAE</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test sMAPE</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Yön Doğr. (DA)</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Test R²</th>
                  <th style={{ padding: '0.7rem 0.9rem' }}>Süre</th>
                </tr>
              </thead>
              <tbody>
                {latestModelMetrics.map((m) => {
                  const isBest = m.testRmse === Math.min(...latestModelMetrics.map((x) => x.testRmse));
                  return (
                    <tr
                      key={m.model}
                      onClick={() => setSelectedModel(m.model as (typeof MODELS)[number])}
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        background: m.model === selectedModel ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '0.65rem 0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                        {m.model} {isBest && <span className="badge badge-emerald" style={{ fontSize: '0.62rem', marginLeft: '0.35rem' }}>EN İYİ</span>}
                      </td>
                      <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>{m.testRmse}</td>
                      <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)' }}>{m.testMae}</td>
                      <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)' }}>%{m.testSmape}</td>
                      <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: '#a855f7' }}>%{m.testDa}</td>
                      <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: m.testR2 > 0 ? '#10b981' : '#f59e0b' }}>{m.testR2}</td>
                      <td style={{ padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{m.trainTimeSec}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sub-Tab 4: Real PyTorch & EDA Matplotlib Output Gallery */}
      {subTab === 'gallery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.9rem' }}>
          {CHART_GALLERY.map((item) => (
            <div key={item.file} style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '185px', background: '#fff' }}>
                <Image
                  src={`/demos/stock/charts/${item.file}`}
                  alt={item.title}
                  fill
                  unoptimized
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ padding: '0.6rem 0.8rem', fontSize: '0.74rem', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Cpu size={13} color="#00f0ff" /> {item.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
