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
    const { memberId, position, startDate, endDate } = body;

    if (!memberId || !position || !startDate) {
      return NextResponse.json({ error: 'Socio, cargo y fecha de inicio son obligatorios' }, { status: 400 });
    }

    // Check if member already has a position
    const existingPosition = await prisma.directiveMember.findFirst({
      where: { memberId }
    });

    if (existingPosition) {
      return NextResponse.json({ error: 'Este socio ya tiene un cargo asignado' }, { status: 400 });
    }

    const newDirectiveMember = await prisma.directiveMember.create({
      data: {
        memberId,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    return NextResponse.json(newDirectiveMember, { status: 201 });
  } catch (error: any) {
    console.error('Error creating directive member:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const directiveMembers = await prisma.directiveMember.findMany({
      include: {
        member: true,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json(directiveMembers);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
