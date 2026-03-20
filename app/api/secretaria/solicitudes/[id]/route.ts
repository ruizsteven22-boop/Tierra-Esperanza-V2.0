import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { status, recordContent } = body;

    if (!status) {
      return NextResponse.json({ error: 'El estado es obligatorio' }, { status: 400 });
    }

    // Update request within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update request status
      const updatedRequest = await tx.secretaryRequest.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      // Add record if content provided
      if (recordContent) {
        await tx.secretaryRecord.create({
          data: {
            requestId: parseInt(id),
            note: recordContent,
            userId: session.userId
          }
        });
      }

      return updatedRequest;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating secretary request:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.secretaryDocument.deleteMany({ where: { requestId: parseInt(id) } }),
      prisma.secretaryRecord.deleteMany({ where: { requestId: parseInt(id) } }),
      prisma.secretaryRequest.delete({ where: { id: parseInt(id) } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting secretary request:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
