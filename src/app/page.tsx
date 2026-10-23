'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Code2, 
  CheckCircle, 
  Play, 
  Download, 
  Server,
  Sparkles,
  Lock,
  MessageSquare
} from 'lucide-react';
import { db } from '@/lib/db';
import { DemoProject } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import DemoCard from '@/components/DemoCard';
import LiveDemoModal from '@/components/LiveDemoModal';

export default function HomePage() {
  const products = db.getProducts();
  const demos = db.getDemos();
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null);

  // Yazılım Paketleri (AI Travel Planner, Hisse Senedi Fiyat Tahmini, Klinik Sistemi)
  const flagshipProducts = products.filter(p => !p.isTrendyol);

  const handleOpenDemoBySlug = (slug: string) => {
    const d = db.getDemoBySlug(slug);
    if (d) setSelectedDemo(d);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '3rem' }}>
      {/* 1. HERO SECTION */}
      <section style={{ position: 'relative', paddingTop: '4rem', paddingBottom: '3rem', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            {/* Küçük Üst Rozet */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '1.75rem' }}>
              <Sparkles size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                YENİ NESİL YAZILIM EKOSİSTEMİ & CANLI VİTRİN
              </span>
            </div>

            {/* Büyük Başlık */}
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              AI Travel Planner, Borsa Tahmin & <br />
              <span className="text-gradient">Klinik Sistemleri Canlı Demoları</span>
            </h1>

            {/* Alt Açıklama */}
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '750px' }}>
              <strong>sdmsoftware.com.tr</strong> ile geliştirdiğimiz yapay zeka seyahat planlayıcısı, hisse senedi fiyat tahmin motoru ve klinik otomasyonunu canlı tarayıcınızda deneyimleyin. İster sitemizden ister <strong>Trendyol</strong> mağazamızdan güvenle edinin.
            </p>

            {/* CTA Butonları */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
              <Link href="/products" className="btn btn-primary btn-lg">
                <span>Yazılımları İncele & Satın Al</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/demos" className="btn btn-secondary btn-lg">
                <Layers size={18} color="var(--primary)" />
                <span>Canlı Demoları Dene</span>
              </Link>
            </div>

            {/* Hızlı İstatistik Sayaçları */}
            <div className="glass-card" style={{ width: '100%', padding: '1.75rem 2rem', background: 'rgba(13, 18, 29, 0.65)' }}>
              <div className="grid-cols-4">
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>3 Ana</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Canlı Yazılım Çözümü</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>%99.99</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Yüksek SLA Erişilebilirlik</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>Trendyol</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Onaylı Mağaza Satışı</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>7/24</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Kurumsal Mühendislik Desteği</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CANLI DEMO VİTRİNİ (AI Travel Planner, Hisse Senedi Tahmini, Klinik Sistemi) */}
      <section style={{ position: 'relative' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <div className="live-indicator" style={{ marginBottom: '0.5rem' }}>
                <span className="live-dot" />
                <span>İNTERAKTİF SİSTEM VİTRİNİ</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                Geliştirdiğimiz Sistemlerin <span className="text-gradient">Canlı Demoları</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                Harici kurulum gerekmeden, web tarayıcınız üzerinden sistemleri anında test edin.
              </p>
            </div>

            <Link href="/demos" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>Tüm Demoları Gör ({demos.length})</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid-cols-3">
            {demos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} onOpenDemo={(d) => setSelectedDemo(d)} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. ÖNE ÇIKAN YAZILIM ÜRÜNLERİ (Hazır ve Özelleştirilebilir Yazılım Paketleri) */}
      <section style={{ position: 'relative' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
                E-TİCARET & DİJİTAL LİSANS SATIŞI
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                Hazır ve Özelleştirilebilir <span className="text-gradient">Yazılım Paketleri</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                Tam kaynak kod, kurulum desteği ve ömür boyu standart güncelleme garantisi.
              </p>
            </div>

            <Link href="/products" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>Yazılım Kataloğunu Gör</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid-cols-3">
            {flagshipProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDemo={handleOpenDemoBySlug}
              />
            ))}
          </div>
        </div>
      </section>



      {/* 5. MİMARİ VE AVANTAJLAR (Neden SDM Software?) */}
      <section>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
              MÜHENDİSLİK STANDARTLARIMIZ
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Kurumsal Şirketlerin Neden <span className="text-cyan">SDM Software</span> Tercih Ettiği
            </h2>
          </div>

          <div className="grid-cols-3">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Zap size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Yapay Zeka & Derin Öğrenme</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Seyahat planlamadan finansal hisse senedi tahminine kadar en yeni LLM ve PyTorch sinir ağı modellerini doğrudan uygulamalarınıza entegre ediyoruz.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} color="var(--accent-purple)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>KVKK & Sağlık Uyumluluğu</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Klinik ve sağlık sistemlerimizde hasta verileri uçtan uca şifrelenir; GİB e-SMM ve e-Fatura entegrasyonu yasal standartlara %100 uygundur.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Download size={24} color="var(--accent-emerald)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Çok Kanallı Güvenli Satış</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                İster web sitemiz üzerinden 256-Bit SSL ve 3D Secure ile anında lisans alın, ister Trendyol mağazamızdan taksit avantajıyla sipariş verin.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* 7. İLETİŞİM & ÖZEL PROJE TEKLİFİ ALMA */}
      <section>
        <div className="container">
          <div className="glass-card" style={{ padding: '3.5rem 2.5rem', background: 'linear-gradient(135deg, #0c111c 0%, #151b29 100%)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ maxWidth: '580px' }}>
                <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>ÖZEL PROJE GELİŞTİRME</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Şirketinize Özel Yazılım Çözümü mü Gerekiyor?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  AI Travel Planner, Borsa Tahmin veya Klinik sistemlerinin haricinde şirketinize özel mimari tasarım ve API entegrasyonu geliştiriyoruz.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href="mailto:iletisim@sdmsoftware.com.tr?subject=Ozel%20Yazilim%20Teklifi"
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <MessageSquare size={18} />
                  <span>Teklif Al & Bize Yazın</span>
                </a>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                  24 saat içinde teknik fizibilite ve fiyatlandırma ile dönüş yapıyoruz.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Canlı Demo Modalı */}
      <LiveDemoModal
        demo={selectedDemo}
        onClose={() => setSelectedDemo(null)}
      />
    </div>
  );
}
