import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const products = db.getProducts();
  return NextResponse.json({ success: true, count: products.length, products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = db.addProduct(body);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
