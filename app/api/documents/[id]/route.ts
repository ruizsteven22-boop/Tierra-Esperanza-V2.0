import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const index = db.documents.findIndex((d) => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  db.documents[index] = { ...db.documents[index], ...body };
  return NextResponse.json(db.documents[index]);
}
