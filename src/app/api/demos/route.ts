import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const demos = db.getDemos();
  return NextResponse.json({ success: true, count: demos.length, demos });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDemo = db.addDemo(body);
    return NextResponse.json({ success: true, demo: newDemo }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
