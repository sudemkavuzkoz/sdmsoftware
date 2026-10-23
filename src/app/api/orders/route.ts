import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const orders = db.getOrders();
  return NextResponse.json({ success: true, count: orders.length, orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOrder = db.createOrder(body);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
