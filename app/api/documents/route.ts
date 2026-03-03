import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(db.documents);
}

export async function POST(request: Request) {
  const body = await request.json();
  const year = new Date().getFullYear();
  const count = db.documents.filter(d => d.type === body.type && d.folio.includes(year.toString())).length + 1;
  const prefix = body.type === 'Oficio' ? 'OF' : body.type === 'Carta' ? 'CA' : 'AC';
  const folio = `${prefix}-${year}-${count.toString().padStart(3, '0')}`;

  const newDocument = {
    ...body,
    id: uuidv4(),
    folio,
    status: 'Borrador',
    createdAt: new Date().toISOString(),
  };
  db.documents.push(newDocument);
  return NextResponse.json(newDocument, { status: 201 });
}
