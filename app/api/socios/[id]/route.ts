import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Update member within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update main member info
      const member = await tx.member.update({
        where: { id: params.id },
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

      // Handle family members: delete all and recreate (simplest approach for now)
      // A more complex approach would be to diff them
      await tx.familyMember.deleteMany({
        where: { memberId: params.id }
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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Delete member (cascading delete should handle family members if configured in schema, 
    // but Prisma needs explicit handling or DB-level cascade)
    // In our schema we didn't specify onDelete: Cascade, so we do it manually or update schema.
    
    await prisma.$transaction([
      prisma.familyMember.deleteMany({ where: { memberId: params.id } }),
      prisma.member.delete({ where: { id: params.id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
