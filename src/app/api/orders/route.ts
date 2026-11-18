import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serverDb } from '@/lib/serverDb';
import { getAuthenticatedUser } from '@/lib/serverSession';
import { Order } from '@/lib/types';

export async function GET() {
  const persistedOrders = serverDb.getOrders();
  const memoryOrders = db.getOrders();
  const seen = new Set<string>();
  const combined = [...persistedOrders, ...memoryOrders].filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
  return NextResponse.json({ success: true, count: combined.length, orders: combined });
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Geçersiz sipariş isteği.';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sipariş kalemleri eksik veya boş.' },
        { status: 400 }
      );
    }
    const paymentSettings = serverDb.getPaymentSettings();
    if (body.paymentMethod === 'credit_card' && !paymentSettings.virtualPosEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kredi kartı / Sanal POS şu anda aktif değil. Lütfen Banka Havalesi / EFT / FAST yöntemini kullanınız.'
        },
        { status: 400 }
      );
    }

    const authUser = await getAuthenticatedUser();
    // Enforce server-side payment status when paying by wire_transfer
    const safePayload = {
      ...body,
      paymentStatus: body.paymentMethod === 'wire_transfer' ? 'pending' : body.paymentStatus,
      orderStatus: body.paymentMethod === 'wire_transfer' ? 'processing' : body.orderStatus
    };
    const newOrder = serverDb.createOrder(safePayload, authUser?.id);
    const updatedUser = authUser ? serverDb.getUserById(authUser.id) : null;
    return NextResponse.json({ success: true, order: newOrder, user: updatedUser }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const current = await getAuthenticatedUser();
  if (!current || current.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Sipariş onaylama için yönetici yetkisi gereklidir.' }, { status: 403 });
  }
  try {
    const body = (await request.json()) as {
      orderId?: string;
      orderStatus?: Order['orderStatus'];
      paymentStatus?: Order['paymentStatus'];
    };
    if (!body.orderId || !body.orderStatus) {
      return NextResponse.json({ success: false, error: 'Sipariş ID ve durum zorunludur.' }, { status: 400 });
    }
    const updated = serverDb.updateOrderStatus(body.orderId, body.orderStatus, body.paymentStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Sipariş bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order: updated, users: serverDb.listUsers() });
  } catch {
    return NextResponse.json({ success: false, error: 'Sipariş güncellenemedi.' }, { status: 400 });
  }
}
