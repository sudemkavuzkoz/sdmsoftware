import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const demos = db.getDemos();
  return NextResponse.json({ success: true, count: demos.length, demos });
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Geçersiz demo isteği.';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.title || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Demo başlığı ve slug zorunludur.' },
        { status: 400 }
      );
    }
    const newDemo = db.addDemo(body);
    return NextResponse.json({ success: true, demo: newDemo }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 400 });
  }
}
