import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const roles = await prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
