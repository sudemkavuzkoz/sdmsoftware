import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverSession';
import { serverDb } from '@/lib/serverDb';
import { MembershipTier } from '@/lib/types';

export async function GET() {
  const current = await getAuthenticatedUser();
  if (!current || current.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yönetici yetkisi gereklidir.' }, { status: 403 });
  }
  const users = serverDb.listUsers();
  const orders = serverDb.getOrders();
  return NextResponse.json({ success: true, count: users.length, users, orders });
}

export async function PATCH(request: Request) {
  const current = await getAuthenticatedUser();
  if (!current || current.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yönetici yetkisi gereklidir.' }, { status: 403 });
  }
  try {
    const body = (await request.json()) as { userId?: string; membershipTier?: MembershipTier };
    if (!body.userId || !body.membershipTier) {
      return NextResponse.json({ success: false, error: 'Kullanıcı ID ve üyelik seviyesi zorunludur.' }, { status: 400 });
    }
    const updated = serverDb.updateUserTierByAdmin(body.userId, body.membershipTier);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Güncelleme başarısız.' }, { status: 400 });
  }
}
