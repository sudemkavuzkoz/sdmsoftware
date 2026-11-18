'use client';

import { useSyncExternalStore } from 'react';
import { db } from '@/lib/db';
import { Order } from '@/lib/types';

const STORAGE_KEY = 'sdm_client_orders';
const CHANGE_EVENT = 'sdm-orders-change';
const SERVER_ORDERS: Order[] = [];

let cachedRaw: string | null | undefined;
let cachedMerged: Order[] = SERVER_ORDERS;

function subscribeOrders(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function readStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getOrdersSnapshot(): Order[] {
  if (typeof window === 'undefined') return SERVER_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const baseOrders = db.getOrders();
    const rawKey = `${raw ?? ''}::${baseOrders.map(o => `${o.id}:${o.orderStatus}`).join(',')}`;
    if (rawKey === cachedRaw) return cachedMerged;
    cachedRaw = rawKey;

    const stored = readStoredOrders();
    const seen = new Set<string>();
    const merged: Order[] = [];

    for (const order of [...stored, ...baseOrders]) {
      if (!seen.has(order.id)) {
        seen.add(order.id);
        merged.push(order);
      }
    }

    cachedMerged = merged;
    return cachedMerged;
  } catch {
    return SERVER_ORDERS;
  }
}

function getOrdersServerSnapshot(): Order[] {
  return SERVER_ORDERS;
}

/**
 * Siparişi tarayıcı deposuna kalıcı olarak kaydeder ve aboneleri günceller.
 */
export function persistClientOrder(order: Order) {
  if (typeof window === 'undefined') return;
  try {
    const existing = readStoredOrders().filter(o => o.id !== order.id);
    const next = [order, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = undefined;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Depolama doluysa sessizce devam edilir
  }
}

export function useOrders(): Order[] {
  return useSyncExternalStore(subscribeOrders, getOrdersSnapshot, getOrdersServerSnapshot);
}

export function useIsClientHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function triggerFileDownload(filename: string, content: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Sipariş kapsamındaki lisans anahtarları ve kurulum rehberini indirir.
 */
export function downloadLicensePackage(order: Order, singleProductId?: string) {
  const targetItems = singleProductId
    ? order.items.filter(i => i.product.id === singleProductId)
    : order.items;

  const lines: string[] = [
    '============================================================',
    'SDM SOFTWARE - LİSANS ANAHTARI VE KURULUM PAKETİ',
    '============================================================',
    `Sipariş Numarası : ${order.orderNumber}`,
    `Müşteri / Yetkili: ${order.customerName} (${order.customerEmail})`,
    `Tarih            : ${new Date(order.createdAt).toLocaleString('tr-TR')}`,
    '',
    '--- ÜRÜNLER VE LİSANS ANAHTARLARI ---',
    ...targetItems.flatMap(item => {
      const key = order.licenseKeys[item.product.id] || `SDM-${item.product.slug.toUpperCase().substring(0, 4)}-KEY-2026`;
      return [
        `• ${item.product.title} (${item.product.version})`,
        `  Lisans Paketi  : ${item.licenseTier.toUpperCase()}`,
        `  Lisans Anahtarı: ${key}`,
        `  Teknolojiler   : ${item.product.techStack.join(', ')}`,
        ''
      ];
    }),
    '--- HIZLI KURULUM REHBERİ ---',
    '1. Depo dizinini açın ve bağımlılıkları yükleyin: npm install',
    '2. .env dosyanızda SDM_LICENSE_KEY alanına yukarıdaki anahtarı ekleyin.',
    '3. Üretim derlemesi alın: npm run build && npm start',
    '',
    'Müşteri Hizmetleri & Destek: WhatsApp 0546 401 14 51 | sudemkavuzkoz005@gmail.com | https://sdmsoftware.com.tr',
    '============================================================'
  ];

  triggerFileDownload(
    `SDM-Lisans-Kurulum-${order.orderNumber}.txt`,
    lines.join('\n'),
    'text/plain'
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sipariş için yazdırılabilir E-Fatura / Sipariş özet HTML belgesi indirir.
 */
export function downloadInvoiceDocument(order: Order) {
  const rowsHtml = order.items
    .map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(item.product.title)} (${escapeHtml(item.licenseTier.toUpperCase())})</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${item.unitPrice.toLocaleString('tr-TR')} ₺</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${(item.unitPrice * item.quantity).toLocaleString('tr-TR')} ₺</td>
      </tr>
    `)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>E-Fatura Özeti - ${escapeHtml(order.orderNumber)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
    .totals { margin-top: 24px; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin:0;">SDM SOFTWARE</h1>
      <p style="margin:4px 0 0;color:#475569;">sdmsoftware.com.tr • WhatsApp: 0546 401 14 51 • sudemkavuzkoz005@gmail.com</p>
    </div>
    <div style="text-align:right;">
      <strong>TEKLİF &amp; SİPARİŞ ÖZET BELGESİ</strong><br />
      Sipariş No: ${escapeHtml(order.orderNumber)}<br />
      Tarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}
    </div>
  </div>
  <p><strong>Alıcı:</strong> ${escapeHtml(order.customerName)} ${order.companyName ? `(${escapeHtml(order.companyName)})` : ''}<br />
  <strong>E-Posta:</strong> ${escapeHtml(order.customerEmail)} • <strong>Telefon:</strong> ${escapeHtml(order.customerPhone)}</p>
  <table>
    <thead>
      <tr>
        <th>Ürün / Lisans</th>
        <th style="text-align:center;">Adet</th>
        <th style="text-align:right;">Birim Fiyat</th>
        <th style="text-align:right;">Tutar</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="totals">
    <div>Ara Toplam: ${order.subtotal.toLocaleString('tr-TR')} ₺</div>
    ${order.discount > 0 ? `<div>İndirim: -${order.discount.toLocaleString('tr-TR')} ₺</div>` : ''}
    <div style="font-size:1.25rem;font-weight:bold;margin-top:8px;">Genel Toplam: ${order.total.toLocaleString('tr-TR')} ₺</div>
  </div>
</body>
</html>`;

  triggerFileDownload(`SDM-Fatura-${order.orderNumber}.html`, html, 'text/html');
}
