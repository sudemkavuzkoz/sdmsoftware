import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { getAuthenticatedUser } from '@/lib/serverSession';
import { PaymentSettings } from '@/lib/types';

export async function GET() {
  const settings = serverDb.getPaymentSettings();
  return NextResponse.json({ success: true, settings });
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Ödeme ve IBAN ayarlarını yalnızca yönetici güncelleyebilir.' },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as Partial<PaymentSettings>;
    const updated = serverDb.updatePaymentSettings(body);
    if (updated.error || !updated.settings) {
      return NextResponse.json(
        { success: false, error: updated.error ?? 'Ayarlar güncellenemedi.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, settings: updated.settings });
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz ödeme ayarı verisi.' }, { status: 400 });
  }
}
