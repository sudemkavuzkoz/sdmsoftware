import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { attachSessionCookie } from '@/lib/serverSession';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      company?: string;
      phone?: string;
    };

    const result = serverDb.registerUser({
      name: body.name ?? '',
      email: body.email ?? '',
      password: body.password ?? '',
      company: body.company,
      phone: body.phone
    });

    if (result.error || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error ?? 'Kayıt işlemi başarısız.' },
        { status: result.status ?? 400 }
      );
    }

    const res = NextResponse.json(
      { success: true, user: result.user, orders: [] },
      { status: 201 }
    );
    attachSessionCookie(res, result.user.id, request);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz kayıt verisi.' },
      { status: 400 }
    );
  }
}
