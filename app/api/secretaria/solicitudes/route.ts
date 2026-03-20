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
    const { title, description, type, priority, memberId } = body;

    if (!title || !description || !memberId) {
      return NextResponse.json({ error: 'Título, descripción y socio son obligatorios' }, { status: 400 });
    }

    const newRequest = await prisma.secretaryRequest.create({
      data: {
        title,
        description,
        type,
        priority,
        status: 'Pendiente',
        memberId,
      },
      include: {
        member: true
      }
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    console.error('Error creating secretary request:', error);
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
    const status = searchParams.get('status');
    const memberId = searchParams.get('memberId');

    const requests = await prisma.secretaryRequest.findMany({
      where: {
        AND: [
          status ? { status } : {},
          memberId ? { memberId } : {},
        ]
      },
      include: {
        member: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
