import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { rut } = body;

    if (!rut) {
      return NextResponse.json({ error: 'RUT es obligatorio' }, { status: 400 });
    }

    // Find member by RUT
    const member = await prisma.member.findUnique({
      where: { rut }
    });

    if (!member) {
      return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 });
    }

    // Check if already registered
    const existingAttendance = await prisma.assemblyAttendance.findUnique({
      where: {
        assemblyId_memberId: {
          assemblyId: params.id,
          memberId: member.id
        }
      }
    });

    if (existingAttendance) {
      return NextResponse.json({ 
        error: 'Asistencia ya registrada anteriormente',
        member 
      }, { status: 400 });
    }

    // Register attendance
    const attendance = await prisma.assemblyAttendance.create({
      data: {
        assemblyId: params.id,
        memberId: member.id,
        status: 'PRESENTE'
      },
      include: {
        member: true
      }
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    console.error('Error registering attendance:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
