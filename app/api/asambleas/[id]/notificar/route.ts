import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const assembly = await prisma.assembly.findUnique({
      where: { id: parseInt(id) },
      include: {
        attendances: true
      }
    });

    if (!assembly) {
      return NextResponse.json({ error: 'Asamblea no encontrada' }, { status: 404 });
    }

    // Get all active members
    const members = await prisma.member.findMany({
      where: { status: 'Activo' }
    });

    // Create notifications in the database
    const notifications = await Promise.all(
      members.map(member => 
        prisma.assemblyNotification.create({
          data: {
            assemblyId: parseInt(id),
            memberId: member.id,
            channel: 'EMAIL',
            destination: member.email || 'No registrado',
            subject: `Citación: ${assembly.title}`,
            message: `Estimado/a ${member.name}, se le cita a la asamblea "${assembly.title}" el día ${new Date(assembly.date).toLocaleDateString('es-CL')} en ${assembly.location}.`,
            status: 'ENVIADO', // Mocking as sent for now
            sentAt: new Date(),
            userId: session.userId
          }
        })
      )
    );

    return NextResponse.json({ 
      message: 'Notificaciones enviadas correctamente',
      count: notifications.length 
    });
  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
