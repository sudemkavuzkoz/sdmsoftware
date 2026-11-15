import Link from 'next/link';
import { ArrowLeft, Layers, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <div className="glow-accent" />
        <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
          404 • SAYFA BULUNAMADI
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '0.85rem' }}>
          Aradığınız Sayfa <span className="text-gradient">Bulunamadı</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '2rem' }}>
          İstediğiniz URL taşınmış, kaldırılmış veya hatalı yazılmış olabilir. Yazılım ürünlerimizi ve canlı sistem demolarımızı incelemeye devam edebilirsiniz.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem' }}>
          <Link href="/" className="btn btn-primary btn-sm">
            <ArrowLeft size={15} /> Ana Sayfaya Dön
          </Link>
          <Link href="/products" className="btn btn-secondary btn-sm">
            <ShoppingBag size={15} /> Yazılım Kataloğu
          </Link>
          <Link href="/demos" className="btn btn-secondary btn-sm">
            <Layers size={15} /> Canlı Demolar
          </Link>
        </div>
      </div>
    </div>
  );
}
