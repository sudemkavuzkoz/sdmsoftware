import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://sdmsoftware.com.tr'),
  title: {
    default: 'SDM Software | Kurumsal Yazılım, E-Ticaret & Canlı Demo Platformu',
    template: '%s | SDM Software'
  },
  description: 'sdmsoftware.com.tr - AI Travel Planner, StockPred AI finansal tahmin, SDM Klinik, ADSP Protez Takip ve Veteriner Klinik sistemleri. Canlı sistem demolarını deneyimleyin ve dijital yazılım lisanslarını güvenle satın alın.',
  keywords: [
    'sdmsoftware.com.tr',
    'SDM Software',
    'AI Travel Planner',
    'StockPred AI',
    'ADSP Protez Takip',
    'klinik yönetim sistemi',
    'canlı demo sistemleri',
    'yazılım lisansı satın al'
  ],
  authors: [{ name: 'SDM Software Engineering' }],
  creator: 'SDM Software',
  publisher: 'sdmsoftware.com.tr',
  openGraph: {
    title: 'SDM Software | Kurumsal Yazılım & Canlı Sistem Vitrini',
    description: 'Yeni nesil yapay zeka yazılımları, sağlık otomasyonları ve canlı interaktif sistem demoları.',
    url: 'https://sdmsoftware.com.tr',
    siteName: 'SDM Software',
    locale: 'tr_TR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SDM Software | Kurumsal Yazılım & Canlı Sistem Vitrini',
    description: 'AI Travel Planner, StockPred AI ve klinik yönetim sistemleri canlı demo ve lisans mağazası.'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                {children}
              </main>
              <Footer />
              <CartDrawer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
