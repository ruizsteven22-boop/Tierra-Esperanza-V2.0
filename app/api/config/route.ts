import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const config = await prisma.systemConfig.findFirst({
      where: { id: 1 }
    });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['superadmin', 'administrador'].includes(session.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    // Remove id from body to avoid updating it
    const { id, createdAt, updatedAt, ...configData } = body;

    const config = await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: configData,
      create: { id: 1, ...configData }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
