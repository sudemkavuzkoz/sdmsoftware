import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const products = db.getProducts();
  return NextResponse.json({ success: true, count: products.length, products });
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Geçersiz ürün isteği.';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.title || !body.slug || typeof body.price !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Ürün başlığı, slug ve fiyat zorunludur.' },
        { status: 400 }
      );
    }
    const newProduct = db.addProduct(body);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 400 });
  }
}
