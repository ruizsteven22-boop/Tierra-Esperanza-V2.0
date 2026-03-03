import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json(db.config);
}

export async function PUT(request: Request) {
  const body = await request.json();
  db.config = { ...db.config, ...body };
  return NextResponse.json(db.config);
}
