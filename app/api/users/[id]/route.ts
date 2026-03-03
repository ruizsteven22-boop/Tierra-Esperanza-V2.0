import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  db.users[index] = { ...db.users[index], ...body };
  return NextResponse.json(db.users[index]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  db.users.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}
