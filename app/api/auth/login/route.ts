import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    await createSession(user.id, user.role.name);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
