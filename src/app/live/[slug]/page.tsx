import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import LiveStandaloneClient from './LiveStandaloneClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const demo = db.getDemoBySlug(slug);
  if (!demo) {
    return { title: 'Canlı Demo Bulunamadı | SDM Software' };
  }
  return {
    title: `${demo.title} | Canlı Çalışan Demo`,
    description: demo.shortDescription
  };
}

export default async function LiveDemoStandalonePage({ params }: PageProps) {
  const { slug } = await params;
  const demo = db.getDemoBySlug(slug);

  if (!demo) {
    notFound();
  }

  return <LiveStandaloneClient demo={demo} />;
}
