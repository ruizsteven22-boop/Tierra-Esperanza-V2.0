import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  const index = db.members.findIndex(m => m.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }
  
  db.members[index] = {
    ...db.members[index],
    ...body,
    id // Ensure ID doesn't change
  };
  
  return NextResponse.json(db.members[index]);
}
