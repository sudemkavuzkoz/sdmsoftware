'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCart, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  User, 
  Menu, 
  X, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Yazılım Ürünleri', href: '/products' },
    { name: 'Canlı Demolar', href: '/demos', highlight: true },
    { name: 'Müşteri Paneli', href: '/dashboard' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(7, 9, 14, 0.85)' }}>
      {/* Üst Bilgi Şeridi */}
      <div style={{ background: 'linear-gradient(90deg, #090d16 0%, #111a2d 50%, #090d16 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.4rem 0', fontSize: '0.78rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)' }}>
              <Sparkles size={13} /> sdmsoftware.com.tr
            </span>
            <span>• Kurumsal Yazılım Çözümleri & Canlı Sistem Vitrini</span>
          </div>

          {/* Yönetici Durumu & Giriş */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  href="/admin"
                  style={{
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: 'var(--accent-purple)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ShieldCheck size={12} />
                  <span>Yönetici: Sudem</span>
                  <ChevronRight size={11} />
                </Link>
                <button
                  onClick={() => logout()}
                  title="Oturumu Kapat"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-muted)',
                    padding: '0.2rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <Link
                href="/admin"
                style={{
                  color: 'var(--text-dim)',
                  fontSize: '0.72rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-purple)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
              >
                <Lock size={11} />
                <span>Yönetici Girişi</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ana Navigasyon Çubuğu */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.75rem' }}>
        {/* Logo */}
        <Link href="/" prefetch={false} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)'
            }}
          >
            <Terminal size={22} color="#07090e" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>SDM</span>
              <span className="text-cyan">SOFTWARE</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              sdmsoftware.com.tr
            </div>
          </div>
        </Link>

        {/* Masaüstü Menü Linkleri */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="desktop-menu">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? 'var(--primary)' : 'var(--text-muted)')}
              >
                {link.name}
                {link.highlight && (
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    CANLI
                  </span>
                )}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--primary)',
                      boxShadow: '0 0 8px var(--primary)'
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Eylemler: Sepet, Canlı Demo Butonu, Mobil Menü Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Sepet Butonu */}
          <button
            onClick={openCart}
            aria-label="Alışveriş Sepeti"
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
          >
            <ShoppingCart size={19} />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'var(--primary)',
                  color: '#07090e',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px var(--primary)'
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Canlı Demo Vitrini CTA */}
          <Link
            href="/demos"
            prefetch={false}
            className="btn btn-primary btn-sm desktop-menu"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Layers size={15} />
            <span>Demoları Dene</span>
          </Link>

          {/* Trendyol Mağazası Dış Link */}
          <a
            href="https://www.trendyol.com/magaza/sudem-kavuzkoz-m-1260453?sst=0&sk=1"
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm desktop-menu"
            style={{
              background: 'rgba(242, 122, 26, 0.15)',
              border: '1px solid rgba(242, 122, 26, 0.4)',
              color: '#f27a1a',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>🧡 Trendyol Mağazası</span>
          </a>

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Menüyü Aç"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'none',
              padding: '0.5rem'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobil Menü Çekmecesi */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: pathname === link.href ? 'var(--primary)' : 'var(--text-main)',
                padding: '0.5rem 0'
              }}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/admin"
            prefetch={false}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--accent-purple)',
              padding: '0.5rem 0'
            }}
          >
            Yönetici (Admin) Paneli
          </Link>
          <Link
            href="/demos"
            prefetch={false}
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Tüm Demoları İncele
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.desktop-menu) {
            display: none !important;
          }
          :global(.mobile-toggle) {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
