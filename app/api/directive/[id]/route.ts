import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  const index = db.directive.findIndex(m => m.id === id);
  if (index !== -1) {
    db.directive[index] = { ...db.directive[index], ...body };
    return NextResponse.json(db.directive[index]);
  }
  
  return NextResponse.json({ error: 'Member not found' }, { status: 404 });
}
