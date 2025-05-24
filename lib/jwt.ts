import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

export function generarToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

export function verificarToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

export function extraerTokenDeHeader(authHeader: string | undefined): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token no proporcionado');
  }
  return authHeader.split(' ')[1];
} 