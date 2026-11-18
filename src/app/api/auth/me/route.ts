import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverSession';
import { serverDb } from '@/lib/serverDb';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, orders: [] });
  }
  const orders = serverDb.getOrdersForUser(user);
  return NextResponse.json({ authenticated: true, user, orders });
}
