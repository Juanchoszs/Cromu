import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarToken, extraerTokenDeHeader } from '@/lib/jwt';

// Headers de seguridad
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.cromu.com;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    object-src 'none';
    upgrade-insecure-requests;
    block-all-mixed-content;
    require-trusted-types-for 'script';
  `.replace(/\s+/g, ' ').trim()
};

// Rutas que requieren autenticación
const rutasProtegidas = [
  '/usuario',
  '/admin',
  '/api/ahorradores',
  '/api/prestamos'
];

// Rutas que requieren ser admin
const rutasAdmin = [
  '/admin',
  '/api/ahorradores',
  '/api/prestamos'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aplicar headers de seguridad a todas las rutas
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Verificar si la ruta requiere autenticación
  const requiereAuth = rutasProtegidas.some(ruta => pathname.startsWith(ruta));
  const requiereAdmin = rutasAdmin.some(ruta => pathname.startsWith(ruta));

  if (requiereAuth) {
    try {
      const token = extraerTokenDeHeader(request.headers.get('authorization'));
      const payload = verificarToken(token);

      // Si la ruta requiere ser admin, verificar el rol
      if (requiereAdmin && !payload.isAdmin) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }

      // Agregar el payload del token a los headers para uso posterior
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId.toString());
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-is-admin', payload.isAdmin.toString());

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/usuario/:path*',
    '/admin/:path*',
    '/api/ahorradores/:path*',
    '/api/prestamos/:path*'
  ],
}; 