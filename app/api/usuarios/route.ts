import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, roleId } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        isActive: true,
      },
      include: {
        role: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
