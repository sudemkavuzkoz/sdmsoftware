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
    const requestedMethod = body.paymentMethod ?? 'quote_request';
    if (requestedMethod !== 'quote_request') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Web sitemiz üzerinden online ödeme alınmamaktadır. Teklif vermek için Müşteri Hizmetleri hattımızı kullanınız (WhatsApp: 0546 401 14 51 | Mail: sudemkavuzkoz005@gmail.com).'
        },
        { status: 400 }
      );
    }

    const authUser = await getAuthenticatedUser();
    // Web checkout does not collect payments; quote requests always start pending admin approval
    const safePayload = {
      ...body,
      paymentMethod: 'quote_request' as const,
      paymentStatus: 'pending' as const,
      orderStatus: 'processing' as const,
      proposedBudget:
        typeof body.proposedBudget === 'string' ? body.proposedBudget.trim().slice(0, 120) || undefined : undefined,
      quoteNote: typeof body.quoteNote === 'string' ? body.quoteNote.trim().slice(0, 1000) || undefined : undefined
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
