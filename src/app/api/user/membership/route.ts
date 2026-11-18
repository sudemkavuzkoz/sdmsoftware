import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverSession';
import { serverDb } from '@/lib/serverDb';
import { MembershipTier, Order } from '@/lib/types';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Bu işlem için önce giriş yapmalı veya kayıt olmalısınız.' },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      action?: 'upgrade_membership' | 'activate_license' | 'track_demo_usage';
      tier?: Exclude<MembershipTier, 'free'>;
      paymentMethod?: Order['paymentMethod'];
      targetSlug?: string;
      licenseKey?: string;
    };

    if (body.action === 'track_demo_usage') {
      const usage = serverDb.incrementDemoUsage(user.id);
      if (!usage) {
        return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
      }
      const updatedUser = serverDb.getUserById(user.id);
      return NextResponse.json({ success: true, usage, user: updatedUser });
    }

    if (body.action === 'activate_license') {
      const res = serverDb.activateLicenseForUser(user.id, body.licenseKey ?? '', body.targetSlug ?? 'all');
      if (res.error || !res.user) {
        return NextResponse.json({ success: false, error: res.error ?? 'Lisans doğrulanamadı.' }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        user: res.user,
        orders: serverDb.getOrdersForUser(res.user)
      });
    }

    if (body.action === 'upgrade_membership') {
      if (user.role !== 'admin') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Üyelik ve lisans aktivasyonu yalnızca Müşteri Hizmetleri teklif onayı sonrası yönetici tarafından yapılmaktadır (WhatsApp: 0546 401 14 51).'
          },
          { status: 403 }
        );
      }
      const tier = body.tier;
      if (!tier || !['pro_monthly', 'pro_yearly', 'enterprise_license'].includes(tier)) {
        return NextResponse.json({ success: false, error: 'Geçersiz üyelik paketi.' }, { status: 400 });
      }
      const upgraded = serverDb.upgradeUserMembership(
        user.id,
        tier,
        body.paymentMethod ?? 'credit_card',
        body.targetSlug ?? 'all'
      );
      if (!upgraded) {
        return NextResponse.json({ success: false, error: 'Üyelik yükseltilemedi.' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        user: upgraded.user,
        order: upgraded.order,
        orders: serverDb.getOrdersForUser(upgraded.user)
      });
    }

    return NextResponse.json({ success: false, error: 'Bilinmeyen üyelik işlemi.' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'İstek ayrıştırılamadı.' }, { status: 400 });
  }
}
