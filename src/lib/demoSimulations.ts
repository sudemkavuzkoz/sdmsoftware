export interface StockSimData {
  current: number;
  predicted: number;
  signal: string;
  confidence: number;
  rsi: number;
  sentiment: number;
  currency: string;
  change: number;
  bars: number[];
}

export const STOCK_DATA: Record<string, StockSimData> = {
  'THYAO.IS': {
    current: 318.5,
    predicted: 364.2,
    signal: 'GÜÇLÜ AL',
    confidence: 89,
    rsi: 58.4,
    sentiment: 88,
    currency: '₺',
    change: 2.4,
    bars: [38, 44, 42, 52, 58, 55, 67, 76, 84, 94],
  },
  'ASELS.IS': {
    current: 62.4,
    predicted: 71.8,
    signal: 'AL',
    confidence: 82,
    rsi: 54.1,
    sentiment: 84,
    currency: '₺',
    change: 1.1,
    bars: [42, 46, 49, 47, 54, 58, 61, 69, 75, 83],
  },
  'EREGL.IS': {
    current: 48.9,
    predicted: 53.2,
    signal: 'TUT',
    confidence: 68,
    rsi: 49.3,
    sentiment: 62,
    currency: '₺',
    change: -0.3,
    bars: [55, 52, 54, 48, 50, 49, 51, 54, 57, 60],
  },
  AAPL: {
    current: 232.0,
    predicted: 258.5,
    signal: 'GÜÇLÜ AL',
    confidence: 91,
    rsi: 61.2,
    sentiment: 92,
    currency: '$',
    change: 1.8,
    bars: [45, 49, 53, 51, 60, 64, 68, 75, 82, 90],
  },
  NVDA: {
    current: 138.5,
    predicted: 162.0,
    signal: 'GÜÇLÜ AL',
    confidence: 94,
    rsi: 67.8,
    sentiment: 95,
    currency: '$',
    change: 3.2,
    bars: [34, 40, 48, 45, 57, 65, 72, 81, 89, 97],
  },
};

const HORIZON_OFFSETS: Record<string, number> = {
  '1 Hafta': -8,
  '1 Ay': 0,
  '3 Ay': 6,
};

/** Returns 10 normalized chart bar heights (15..98) for the selected stock and horizon. */
export function getProjectionBars(stock: string, horizon: string): number[] {
  const base = (STOCK_DATA[stock] || STOCK_DATA['THYAO.IS']).bars;
  const offset = HORIZON_OFFSETS[horizon] ?? 0;
  return base.map((v, i) => {
    const delta = i >= 7 ? offset : Math.round(offset / 3);
    return Math.max(18, Math.min(98, v + delta));
  });
}

export const PROTEZ_STAGES = [
  'Ölçü Alındı',
  'Metal Döküm',
  'Metal Prova',
  'Porselen Prova',
  'Teslim Edildi',
] as const;

export const PROTEZ_STAGE_COLORS = [
  'var(--primary)',
  'var(--primary)',
  'var(--accent-amber)',
  'var(--accent-amber)',
  'var(--accent-emerald)',
] as const;

export const VET_STATUS_COLOR: Record<string, string> = {
  Onaylandı: 'var(--accent-emerald)',
  Muayenede: 'var(--primary)',
  Beklemede: 'var(--accent-amber)',
  Tamamlandı: 'var(--accent-purple)',
};

export const KNOWN_DEMO_SLUGS = [
  'ai-travel-planner-demo',
  'stock-price-prediction-demo',
  'sdm-clinic-system-demo',
  'protez-takip-sistemi-demo',
  'veteriner-klinik-demo',
  'pati-bahcesi-demo',
] as const;
