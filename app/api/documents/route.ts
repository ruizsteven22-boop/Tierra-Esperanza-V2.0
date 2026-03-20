import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const documents = await prisma.secretaryDocument.findMany({
      include: {
        request: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener documentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, fileUrl, requestId } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Título y tipo son obligatorios' }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const count = await prisma.secretaryDocument.count({
      where: {
        type,
        folio: { contains: year.toString() }
      }
    });

    const prefixes: Record<string, string> = {
      'Oficio': 'OF',
      'Carta': 'CA',
      'Acta': 'AC',
      'Circular': 'CI',
      'Importante': 'IM'
    };
    const prefix = prefixes[type] || 'DOC';
    const folio = `${prefix}-${year}-${(count + 1).toString().padStart(3, '0')}`;

    const newDocument = await prisma.secretaryDocument.create({
      data: {
        title,
        type,
        folio,
        fileUrl: fileUrl || null,
        status: fileUrl ? 'Cargado' : 'Borrador',
        requestId: requestId ? parseInt(requestId) : null,
        userId: session.userId
      }
    });

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
