import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const categories = await prisma.treasuryCategory.findMany({
      where: type ? { type } : {},
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Nombre y tipo son obligatorios' }, { status: 400 });
    }

    const category = await prisma.treasuryCategory.create({
      data: { name, type, description }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
