import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(db.tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newTask = {
    ...body,
    id: uuidv4(),
  };
  db.tasks.push(newTask);
  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const index = db.tasks.findIndex(t => t.id === body.id);
  if (index === -1) return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  db.tasks[index] = { ...db.tasks[index], ...body };
  return NextResponse.json(db.tasks[index]);
}
