// app/api/ahorradores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  agregarAhorrador, 
  obtenerAhorradores, 
  obtenerAhorradorPorId,
  actualizarAhorrador,
  eliminarAhorrador,
  actualizarHistorialPagos
} from '@/lib/api/ahorradores';

/**
 * Maneja solicitudes POST para crear un nuevo ahorrador
 */
export async function POST(request: NextRequest) {
  try {
    // Validar datos de entrada
    const datos = await request.json();
    
    // Verificar campos obligatorios
    const camposRequeridos = ['nombre', 'cedula', 'fechaIngreso', 'telefono', 'direccion', 'email'];
    const camposFaltantes = camposRequeridos.filter(campo => !datos[campo]);
    
    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` }, 
        { status: 400 }
      );
    }
    
    // Crear el ahorrador
    const nuevoAhorrador = await agregarAhorrador(datos);
    
    return NextResponse.json(nuevoAhorrador, { status: 201 });
  } catch (error: any) {
    console.error('Error al guardar el ahorrador:', error);
    
    // Manejar errores específicos
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un ahorrador con esa cédula' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al guardar el ahorrador', detalles: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Maneja solicitudes GET para obtener todos los ahorradores
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const cedula = url.searchParams.get('cedula');
    
    // Si se proporciona un ID, devolver solo ese ahorrador
    if (id) {
      const ahorrador = await obtenerAhorradorPorId(id);
      
      if (!ahorrador) {
        return NextResponse.json(
          { error: `No se encontró ahorrador con ID ${id}` }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(ahorrador);
    }
    
    // Si se proporciona una cédula, buscar por cédula
    if (cedula) {
      const ahorrador = await obtenerAhorradorPorId(cedula);
      
      if (!ahorrador) {
        return NextResponse.json(
          { error: `No se encontró ahorrador con cédula ${cedula}` }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(ahorrador);
    }
    
    // Si no se proporciona ID ni cédula, devolver todos los ahorradores
    const ahorradores = await obtenerAhorradores();
    return NextResponse.json(ahorradores);
  } catch (error: any) {
    console.error('Error al obtener ahorradores:', error);
    return NextResponse.json(
      { error: 'Error al obtener ahorradores', detalles: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Maneja solicitudes PUT para actualizar un ahorrador existente
 */
export async function PUT(request: NextRequest) {
  try {
    const datos = await request.json();
    
    // Verificar que se proporcione un ID
    if (!datos.id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para actualizar el ahorrador' }, 
        { status: 400 }
      );
    }
    
    // Actualizar el ahorrador
    const resultado = await actualizarAhorrador(datos.id, datos);
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error al actualizar el ahorrador:', error);
    
    // Manejar errores específicos
    if (error.message.includes('No se encontró ahorrador')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 404 }
      );
    }
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un ahorrador con esa cédula' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el ahorrador', detalles: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Maneja solicitudes DELETE para eliminar un ahorrador
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para eliminar el ahorrador' }, 
        { status: 400 }
      );
    }
    
    const eliminado = await eliminarAhorrador(id);
    
    if (!eliminado) {
      return NextResponse.json(
        { error: `No se encontró ahorrador con ID ${id}` }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar el ahorrador:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el ahorrador', detalles: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Endpoint específico para actualizar el historial de pagos
 * Se implementa como una ruta separada para mayor claridad
 */
export async function PATCH(request: NextRequest) {
  try {
    const datos = await request.json();
    
    // Verificar campos obligatorios
    if (!datos.id || !datos.historialPagos) {
      return NextResponse.json(
        { error: 'Se requiere ID y historialPagos para actualizar' }, 
        { status: 400 }
      );
    }
    
    // Actualizar el historial de pagos
    const resultado = await actualizarHistorialPagos(
      datos.id,
      datos.historialPagos,
      datos.ahorroTotal || 0,
      datos.pagosConsecutivos || 0,
      datos.incentivoPorFidelidad || false
    );
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error al actualizar el historial de pagos:', error);
    
    if (error.message.includes('No se encontró ahorrador')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el historial de pagos', detalles: error.message }, 
      { status: 500 }
    );
  }
}