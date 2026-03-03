import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(db.assemblies);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newAssembly = {
    ...body,
    id: uuidv4(),
    status: 'Programada',
  };
  db.assemblies.push(newAssembly);
  return NextResponse.json(newAssembly, { status: 201 });
}
