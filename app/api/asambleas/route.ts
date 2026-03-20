import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, location, type, description } = body;

    if (!title || !date || !location) {
      return NextResponse.json({ error: 'Título, fecha y ubicación son obligatorios' }, { status: 400 });
    }

    const newAssembly = await prisma.assembly.create({
      data: {
        title,
        date: new Date(date),
        location,
        type,
        description,
      }
    });

    return NextResponse.json(newAssembly, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assembly:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const assemblies = await prisma.assembly.findMany({
      where: type ? { type } : {},
      include: {
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(assemblies);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
