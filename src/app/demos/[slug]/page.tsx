import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Play, ShieldCheck, ExternalLink, Key, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';
import DemoDetailClient from './DemoDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const demo = db.getDemoBySlug(slug);
  if (!demo) {
    return { title: 'Demo Bulunamadı | SDM Software' };
  }
  return {
    title: `${demo.title} - Canlı Sistem Demosu`,
    description: demo.shortDescription
  };
}

export default async function DemoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const demo = db.getDemoBySlug(slug);

  if (!demo) {
    notFound();
  }

  const linkedProduct = demo.productSlug ? (db.getProductBySlug(demo.productSlug) ?? null) : null;

  return (
    <DemoDetailClient
      demo={demo}
      linkedProduct={linkedProduct}
    />
  );
}
