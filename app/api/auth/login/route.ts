import { NextResponse } from 'next/server';
import { verificarCredenciales } from '@/lib/auth';
import { generarToken } from '@/lib/jwt';
import { pool } from '@/lib/db';

// Almacenamiento en memoria para intentos de inicio de sesión
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos en milisegundos

export async function POST(request: Request) {
  try {
    const { cedula, password } = await request.json();

    if (!cedula || !password) {
      return NextResponse.json(
        { error: 'Cédula y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar intentos de inicio de sesión
    const now = Date.now();
    const attempts = loginAttempts.get(cedula) || { count: 0, lastAttempt: 0 };

    if (attempts.count >= MAX_ATTEMPTS) {
      const timeLeft = LOCKOUT_TIME - (now - attempts.lastAttempt);
      if (timeLeft > 0) {
        return NextResponse.json(
          { 
            error: `Demasiados intentos fallidos. Por favor, espere ${Math.ceil(timeLeft / 60000)} minutos.` 
          },
          { status: 429 }
        );
      }
      // Resetear intentos si ha pasado el tiempo de bloqueo
      attempts.count = 0;
    }

    const usuario = await verificarCredenciales(cedula, password);

    if (!usuario) {
      // Incrementar contador de intentos fallidos
      attempts.count += 1;
      attempts.lastAttempt = now;
      loginAttempts.set(cedula, attempts);

      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Resetear intentos al iniciar sesión exitosamente
    loginAttempts.delete(cedula);

    const token = generarToken({
      userId: usuario.id,
      email: usuario.email,
      isAdmin: usuario.is_admin
    });

    return NextResponse.json({
      token,
      isAdmin: usuario.is_admin,
      nombre: usuario.nombre
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 