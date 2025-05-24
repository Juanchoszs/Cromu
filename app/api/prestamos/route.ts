import { NextRequest, NextResponse } from 'next/server';
import { agregarPrestamo, obtenerPrestamos, obtenerPrestamoPorId, actualizarPrestamo, eliminarPrestamo, obtenerPrestamosPorCedula } from '@/lib/api/prestamos';

// GET - Obtener todos los préstamos, uno específico por ID, o por cédula
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const cedula = url.searchParams.get('cedula');
    
    if (id) {
      // Obtener un préstamo específico
      const prestamo = await obtenerPrestamoPorId(id);
      
      if (!prestamo) {
        return NextResponse.json(
          { error: 'Préstamo no encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(prestamo);
    } else if (cedula) {
      // Obtener préstamos por cédula
      const prestamos = await obtenerPrestamosPorCedula(cedula);
      return NextResponse.json(prestamos);
    } else {
      // Obtener todos los préstamos
      const prestamos = await obtenerPrestamos();
      return NextResponse.json(prestamos);
    }
  } catch (error: any) {
    console.error('Error en GET /api/prestamos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener préstamos' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo préstamo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obligatorios
    const camposRequeridos = [
      'nombreDeudor', 'cedula', 'telefono', 'direccion',
      'monto', 'plazoMeses', 'tasaInteres', 'fechaDesembolso', 'estado'
    ];
    
    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `El campo ${campo} es obligatorio` },
          { status: 400 }
        );
      }
    }
    
    // Crear el préstamo
    const resultado = await agregarPrestamo(body);
    
    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/prestamos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el préstamo' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un préstamo existente
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para actualizar el préstamo' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Verificar que el préstamo existe
    const prestamoExistente = await obtenerPrestamoPorId(id);
    
    if (!prestamoExistente) {
      return NextResponse.json(
        { error: 'Préstamo no encontrado' },
        { status: 404 }
      );
    }
    
    // Actualizar el préstamo
    const resultado = await actualizarPrestamo(id, body);
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error en PUT /api/prestamos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el préstamo' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un préstamo
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para eliminar el préstamo' },
        { status: 400 }
      );
    }
    
    // Verificar que el préstamo existe
    const prestamoExistente = await obtenerPrestamoPorId(id);
    
    if (!prestamoExistente) {
      return NextResponse.json(
        { error: 'Préstamo no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el préstamo
    const resultado = await eliminarPrestamo(id);
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error en DELETE /api/prestamos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el préstamo' },
      { status: 500 }
    );
  }
}