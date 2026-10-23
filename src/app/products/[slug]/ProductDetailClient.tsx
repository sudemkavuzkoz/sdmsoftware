'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Play, 
  Download, 
  Layers, 
  ArrowLeft, 
  FileCode, 
  Cpu, 
  Clock,
  Check,
  ChevronDown
} from 'lucide-react';
import { Product, DemoProject, LicenseTier } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import LiveDemoModal from '@/components/LiveDemoModal';

interface ProductDetailClientProps {
  product: Product;
  relatedDemo: DemoProject | null;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  relatedDemo,
  relatedProducts
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState<LicenseTier>('standard');
  const [added, setAdded] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const getTierPrice = (tier: LicenseTier) => {
    switch (tier) {
      case 'standard':
        return product.price;
      case 'commercial':
        return Math.round(product.price * 1.5);
      case 'extended':
        return Math.round(product.price * 2.5);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedTier);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Geri Dönüş Linki */}
      <Link
        href="/products"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '2rem'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={16} />
        <span>Tüm Yazılım Kataloğuna Dön</span>
      </Link>

      {/* Ana Ürün Paneli */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', marginBottom: '4rem' }} className="product-layout">
        {/* Sol Taraf: Görsel, Teknik Detaylar, Açıklama */}
        <div>
          <div className="glass-card" style={{ height: '360px', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
            <div className="glow-accent" />
            <img
              src={product.imageUrl}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {product.badge && (
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <span className="badge badge-cyan">{product.badge}</span>
              </div>
            )}
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <span className="badge" style={{ background: 'rgba(0,0,0,0.7)', color: '#ffffff' }}>
                Sürüm {product.version}
              </span>
            </div>
          </div>

          {/* Açıklama */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Yazılım Mimarisi ve Kapsamı
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Teknik Özellikler ve Modüller:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {product.features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teknoloji Yığını */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Kullanılan Teknolojiler:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {product.techStack.map(t => (
                <span key={t} className="tech-tag" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Lisans Seçimi, Fiyat, Satın Alma & Demo Butonu */}
        <div>
          <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '6rem' }}>
            <div className="glow-accent" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="badge badge-purple">{product.category.toUpperCase()}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
                <Star size={15} fill="var(--accent-amber)" />
                <span style={{ fontWeight: 700 }}>{product.rating}</span>
                <span style={{ color: 'var(--text-dim)' }}>({product.reviewsCount} Değerlendirme)</span>
              </div>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: '1.3' }}>
              {product.title}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {product.shortDescription}
            </p>

            {/* Lisans Seçici */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Lisans Tipini Seçin:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* 1. Standart */}
                <div
                  onClick={() => setSelectedTier('standard')}
                  style={{
                    border: `1px solid ${selectedTier === 'standard' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: selectedTier === 'standard' ? 'rgba(0, 240, 255, 0.06)' : 'var(--bg-elevated)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Tekil Geliştirici Lisansı</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        1 Proje / Bireysel veya tek işletme kullanımı
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {getTierPrice('standard').toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>

                {/* 2. Ticari */}
                <div
                  onClick={() => setSelectedTier('commercial')}
                  style={{
                    border: `1px solid ${selectedTier === 'commercial' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: selectedTier === 'commercial' ? 'rgba(0, 240, 255, 0.06)' : 'var(--bg-elevated)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Ticari Şirket Lisansı</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        Sınırsız iç kullanım / Çoklu departman
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {getTierPrice('commercial').toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>

                {/* 3. Genişletilmiş */}
                <div
                  onClick={() => setSelectedTier('extended')}
                  style={{
                    border: `1px solid ${selectedTier === 'extended' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: selectedTier === 'extended' ? 'rgba(0, 240, 255, 0.06)' : 'var(--bg-elevated)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Genişletilmiş Kurumsal Lisans</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        SaaS olarak satma veya alt müşterilere dağıtım hakkı
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {getTierPrice('extended').toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fiyat Göstergesi ve Sepete Ekle Butonu */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Ödenecek Tutar:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {getTierPrice(selectedTier).toLocaleString('tr-TR')} ₺
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem'
                }}
              >
                {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                <span>{added ? 'Sepete Eklendi!' : 'Sepete Ekle & Ödemeye Geç'}</span>
              </button>
            </div>

            {/* Canlı Demo Butonu (Eğer bu ürüne ait demo varsa) */}
            {relatedDemo && (
              <button
                onClick={() => setDemoModalOpen(true)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  borderColor: 'rgba(0, 240, 255, 0.3)',
                  marginBottom: '1.5rem'
                }}
              >
                <Play size={16} fill="var(--primary)" color="var(--primary)" />
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Canlı Demo Sürümünü Test Et</span>
              </button>
            )}

            {/* Güvenlik Rozetleri */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={15} color="var(--accent-emerald)" />
                <span>Tek Seferlik Ödeme — Gizli Aylık Ücret Yok</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={15} color="var(--primary)" />
                <span>Ödeme Onayından Sonra Anında Kaynak Kod & Lisans Teslimi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={15} color="var(--accent-purple)" />
                <span>6 Ay Ücretsiz Mühendislik & Güvenlik Güncellemeleri</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İlgili Diğer Ürünler */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            İlginizi Çekebilecek Diğer Yazılımlar
          </h3>
          <div className="grid-cols-3">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {relatedDemo && (
        <LiveDemoModal
          demo={demoModalOpen ? relatedDemo : null}
          onClose={() => setDemoModalOpen(false)}
        />
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.product-layout) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
