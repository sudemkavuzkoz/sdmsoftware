import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { attachSessionCookie } from '@/lib/serverSession';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? '';
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-posta ve şifre zorunludur.' },
        { status: 400 }
      );
    }

    const user = serverDb.authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'E-posta adresi veya şifre hatalı.' },
        { status: 401 }
      );
    }

    const orders = serverDb.getOrdersForUser(user);
    const res = NextResponse.json({ success: true, user, orders });
    attachSessionCookie(res, user.id, request);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Giriş isteği işlenemedi.' },
      { status: 400 }
    );
  }
}
