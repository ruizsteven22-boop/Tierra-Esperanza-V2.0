import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();
  const index = db.assemblies.findIndex((a: any) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Assembly not found' }, { status: 404 });
  }

  db.assemblies[index] = { ...db.assemblies[index], ...body };
  return NextResponse.json(db.assemblies[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const index = db.assemblies.findIndex((a: any) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Assembly not found' }, { status: 404 });
  }

  db.assemblies.splice(index, 1);
  return NextResponse.json({ message: 'Assembly deleted' });
}
