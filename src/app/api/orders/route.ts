import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const orders = db.getOrders();
  return NextResponse.json({ success: true, count: orders.length, orders });
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
    const newOrder = db.createOrder(body);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 400 });
  }
}
