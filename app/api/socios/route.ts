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
    const { name, rut, email, phone, address, birthDate, status, familyMembers } = body;

    if (!name || !rut) {
      return NextResponse.json({ error: 'Nombre y RUT son obligatorios' }, { status: 400 });
    }

    // Check if RUT already exists
    const existingMember = await prisma.member.findUnique({
      where: { rut }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Ya existe un socio con este RUT' }, { status: 400 });
    }

    // Create member within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          name,
          rut,
          email: email || null,
          phone: phone || null,
          address: address || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          status: status || 'Activo',
        }
      });

      if (familyMembers && familyMembers.length > 0) {
        await tx.familyMember.createMany({
          data: familyMembers.map((fm: any) => ({
            memberId: member.id,
            name: fm.name,
            relationship: fm.relationship,
            rut: fm.rut,
          }))
        });
      }

      return member;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating member:', error);
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
    const q = searchParams.get('q') || '';

    const members = await prisma.member.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { rut: { contains: q } },
        ]
      },
      take: 10,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
