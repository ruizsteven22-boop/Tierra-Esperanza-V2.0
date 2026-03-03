import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(db.transactions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newTransaction = {
    ...body,
    id: uuidv4(),
    date: new Date().toISOString(),
  };
  db.transactions.push(newTransaction);
  return NextResponse.json(newTransaction, { status: 201 });
}
