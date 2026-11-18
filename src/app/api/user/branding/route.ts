import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverSession';
import { serverDb } from '@/lib/serverDb';
import { UserBrandingConfig } from '@/lib/types';

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Marka ve sistem ayarlarını kaydetmek için giriş yapmalısınız.' },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as Partial<UserBrandingConfig>;
    const updated = serverDb.updateUserBranding(user.id, body);
    if (updated.error || !updated.user) {
      return NextResponse.json(
        { success: false, error: updated.error ?? 'Kişiselleştirme kaydedilemedi.' },
        { status: updated.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, user: updated.user });
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz kişiselleştirme verisi.' }, { status: 400 });
  }
}
