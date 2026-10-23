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
  description: 'sdmsoftware.com.tr - Kurumsal ERP, AI Chatbot, Finansal Analitik ve B2B e-ticaret sistemleri. Canlı sistem demolarını deneyimleyin, dijital yazılım lisanslarını güvenle satın alın.',
  keywords: [
    'sdmsoftware.com.tr',
    'SDM Software',
    'kurumsal yazılım satışı',
    'erp yazılımı',
    'canlı demo sistemleri',
    'ai chatbot çözümleri',
    'b2b e-ticaret',
    'yazılım lisansı satın al'
  ],
  authors: [{ name: 'SDM Software Engineering' }],
  creator: 'SDM Software',
  publisher: 'sdmsoftware.com.tr',
  openGraph: {
    title: 'SDM Software | Kurumsal Yazılım & Canlı Sistem Vitrini',
    description: 'Yeni nesil yazılım çözümleri, e-ticaret platformları ve canlı interaktif sistem demoları.',
    url: 'https://sdmsoftware.com.tr',
    siteName: 'SDM Software',
    locale: 'tr_TR',
    type: 'website'
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
