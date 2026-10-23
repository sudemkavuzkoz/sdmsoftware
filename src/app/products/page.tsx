'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { Product, ProductCategory, DemoProject } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import LiveDemoModal from '@/components/LiveDemoModal';

export default function ProductsPage() {
  const allProducts = db.getProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);

  const categories = [
    { id: 'all', label: 'Tüm Ürünler' },
    { id: 'saas', label: 'AI Travel Planner & SaaS' },
    { id: 'webapp', label: 'Borsa Tahmin & FinTech' },
    { id: 'enterprise', label: 'SDM Klinik & Sağlık' },
    { id: 'trendyol', label: '🧡 Trendyol Mağaza Ürünleri' }
  ];

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // 'featured'
      });
  }, [allProducts, searchQuery, selectedCategory, sortBy]);

  const handleOpenDemoBySlug = (slug: string) => {
    const demo = db.getDemoBySlug(slug);
    if (demo) setSelectedDemo(demo);
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Başlık Bölümü */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
          DİJİTAL YAZILIM MAĞAZASI
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Yazılım Çözümleri & <span className="text-gradient">Lisans Kataloğu</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
          Geliştirdiğimiz kurumsal yazılımları, modülleri ve API kütüphanelerini inceleyin. İhtiyacınıza uygun lisansı seçerek anında edinin.
        </p>
      </div>

      {/* Arama & Filtre Çubuğu */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(13, 18, 29, 0.7)'
        }}
      >
        {/* Canlı Arama Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
          <Search
            size={18}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Yazılım ara... (örn: ERP, Chatbot, Finans, API)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
          />
        </div>

        {/* Sıralama Seçimi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SlidersHorizontal size={16} color="var(--text-muted)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="featured">Öne Çıkanlar</option>
            <option value="price-low">Fiyat: Düşükten Yükseğe</option>
            <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Puan</option>
          </select>
        </div>
      </div>

      {/* Kategori Butonları */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Ürün Listesi Izgarası */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Aramanızla eşleşen yazılım ürünü bulunamadı.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="btn btn-secondary btn-sm"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDemo={handleOpenDemoBySlug}
            />
          ))}
        </div>
      )}

      {/* Demo Modal */}
      <LiveDemoModal
        demo={selectedDemo}
        onClose={() => setSelectedDemo(null)}
      />
    </div>
  );
}
