import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'https://sdmsoftware.com.tr';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/demos`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/legal/kvkk`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/legal/mesafeli-satis`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/legal/gizlilik-cerez`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/legal/iptal-iade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 }
  ];

  const productRoutes: MetadataRoute.Sitemap = db.getProducts().map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  const demoRoutes: MetadataRoute.Sitemap = db.getDemos().map((demo) => ({
    url: `${BASE_URL}/demos/${demo.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  return [...staticRoutes, ...productRoutes, ...demoRoutes];
}
