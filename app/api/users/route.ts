import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(db.users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newUser = {
    ...body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}
