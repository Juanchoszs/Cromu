import { NextRequest, NextResponse } from 'next/server';
import { 
  agregarPrestamo, 
  obtenerPrestamos, 
  obtenerPrestamoPorId,
  actualizarPrestamo,
  eliminarPrestamo
} from '@/lib/api/prestamos';

/**
 * Maneja solicitudes GET para obtener préstamos
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // Si se proporciona un ID, devolver solo ese préstamo
    if (id) {
      const prestamo = await obtenerPrestamoPorId(id);
      
      if (!prestamo) {
        return NextResponse.json(
          { error: `No se encontró préstamo con ID ${id}` }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(prestamo);
    }
    
    // Si no se proporciona ID, devolver todos los préstamos
    const prestamos = await obtenerPrestamos();
    return NextResponse.json(prestamos);
  } catch (error: any) {
    console.error('Error al obtener préstamos:', error);
    return NextResponse.json(
      { error: 'Error al obtener préstamos', detalles: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Maneja solicitudes POST para crear un nuevo préstamo
 */
export async function POST(request: NextRequest) {
  try {
    // Validar datos de entrada
    const datos = await request.json();
    
    // Verificar campos obligatorios
    const camposRequeridos = ['nombreDeudor', 'cedula', 'monto', 'plazoMeses', 'tasaInteres', 'fechaDesembolso'];
    const camposFaltantes = camposRequeridos.filter(campo => !datos[campo]);
    
    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` }, 
        { status: 400 }
      );
    }
    
    // Crear el préstamo
    const nuevoPrestamo = await agregarPrestamo(datos);
    
    return NextResponse.json(nuevoPrestamo, { status: 201 });
  } catch (error: any) {
    console.error('Error al guardar el préstamo:', error);
    
    return NextResponse.json(
      { error: 'Error al guardar el préstamo', detalles: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Maneja solicitudes PUT para actualizar un préstamo existente
 */
export async function PUT(request: NextRequest) {
  try {
    const datos = await request.json();
    
    // Verificar que se proporcione un ID
    if (!datos.id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para actualizar el préstamo' }, 
        { status: 400 }
      );
    }
    
    // Actualizar el préstamo
    const resultado = await actualizarPrestamo(datos.id, datos);
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error al actualizar el préstamo:', error);
    
    // Manejar errores específicos
    if (error.message.includes('No se encontró préstamo')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el préstamo', detalles: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Maneja solicitudes DELETE para eliminar un préstamo
 */
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
    
    const eliminado = await eliminarPrestamo(id);
    
    if (!eliminado) {
      return NextResponse.json(
        { error: `No se encontró préstamo con ID ${id}` }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar el préstamo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el préstamo', detalles: error.message }, 
      { status: 500 }
    );
  }
}