import { NextRequest, NextResponse } from 'next/server';
import { obtenerAhorradorPorCedula } from '@/lib/api/ahorradores';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cedula = url.searchParams.get('cedula');
    
    if (!cedula) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro cedula' },
        { status: 400 }
      );
    }
    
    const ahorrador = await obtenerAhorradorPorCedula(cedula);
    
    if (!ahorrador) {
      return NextResponse.json(
        { error: 'Ahorrador no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(ahorrador);
  } catch (error: any) {
    console.error('Error en GET /api/ahorradores/buscar:', error);
    return NextResponse.json(
      { error: error.message || 'Error al buscar ahorrador' },
      { status: 500 }
    );
  }
}