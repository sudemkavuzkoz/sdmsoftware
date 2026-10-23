'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Check, ExternalLink, Play, Mail } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDemo?: (slug: string) => void;
}

export default function ProductCard({ product, onOpenDemo }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 'standard');
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const getBadgeClass = (badge?: string) => {
    switch (badge) {
      case 'Popüler':
        return 'badge-cyan';
      case 'Çok Satan':
        return 'badge-purple';
      case 'Yeni':
        return 'badge-emerald';
      case 'Özel':
        return 'badge-amber';
      case 'Trendyol':
        return 'badge-trendyol';
      default:
        return 'badge-cyan';
    }
  };

  const isTrendyol = product.isTrendyol || product.category === 'trendyol';

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderColor: isTrendyol ? 'rgba(242, 122, 26, 0.3)' : undefined
      }}
    >
      <div
        className="glow-accent"
        style={{
          background: isTrendyol
            ? 'linear-gradient(90deg, transparent 0%, #f27a1a 50%, transparent 100%)'
            : undefined
        }}
      />

      {/* Ürün Görseli & Rozetler */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#0a0e17' }}>
        <img
          src={product.imageUrl}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="product-img"
        />

        {/* Rozet */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          {isTrendyol ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                background: 'rgba(242, 122, 26, 0.9)',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(242, 122, 26, 0.5)'
              }}
            >
              🧡 TRENDYOL
            </span>
          ) : (
            product.badge && (
              <span className={`badge ${getBadgeClass(product.badge)}`}>
                {product.badge}
              </span>
            )
          )}
        </div>

        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span className="badge" style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff', backdropFilter: 'blur(4px)' }}>
            {product.version}
          </span>
        </div>

        {/* Demo Varsa Hızlı Canlı Demo Butonu */}
        {product.demoSlug && onOpenDemo && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenDemo(product.demoSlug!);
            }}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(0, 240, 255, 0.9)',
              color: '#07090e',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 12px rgba(0, 240, 255, 0.4)'
            }}
          >
            <Play size={11} fill="#07090e" />
            <span>Canlı Demo</span>
          </button>
        )}
      </div>

      {/* Kart İçeriği */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Rating & Kategori */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: isTrendyol ? '#f27a1a' : 'var(--primary)',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}
          >
            {isTrendyol ? 'Trendyol Mağazası' : product.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--accent-amber)' }}>
            <Star size={13} fill="var(--accent-amber)" />
            <span style={{ fontWeight: 700 }}>{product.rating}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>({product.reviewsCount})</span>
          </div>
        </div>

        {/* Başlık ve Açıklama */}
        <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: '1.35',
              marginBottom: '0.5rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isTrendyol ? '#f27a1a' : 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
          >
            {product.title}
          </h3>
        </Link>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5', flex: 1 }}>
          {product.shortDescription}
        </p>

        {/* Teknoloji Rozetleri */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
          {product.techStack.slice(0, 3).map((tech) => (
            <span key={tech} className="tech-tag">
              {tech}
            </span>
          ))}
          {product.techStack.length > 3 && (
            <span className="tech-tag" style={{ color: 'var(--text-dim)' }}>
              +{product.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Fiyat ve Butonlar */}
        <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Fiyat Satırı */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <span suppressHydrationWarning style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {product.price.toLocaleString('tr-TR')} ₺
            </span>
            {product.originalPrice && (
              <span suppressHydrationWarning style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                {product.originalPrice.toLocaleString('tr-TR')} ₺
              </span>
            )}
            {product.originalPrice && (
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--accent-emerald)',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                %{Math.round((1 - product.price / product.originalPrice) * 100)} İndirim
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            {isTrendyol ? 'Trendyol Güvencesiyle' : 'Standart Lisans / Tek Seferlik Ödeme'}
          </div>

          {/* Butonlar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isTrendyol && product.marketplaceUrl ? (
              <a
                href={product.marketplaceUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #f27a1a 0%, #d85c07 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.75rem',
                  boxShadow: '0 4px 12px rgba(242, 122, 26, 0.35)'
                }}
              >
                <span>Trendyol</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              /* Teklif Al Butonu - normal ürünler için */
              <a
                href={`mailto:iletisim@sdmsoftware.com.tr?subject=Fiyat%20Teklifi%20-%20${encodeURIComponent(product.title)}&body=Merhaba%2C%0A%0A${encodeURIComponent(product.title)}%20i%C3%A7in%20fiyat%20teklifi%20almak%20istiyorum.%0A%0AAd%C4%B1m%3A%0A%C5%9Eirketim%3A%0ATelefon%3A`}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  color: '#c084fc',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.32) 0%, rgba(99, 102, 241, 0.32) 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Mail size={13} />
                <span>Teklif Al</span>
              </a>
            )}

            <button
              onClick={handleAddToCart}
              className={`btn btn-sm ${added ? 'btn-secondary' : 'btn-primary'}`}
              style={{
                flex: 1,
                background: added
                  ? 'rgba(16, 185, 129, 0.2)'
                  : isTrendyol
                  ? 'rgba(255, 255, 255, 0.08)'
                  : undefined,
                borderColor: added ? 'var(--accent-emerald)' : isTrendyol ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: added ? 'var(--accent-emerald)' : isTrendyol ? 'var(--text-main)' : undefined
              }}
              title="Sepete Ekle"
            >
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
              <span style={{ fontSize: '0.82rem' }}>{added ? 'Eklendi' : 'Sepete Ekle'}</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.product-img:hover) {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
