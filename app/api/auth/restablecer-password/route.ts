import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, nuevaPassword } = await request.json();

    if (!token || !nuevaPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar el token
    const payload = verifyToken(token);
    if (!payload || payload.tipo !== 'recuperacion') {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar si el token existe y no ha expirado en la base de datos
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE id = ? AND token_recuperacion = ? AND token_expiracion > NOW()',
      [payload.id, token]
    );

    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

    // Actualizar la contraseña y limpiar el token
    await pool.query(
      'UPDATE usuarios SET password = ?, token_recuperacion = NULL, token_expiracion = NULL WHERE id = ?',
      [hashedPassword, payload.id]
    );

    return NextResponse.json({ 
      mensaje: 'Contraseña actualizada exitosamente' 
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 