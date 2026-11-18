import { Product, DemoProject, Order, User } from './types';

// Gerçek Sistem Ürünleri (AI Travel Planner, Hisse Senedi Fiyat Tahmini, Klinik Sistemi ve Trendyol Ürünleri)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-travel-ai',
    title: 'AI Travel Planner - Akıllı Seyahat & Rota Planlayıcı',
    slug: 'ai-travel-planner',
    shortDescription: 'Yapay zeka ile kişiselleştirilmiş saatlik rota, otel, bütçe optimizasyonu ve gezi rehberi oluşturan akıllı seyahat platformu.',
    description: 'AI Travel Planner; tatil süresi, bütçe kısıtı ve kişisel ilgi alanlarını analiz ederek saniyeler içinde zenginleştirilmiş seyahat planları, otel/restoran önerileri, interaktif harita rotaları ve hava durumuna duyarlı etkinlik önerileri üreten modern yapay zeka SaaS çözümüdür.',
    category: 'saas',
    price: 5900,
    originalPrice: 8500,
    badge: 'Popüler',
    rating: 4.9,
    reviewsCount: 42,
    features: [
      'Kişiselleştirilmiş gün ve saat bazlı interaktif gezi rotaları',
      'Hava durumu ve anlık bütçeye göre dinamik rota optimizasyonu',
      'Google Maps & Mapbox interaktif harita koordinatları',
      'Restoran, otel ve turistik mekan puanlama entegrasyonu',
      'Tek tıkla PDF ve offline mobil seyahat rehberi dışa aktarma'
    ],
    techStack: ['Next.js 16', 'OpenAI GPT-4o', 'Mapbox API', 'Node.js', 'PostgreSQL'],
    demoSlug: 'ai-travel-planner-demo',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    version: 'v2.2.0'
  },
  {
    id: 'prod-stock-ai',
    title: 'StockPred AI - Hisse Senedi Fiyat Tahmin Sistemi',
    slug: 'stock-price-prediction-ai',
    shortDescription: 'BIST 100 ve Global hisseler için derin öğrenme (LSTM/Transformer) tabanlı fiyat tahminleme ve finansal analiz motoru.',
    description: 'Geçmiş fiyat trendleri, işlem hacimleri, finansal haber duygu analizleri (NLP) ve teknik göstergeleri (RSI, MACD, Bollinger) işleyerek olası fiyat hareketlerini ve kırılımları tahmin eden profesyonel finansal analiz ve tahminleme yazılımı.',
    category: 'webapp',
    price: 9900,
    originalPrice: 13500,
    badge: 'Çok Satan',
    rating: 5.0,
    reviewsCount: 38,
    features: [
      'LSTM & Transformer derin öğrenme fiyat projeksiyon modelleri',
      'BIST 100 ve ABD (NASDAQ/S&P 500) hisseleri için canlı veri akışı',
      'Finansal haber ve KAP duygu analizi (Sentiment Score)',
      'Al/Sat sinyal göstergesi ve güvenilirlik yüzdesi hesaplayıcı',
      'TradingView uyumlu dinamik interaktif mum ve trend grafikleri'
    ],
    techStack: ['Python PyTorch', 'FastAPI', 'Next.js', 'TimescaleDB', 'Redis'],
    demoSlug: 'stock-price-prediction-demo',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    version: 'v3.1.0'
  },
  {
    id: 'prod-clinic-sys',
    title: 'SDM Klinik - Poliklinik & Randevu Yönetim Sistemi',
    slug: 'sdm-clinic-management-system',
    shortDescription: 'Özel klinikler, diş hekimleri ve poliklinikler için online randevu, hasta takip kartı, SMS hatırlatma ve e-SMM otomasyonu.',
    description: 'Hasta kayıt kabul, doktor randevu takvimi, tıbbi tedavi geçmişi, laboratuvar/tetkik takibi, otomatik SMS & WhatsApp randevu hatırlatmaları ve Gelir İdaresi Başkanlığı e-Serbest Meslek Makbuzu (e-SMM) entegrasyonu sunan uçtan uca modern sağlık yazılımı.',
    category: 'enterprise',
    price: 7500,
    originalPrice: 10900,
    badge: 'Özel',
    rating: 4.9,
    reviewsCount: 29,
    features: [
      'Doktor ve branş bazlı renkli dinamik randevu takvimi',
      'Detaylı hasta tıbbi geçmişi, tetkik ve reçete dijital arşivi',
      'Otomatik SMS ve WhatsApp randevu hatırlatma motoru',
      'Kasa tahsilatları, gider takibi ve e-SMM / e-Fatura entegrasyonu',
      'KVKK standartlarında şifrelenmiş güvenli hasta verisi saklama'
    ],
    techStack: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Twilio/Netgsm SMS', 'Docker'],
    demoSlug: 'sdm-clinic-system-demo',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    version: 'v2.5.0'
  },
  {
    id: 'prod-protez-adsp',
    title: 'ADSP Protez Takip Sistemi',
    slug: 'protez-takip-sistemi-adsp',
    shortDescription: 'Ağız ve Diş Sağlığı Merkezleri (ADSP) ve laboratuvarlar için dijital protez üretim, prova ve teslimat takip sistemi.',
    description: 'Hekimlerin protez iş emri oluşturduğu, diş protez laboratuvarlarının ve teknisyenlerin üretim aşamalarını anlık güncellediği, Vercel üzerinde canlı yayında olan profesyonel süreç yönetim sistemi.',
    category: 'enterprise',
    price: 8900,
    originalPrice: 12500,
    badge: 'Yeni',
    rating: 5.0,
    reviewsCount: 34,
    features: [
      'Hekim, laboratuvar ve teknisyen yetki rolleri',
      'Model dökümü, metal prova, porselen prova ve teslimat aşama takibi',
      'Barkod & QR kodlu protez iş emri fişi oluşturma',
      'Gecikme uyarıları ve anlık durum bildirimleri',
      'Canlı Vercel dağıtımı ve kesintisiz erişim'
    ],
    techStack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Vercel Deployment'],
    demoSlug: 'protez-takip-sistemi-demo',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    version: 'v2.0.0'
  },
  {
    id: 'prod-veteriner-sys',
    title: 'Veteriner Klinik & Randevu Yönetim Sistemi',
    slug: 'veteriner-klinik-sistemi',
    shortDescription: 'Evcil hayvan sahipleri için online veteriner randevusu, aşı/muayene takvimi ve hekim onay yönetim paneli.',
    description: 'Hayvan sahiplerinin kolayca veteriner seçip randevu alabildiği, veteriner hekimlerin randevuları onaylayıp iptal edebildiği ve muayene sonrası detaylı tıbbi teşhis notları ekleyebildiği açık kaynak klinik platformu.',
    category: 'enterprise',
    price: 6800,
    originalPrice: 9500,
    badge: 'Popüler',
    rating: 4.8,
    reviewsCount: 26,
    features: [
      'Pet sahibi hasta kayıt ve evcil hayvan profil kartları',
      'Hekim takvimi üzerinden anlık online randevu alma',
      'Veteriner hekim onay/ret ve randevu yönetimi',
      'Muayene teşhis notları ve aşı periyodu takibi',
      'Modern, kullanıcı dostu duyarlı (responsive) tasarım'
    ],
    techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    demoSlug: 'veteriner-klinik-demo',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    version: 'v1.4.0'
  }
];

// Gerçek Sistemlerin Canlı Demo Projeleri
const INITIAL_DEMOS: DemoProject[] = [
  {
    id: 'demo-travel-ai',
    title: 'AI Travel Planner — Dünya Haritası & RAG Asistanı',
    slug: 'ai-travel-planner-demo',
    category: 'travel_ai',
    shortDescription: 'AI-TRAVEL-PLANNER reposundaki 200 ülke/şehir belgesi, interaktif dünya haritası ve RAG kaynak kanıt motorunu canlı test edin.',
    fullDescription: 'GitHub reposundan çekilen 200 destinasyon rehberi (travel_data), koordinat veritabanı ve world_famous_places_2024 veri seti üzerinde çalışan gerçek harita + RAG seyahat asistanı. Haritadan bir pin seçin, soru sorun, kaynak satır kanıtları ve Google Maps rotalarıyla yanıt alın.',
    features: [
      '200 ülke ve şehir için interaktif Leaflet dünya haritası pinleri',
      'Gerçek travel_data belgeleri üzerinden RAG kaynak araması ve satır kanıtı',
      'UNESCO ve ünlü mekanlar kataloğu ile Google Maps rota bağlantıları',
      'Günlük saatlik gezi planı ve Türkçe/İngilizce anlık sorgulama'
    ],
    techStack: ['Leaflet Map', 'RAG Vector/Keyword Search', 'Python Corpus', 'Next.js 16'],
    liveUrl: '/live/ai-travel-planner-demo',
    githubUrl: 'https://github.com/sudemkavuzkoz/AI-TRAVEL-PLANNER',
    previewType: 'interactive_sandbox',
    status: 'active',
    viewsCount: 3120,
    likesCount: 840,
    credentials: {
      user: 'traveler@sdmsoftware.com.tr',
      pass: 'travel2026',
      role: 'Gezgin / Seyahat Planlayıcı'
    },
    productSlug: 'ai-travel-planner',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-stock-ai',
    title: 'StockPred AI — Zaman Serisi Tahmin & Benchmark Motoru',
    slug: 'stock-price-prediction-demo',
    category: 'stock_prediction',
    shortDescription: 'Şirketinizin günlük hisse CSV/JSON verisini yükleyerek 5 modelden 10 günlük projeksiyon & stratejik tavsiye alın; MSFT/NVDA benchmarklarını inceleyin.',
    fullDescription: 'Zaman-Serisi-Tahmin-Sistemi-Mimarisi reposundan çekilen 2015–2025 arası 2.746 günlük MSFT/NVDA verileri ve 296 test koşumuna ek olarak; şirketlerin kendi günlük hisse senedi CSV/JSON dosyalarını yükleyip anlık model backtesti, 10 iş günlük projeksiyon ve risk/momentum tavsiyeleri alabildiği canlı tahmin platformu.',
    features: [
      'Şirketlere özel CSV/JSON hisse verisi yükleme, örnek şablon indirme & anlık analiz',
      'CNN-LSTM, GRU, LSTM, XGBoost, ARIMA walk-forward test skorları ve stratejik tavsiye raporu',
      'MSFT ve NVDA 2015–2025 gerçek tarihsel fiyat ve teknik indikatör (RSI-14, MACD, Vol20) serileri',
      '10 iş günlük projeksiyon grafiği, eğitim kaybı ve EDA analiz çıktıları'
    ],
    techStack: ['PyTorch LSTM/GRU', 'XGBoost', 'Scikit-Learn', 'Next.js 16'],
    liveUrl: '/live/stock-price-prediction-demo',
    githubUrl: 'https://github.com/sudemkavuzkoz/Zaman-Serisi-Tahmin-Sistemi-Mimarisi',
    previewType: 'dashboard_simulation',
    status: 'active',
    viewsCount: 4280,
    likesCount: 1190,
    credentials: {
      user: 'trader@sdmsoftware.com.tr',
      pass: 'stocks2026',
      role: 'Kantitatif Finans Analisti'
    },
    productSlug: 'stock-price-prediction-ai',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-protez-adsp',
    title: 'ADSP Protez Takip & Laboratuvar OS — 8 Aşamalı Kanban',
    slug: 'protez-takip-sistemi-demo',
    category: 'clinic_system',
    shortDescription: 'Hekim/Teknisyen rolleri, Konvansiyonel & Dijital CAD/CAM Kanban, acil teslim uyarıları ve canlı vaka kronolojisi içeren laboratuvar yönetim sistemi.',
    fullDescription: 'protez-takip-sistemi-adsp reposundaki tüm iş akışlarını gelişmiş koyu-medikal SaaS arayüzünde sunar: Konvansiyonel (8 aşamalı) ve Dijital CAD/CAM (8 aşamalı) Kanban panoları, tıklanabilir FDI diş seçici, vaka filtreleme, VITA renk takibi ve etkileşimli kronoloji.',
    features: [
      'Klinik Hekim ve Laboratuvar Teknisyeni rol panelleri + Canlı Vercel geçişi',
      'Konvansiyonel ve Dijital CAD/CAM 8 aşamalı ileri/geri Kanban kontrolü',
      'Yarın teslim edilecek acil vakalar için üst uyarı bandı ve hasta/protez filtresi',
      'Vaka detay çekmecesinde not ekleme ve canlı işlem kronolojisi'
    ],
    techStack: ['Next.js 16', 'TypeScript', 'Zod Schema', 'Vercel Deployment'],
    liveUrl: 'https://protez-takip-sistemi-adsp.vercel.app/dashboard/clinic',
    githubUrl: 'https://github.com/sudemkavuzkoz/protez-takip-sistemi-adsp',
    previewType: 'interactive_sandbox',
    status: 'active',
    viewsCount: 3890,
    likesCount: 940,
    credentials: {
      user: 'adsp@sdmsoftware.com.tr',
      pass: 'protez2026',
      role: 'ADSP Başhekim & Laboratuvar Yöneticisi'
    },
    productSlug: 'protez-takip-sistemi-adsp',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-pati-bahcesi',
    title: 'Pati Bahçesi — 2D Sevimli Evcil Hayvan Dünyası',
    slug: 'pati-bahcesi-demo',
    category: 'game',
    shortDescription: 'Pati-Bah-esi reposundan doğrudan çekilen 2D evcil hayvan bakım, görev, mini oyun ve barınak simülasyonunu tarayıcınızda canlı oynayın.',
    fullDescription: 'GitHub reposundan eksiksiz çekilen HTML5/CSS3/JS Cozy Pet Sanctuary uygulaması. 8 farklı evcil hayvan türü, bağımsız uyku/XP ilerleme sistemi, kendi hayvanını tasarlama stüdyosu, Pati Dükkanı ve Lezzet Yağmuru mini oyunu içerir.',
    features: [
      '8 farklı vektörel 2D evcil hayvan ve özel hayvan tasarlama stüdyosu',
      'Bağımsız tokluk, mutluluk, enerji, temizlik, XP ve uyku mekaniği',
      'Lezzet Yağmuru canvas mini oyunu, görevler ve Pati Dükkanı',
      'Web Audio ses efektleri ve yerel tarayıcı kayıt desteği'
    ],
    techStack: ['HTML5 Canvas', 'CSS3', 'JavaScript', 'Procedural SVG'],
    liveUrl: '/demos/pati-bahcesi/index.html',
    githubUrl: 'https://github.com/sudemkavuzkoz/Pati-Bah-esi',
    previewType: 'iframe',
    status: 'active',
    viewsCount: 1940,
    likesCount: 610,
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-clinic-sys',
    title: 'SDM Klinik OS — Diş & Poliklinik EMR Yönetim Sistemi',
    slug: 'sdm-clinic-system-demo',
    category: 'clinic_system',
    shortDescription: 'İnteraktif 32 diş FDI odontogram, hekim slot matrisi, bekleme salonu sırası, e-Reçete ve GİB e-SMM tahsilat modüllerini canlı test edin.',
    fullDescription: 'Poliklinikler ve diş klinikleri için geliştirilen kapsamlı EMR ve klinik yönetim arayüzü: Genel Bakış & Sıra Yönetimi, hekim saat matrisi, 32 dişlik interaktif FDI odontogram ile tedavi fiyatlandırma, ICD-10 muayene notu, e-Reçete, GİB e-SMM fatura kesimi ve SMS/WhatsApp otomasyon günlüğü.',
    features: [
      'İnteraktif 32 Diş FDI Odontogram (çürük, dolgu, kanal, zirkonyum, implant atama)',
      'Hekim & ünit bazlı randevu takvim matrisi ve canlı bekleme salonu kuyruğu',
      'Klinik vital bulgular, ICD-10 SOAP muayene notu ve e-Reçete oluşturucu',
      'Sigorta indirimi hesaplayan GİB e-SMM kasa modülü ve WhatsApp/SMS günlüğü'
    ],
    techStack: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Twilio API'],
    liveUrl: '/live/sdm-clinic-system-demo',
    githubUrl: 'https://github.com/sudemkavuzkoz/Dental-Clinik',
    previewType: 'interactive_sandbox',
    status: 'active',
    viewsCount: 2650,
    likesCount: 680,
    credentials: {
      user: 'doktor@sdmsoftware.com.tr',
      pass: 'clinic2026',
      role: 'Başhekim / Klinik Yöneticisi'
    },
    productSlug: 'sdm-clinic-management-system',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-veteriner-sys',
    title: 'Veteriner Klinik OS — Triyaj, Aşı Pasaportu & Müşahede',
    slug: 'veteriner-klinik-demo',
    category: 'clinic_system',
    shortDescription: 'Pet Sahibi & Veteriner Hekim çift rolü, mikroçip kimlik kartı, vital monitör, aşı karnesi hatırlatıcı ve müşahede ünitesi yönetimi.',
    fullDescription: 'Veteriner klinikleri için tasarlanmış kapsamlı yönetim sistemi: Pet Sahibi Portalı ile online randevu alma; Veteriner Hekim Paneli ile onay/iptal, canlı triyaj ve vital bulgu (ısı, nabız, solunum) kaydı, mikroçipli aşı pasaportu, yataklı müşahede kafes takibi, hemogram laboratuvarı ve tahsilat akışı.',
    features: [
      'Veteriner Hekim OS ve Pet Sahibi Portalı arasında anlık canlı senkronizasyon',
      'Dijital pet kimliği, mikroçip ID, vital bulgu monitörü ve muayene notu editörü',
      'Tür bazlı Aşı Takvimi, tek tıkla aşı uygulama ve SMS hatırlatma tetikleyici',
      'Yatan hasta müşahede üniteleri, doz onayları ve Hemogram/Biyokimya grafikleri'
    ],
    techStack: ['React', 'TypeScript', 'Next.js 16'],
    liveUrl: '/live/veteriner-klinik-demo',
    githubUrl: 'https://github.com/sudemkavuzkoz/Veteriner-Klinik-Sistemi',
    previewType: 'interactive_sandbox',
    status: 'active',
    viewsCount: 2150,
    likesCount: 520,
    credentials: {
      user: 'vet@sdmsoftware.com.tr',
      pass: 'vet2026',
      role: 'Veteriner Hekim'
    },
    productSlug: 'veteriner-klinik-sistemi',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80'
  }
];

// Başlangıç Siparişleri (Boş)
const INITIAL_ORDERS: Order[] = [];

// Veritabanı State Singleton Deposu
class DatabaseStore {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private demos: DemoProject[] = [...INITIAL_DEMOS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private users: User[] = [
    {
      id: 'usr-1',
      name: 'Yönetici Admin',
      email: 'admin@sdmsoftware.com.tr',
      role: 'admin',
      company: 'SDM Software HQ',
      membershipTier: 'enterprise_license',
      demoActionsUsed: 0,
      demoTrialLimit: 9999,
      licenses: [],
      branding: {
        brandName: 'SDM Software HQ',
        tagline: 'Kurumsal Yönetim Platformu',
        accentColor: '#00f0ff',
        logoText: 'SDM',
        welcomeMessage: 'Hoş geldiniz — Yönetici Tam Erişimi',
        enabledModules: ['dental_emr', 'vet_triage', 'stock_upload', 'travel_rag'],
        updatedAt: '2026-01-01T00:00:00Z'
      },
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  private trendyolSettings = {
    storeName: 'Sudem Kavuzkoz',
    storeUrl: 'https://www.trendyol.com/magaza/sudem-kavuzkoz-m-1260453?sst=0&sk=1',
    sellerScore: '9.8',
    followers: '1.4K',
    badgeText: 'Onaylı Trendyol Satıcısı (Sudem Kavuzkoz)'
  };

  getTrendyolSettings() {
    return this.trendyolSettings;
  }

  updateTrendyolSettings(updates: Partial<typeof this.trendyolSettings>) {
    this.trendyolSettings = { ...this.trendyolSettings, ...updates };
    return this.trendyolSettings;
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find(p => p.slug === slug);
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...updates };
    return this.products[idx];
  }

  deleteProduct(id: string): boolean {
    const prevLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length < prevLen;
  }

  getDemos(): DemoProject[] {
    return this.demos;
  }

  getDemoBySlug(slug: string): DemoProject | undefined {
    return this.demos.find(d => d.slug === slug);
  }

  addDemo(demo: Omit<DemoProject, 'id'>): DemoProject {
    const newDemo: DemoProject = {
      ...demo,
      id: `demo-${Date.now()}`
    };
    this.demos.unshift(newDemo);
    return newDemo;
  }

  updateDemo(id: string, updates: Partial<DemoProject>): DemoProject | null {
    const idx = this.demos.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.demos[idx] = { ...this.demos[idx], ...updates };
    return this.demos[idx];
  }

  deleteDemo(id: string): boolean {
    const prevLen = this.demos.length;
    this.demos = this.demos.filter(d => d.id !== id);
    return this.demos.length < prevLen;
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'licenseKeys'>): Order {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SDM-${new Date().getFullYear()}-${randomSuffix}`;
    
    const licenseKeys: { [productId: string]: string } = {};
    orderData.items.forEach(item => {
      const seg1 = item.product.slug.substring(0, 4).toUpperCase();
      const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg4 = Math.random().toString(36).substring(2, 6).toUpperCase();
      licenseKeys[item.product.id] = `SDM-${seg1}-${seg2}-${seg3}-${seg4}`;
    });

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      licenseKeys,
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): Order | null {
    const idx = this.orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    this.orders[idx].orderStatus = status;
    if (paymentStatus) {
      this.orders[idx].paymentStatus = paymentStatus;
    }
    return this.orders[idx];
  }

  getStats() {
    const totalRevenue = this.orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((acc, curr) => acc + curr.total, 0);
    const totalOrders = this.orders.length;
    const totalProducts = this.products.length;
    const totalDemos = this.demos.length;
    const totalDemoViews = this.demos.reduce((acc, curr) => acc + curr.viewsCount, 0);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalDemos,
      totalDemoViews
    };
  }
}

const globalForDb = globalThis as unknown as { dbStore: DatabaseStore | undefined };
export const db = globalForDb.dbStore ?? new DatabaseStore();
globalForDb.dbStore = db;
