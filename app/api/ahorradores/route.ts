import { NextRequest, NextResponse } from 'next/server';
import { agregarAhorrador, obtenerAhorradores, obtenerAhorradorPorId, actualizarAhorrador, eliminarAhorrador } from '@/lib/api/ahorradores';

// GET - Obtener todos los ahorradores o uno específico por ID
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Obtener un ahorrador específico
      const ahorrador = await obtenerAhorradorPorId(id);
      
      if (!ahorrador) {
        return NextResponse.json(
          { error: 'Ahorrador no encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(ahorrador);
    } else {
      // Obtener todos los ahorradores
      const ahorradores = await obtenerAhorradores();
      return NextResponse.json(ahorradores);
    }
  } catch (error: any) {
    console.error('Error en GET /api/ahorradores:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener ahorradores' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo ahorrador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obligatorios
    const camposRequeridos = [
      'nombre', 'cedula', 'telefono', 'direccion', 'email', 'fechaIngreso'
    ];
    
    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `El campo ${campo} es obligatorio` },
          { status: 400 }
        );
      }
    }
    
    // Crear el ahorrador
    const resultado = await agregarAhorrador(body);
    
    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/ahorradores:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el ahorrador' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un ahorrador existente
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para actualizar el ahorrador' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Verificar que el ahorrador existe
    const ahorradorExistente = await obtenerAhorradorPorId(id);
    
    if (!ahorradorExistente) {
      return NextResponse.json(
        { error: 'Ahorrador no encontrado' },
        { status: 404 }
      );
    }
    
    // Actualizar el ahorrador
    const resultado = await actualizarAhorrador(id, body);
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error en PUT /api/ahorradores:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el ahorrador' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un ahorrador
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
    
    // Verificar que el ahorrador existe
    const ahorradorExistente = await obtenerAhorradorPorId(id);
    
    if (!ahorradorExistente) {
      return NextResponse.json(
        { error: 'Ahorrador no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el ahorrador
    await eliminarAhorrador(id);
    
    return NextResponse.json({ message: 'Ahorrador eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error en DELETE /api/ahorradores:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el ahorrador' },
      { status: 500 }
    );
  }
}