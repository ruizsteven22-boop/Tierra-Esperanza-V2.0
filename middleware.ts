import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sigevivi-secret-key-change-this-in-prod'
);

const COOKIE_NAME = 'sigevivi-session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets and login page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Basic role-based path protection
    if (pathname.startsWith('/soporte') && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/configuracion') && !['superadmin', 'administrador'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/usuarios') && !['superadmin', 'administrador'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/tesoreria') && !['superadmin', 'administrador', 'tesoreria'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/secretaria') && !['superadmin', 'administrador', 'secretaria'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/directiva') && !['superadmin', 'administrador', 'directiva'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/socios') && !['superadmin', 'administrador', 'secretaria', 'directiva'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/asambleas') && !['superadmin', 'administrador', 'directiva', 'secretaria'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
