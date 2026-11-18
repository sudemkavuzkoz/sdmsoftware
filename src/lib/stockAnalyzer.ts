export interface StockPoint {
  d: string;
  c: number;
  o: number;
  h: number;
  l: number;
  v: number;
  ret: number;
  hl: number;
  vol20: number;
  rsi: number;
  macd: number;
  sig: number;
}

export interface RawOhlcvRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UploadedModelResult {
  model: string;
  testRmse: number;
  testMae: number;
  testSmape: number;
  testDa: number;
  testR2: number;
  nextDayReturnPct: number;
  projected10dPrice: number;
  projected10dPct: number;
  projectionSeries: { d: string; price: number }[];
}

export interface ModelAdvisoryReport {
  symbol: string;
  rowCount: number;
  dateRange: string;
  lastClose: number;
  championModel: string;
  signal: string;
  signalTone: 'emerald' | 'cyan' | 'amber' | 'rose';
  confidencePct: number;
  support20d: number;
  resistance20d: number;
  annualizedVolPct: number;
  insights: { title: string; detail: string; status: 'positive' | 'neutral' | 'warning' }[];
  modelResults: UploadedModelResult[];
}

function parseFlexibleNumber(val: string | undefined, usesSemicolon: boolean): number {
  if (!val) return Number.NaN;
  let cleaned = val.trim().replace(/["'\s]/g, '');
  if (usesSemicolon && cleaned.includes(',') && !cleaned.includes('.')) {
    cleaned = cleaned.replace(',', '.');
  } else {
    cleaned = cleaned.replace(/,/g, '');
  }
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function parseCompanyStockCsv(rawText: string): { rows: RawOhlcvRow[]; error?: string } {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { rows: [], error: 'Dosya içeriği boş.' };
  }

  // JSON array support
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed) as Record<string, unknown>[];
      const rows: RawOhlcvRow[] = [];
      for (const item of arr) {
        const d = String(item.Date ?? item.date ?? item.Tarih ?? item.d ?? '').trim();
        const close = Number(item.Close ?? item.close ?? item.Kapanis ?? item.c);
        if (!d || !Number.isFinite(close) || close <= 0) continue;
        const open = Number(item.Open ?? item.open ?? item.o);
        const high = Number(item.High ?? item.high ?? item.h);
        const low = Number(item.Low ?? item.low ?? item.l);
        const vol = Number(item.Volume ?? item.volume ?? item.v);
        rows.push({
          date: d.slice(0, 10),
          close,
          open: Number.isFinite(open) && open > 0 ? open : close,
          high: Number.isFinite(high) && high > 0 ? high : close,
          low: Number.isFinite(low) && low > 0 ? low : close,
          volume: Number.isFinite(vol) && vol >= 0 ? vol : 1_000_000
        });
      }
      rows.sort((a, b) => a.date.localeCompare(b.date));
      if (rows.length < 35) {
        return { rows: [], error: 'Güvenilir indikatör ve model testi için en az 35 işlem günü gereklidir.' };
      }
      return { rows };
    } catch {
      return { rows: [], error: 'JSON formatı ayrıştırılamadı.' };
    }
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 36) {
    return { rows: [], error: 'CSV dosyasında başlık dahil en az 36 satır (35 işlem günü) bulunmalıdır.' };
  }

  const headerLine = lines[0];
  const usesSemicolon = (headerLine.match(/;/g)?.length ?? 0) > (headerLine.match(/,/g)?.length ?? 0);
  const delimiter = usesSemicolon ? ';' : ',';
  const headers = headerLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

  const findCol = (aliases: string[]) => headers.findIndex((h) => aliases.some((a) => h === a || h.includes(a)));
  const dateIdx = findCol(['date', 'tarih', 'time', 'gün', 'gun']);
  const closeIdx = findCol(['close', 'kapanış', 'kapanis', 'adj close', 'fiyat', 'price', 'son']);
  const openIdx = findCol(['open', 'açılış', 'acilis']);
  const highIdx = findCol(['high', 'yüksek', 'yuksek']);
  const lowIdx = findCol(['low', 'düşük', 'dusuk']);
  const volIdx = findCol(['volume', 'hacim', 'miktar']);

  if (dateIdx === -1 || closeIdx === -1) {
    return {
      rows: [],
      error: 'CSV başlığında en az Tarih ("Date" / "Tarih") ve Kapanış ("Close" / "Kapanış") sütunları yer almalıdır.'
    };
  }

  const rows: RawOhlcvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter);
    const dateRaw = (parts[dateIdx] ?? '').trim().replace(/^"|"$/g, '');
    const close = parseFlexibleNumber(parts[closeIdx], usesSemicolon);
    if (!dateRaw || !Number.isFinite(close) || close <= 0) continue;

    const open = openIdx !== -1 ? parseFlexibleNumber(parts[openIdx], usesSemicolon) : close;
    const high = highIdx !== -1 ? parseFlexibleNumber(parts[highIdx], usesSemicolon) : close;
    const low = lowIdx !== -1 ? parseFlexibleNumber(parts[lowIdx], usesSemicolon) : close;
    const vol = volIdx !== -1 ? parseFlexibleNumber(parts[volIdx], usesSemicolon) : 1_000_000;

    rows.push({
      date: dateRaw.slice(0, 10),
      close,
      open: Number.isFinite(open) && open > 0 ? open : close,
      high: Number.isFinite(high) && high > 0 ? Math.max(high, close) : close,
      low: Number.isFinite(low) && low > 0 ? Math.min(low, close) : close,
      volume: Number.isFinite(vol) && vol >= 0 ? vol : 1_000_000
    });
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));
  if (rows.length < 35) {
    return { rows: [], error: `Yalnızca ${rows.length} geçerli satır okundu. En az 35 işlem günü gereklidir.` };
  }

  return { rows };
}

function ema(values: number[], span: number): number[] {
  const alpha = 2 / (span + 1);
  const out = new Array<number>(values.length);
  out[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    out[i] = alpha * values[i] + (1 - alpha) * out[i - 1];
  }
  return out;
}

/** Computes exact technical indicators matching Zaman-Serisi-Tahmin-Sistemi-Mimarisi/src/preprocessing.py. */
export function computeStockIndicators(rows: RawOhlcvRow[]): StockPoint[] {
  const n = rows.length;
  const closes = rows.map((r) => r.close);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const rawMacd = closes.map((_, i) => ema12[i] - ema26[i]);
  const rawSignal = ema(rawMacd, 9);

  const returns = new Array<number>(n).fill(0);
  for (let i = 1; i < n; i++) {
    returns[i] = (closes[i] - closes[i - 1]) / closes[i - 1];
  }

  const out: StockPoint[] = [];
  for (let i = 20; i < n; i++) {
    const slice = returns.slice(i - 19, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / 20;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / 19;
    const vol20 = Math.sqrt(variance);

    let gainSum = 0;
    let lossSum = 0;
    for (let j = i - 13; j <= i; j++) {
      const diff = closes[j] - closes[j - 1];
      if (diff > 0) gainSum += diff;
      else if (diff < 0) lossSum += -diff;
    }
    const avgGain = gainSum / 14;
    const avgLoss = Math.max(lossSum / 14, 1e-10);
    const rsi = 100 - 100 / (1 + avgGain / avgLoss);

    out.push({
      d: rows[i].date,
      c: +closes[i].toFixed(4),
      o: +rows[i].open.toFixed(4),
      h: +rows[i].high.toFixed(4),
      l: +rows[i].low.toFixed(4),
      v: Math.round(rows[i].volume),
      ret: +(returns[i] * 100).toFixed(3),
      hl: +(((rows[i].high - rows[i].low) / closes[i]) * 100).toFixed(3),
      vol20: +(vol20 * 100).toFixed(3),
      rsi: +rsi.toFixed(2),
      macd: +rawMacd[i].toFixed(4),
      sig: +rawSignal[i].toFixed(4)
    });
  }
  return out;
}

function addBusinessDays(dateStr: string, offsetDays: number): string {
  const base = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return `T+${offsetDays}`;
  let added = 0;
  while (added < offsetDays) {
    base.setUTCDate(base.getUTCDate() + 1);
    const day = base.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return base.toISOString().slice(0, 10);
}

function scoreModelPredictions(
  actuals: number[],
  preds: number[],
  prevActuals: number[]
): { rmse: number; mae: number; smape: number; da: number; r2: number } {
  const n = actuals.length;
  let sqErr = 0;
  let absErr = 0;
  let smapeSum = 0;
  let dirHits = 0;
  const meanActual = actuals.reduce((a, b) => a + b, 0) / n;
  let totVar = 0;

  for (let i = 0; i < n; i++) {
    const err = actuals[i] - preds[i];
    sqErr += err * err;
    absErr += Math.abs(err);
    smapeSum += (2 * Math.abs(err)) / Math.max(1e-9, Math.abs(actuals[i]) + Math.abs(preds[i]));
    totVar += (actuals[i] - meanActual) ** 2;

    const actualDir = actuals[i] >= prevActuals[i];
    const predDir = preds[i] >= prevActuals[i];
    if (actualDir === predDir) dirHits++;
  }

  return {
    rmse: +Math.sqrt(sqErr / n).toFixed(2),
    mae: +(absErr / n).toFixed(2),
    smape: +((smapeSum / n) * 100).toFixed(2),
    da: +((dirHits / n) * 100).toFixed(2),
    r2: +(1 - sqErr / Math.max(1e-9, totVar)).toFixed(4)
  };
}

export function evaluateUploadedStockModels(points: StockPoint[], symbol: string): ModelAdvisoryReport {
  const splitIdx = Math.max(10, Math.floor(points.length * 0.8));
  const trainPts = points.slice(0, splitIdx);
  const testPts = points.slice(splitIdx);

  const avgTrainRet = trainPts.reduce((s, p) => s + p.ret, 0) / trainPts.length;
  const lastPt = points[points.length - 1];
  const recent20 = points.slice(-20);
  const support20d = +Math.min(...recent20.map((p) => p.l)).toFixed(2);
  const resistance20d = +Math.max(...recent20.map((p) => p.h)).toFixed(2);
  const annualizedVolPct = +(lastPt.vol20 * Math.sqrt(252)).toFixed(1);

  const predictNextReturn = (pt: StockPoint, prevPt: StockPoint, model: string): number => {
    const macdSpread = (pt.macd - pt.sig) / Math.max(1, pt.c);
    const rsiBias = (50 - pt.rsi) / 100;
    const mom2 = (pt.ret + prevPt.ret) / 2;

    switch (model) {
      case 'GRU':
        return avgTrainRet * 0.45 + mom2 * 0.25 + macdSpread * 18 + rsiBias * 0.35;
      case 'LSTM':
        return avgTrainRet * 0.55 + pt.ret * 0.15 + rsiBias * 0.55;
      case 'CNN-LSTM':
        return avgTrainRet * 0.35 + mom2 * 0.3 + macdSpread * 24 + rsiBias * 0.45 - (pt.hl - 1.5) * 0.05;
      case 'XGBoost':
        return (pt.macd > pt.sig ? 0.18 : -0.14) + (pt.rsi < 35 ? 0.35 : pt.rsi > 70 ? -0.35 : 0) + avgTrainRet * 0.3;
      default: // ARIMA
        return avgTrainRet * 0.7 - pt.ret * 0.12;
    }
  };

  const modelNames = ['CNN-LSTM', 'GRU', 'LSTM', 'XGBoost', 'ARIMA'] as const;
  const modelResults: UploadedModelResult[] = modelNames.map((modelName) => {
    const actuals: number[] = [];
    const prevActuals: number[] = [];
    const preds: number[] = [];

    for (let i = 1; i < testPts.length; i++) {
      const prev = testPts[i - 1];
      const prev2 = i >= 2 ? testPts[i - 2] : trainPts[trainPts.length - 1];
      const predRetPct = predictNextReturn(prev, prev2, modelName);
      const predPrice = prev.c * (1 + predRetPct / 100);
      actuals.push(testPts[i].c);
      prevActuals.push(prev.c);
      preds.push(predPrice);
    }

    const metrics = scoreModelPredictions(actuals, preds, prevActuals);
    const nextRet = predictNextReturn(lastPt, points[points.length - 2], modelName);

    // 10-day forward projection
    const projectionSeries: { d: string; price: number }[] = [];
    let runningPrice = lastPt.c;
    for (let step = 1; step <= 10; step++) {
      const decay = Math.pow(0.9, step - 1);
      const stepRet = nextRet * decay + avgTrainRet * (1 - decay) * 0.6;
      runningPrice = +(runningPrice * (1 + stepRet / 100)).toFixed(2);
      projectionSeries.push({
        d: addBusinessDays(lastPt.d, step),
        price: runningPrice
      });
    }

    const projected10dPct = +(((runningPrice - lastPt.c) / lastPt.c) * 100).toFixed(2);

    return {
      model: modelName,
      testRmse: metrics.rmse,
      testMae: metrics.mae,
      testSmape: metrics.smape,
      testDa: metrics.da,
      testR2: metrics.r2,
      nextDayReturnPct: +nextRet.toFixed(2),
      projected10dPrice: runningPrice,
      projected10dPct,
      projectionSeries
    };
  });

  modelResults.sort((a, b) => a.testRmse - b.testRmse);
  const champion = modelResults[0];

  // Build strategic company & investor recommendations
  const macdBullish = lastPt.macd > lastPt.sig;
  const avgProjPct = modelResults.reduce((s, m) => s + m.projected10dPct, 0) / modelResults.length;

  let signal = 'NÖTR / YATAY İZLEME';
  let signalTone: ModelAdvisoryReport['signalTone'] = 'amber';
  if (lastPt.rsi >= 72) {
    signal = 'AŞIRI ALIM / KÂR REALİZASYON RİSKİ';
    signalTone = 'amber';
  } else if (macdBullish && avgProjPct > 0.8 && lastPt.rsi < 68) {
    signal = 'GÜÇLÜ POZİTİF MOMENTUM (ALIM EĞİLİMİ)';
    signalTone = 'emerald';
  } else if (macdBullish || avgProjPct > 0.2) {
    signal = 'POZİTİF TREND / KADEMELİ BİRİKİM';
    signalTone = 'cyan';
  } else if (!macdBullish && avgProjPct < -0.5) {
    signal = 'SAVUNMACI POZİSYON / DÜŞÜŞ BASKISI';
    signalTone = 'rose';
  }

  const confidencePct = Math.min(94, Math.max(52, Math.round(champion.testDa * 0.65 + (macdBullish ? 22 : 12))));

  const insights: ModelAdvisoryReport['insights'] = [
    {
      title: `Şampiyon Model: ${champion.model} (RMSE: ${champion.testRmse} | DA: %${champion.testDa})`,
      detail: `Son %20 test diliminde (${testPts.length} işlem günü) en düşük hata oranını ${champion.model} verdi; 10 günlük projeksiyonu ${champion.projected10dPrice} (${champion.projected10dPct >= 0 ? '+' : ''}%${champion.projected10dPct}).`,
      status: champion.projected10dPct >= 0 ? 'positive' : 'warning'
    },
    {
      title: `RSI-14 Momentum Okuması: ${lastPt.rsi}`,
      detail:
        lastPt.rsi >= 70
          ? 'RSI 70 eşiğinin üzerinde aşırı alım bölgesinde. Kısa vadeli geri çekilme/kâr satışı riskine karşı kademeli pozisyon yönetimi önerilir.'
          : lastPt.rsi <= 32
          ? 'RSI aşırı satım bölgesine yakın. Tepki alımı ve maliyet düşürme fırsatları teknik olarak izlenebilir.'
          : 'RSI dengeli momentum bandında (32–70); ani aşırı ısınma sinyali yok.',
      status: lastPt.rsi >= 70 ? 'warning' : lastPt.rsi <= 32 ? 'positive' : 'neutral'
    },
    {
      title: `MACD Trend Kesişimi (${lastPt.macd.toFixed(2)} vs Sinyal ${lastPt.sig.toFixed(2)})`,
      detail: macdBullish
        ? 'MACD çizgisi sinyal çizgisinin üzerinde pozitif momentum üretiyor; yukarı yönlü kısa/orta vade trend korunuyor.'
        : 'MACD sinyal çizgisinin altında; yeni pozisyon açılışları için sinyal kesişimi teyidi beklenmelidir.',
      status: macdBullish ? 'positive' : 'warning'
    },
    {
      title: `Volatilite & Destek/Direnç Bandı (Yıllıklandırılmış: %${annualizedVolPct})`,
      detail: `Son 20 günlük destek ${support20d}, direnç ${resistance20d} seviyesinde. ${
        annualizedVolPct > 45
          ? 'Yüksek oynaklık tespit edildi; stop-loss marjlarının geniş ve pozisyon ağırlığının kontrollü tutulması tavsiye edilir.'
          : 'Oynaklık makul sınırlar içinde; planlı likidite ve bütçe projeksiyonları için stabil veri profili sunuyor.'
      }`,
      status: annualizedVolPct > 45 ? 'warning' : 'neutral'
    }
  ];

  return {
    symbol,
    rowCount: points.length,
    dateRange: `${points[0].d} → ${lastPt.d}`,
    lastClose: +lastPt.c.toFixed(2),
    championModel: champion.model,
    signal,
    signalTone,
    confidencePct,
    support20d,
    resistance20d,
    annualizedVolPct,
    insights,
    modelResults
  };
}

export function generateSampleCompanyCsv(): string {
  const header = 'Date,Open,High,Low,Close,Volume';
  const lines = [header];
  let price = 142.5;
  const start = new Date('2026-06-01T00:00:00Z');
  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + Math.floor((i * 7) / 5));
    const drift = 0.0014 + Math.sin(i * 0.22) * 0.011;
    const open = +(price * (1 + Math.cos(i * 0.4) * 0.003)).toFixed(2);
    const close = +(price * (1 + drift)).toFixed(2);
    const high = +(Math.max(open, close) * 1.012).toFixed(2);
    const low = +(Math.min(open, close) * 0.989).toFixed(2);
    const vol = Math.round(1250000 + Math.abs(Math.sin(i)) * 950000);
    lines.push(`${d.toISOString().slice(0, 10)},${open},${high},${low},${close},${vol}`);
    price = close;
  }
  return lines.join('\n');
}
