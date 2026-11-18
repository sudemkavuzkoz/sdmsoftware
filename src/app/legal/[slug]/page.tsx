import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, FileText, Mail } from 'lucide-react';

interface LegalDoc {
  title: string;
  badge: string;
  updatedAt: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

const LEGAL_DOCS: Record<string, LegalDoc> = {
  kvkk: {
    title: 'KVKK Aydınlatma Metni',
    badge: '6698 SAYILI KANUN KAPSAMINDA',
    updatedAt: 'Son Güncelleme: 2026',
    summary:
      'SDM Software (sdmsoftware.com.tr) olarak kişisel verilerinizin 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca işlenmesi, korunması ve haklarınız hakkında bilgilendirme.',
    sections: [
      {
        heading: '1. Veri Sorumlusu ve İşleme Amaçları',
        body: 'Sipariş, faturalandırma, dijital yazılım lisansı üretimi ve teknik destek süreçlerinin yürütülmesi amacıyla ad-soyad, e-posta, telefon ve fatura bilgileriniz hukuka uygun şekilde işlenir.'
      },
      {
        heading: '2. Verilerin Aktarımı ve Saklama Güvenliği',
        body: 'Kişisel verileriniz yalnızca yasal yükümlülüklerin yerine getirilmesi, ödeme doğrulama veya fatura düzenlenmesi kapsamında yetkili kurumlarla ve şifreli iletişim kanallarıyla paylaşılır.'
      },
      {
        heading: '3. İlgili Kişinin Hakları',
        body: 'KVKK Madde 11 kapsamındaki bilgi talep etme, düzeltme, silme ve itiraz haklarınız için sudemkavuzkoz005@gmail.com e-posta adresi veya 0546 401 14 51 numaralı müşteri hizmetleri hattı üzerinden bizimle her zaman iletişime geçebilirsiniz.'
      }
    ]
  },
  'mesafeli-satis': {
    title: 'Mesafeli Satış ve Lisans Bilgilendirmesi',
    badge: 'DİJİTAL YAZILIM LİSANSI',
    updatedAt: 'Son Güncelleme: 2026',
    summary:
      'sdmsoftware.com.tr üzerindeki yazılım paketleri ve kurumsal çözümler için Müşteri Hizmetleri teklif süreci ve dijital lisans koşulları.',
    sections: [
      {
        heading: '1. Teklif Süreci ve Dijital Teslimat',
        body: 'Web sitemiz üzerinden doğrudan ödeme alınmaz. Seçilen yazılım veya üyelik paketi için Müşteri Hizmetleri (0546 401 14 51 / sudemkavuzkoz005@gmail.com) ile sağlanan teklif mutabakatı sonrasında dijital lisans anahtarı ve kurulum rehberi hesabınıza tanımlanır.'
      },
      {
        heading: '2. Lisans Kapsamı ve Kullanım Hakları',
        body: 'Her lisans türü, ürün detay sayfasında belirtilen alan adı/kurum sayısına ve kaynak kod erişim kapsamına göre geçerlidir. İzinsiz üçüncü taraf yeniden dağıtımı yasaktır.'
      },
      {
        heading: '3. Teknik Destek ve Sürüm Güncellemeleri',
        body: 'Satın alınan tüm lisanslar kurulum rehberi ile birlikte sunulur; kurumsal ve genişletilmiş lisanslar için sürüm güncellemeleri ve öncelikli destek sağlanır.'
      }
    ]
  },
  'gizlilik-cerez': {
    title: 'Gizlilik & Çerez Politikası',
    badge: 'GİZLİLİK VE VERİ GÜVENLİĞİ',
    updatedAt: 'Son Güncelleme: 2026',
    summary:
      'Web sitemizde kullanıcı deneyimini sürdürmek, sepet ve oturum verilerinizi tarayıcınızda güvenle saklamak için kullanılan yerel depolama ve güvenlik ilkeleri.',
    sections: [
      {
        heading: '1. Tarayıcı Depolama (LocalStorage) Kullanımı',
        body: 'Sepet kalemleriniz, tercih ettiğiniz indirim kuponları, müşteri paneli sipariş kayıtlarınız ve yönetici oturum ayarlarınız kesintisiz deneyim amacıyla tarayıcınızın yerel deposunda saklanır.'
      },
      {
        heading: '2. İzole Demo Ortamları',
        body: 'Canlı demo simülatörleri tarayıcı içinde izole şekilde çalışır. Örnek senaryolara girdiğiniz veriler üçüncü taraflarla paylaşılmaz ve kalıcı takip profillemesi yapılmaz.'
      },
      {
        heading: '3. İletişim ve Güvenlik',
        body: 'Tüm sayfa ve veri trafiği HTTPS / TLS şifreleme katmanı üzerinden iletilir. Sorularınız için sudemkavuzkoz005@gmail.com veya 0546 401 14 51 numaralı hattan ulaşabilirsiniz.'
      }
    ]
  },
  'iptal-iade': {
    title: 'İptal ve İade Koşulları',
    badge: 'İADE VE DESTEK POLİTİKASI',
    updatedAt: 'Son Güncelleme: 2026',
    summary:
      'Dijital ürün, kurumsal yazılım lisansı ve kaynak kod paketleri için teklif, iptal ve teknik destek süreçleri.',
    sections: [
      {
        heading: '1. Dijital Ürün ve Lisans Teslimatı',
        body: 'Mesafeli Sözleşmeler Yönetmeliği uyarınca, elektronik ortamda ifa edilen ve lisans anahtarı / kaynak kodu hesabınıza tanımlanan yazılımlarda teslimat sonrasında kural olarak cayma hakkı uygulanmaz.'
      },
      {
        heading: '2. Teknik Sorunlarda Destek ve Çözüm Garantisi',
        body: 'Ürünün vaat edilen kurulum rehberine veya canlı demo özelliklerine aykırı çalışması durumunda mühendislik ekibimiz (0546 401 14 51) öncelikle teknik uyarlama sağlar.'
      },
      {
        heading: '3. Teklif Talebi ve Ön Başvuru İptali',
        body: 'Henüz lisansı aktifleştirilmemiş ve onaylanmamış teklif talepleri talebiniz doğrultusunda (0546 401 14 51 / sudemkavuzkoz005@gmail.com) tek taraflı olarak iptal edilebilir.'
      }
    ]
  }
};

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) {
    return { title: 'Sayfa Bulunamadı | SDM Software' };
  }
  return {
    title: doc.title,
    description: doc.summary
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];

  if (!doc) {
    notFound();
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5.5rem', maxWidth: '860px' }}>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          marginBottom: '1.75rem'
        }}
      >
        <ArrowLeft size={16} /> Ana Sayfaya Dön
      </Link>

      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div className="glow-accent" />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span className="badge badge-cyan">{doc.badge}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{doc.updatedAt}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)', fontWeight: 800, marginBottom: '1rem' }}>
          {doc.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: '1.7', marginBottom: '2rem' }}>
          {doc.summary}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {doc.sections.map((section) => (
            <div
              key={section.heading}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem'
              }}
            >
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--primary)" />
                <span>{section.heading}</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.65' }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span>SDM Software Hukuk & Uyumluluk Bilgilendirmesi</span>
          </div>
          <a href="mailto:sudemkavuzkoz005@gmail.com" className="btn btn-secondary btn-sm">
            <Mail size={14} /> İletişime Geç
          </a>
        </div>
      </div>
    </div>
  );
}
