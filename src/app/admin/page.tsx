'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Package, 
  Layers, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  DollarSign, 
  Eye, 
  RefreshCw,
  CheckCircle2,
  Lock,
  EyeOff,
  AlertCircle,
  LogOut,
  KeyRound,
  Users,
  Headphones,
  MessageCircle,
  Mail,
  Phone
} from 'lucide-react';
import { db } from '@/lib/db';
import { Product, DemoProject, Order, ProductCategory, DemoCategory, User, MembershipTier } from '@/lib/types';
import { getTierLabel } from '@/lib/membership';
import { CUSTOMER_SUPPORT, buildMailtoQuoteUrl, buildWhatsAppQuoteUrl } from '@/lib/contact';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, isAdmin, loginAsAdmin, logout, changeAdminPassword } = useAuth();

  // Şifre Giriş Durumu
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Şifre Değiştirme Modalı
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passChangeStatus, setPassChangeStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAsAdmin(passwordInput);
    if (!res.success) {
      setAuthError(res.message || 'Hatalı yönetici şifresi!');
    } else {
      setAuthError(null);
      setPasswordInput('');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const res = changeAdminPassword(currentPass, newPass);
    setPassChangeStatus(res);
    if (res.success) {
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setCurrentPass('');
        setNewPass('');
        setPassChangeStatus(null);
      }, 1600);
    }
  };

  // Veri Durumları
  const [products, setProducts] = useState<Product[]>(db.getProducts());
  const [demos, setDemos] = useState<DemoProject[]>(db.getDemos());
  const [orders, setOrders] = useState<Order[]>(db.getOrders());
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [trendyolSettings, setTrendyolSettings] = useState(db.getTrendyolSettings());

  const stats = useMemo(
    () => ({
      totalRevenue: orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
      totalOrders: orders.length,
      totalProducts: products.length,
      totalDemos: demos.length,
      totalDemoViews: demos.reduce((sum, d) => sum + d.viewsCount, 0)
    }),
    [orders, products, demos]
  );

  // Aktif Sekme
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'demos' | 'orders' | 'members' | 'support' | 'trendyol'>('overview');

  const loadDbMembers = () => {
    fetch('/api/admin/users', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { success?: boolean; users?: User[]; orders?: Order[] }) => {
        if (data.success && data.users) {
          setRegisteredUsers(data.users);
        }
        if (data.success && Array.isArray(data.orders)) {
          const clientOnly = db.getOrders();
          const seen = new Set<string>();
          setOrders(
            [...data.orders, ...clientOnly].filter((o) => {
              if (seen.has(o.id)) return false;
              seen.add(o.id);
              return true;
            })
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;
    let active = true;
    fetch('/api/admin/users', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { success?: boolean; users?: User[]; orders?: Order[] }) => {
        if (!active) return;
        if (data.success && data.users) setRegisteredUsers(data.users);
        if (data.success && Array.isArray(data.orders)) {
          const clientOnly = db.getOrders();
          const seen = new Set<string>();
          setOrders(
            [...data.orders, ...clientOnly].filter((o) => {
              if (seen.has(o.id)) return false;
              seen.add(o.id);
              return true;
            })
          );
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user]);

  const handleUpdateUserTier = async (userId: string, membershipTier: MembershipTier) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, membershipTier })
      });
      const data = (await res.json()) as { success?: boolean; user?: User };
      if (data.success && data.user) {
        setRegisteredUsers((prev) => prev.map((u) => (u.id === userId ? data.user! : u)));
      }
    } catch {
      // yoksay
    }
  };

  // Yeni Ürün Ekleme Modalı
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('saas');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTech, setNewTech] = useState('Next.js, TypeScript, PostgreSQL');

  // Trendyol Hızlı Ürün Ekleme
  const [newTrendyolTitle, setNewTrendyolTitle] = useState('');
  const [newTrendyolPrice, setNewTrendyolPrice] = useState('');
  const [newTrendyolUrl, setNewTrendyolUrl] = useState('https://www.trendyol.com/magaza/sudem-kavuzkoz-m-1260453?sst=0&sk=1');
  const [newTrendyolImage, setNewTrendyolImage] = useState('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80');
  const [newTrendyolDesc, setNewTrendyolDesc] = useState('Sudem Kavuzkoz Trendyol mağazamızdan güvenle sipariş verebilirsiniz.');

  // Yeni Demo Ekleme Modalı
  const [isAddDemoOpen, setIsAddDemoOpen] = useState(false);
  const [newDemoTitle, setNewDemoTitle] = useState('');
  const [newDemoCategory, setNewDemoCategory] = useState<DemoCategory>('travel_ai');
  const [newDemoUrl, setNewDemoUrl] = useState('https://sdmsoftware.com.tr/demos');
  const [newDemoDesc, setNewDemoDesc] = useState('');

  const refreshData = () => {
    setProducts([...db.getProducts()]);
    setDemos([...db.getDemos()]);
    setTrendyolSettings(db.getTrendyolSettings());
    loadDbMembers();
  };

  // Standart Ürün Ekleme
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    db.addProduct({
      title: newTitle,
      slug: slug || `urun-${Date.now()}`,
      shortDescription: newDesc || 'SDM Software tarafından geliştirilen kurumsal çözüm.',
      description: newDesc || 'Detaylı yazılım açıklaması ve teknik mimari.',
      category: newCategory,
      price: parseFloat(newPrice),
      rating: 5.0,
      reviewsCount: 1,
      badge: newCategory === 'trendyol' ? 'Trendyol' : 'Yeni',
      isTrendyol: newCategory === 'trendyol',
      marketplaceUrl: newCategory === 'trendyol' ? trendyolSettings.storeUrl : undefined,
      features: ['Modern mimari ve REST API', 'Yüksek güvenlikli altyapı', 'Kaynak kod teslimi'],
      techStack: newTech.split(',').map(s => s.trim()),
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      inStock: true,
      version: 'v1.0.0'
    });

    refreshData();
    setIsAddProductOpen(false);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
  };

  // Trendyol Ürünü Ekleme
  const handleCreateTrendyolProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrendyolTitle || !newTrendyolPrice) return;

    const slug = newTrendyolTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    db.addProduct({
      title: newTrendyolTitle,
      slug: slug || `trendyol-${Date.now()}`,
      shortDescription: newTrendyolDesc,
      description: `${newTrendyolDesc} Sudem Kavuzkoz Trendyol mağazamız üzerinden faturalı ve garantili olarak satışa sunulmaktadır.`,
      category: 'trendyol',
      price: parseFloat(newTrendyolPrice),
      rating: 5.0,
      reviewsCount: 12,
      badge: 'Trendyol',
      isTrendyol: true,
      marketplaceUrl: newTrendyolUrl,
      features: ['Trendyol Güvencesi', 'Hızlı Teslimat', 'Orijinal Lisans ve Faturalı Satış'],
      techStack: ['Trendyol Mağaza', 'Sudem Kavuzkoz', 'Faturalı Satış'],
      imageUrl: newTrendyolImage,
      inStock: true,
      version: 'v1.0'
    });

    refreshData();
    setNewTrendyolTitle('');
    setNewTrendyolPrice('');
    alert('Trendyol ürünü başarıyla vitrine eklendi!');
  };

  // Ürün Silme
  const handleDeleteProduct = (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      db.deleteProduct(id);
      refreshData();
    }
  };

  // Demo Ekleme
  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemoTitle) return;

    const slug = newDemoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    db.addDemo({
      title: newDemoTitle,
      slug: slug || `demo-${Date.now()}`,
      category: newDemoCategory,
      shortDescription: newDemoDesc || 'Canlı sistem simülasyonu ve test ortamı.',
      fullDescription: newDemoDesc || 'Kapsamlı sistem mimarisi ve test senaryoları.',
      features: ['Canlı API testi', 'İzole sandbox ortamı', 'Yönetici yetkileri'],
      techStack: ['Next.js 16', 'Docker', 'FastAPI'],
      liveUrl: newDemoUrl,
      previewType: 'interactive_sandbox',
      status: 'active',
      viewsCount: 10,
      likesCount: 2,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    });

    refreshData();
    setIsAddDemoOpen(false);
    setNewDemoTitle('');
    setNewDemoDesc('');
  };

  // Demo Silme
  const handleDeleteDemo = (id: string) => {
    if (confirm('Bu demo projesini vitrinden kaldırmak istiyor musunuz?')) {
      db.deleteDemo(id);
      refreshData();
    }
  };

  // Sipariş Durumu Güncelleme & Havale Onayı (Veritabanı Senkronlu)
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    db.updateOrderStatus(orderId, status, paymentStatus);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: status, paymentStatus })
      });
      const data = (await res.json()) as { success?: boolean; order?: Order; users?: User[] };
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === data.order!.id ? data.order! : o)));
      } else {
        loadDbMembers();
      }
      if (data.success && data.users) {
        setRegisteredUsers(data.users);
      }
    } catch {
      loadDbMembers();
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2.75rem 2rem', position: 'relative', border: '1px solid rgba(168, 85, 247, 0.35)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' }}>
          <div className="glow-accent" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }} />

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)'
              }}
            >
              <Lock size={28} color="#ffffff" strokeWidth={2.4} />
            </div>
            <span className="badge badge-purple" style={{ marginBottom: '0.6rem' }}>YÖNETİCİ GÜVENLİĞİ</span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Yönetici Paneli Girişi
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.5' }}>
              Bu alana yalnızca yetkili sistem yöneticisi şifreyle erişebilir.
            </p>
          </div>

          {authError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Yönetici Şifresi</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Yetkili Giriş</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setAuthError(null); }}
                  placeholder="Şifrenizi girin..."
                  className="form-input"
                  autoFocus
                  required
                  style={{ paddingRight: '2.5rem', fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-purple" style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}>
              <ShieldCheck size={18} />
              <span>Panele Giriş Yap</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
              ← Ana Sayfaya Geri Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      {/* Yönetici Üst Başlık */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem', marginBottom: '2.5rem', background: 'rgba(13, 18, 29, 0.85)' }}>
        <div className="glow-accent" />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>SDM Yönetici (Admin) Paneli</h1>
                <span className="badge badge-purple">Yönetici: Sudem</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                sdmsoftware.com.tr E-Ticaret, Üyelikler, Lisanslar &amp; Trendyol Yönetimi
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-secondary btn-sm">
              Siteyi Ziyaret Et
            </Link>
            <a
              href="https://www.trendyol.com/magaza/sudem-kavuzkoz-m-1260453?sst=0&sk=1"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
              style={{ background: 'rgba(242, 122, 26, 0.15)', border: '1px solid rgba(242, 122, 26, 0.4)', color: '#f27a1a', fontWeight: 700 }}
            >
              <span>🧡 Trendyol Mağazası</span>
              <ExternalLink size={12} />
            </a>
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
            >
              <KeyRound size={14} /> Şifre Değiştir
            </button>
            <button
              onClick={() => logout()}
              className="btn btn-sm"
              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}
            >
              <LogOut size={14} /> Güvenli Çıkış
            </button>
            <button onClick={refreshData} className="btn btn-secondary btn-sm" title="Yenile">
              <RefreshCw size={14} /> Yenile
            </button>
          </div>
        </div>
      </div>

      {/* KPI İstatistik Kartları */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Onaylanan Teklif Tutarı</span>
            <DollarSign size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            {stats.totalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            Onaylanan teklif &amp; lisanslar
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Teklif Talepleri</span>
            <ShoppingBag size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
            {stats.totalOrders} Adet
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Kayıtlı talep sayısı
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aktif Yazılım & Ürün</span>
            <Package size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {stats.totalProducts} Ürün
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Teklif kataloğu paketleri
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Demo Tıklanmaları</span>
            <Eye size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            {stats.totalDemoViews}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Canlı vitrin etkileşimi
          </div>
        </div>
      </div>

      {/* Sekme Butonları */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BarChart3 size={15} /> Genel Bakış
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Package size={15} /> Yazılım Paketleri ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('trendyol')}
          className={`btn btn-sm ${activeTab === 'trendyol' ? 'btn-primary' : 'btn-secondary'}`}
          style={activeTab !== 'trendyol' ? { color: '#f27a1a', borderColor: 'rgba(242, 122, 26, 0.4)' } : { background: '#f27a1a', color: '#fff' }}
        >
          🧡 Trendyol Mağazam & Ürünler
        </button>
        <button
          onClick={() => setActiveTab('demos')}
          className={`btn btn-sm ${activeTab === 'demos' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={15} /> Canlı Demolar ({demos.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('orders');
            loadDbMembers();
          }}
          className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShoppingBag size={15} /> Teklifler &amp; Talepler ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('members');
            loadDbMembers();
          }}
          className={`btn btn-sm ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={15} /> Kayıtlı Üyeler &amp; Lisanslar
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`btn btn-sm ${activeTab === 'support' ? 'btn-primary' : 'btn-secondary'}`}
          style={activeTab !== 'support' ? { color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.4)' } : undefined}
        >
          <Headphones size={15} /> Müşteri Hizmetleri &amp; Teklif Ayarları
        </button>
      </div>

      {/* SEKME 1: GENEL BAKIŞ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Son Teklif Talepleri</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Henüz kayıtlı teklif talebi bulunmuyor.</div>
              ) : (
                orders.slice(0, 4).map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.orderNumber} • {o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.items.map(i => i.product.title).join(', ')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {o.total > 0 ? `${o.total.toLocaleString('tr-TR')} ₺` : 'Özel Teklif'}
                      </div>
                      <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                        {o.paymentStatus === 'paid' ? 'Onaylandı' : 'Teklif Bekliyor'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Hızlı İşlemler</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => { setActiveTab('trendyol'); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start', color: '#f27a1a', borderColor: 'rgba(242,122,26,0.3)' }}>
                🧡 Trendyol Mağaza Ürünlerini Düzenle
              </button>
              <button onClick={() => { setActiveTab('products'); setIsAddProductOpen(true); }} className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                <Plus size={16} /> Yeni Yazılım Ürünü Ekle
              </button>
              <button onClick={() => { setActiveTab('members'); loadDbMembers(); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start', color: 'var(--primary)' }}>
                <Users size={16} /> Kayıtlı Üyeler &amp; Lisansları Görüntüle
              </button>
              <button onClick={() => setActiveTab('support')} className="btn btn-secondary" style={{ justifyContent: 'flex-start', color: 'var(--accent-emerald)', borderColor: 'rgba(16,185,129,0.35)' }}>
                <Headphones size={16} /> Müşteri Hizmetleri ({CUSTOMER_SUPPORT.phoneDisplay}) &amp; Teklif Kanalları
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEKME: TRENDYOL MAĞAZAM & ÜRÜNLER */}
      {activeTab === 'trendyol' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Mağaza Bilgileri Kartı */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(242, 122, 26, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge" style={{ background: '#f27a1a', color: '#fff', marginBottom: '0.5rem' }}>
                  ONAYLI TRENDYOL MAĞAZASI
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Sudem Kavuzkoz Trendyol Mağazası
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Mağaza URL: <code style={{ color: '#f27a1a', fontFamily: 'var(--font-mono)' }}>https://www.trendyol.com/magaza/sudem-kavuzkoz-m-1260453?sst=0&sk=1</code>
                </div>
              </div>

              <a
                href="https://www.trendyol.com/magaza/sudem-kavuzkoz-m-1260453?sst=0&sk=1"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{ background: 'linear-gradient(135deg, #f27a1a 0%, #d85c07 100%)', color: '#fff', fontWeight: 700 }}
              >
                <span>Trendyol&apos;da Mağazayı Aç</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Trendyol mağazanızdaki ürünleri aşağıdaki formu kullanarak doğrudan bu web sitesine ekleyebilirsiniz. Ziyaretçileriniz hem siteden doğrudan sipariş verebilir, hem de &quot;Trendyol&apos;da İncele&quot; butonuna basarak mağazanıza geçebilir.
            </p>
          </div>

          {/* Yeni Trendyol Ürünü Ekleme Formu */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="#f27a1a" />
              Trendyol Mağazanızdan Yeni Ürün Ekle
            </h3>

            <form onSubmit={handleCreateTrendyolProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Ürün Başlığı</label>
                  <input
                    type="text"
                    required
                    placeholder="örn: Sudem Kavuzkoz Özel Tasarım / Yazılım Paketi"
                    value={newTrendyolTitle}
                    onChange={(e) => setNewTrendyolTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fiyat (₺)</label>
                  <input
                    type="number"
                    required
                    placeholder="1250"
                    value={newTrendyolPrice}
                    onChange={(e) => setNewTrendyolPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Trendyol Ürün Linki (URL)</label>
                  <input
                    type="text"
                    required
                    value={newTrendyolUrl}
                    onChange={(e) => setNewTrendyolUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Görsel URL (Unsplash veya Trendyol CDN)</label>
                  <input
                    type="text"
                    value={newTrendyolImage}
                    onChange={(e) => setNewTrendyolImage(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kısa Açıklama</label>
                <textarea
                  rows={2}
                  value={newTrendyolDesc}
                  onChange={(e) => setNewTrendyolDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                className="btn btn-sm"
                style={{ background: 'linear-gradient(135deg, #f27a1a 0%, #d85c07 100%)', color: '#fff', fontWeight: 700, padding: '0.65rem 1.5rem' }}
              >
                Ürünü Web Sitesi Vitrinine Ekle
              </button>
            </form>
          </div>

          {/* Sitedeki Trendyol Ürünleri Tablosu */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
              Sitenizde Sergilenen Trendyol Ürünleri
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Ürün Adı</th>
                  <th style={{ padding: '1rem' }}>Fiyat</th>
                  <th style={{ padding: '1rem' }}>Trendyol Linki</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => p.isTrendyol || p.category === 'trendyol').map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '1rem', color: '#f27a1a', fontWeight: 700 }}>{p.price.toLocaleString('tr-TR')} ₺</td>
                    <td style={{ padding: '1rem', fontSize: '0.78rem' }}>
                      <a href={p.marketplaceUrl || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        Trendyol&apos;da Gör <ExternalLink size={12} />
                      </a>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-danger btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                        <Trash2 size={13} /> Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEKME 2: ÜRÜN YÖNETİMİ */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Yazılım Ürünleri Listesi</h2>
            <button onClick={() => setIsAddProductOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Yeni Ürün Ekle
            </button>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Ürün Başlığı</th>
                  <th style={{ padding: '1rem' }}>Kategori</th>
                  <th style={{ padding: '1rem' }}>Fiyat</th>
                  <th style={{ padding: '1rem' }}>Rozet</th>
                  <th style={{ padding: '1rem' }}>Puan</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${p.isTrendyol ? 'badge-trendyol' : 'badge-purple'}`} style={p.isTrendyol ? { background: '#f27a1a', color: '#fff' } : undefined}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: p.isTrendyol ? '#f27a1a' : 'var(--primary)', fontWeight: 700 }}>
                      {p.price.toLocaleString('tr-TR')} ₺
                    </td>
                    <td style={{ padding: '1rem' }}>{p.badge && <span className="badge badge-cyan">{p.badge}</span>}</td>
                    <td style={{ padding: '1rem' }}>⭐ {p.rating} ({p.reviewsCount})</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Trash2 size={13} /> Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEKME 3: DEMO SİSTEM YÖNETİMİ */}
      {activeTab === 'demos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Canlı Demo & Portföy Sistemleri</h2>
            <button onClick={() => setIsAddDemoOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Yeni Demo Projesi Ekle
            </button>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Sistem Başlığı</th>
                  <th style={{ padding: '1rem' }}>Kategori</th>
                  <th style={{ padding: '1rem' }}>Görüntülenme</th>
                  <th style={{ padding: '1rem' }}>Durum</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {demos.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{d.title}</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-cyan">{d.category}</span></td>
                    <td style={{ padding: '1rem' }}>👁 {d.viewsCount}</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-emerald">{d.status}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteDemo(d.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Trash2 size={13} /> Kaldır
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEKME 4: TEKLİF & SİPARİŞ TALEPLERİ */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Gelen Teklif Talepleri &amp; Müşteriler</h2>

          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Talep No</th>
                  <th style={{ padding: '1rem' }}>Müşteri &amp; İletişim</th>
                  <th style={{ padding: '1rem' }}>Talep Edilen Sistemler</th>
                  <th style={{ padding: '1rem' }}>Liste / Teklif</th>
                  <th style={{ padding: '1rem' }}>Onay Durumu</th>
                  <th style={{ padding: '1rem' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Henüz gelen teklif talebi bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                        <div>{o.orderNumber}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                          {o.paymentMethod === 'quote_request'
                            ? 'Teklif Talebi'
                            : o.paymentMethod === 'wire_transfer'
                            ? 'Havale / EFT'
                            : 'Kayıt'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail} • {o.customerPhone}</div>
                        {o.proposedBudget && (
                          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.15rem' }}>
                            Teklif / Bütçe: {o.proposedBudget}
                          </div>
                        )}
                        {(o.quoteNote || o.transferReference) && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: '0.15rem' }}>
                            Not: {o.quoteNote || o.transferReference}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                        {o.items.map(i => `${i.product.title} (${i.licenseTier})`).join(', ')}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {o.total > 0 ? `${o.total.toLocaleString('tr-TR')} ₺` : 'Özel Teklif'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-emerald' : o.paymentStatus === 'failed' ? 'badge-purple' : 'badge-amber'}`}>
                          {o.paymentStatus === 'paid' ? 'Onaylandı' : o.paymentStatus === 'failed' ? 'İptal' : 'Teklif Bekliyor'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {o.paymentStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => void handleUpdateOrderStatus(o.id, 'completed', 'paid')}
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: '0.72rem', padding: '0.28rem 0.6rem', whiteSpace: 'nowrap' }}
                            >
                              Teklifi Onayla &amp; Lisansı Aç
                            </button>
                          )}
                          <select
                            value={o.orderStatus}
                            onChange={(e) => void handleUpdateOrderStatus(o.id, e.target.value as Order['orderStatus'])}
                            className="form-select"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', minWidth: '130px' }}
                          >
                            <option value="completed">Tamamlandı</option>
                            <option value="processing">Görüşülüyor</option>
                            <option value="refunded">İptal Edildi</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEKME: KAYITLI ÜYELER & LİSANSLAR (VERİTABANI) */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Veritabanına Kayıtlı Üyeler &amp; Özelleştirmeler</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Kayıt olan tüm kullanıcılar, üyelik paketleri, aktif lisans sayıları ve white-label marka ayarları burada listelenir.
              </p>
            </div>
            <button type="button" onClick={loadDbMembers} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Veritabanını Yenile
            </button>
          </div>

          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.9rem 1rem' }}>Üye &amp; İletişim</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Marka / Kişiselleştirme</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Deneme Kullanımı</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Aktif Lisans</th>
                  <th style={{ padding: '0.9rem 1rem' }}>Üyelik Paketini Yönet</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.filter((u) => u.role !== 'admin').length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Henüz site üzerinden kayıtlı gerçek müşteri yok. Yeni kayıtlar doğrudan burada listelenir.
                    </td>
                  </tr>
                ) : (
                  registeredUsers
                    .filter((u) => u.role !== 'admin')
                    .map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          {u.company && <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{u.company}</div>}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '4px',
                                background: u.branding?.accentColor || '#00f0ff',
                                display: 'inline-block'
                              }}
                            />
                            <strong>{u.branding?.brandName || u.name}</strong>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{u.branding?.customDomain || 'Varsayılan Alan'}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)' }}>
                          {u.demoActionsUsed} / {u.demoTrialLimit}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span className="badge badge-cyan">{u.licenses?.length ?? 0} Lisans</span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <select
                            value={u.membershipTier}
                            onChange={(e) => void handleUpdateUserTier(u.id, e.target.value as MembershipTier)}
                            className="form-select"
                            style={{ padding: '0.32rem 0.6rem', fontSize: '0.76rem', width: 'auto' }}
                          >
                            <option value="free">{getTierLabel('free')}</option>
                            <option value="pro_monthly">{getTierLabel('pro_monthly')}</option>
                            <option value="pro_yearly">{getTierLabel('pro_yearly')}</option>
                            <option value="enterprise_license">{getTierLabel('enterprise_license')}</option>
                          </select>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEKME: MÜŞTERİ HİZMETLERİ & TEKLİF AYARLARI */}
      {activeTab === 'support' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Headphones size={20} color="var(--accent-emerald)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Bağlı Müşteri Hizmetleri Kanalları</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Web sitesinden ödeme alınması kapatılmıştır. Tüm ürün sayfalarında, canlı demolarda, teklif listesinde ve{' '}
              <code style={{ color: 'var(--primary)' }}>/checkout</code> teklif merkezinde müşteriler aşağıdaki iletişim hatlarınıza yönlendirilir:
            </p>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Telefon &amp; WhatsApp Müşteri Hizmetleri
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginBottom: '0.6rem' }}>
                {CUSTOMER_SUPPORT.phoneDisplay}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a
                  href={buildWhatsAppQuoteUrl({ subject: 'Müşteri Hizmetleri Test Mesajı' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#10b981', color: '#03150e', fontWeight: 800 }}
                >
                  <MessageCircle size={14} /> WhatsApp Bağlantısını Aç
                </a>
                <a href={CUSTOMER_SUPPORT.telHref} className="btn btn-secondary btn-sm">
                  <Phone size={14} /> Arama Linki
                </a>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Resmi Teklif E-Posta Adresi
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginBottom: '0.6rem', wordBreak: 'break-all' }}>
                {CUSTOMER_SUPPORT.email}
              </div>
              <a href={buildMailtoQuoteUrl({ subject: 'Müşteri Hizmetleri Test Mesajı' })} className="btn btn-secondary btn-sm">
                <Mail size={14} /> E-Posta Bağlantısını Aç
              </a>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.85rem', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Teklif &amp; Lisans Aktivasyon Süreci</h3>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', padding: '0.75rem 0.9rem', fontSize: '0.8rem', color: '#fde68a' }}>
              <strong>Web Sitesi Online Ödeme: KAPALI</strong> — Sunucu API katmanı (<code>/api/orders</code>) web üzerinden kart veya çevrimiçi ödeme kabul etmez.
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '1rem', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div><strong>Tekliften Lisansa Çalışma Akışı:</strong></div>
              <div>1. Müşteri WhatsApp (<strong>{CUSTOMER_SUPPORT.phoneDisplay}</strong>), e-posta (<strong>{CUSTOMER_SUPPORT.email}</strong>) veya sitedeki teklif formundan fiyat teklifi iletir.</div>
              <div>2. Form üzerinden gelen talepler <strong>Teklifler &amp; Talepler</strong> sekmesinde <em>&quot;Teklif Bekliyor&quot;</em> olarak listelenir.</div>
              <div>3. Müşteri ile anlaşma sağlandığında <strong>Teklifi Onayla &amp; Lisansı Aç</strong> butonuna bastığınızda lisans anahtarı ve Premium üyelik müşterinin hesabında otomatik aktif olur.</div>
            </div>
          </div>
        </div>
      )}

      {/* YENİ STANDART ÜRÜN EKLEME MODALI */}
      {isAddProductOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Yeni E-Ticaret Ürünü Ekle</h3>
              <button onClick={() => setIsAddProductOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Ürün Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="örn: AI Travel Planner Pro"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="form-select"
                  >
                    <option value="saas">SaaS & Yapay Zeka</option>
                    <option value="webapp">Borsa & Finans</option>
                    <option value="enterprise">Klinik & Sağlık</option>
                    <option value="trendyol">🧡 Trendyol Mağaza Ürünü</option>
                    <option value="api">API Kütüphanesi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fiyat (₺)</label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kısa Açıklama</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ürünün temel yeteneklerini açıklayın..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teknolojiler (Virgülle ayırın)</label>
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Ürünü Kaydet ve Yayına Al
              </button>
            </form>
          </div>
        </div>
      )}

      {/* YENİ DEMO EKLEME MODALI */}
      {isAddDemoOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Yeni Canlı Demo Projesi Tanımla</h3>
              <button onClick={() => setIsAddDemoOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDemo}>
              <div className="form-group">
                <label className="form-label">Demo Sistem Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="örn: Yeni AI Çözüm Demosu"
                  value={newDemoTitle}
                  onChange={(e) => setNewDemoTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    value={newDemoCategory}
                    onChange={(e) => setNewDemoCategory(e.target.value as DemoCategory)}
                    className="form-select"
                  >
                    <option value="travel_ai">AI Travel Planner</option>
                    <option value="stock_prediction">Hisse Senedi Tahmini</option>
                    <option value="clinic_system">Klinik & Sağlık</option>
                    <option value="erp_crm">Kurumsal ERP</option>
                    <option value="ai_bot">Yapay Zeka Destek Botu</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Canlı Demo URL</label>
                  <input
                    type="text"
                    value={newDemoUrl}
                    onChange={(e) => setNewDemoUrl(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea
                  rows={3}
                  value={newDemoDesc}
                  onChange={(e) => setNewDemoDesc(e.target.value)}
                  placeholder="Test senaryoları ve sistem detayları..."
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Demoyu Vitrine Ekle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* YÖNETİCİ ŞİFRESİ DEĞİŞTİRME MODALI */}
      {isChangePasswordOpen && (
        <div className="modal-overlay" onClick={() => setIsChangePasswordOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <KeyRound size={22} color="var(--accent-purple)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Yönetici Şifresini Değiştir</h3>
              </div>
              <button onClick={() => setIsChangePasswordOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {passChangeStatus && (
              <div style={{
                background: passChangeStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${passChangeStatus.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                color: passChangeStatus.success ? 'var(--accent-emerald)' : '#f87171',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {passChangeStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passChangeStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Mevcut Şifre</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Yeni Şifre</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Yeni şifrenizi belirleyin"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsChangePasswordOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  İptal
                </button>
                <button type="submit" className="btn btn-purple" style={{ flex: 1 }}>
                  Şifreyi Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
