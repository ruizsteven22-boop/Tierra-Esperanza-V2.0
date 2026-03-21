import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = body.username?.trim();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    console.log('Login attempt for:', username);
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      },
      include: { role: true },
    });

    console.log('User found:', !!user);

    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 });
    }

    console.log('User isActive:', user.isActive);
    if (!user.isActive) {
      console.log('User inactive:', username);
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 401 });
    }

    console.log('Comparing password for user:', user.id);
    const isValid = await comparePassword(password, user.passwordHash);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    console.log('Creating session for:', user.id);
    await createSession(user.id, user.role.name);

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        photoUrl: user.photoUrl
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error desconocido' }, { status: 500 });
  }
}
