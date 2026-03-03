import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(db.members);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newMember = {
    ...body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  db.members.push(newMember);
  return NextResponse.json(newMember, { status: 201 });
}
