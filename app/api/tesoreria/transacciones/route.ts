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
    const { type, categoryId, amount, description, paymentMethod, memberId, generateReceipt } = body;

    if (!type || !categoryId || !amount || !description) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Create transaction within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.treasuryTransaction.create({
        data: {
          type,
          categoryId,
          amount,
          description,
          paymentMethod,
          memberId: memberId || null,
          userId: session.userId,
        }
      });

      if (generateReceipt) {
        // Get last receipt number
        const lastReceipt = await tx.treasuryReceipt.findFirst({
          orderBy: { number: 'desc' }
        });
        const nextNumber = (lastReceipt?.number || 0) + 1;

        await tx.treasuryReceipt.create({
          data: {
            transactionId: transaction.id,
            memberId: memberId || null,
            number: nextNumber,
            amount,
            details: description,
          }
        });
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
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
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const memberId = searchParams.get('memberId');

    const transactions = await prisma.treasuryTransaction.findMany({
      where: {
        AND: [
          type ? { type } : {},
          categoryId ? { categoryId } : {},
          memberId ? { memberId } : {},
        ]
      },
      include: {
        member: true,
        category: true,
        receipt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
