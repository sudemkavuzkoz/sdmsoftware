import { CartItem } from './types';

export const CUSTOMER_SUPPORT = {
  brand: 'SDM Software',
  sectionTitle: 'Müşteri Hizmetleri & Teklif Merkezi',
  phoneDisplay: '0546 401 14 51',
  phoneDigits: '05464011451',
  phoneIntl: '905464011451',
  telHref: 'tel:+905464011451',
  whatsappHref: 'https://wa.me/905464011451',
  email: 'sudemkavuzkoz005@gmail.com',
  hours: 'Hafta içi & Cumartesi • 09:00 - 21:00',
  noWebPaymentNotice:
    'Web sitemiz üzerinden online ödeme alınmamaktadır. Seçtiğiniz yazılım, üyelik veya özel proje için WhatsApp (0546 401 14 51) ya da e-posta (sudemkavuzkoz005@gmail.com) üzerinden doğrudan teklif verebilirsiniz.'
} as const;

export interface QuoteMessageParams {
  subject?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  proposedBudget?: string;
  quoteNote?: string;
  orderNumber?: string;
  items?: CartItem[];
  totalAmount?: number;
}

export function formatQuoteMessage(params: QuoteMessageParams): string {
  const lines: string[] = ['Merhaba SDM Software Müşteri Hizmetleri,'];

  if (params.orderNumber) {
    lines.push(`Talep Referans No: ${params.orderNumber}`);
  }
  if (params.subject) {
    lines.push(`Konu: ${params.subject}`);
  }

  if (params.items && params.items.length > 0) {
    lines.push('');
    lines.push('Teklif Talep Edilen Sistem / Lisanslar:');
    params.items.forEach((item) => {
      if (item.unitPrice > 0) {
        lines.push(
          `- ${item.product.title} (${item.licenseTier.toUpperCase()} x ${item.quantity}) - ${(
            item.unitPrice * item.quantity
          ).toLocaleString('tr-TR')} TL`
        );
      } else {
        lines.push(`- ${item.product.title}`);
      }
    });
    if (typeof params.totalAmount === 'number' && params.totalAmount > 0) {
      lines.push(`Liste Tutarı: ${params.totalAmount.toLocaleString('tr-TR')} TL`);
    }
  }

  if (params.proposedBudget?.trim()) {
    lines.push(`Teklif / Bütçe Önerim: ${params.proposedBudget.trim()}`);
  }
  if (params.quoteNote?.trim()) {
    lines.push(`Detay / Not: ${params.quoteNote.trim()}`);
  }

  if (params.customerName || params.companyName || params.customerPhone || params.customerEmail) {
    lines.push('');
    lines.push('İletişim Bilgilerim:');
    if (params.customerName) lines.push(`Ad Soyad: ${params.customerName}`);
    if (params.companyName) lines.push(`Kurum / Firma: ${params.companyName}`);
    if (params.customerPhone) lines.push(`Telefon: ${params.customerPhone}`);
    if (params.customerEmail) lines.push(`E-Posta: ${params.customerEmail}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppQuoteUrl(params: QuoteMessageParams = {}): string {
  const text = formatQuoteMessage(params);
  return `${CUSTOMER_SUPPORT.whatsappHref}?text=${encodeURIComponent(text)}`;
}

export function buildMailtoQuoteUrl(params: QuoteMessageParams = {}): string {
  const subject = params.orderNumber
    ? `Teklif Talebi (${params.orderNumber}) - SDM Software`
    : params.subject
    ? `Fiyat Teklifi - ${params.subject}`
    : 'Yazılım & Lisans Teklif Talebi - SDM Software';
  const body = formatQuoteMessage(params);
  return `mailto:${CUSTOMER_SUPPORT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
