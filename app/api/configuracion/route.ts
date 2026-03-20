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
    const { organizationName, rut, address, email, phone, website, logoUrl } = body;

    if (!organizationName) {
      return NextResponse.json({ error: 'El nombre de la organización es obligatorio' }, { status: 400 });
    }

    const existingConfig = await prisma.systemConfig.findFirst();

    let config;
    if (existingConfig) {
      config = await prisma.systemConfig.update({
        where: { id: existingConfig.id },
        data: {
          organizationName,
          rut,
          address,
          email,
          phone,
          website,
          logoUrl,
        }
      });
    } else {
      config = await prisma.systemConfig.create({
        data: {
          organizationName,
          rut,
          address,
          email,
          phone,
          website,
          logoUrl,
        }
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Error updating system config:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const config = await prisma.systemConfig.findFirst();
    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
