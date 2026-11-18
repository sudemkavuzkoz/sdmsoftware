'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapPin,
  Search,
  Send,
  Sparkles,
  ExternalLink,
  BookOpen,
  Navigation,
  Compass,
  FileText,
  Clock
} from 'lucide-react';

interface CountryIndexItem {
  id: number;
  slug: string;
  name: string;
  filename: string;
  lat: number;
  lon: number;
  chunkCount: number;
  summary: string;
  famousCount: number;
}

interface FamousPlace {
  name: string;
  country: string;
  city: string;
  visitorsM: number;
  type: string;
  unesco: boolean;
  yearBuilt: string;
  feeUsd: number;
  bestMonth: string;
  region: string;
  durationHours: number;
  famousFor: string;
}

interface TravelChunk {
  id: number;
  source: string;
  heading: string;
  line: number;
  text: string;
}

interface CountryDoc {
  id: number;
  slug: string;
  name: string;
  filename: string;
  lat: number;
  lon: number;
  cities: string[];
  famousPlaces: FamousPlace[];
  chunks: TravelChunk[];
}

interface RagEvidence {
  dosya: string;
  bolum: number;
  heading: string;
  satir: number;
  skor: number;
  arama: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  evidence?: RagEvidence[];
  mapLinks?: { label: string; url: string }[];
}

interface LeafletMarker {
  on: (event: string, cb: () => void) => void;
  bindTooltip: (html: string, opts?: Record<string, unknown>) => void;
  setStyle: (style: Record<string, unknown>) => void;
}

interface LeafletMap {
  setView: (coords: [number, number], zoom: number, opts?: Record<string, unknown>) => LeafletMap;
  remove: () => void;
}

interface LeafletStatic {
  map: (el: HTMLElement, opts?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, opts?: Record<string, unknown>) => { addTo: (m: LeafletMap) => void };
  control: { zoom: (opts: Record<string, unknown>) => { addTo: (m: LeafletMap) => void } };
  circleMarker: (coords: [number, number], opts?: Record<string, unknown>) => LeafletMarker & { addTo: (m: LeafletMap) => LeafletMarker };
}

declare global {
  interface Window {
    L?: LeafletStatic;
  }
}

const FEATURED_SLUGS = [
  'istanbul',
  'antalya',
  'cappadocia',
  'turkey',
  'italy',
  'france',
  'japan',
  'spain',
  'greece',
  'thailand'
];

const TR_TO_EN_BRIDGE: Record<string, string[]> = {
  plan: ['tourism', 'overview', 'history', 'cityscape', 'historic', 'parks', 'famous', 'sites'],
  rota: ['tourism', 'sites', 'historic', 'parks', 'district', 'architecture', 'center'],
  program: ['tourism', 'sites', 'museum', 'historic', 'culture', 'overview'],
  gezi: ['tourism', 'sites', 'historic', 'museum', 'parks', 'architecture'],
  gezilecek: ['historic', 'sites', 'museum', 'palace', 'mosque', 'cathedral', 'parks', 'tower', 'square', 'tourism'],
  tarih: ['history', 'ancient', 'empire', 'century', 'historic', 'byzantine', 'ottoman', 'roman'],
  muze: ['museum', 'art', 'palace', 'gallery', 'archaeological', 'culture'],
  müze: ['museum', 'art', 'palace', 'gallery', 'archaeological', 'culture'],
  yemek: ['cuisine', 'food', 'restaurant', 'culinary', 'local', 'dish', 'wine', 'coffee'],
  gastronomi: ['cuisine', 'food', 'culinary', 'restaurant', 'traditional'],
  hava: ['climate', 'temperature', 'weather', 'summer', 'winter', 'precipitation', 'rain'],
  iklim: ['climate', 'temperature', 'mediterranean', 'summer', 'winter', 'season'],
  plaj: ['beach', 'coast', 'sea', 'riviera', 'island', 'bay', 'harbour'],
  deniz: ['sea', 'coast', 'bay', 'beach', 'harbour', 'island', 'strait'],
  ulasim: ['transport', 'airport', 'metro', 'railway', 'bridge', 'port'],
  ulaşım: ['transport', 'airport', 'metro', 'railway', 'bridge', 'port'],
  nerede: ['geography', 'located', 'capital', 'region', 'border', 'area'],
  nufus: ['population', 'demographics', 'million', 'city'],
  nüfus: ['population', 'demographics', 'million', 'city'],
  mimari: ['architecture', 'palace', 'mosque', 'cathedral', 'tower', 'church', 'bridge']
};

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();
}

function buildMapsUrl(placeName: string, destinationName: string): string {
  const query = encodeURIComponent(`${placeName}, ${destinationName}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} style={{ color: '#f8fafc', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} style={{ color: '#94a3b8', fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#38bdf8',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function extractPlaceCandidates(doc: CountryDoc): string[] {
  const found = new Set<string>();
  doc.famousPlaces.forEach((p) => found.add(p.name));
  doc.cities.forEach((c) => found.add(c));

  const landmarkRegex = /\b([A-Z][a-zA-ZığüşöçİĞÜŞÖÇ'’-]+(?:\s+(?:of|the|de|du|des|la|le|da))?(?:\s+[A-Z][a-zA-ZığüşöçİĞÜŞÖÇ'’-]+){0,3}\s+(?:Palace|Museum|Mosque|Cathedral|Tower|Square|Park|Bridge|Castle|Temple|Beach|Bazaar|Avenue|Gate|Church|Ruins|Bay|Fortress|Garden|Gardens))\b/g;
  for (const chunk of doc.chunks) {
    const matches = chunk.text.match(landmarkRegex);
    if (matches) {
      for (const m of matches) {
        if (m.length >= 6 && m.length <= 48) {
          found.add(m.trim());
        }
        if (found.size >= 16) break;
      }
    }
    if (found.size >= 16) break;
  }
  return Array.from(found).slice(0, 12);
}

function runHybridRagSearch(doc: CountryDoc, userQuery: string) {
  const rawTokens = userQuery
    .split(/\s+/)
    .map(normalizeToken)
    .filter((w) => w.length > 2);

  const expandedTerms = new Set<string>(rawTokens);
  for (const t of rawTokens) {
    for (const [trKey, enList] of Object.entries(TR_TO_EN_BRIDGE)) {
      if (t.includes(trKey) || trKey.includes(t)) {
        enList.forEach((en) => expandedTerms.add(en));
      }
    }
  }

  const isPlanRequest = /(plan|rota|program|gün|gun|tur|gezi|itinerary|day)/i.test(userQuery);
  const terms = Array.from(expandedTerms);

  const scored = doc.chunks.map((chunk) => {
    const haystack = `${chunk.heading} ${chunk.text}`.toLowerCase();
    const headingLower = chunk.heading.toLowerCase();
    let baseScore = 0.14;
    let hits = 0;

    for (const term of terms) {
      if (headingLower.includes(term)) {
        baseScore += 0.22;
        hits++;
      } else if (haystack.includes(term)) {
        baseScore += 0.14;
        hits++;
      }
    }

    if (chunk.id === 0 || /summary|overview/i.test(headingLower)) {
      baseScore += 0.08;
    }
    if (isPlanRequest && /(historic|sight|cityscape|tourism|park|architecture|culture|summary|overview)/i.test(headingLower)) {
      baseScore += 0.16;
    }

    const score = Math.min(0.98, +(baseScore + Math.min(hits * 0.03, 0.15)).toFixed(2));
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, isPlanRequest ? 6 : 4);

  const evidence: RagEvidence[] = top.map(({ chunk, score }) => ({
    dosya: chunk.source,
    bolum: chunk.id,
    heading: chunk.heading,
    satir: chunk.line,
    skor: score,
    arama: `${chunk.text.slice(0, 42).replace(/\s+/g, ' ').trim()}...`
  }));

  const places = extractPlaceCandidates(doc);
  const mapLinks = places.slice(0, 6).map((place) => ({
    label: place,
    url: buildMapsUrl(place, doc.name)
  }));

  // Build grounded response strictly from retrieved chunks + CSV famous places
  let response = '';
  if (isPlanRequest) {
    const dayMatch = userQuery.match(/(\d+)\s*(gün|gun|day)/i);
    const days = Math.min(5, Math.max(1, dayMatch ? parseInt(dayMatch[1], 10) : 3));
    const intro = top[0]?.chunk.text.split('. ').slice(0, 2).join('. ') || doc.chunks[0]?.text.slice(0, 260) || '';

    response += `### 📍 ${doc.name} — ${days} Günlük RAG Tabanlı Seyahat Rehberi\n\n`;
    response += `${intro}.\n\n`;

    for (let d = 1; d <= days; d++) {
      const p1 = places[(d - 1) * 2] || doc.cities[(d - 1) % Math.max(1, doc.cities.length)] || `${doc.name} Historic Center`;
      const p2 = places[(d - 1) * 2 + 1] || top[d % top.length]?.chunk.heading || `${doc.name} Cultural District`;
      const chunkExcerpt = top[d % top.length]?.chunk;
      const snippet = chunkExcerpt ? chunkExcerpt.text.split('. ').slice(0, 2).join('. ') : '';

      response += `#### Gün ${d}: ${p1} & ${chunkExcerpt?.heading || 'Bölge Keşfi'}\n`;
      response += `- **Sabah:** **${p1}** ziyareti ve çevresindeki tarihi doku incelemesi. *(Bkz: ${doc.filename}, Bölüm ${chunkExcerpt?.id ?? 0})*\n`;
      response += `- **Öğle & Öğleden Sonra:** **${p2}** odağında gezi — ${snippet.slice(0, 210)}${snippet.length > 210 ? '...' : ''}\n`;
      if (doc.famousPlaces[d - 1]) {
        const fp = doc.famousPlaces[d - 1];
        response += `- **Öne Çıkan Nokta (${fp.type}):** ${fp.name} (${fp.city}) — ${fp.famousFor} | Ort. Süre: ${fp.durationHours} sa | En iyi dönem: ${fp.bestMonth}\n`;
      }
      response += `\n`;
    }
  } else {
    response += `### 🔍 ${doc.name} — RAG Belge Sorgu Sonucu\n\n`;
    top.slice(0, 3).forEach(({ chunk }) => {
      const sentences = chunk.text.split('. ').slice(0, 3).join('. ');
      response += `**${chunk.heading}** *(Bkz: ${chunk.source}, Bölüm ${chunk.id})*\n${sentences}${sentences.endsWith('.') ? '' : '.'}\n\n`;
    });
    if (doc.famousPlaces.length > 0) {
      response += `**Kayıtlı Ünlü Noktalar (world_famous_places_2024.csv):**\n`;
      doc.famousPlaces.slice(0, 4).forEach((fp) => {
        response += `- **${fp.name}** (${fp.city}) — ${fp.famousFor} (UNESCO: ${fp.unesco ? 'Evet' : 'Hayır'})\n`;
      });
    }
  }

  return { response, evidence, mapLinks };
}

function loadLeafletAssets(): Promise<LeafletStatic | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve) => {
    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('leaflet-js-cdn') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L ?? null));
      existingScript.addEventListener('error', () => resolve(null));
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js-cdn';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L ?? null);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
}

export default function AiTravelPlannerApp({ fullHeight = false }: { fullHeight?: boolean }) {
  const [countries, setCountries] = useState<CountryIndexItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>('istanbul');
  const [activeDoc, setActiveDoc] = useState<CountryDoc | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const loadingDoc = !activeDoc || activeDoc.slug !== selectedSlug;
  const msgCounterRef = useRef(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load 200-destination index from AI-TRAVEL-PLANNER repo dataset
  useEffect(() => {
    let active = true;
    fetch('/demos/travel/countries.json')
      .then((r) => r.json())
      .then((data: CountryIndexItem[]) => {
        if (active) setCountries(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load selected country's real chunks
  useEffect(() => {
    if (!selectedSlug) return;
    let active = true;
    fetch(`/demos/travel/docs/${selectedSlug}.json`)
      .then((r) => r.json())
      .then((doc: CountryDoc) => {
        if (!active) return;
        setActiveDoc(doc);
        const introText = doc.chunks[0]?.text.slice(0, 260) || '';
        setMessages([
          {
            id: `welcome-${doc.slug}`,
            role: 'assistant',
            content: `**${doc.name}** (\`${doc.filename}\`) RAG veritabanından yüklendi — **${doc.chunks.length} belge bölümü** sorgulamaya hazır.\n\n> ${introText}...\n\nAşağıdan hızlı bir buton seçin veya dilediğiniz soruyu yazın.`
          }
        ]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selectedSlug]);

  // Initialize Leaflet World Map matching AI-TRAVEL-PLANNER/app.py
  useEffect(() => {
    if (countries.length === 0 || !mapContainerRef.current) return;
    let cancelled = false;

    loadLeafletAssets().then((L) => {
      if (cancelled || !L || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([36.0, 22.0], 3);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      const nextMarkers: Record<string, LeafletMarker> = {};
      countries.forEach((c) => {
        const isSelected = c.slug === selectedSlug;
        const marker = L.circleMarker([c.lat, c.lon], {
          radius: isSelected ? 10 : 7,
          fillColor: isSelected ? '#00f0ff' : '#10b981',
          color: '#ffffff',
          weight: isSelected ? 2.5 : 1.5,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindTooltip(`<b>${c.name}</b> (${c.chunkCount} bölüm)`, { direction: 'top' });
        marker.on('click', () => {
          setSelectedSlug(c.slug);
          map.setView([c.lat, c.lon], 5, { animate: true });
        });
        nextMarkers[c.slug] = marker;
      });

      markersRef.current = nextMarkers;
      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // Only init once when countries load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);

  // Highlight selected marker when selectedSlug changes
  useEffect(() => {
    const target = countries.find((c) => c.slug === selectedSlug);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.setView([target.lat, target.lon], target.slug === 'istanbul' || target.slug === 'antalya' ? 6 : 4, {
        animate: true
      });
    }
    Object.entries(markersRef.current).forEach(([slug, m]) => {
      m.setStyle({
        radius: slug === selectedSlug ? 10 : 7,
        fillColor: slug === selectedSlug ? '#00f0ff' : '#10b981',
        weight: slug === selectedSlug ? 2.5 : 1.5
      });
    });
  }, [selectedSlug, countries]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const filteredCountries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      return countries.filter((c) => FEATURED_SLUGS.includes(c.slug));
    }
    return countries.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q)).slice(0, 24);
  }, [countries, searchTerm]);

  const handleAsk = (queryText?: string) => {
    const query = (queryText ?? inputQuery).trim();
    if (!query || !activeDoc) return;

    const nextSeq = ++msgCounterRef.current;
    const userMsg: ChatMessage = {
      id: `u-${activeDoc.slug}-${nextSeq}`,
      role: 'user',
      content: query
    };

    const { response, evidence, mapLinks } = runHybridRagSearch(activeDoc, query);
    const botMsg: ChatMessage = {
      id: `a-${activeDoc.slug}-${nextSeq}`,
      role: 'assistant',
      content: response,
      evidence,
      mapLinks
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!queryText) setInputQuery('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: fullHeight ? '0' : 'var(--radius-lg)',
        overflow: 'hidden',
        border: fullHeight ? 'none' : '1px solid var(--border-subtle)',
        background: '#050811',
        height: fullHeight ? '100vh' : '680px',
        minHeight: '580px'
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.75rem 1.15rem',
          background: '#090f1d',
          borderBottom: '1px solid rgba(56, 189, 248, 0.16)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Compass size={17} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
              AI DÜNYA REHBERİ — Global RAG Travel Planner
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {countries.length} destinasyon belgesi • Gerçek travel_data RAG araması &amp; Harita pinleri
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href="https://github.com/sudemkavuzkoz/AI-TRAVEL-PLANNER"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem' }}
          >
            <ExternalLink size={12} /> GitHub Kodu
          </a>
        </div>
      </div>

      {/* Main Split Workspace: Map (Left) + RAG Chatbot (Right) */}
      <div className="travel-split-wrap" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Leaflet World Map + Destination Picker */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(148,163,184,0.14)', minHeight: '280px', minWidth: 0, overflow: 'hidden' }}>
          {/* Floating Search Box */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              zIndex: 450,
              maxWidth: '420px',
              background: 'rgba(7, 11, 22, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              padding: '0.75rem'
            }}
          >
            <div style={{ position: 'relative', marginBottom: '0.55rem' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="200 ülke/şehir ara (örn: Istanbul, Antalya, Japan, Italy)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  color: '#f8fafc',
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '78px', overflowY: 'auto' }}>
              {filteredCountries.map((c) => {
                const active = c.slug === selectedSlug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setSelectedSlug(c.slug)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: '999px',
                      cursor: 'pointer',
                      border: active ? '1px solid #00f0ff' : '1px solid rgba(16, 185, 129, 0.35)',
                      background: active ? 'rgba(0, 240, 255, 0.18)' : 'rgba(16, 185, 129, 0.1)',
                      color: active ? '#00f0ff' : '#a7f3d0'
                    }}
                  >
                    <MapPin size={10} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Element */}
          <div
            ref={mapContainerRef}
            className="travel-leaflet-map"
            style={{ width: '100%', height: '100%', minHeight: '300px', background: '#0b1220' }}
          />
          {!mapReady && (
            <div style={{ position: 'absolute', bottom: '14px', left: '14px', fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(9,13,22,0.85)', padding: '0.35rem 0.7rem', borderRadius: '8px' }}>
              Harita pinleri yükleniyor ({countries.length} konum)...
            </div>
          )}
        </div>

        {/* Right: RAG Chat Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#070b15', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(148,163,184,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0b1020' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
                {activeDoc ? `${activeDoc.name} Seyahat Rehberi` : 'Destinasyon Yükleniyor...'}
              </span>
            </div>
            {activeDoc && (
              <span style={{ fontSize: '0.68rem', color: '#38bdf8', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.28)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                RAG: {activeDoc.chunks.length} Bölüm
              </span>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div style={{ padding: '0.55rem 0.9rem', borderBottom: '1px solid rgba(148,163,184,0.08)', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', background: '#090e1a' }}>
            {[
              { label: '🗺️ 3 Günlük Plan', q: '3 günlük detaylı gezi planı ve rota öner' },
              { label: '🏛️ Tarihi Yerler', q: 'Tarihi mekanlar, müzeler ve gezilecek yerler nereler?' },
              { label: '🍽️ Kültür & Gastronomi', q: 'Yerel kültür, mutfak ve ünlü noktalar neler?' },
              { label: '☀️ İklim & Zaman', q: 'İklim, hava durumu ve en iyi ziyaret zamanı nedir?' }
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={loadingDoc || !activeDoc}
                onClick={() => handleAsk(item.q)}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.28rem 0.6rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(56,189,248,0.25)',
                  background: 'rgba(15,23,42,0.9)',
                  color: '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {loadingDoc ? (
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '1rem' }}>
                Belge vektör indeksi ve rehber bölümleri yükleniyor...
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '94%',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : '#0f172a',
                    border: msg.role === 'user' ? 'none' : '1px solid #1e293b',
                    color: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.8rem',
                    lineHeight: 1.55
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {msg.content.split('\n').map((line, idx) => {
                      if (!line.trim()) return <div key={idx} style={{ height: '0.25rem' }} />;
                      if (line.startsWith('### ')) {
                        return (
                          <div key={idx} style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.25rem' }}>
                            {renderInlineMarkdown(line.replace('### ', ''))}
                          </div>
                        );
                      }
                      if (line.startsWith('#### ')) {
                        return (
                          <div key={idx} style={{ fontSize: '0.84rem', fontWeight: 700, color: '#34d399', marginTop: '0.4rem', marginBottom: '0.1rem' }}>
                            {renderInlineMarkdown(line.replace('#### ', ''))}
                          </div>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote
                            key={idx}
                            style={{
                              borderLeft: '2px solid #38bdf8',
                              paddingLeft: '0.6rem',
                              color: '#cbd5e1',
                              fontSize: '0.76rem',
                              margin: '0.25rem 0'
                            }}
                          >
                            {renderInlineMarkdown(line.slice(2))}
                          </blockquote>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={idx} style={{ paddingLeft: '0.65rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: '#38bdf8' }}>•</span>
                            {renderInlineMarkdown(line.slice(2))}
                          </div>
                        );
                      }
                      return <div key={idx}>{renderInlineMarkdown(line)}</div>;
                    })}
                  </div>

                  {/* Google Maps Pills */}
                  {msg.mapLinks && msg.mapLinks.length > 0 && (
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.55rem', borderTop: '1px solid rgba(148,163,184,0.16)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Navigation size={11} color="#38bdf8" /> Google Maps Konum Bağlantıları:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {msg.mapLinks.map((m) => (
                          <a
                            key={m.label}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.69rem',
                              fontWeight: 600,
                              padding: '0.22rem 0.55rem',
                              borderRadius: '6px',
                              background: '#1e293b',
                              color: '#38bdf8',
                              border: '1px solid #334155'
                            }}
                          >
                            <MapPin size={10} /> {m.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RAG Evidence Report */}
                  {msg.evidence && msg.evidence.length > 0 && (
                    <div style={{ marginTop: '0.65rem', padding: '0.55rem', borderRadius: '8px', background: 'rgba(2, 6, 23, 0.65)', border: '1px solid rgba(56, 189, 248, 0.16)' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <BookOpen size={11} /> Kullanılan Kaynaklar ve RAG Kanıt Raporu:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {msg.evidence.slice(0, 3).map((ev, i) => (
                          <div key={i} style={{ fontSize: '0.67rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span>
                              <FileText size={10} style={{ display: 'inline', marginRight: '3px' }} />
                              <strong style={{ color: '#e2e8f0' }}>{ev.dosya}</strong> • {ev.heading} (Bölüm {ev.bolum}, Satır {ev.satir})
                            </span>
                            <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>Skor: {ev.skor.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            style={{ padding: '0.7rem 0.9rem', borderTop: '1px solid rgba(148,163,184,0.14)', background: '#0b1020' }}
          >
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loadingDoc || !activeDoc}
                placeholder={activeDoc ? `${activeDoc.name} hakkında soru sorun veya gün/rota isteyin...` : 'Yükleniyor...'}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '9px',
                  padding: '0.55rem 0.85rem',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loadingDoc || !activeDoc || !inputQuery.trim()}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.5rem 0.9rem' }}
              >
                <Send size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.66rem', color: '#64748b' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={10} color="#38bdf8" /> Engine: Hybrid RAG + Travel Corpus ({countries.length} Destinasyon)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={10} /> Sıfır Halüsinasyon Modu
              </span>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        :global(.travel-leaflet-map .leaflet-tile-container) {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        :global(.travel-leaflet-map .leaflet-container) {
          background: #0b1220 !important;
        }
        @media (max-width: 720px) {
          :global(.travel-split-wrap) {
            grid-template-columns: 1fr !important;
            grid-template-rows: 260px 1fr;
          }
        }
      `}</style>
    </div>
  );
}
