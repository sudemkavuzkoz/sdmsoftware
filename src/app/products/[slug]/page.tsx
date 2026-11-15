import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = db.getProductBySlug(slug);
  if (!product) {
    return { title: 'Ürün Bulunamadı | SDM Software' };
  }
  return {
    title: `${product.title} - Yazılım Lisansı Satın Al`,
    description: product.shortDescription
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = db.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedDemo = product.demoSlug ? (db.getDemoBySlug(product.demoSlug) ?? null) : null;
  const allProducts = db.getProducts().filter(p => p.id !== product.id).slice(0, 3);

  return (
    <ProductDetailClient
      product={product}
      relatedDemo={relatedDemo}
      relatedProducts={allProducts}
    />
  );
}
