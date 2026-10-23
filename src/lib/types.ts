export type ProductCategory = 'saas' | 'api' | 'webapp' | 'enterprise' | 'template' | 'trendyol';

export type LicenseTier = 'standard' | 'commercial' | 'extended';

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  badge?: 'Popüler' | 'Yeni' | 'Çok Satan' | 'Özel' | 'Trendyol';
  rating: number;
  reviewsCount: number;
  features: string[];
  techStack: string[];
  demoSlug?: string;
  downloadUrl?: string;
  marketplaceUrl?: string;
  isTrendyol?: boolean;
  imageUrl: string;
  inStock: boolean;
  version: string;
}

export type DemoCategory = 'travel_ai' | 'stock_prediction' | 'clinic_system' | 'erp_crm' | 'ai_bot' | 'fintech' | 'b2b' | 'automation';

export interface DemoProject {
  id: string;
  title: string;
  slug: string;
  category: DemoCategory;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  techStack: string[];
  liveUrl?: string;
  previewType: 'interactive_sandbox' | 'iframe' | 'dashboard_simulation';
  status: 'active' | 'beta' | 'maintenance';
  viewsCount: number;
  likesCount: number;
  credentials?: {
    user: string;
    pass: string;
    role: string;
  };
  productSlug?: string;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  licenseTier: LicenseTier;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  taxNumber?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'credit_card' | 'iyzico' | 'stripe' | 'wire_transfer';
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'completed' | 'processing' | 'refunded';
  licenseKeys: { [productId: string]: string };
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  company?: string;
  createdAt: string;
}

export interface TrendyolStoreSettings {
  storeName: string;
  storeUrl: string;
  sellerScore: string;
  followers: string;
  badgeText: string;
}
