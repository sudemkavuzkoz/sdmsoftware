import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serverDb } from '@/lib/serverDb';
import { getAuthenticatedUser } from '@/lib/serverSession';

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
    const authUser = await getAuthenticatedUser();
    const newOrder = serverDb.createOrder(body, authUser?.id);
    const updatedUser = authUser ? serverDb.getUserById(authUser.id) : null;
    return NextResponse.json({ success: true, order: newOrder, user: updatedUser }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 400 });
  }
}
