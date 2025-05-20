import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

// Interfaz para los datos del préstamo
export interface PrestamoData {
  id?: string;
  nombreDeudor: string;
  cedula: string;
  telefono: string;
  direccion: string;
  monto: number;
  plazoMeses: number;
  tasaInteres: number;
  fechaDesembolso: string;
  fechaVencimiento?: string;
  estado: 'Activo' | 'Pagado' | 'Vencido' | 'Refinanciado';
  garantia?: string;
  historialPagos?: Record<string, {
    fecha: string;
    monto: number;
    tipo: 'Capital' | 'Interés' | 'Mixto';
    comprobante?: string;
  }[]>;
  creado_en?: Date;
  actualizado_en?: Date;
}

/**
 * Agrega un nuevo préstamo a la base de datos
 * @param datos Datos del préstamo a agregar
 * @returns Objeto con el ID del préstamo creado
 */
export async function agregarPrestamo(datos: PrestamoData): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    // Iniciar transacción
    await client.query('BEGIN');
    
    const id = uuidv4();
    const historialPagos = JSON.stringify(datos.historialPagos || {});

    const query = `
      INSERT INTO prestamos (
        id, nombre_deudor, cedula, telefono, direccion,
        monto, plazo_meses, tasa_interes, fecha_desembolso, 
        fecha_vencimiento, estado, garantia, historial_pagos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;

    const values = [
      id,
      datos.nombreDeudor,
      datos.cedula,
      datos.telefono,
      datos.direccion,
      datos.monto,
      datos.plazoMeses,
      datos.tasaInteres,
      datos.fechaDesembolso,
      datos.fechaVencimiento,
      datos.estado,
      datos.garantia || '',
      historialPagos
    ];

    const result = await client.query(query, values);
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error('Error al agregar préstamo:', error);
    throw error;
  } finally {
    // Liberar el cliente
    client.release();
  }
}

/**
 * Obtiene todos los préstamos de la base de datos
 * @returns Array con todos los préstamos
 */
export async function obtenerPrestamos(): Promise<PrestamoData[]> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre_deudor AS "nombreDeudor", cedula, telefono, direccion,
        monto, plazo_meses AS "plazoMeses", tasa_interes AS "tasaInteres", 
        fecha_desembolso AS "fechaDesembolso", fecha_vencimiento AS "fechaVencimiento", 
        estado, garantia, historial_pagos AS "historialPagos",
        creado_en AS "creado_en", actualizado_en AS "actualizado_en"
      FROM prestamos
      ORDER BY fecha_desembolso DESC
    `;
    
    const result = await client.query(query);
    
    // Transformar los datos para que coincidan con la estructura esperada por el frontend
    return result.rows.map(row => ({
      ...row,
      historialPagos: typeof row.historialPagos === 'string' 
        ? JSON.parse(row.historialPagos) 
        : row.historialPagos
    }));
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtiene un préstamo específico por su ID
 * @param id ID del préstamo a buscar
 * @returns Datos del préstamo o null si no existe
 */
export async function obtenerPrestamoPorId(id: string): Promise<PrestamoData | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre_deudor AS "nombreDeudor", cedula, telefono, direccion,
        monto, plazo_meses AS "plazoMeses", tasa_interes AS "tasaInteres", 
        fecha_desembolso AS "fechaDesembolso", fecha_vencimiento AS "fechaVencimiento", 
        estado, garantia, historial_pagos AS "historialPagos",
        creado_en AS "creado_en", actualizado_en AS "actualizado_en"
      FROM prestamos
      WHERE id = $1
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const prestamo = result.rows[0];
    
    // Convertir historialPagos de string JSON a objeto
    return {
      ...prestamo,
      historialPagos: typeof prestamo.historialPagos === 'string' 
        ? JSON.parse(prestamo.historialPagos) 
        : prestamo.historialPagos
    };
  } catch (error) {
    console.error(`Error al obtener préstamo con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtiene préstamos por cédula del deudor
 * @param cedula Cédula del deudor a buscar
 * @returns Array con los préstamos encontrados
 */
export async function obtenerPrestamosPorCedula(cedula: string): Promise<PrestamoData[]> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre_deudor AS "nombreDeudor", cedula, telefono, direccion,
        monto, plazo_meses AS "plazoMeses", tasa_interes AS "tasaInteres", 
        fecha_desembolso AS "fechaDesembolso", fecha_vencimiento AS "fechaVencimiento", 
        estado, garantia, historial_pagos AS "historialPagos",
        creado_en AS "creado_en", actualizado_en AS "actualizado_en"
      FROM prestamos
      WHERE cedula = $1
      ORDER BY fecha_desembolso DESC
    `;
    
    const result = await client.query(query, [cedula]);
    
    // Transformar los datos para que coincidan con la estructura esperada por el frontend
    return result.rows.map(row => ({
      ...row,
      historialPagos: typeof row.historialPagos === 'string' 
        ? JSON.parse(row.historialPagos) 
        : row.historialPagos
    }));
  } catch (error) {
    console.error(`Error al obtener préstamos para cédula ${cedula}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Actualiza un préstamo existente
 * @param id ID del préstamo a actualizar
 * @param datos Datos actualizados del préstamo
 * @returns Objeto con el ID del préstamo actualizado
 */
export async function actualizarPrestamo(id: string, datos: Partial<PrestamoData>): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    // Iniciar transacción
    await client.query('BEGIN');
    
    // Preparar historialPagos para almacenamiento
    let historialPagosJSON = null;
    if (datos.historialPagos) {
      historialPagosJSON = JSON.stringify(datos.historialPagos);
    }
    
    // Construir la consulta dinámica basada en los campos proporcionados
    let updateFields = [];
    let values = [id];
    let paramIndex = 2;
    
    if (datos.nombreDeudor !== undefined) {
      updateFields.push(`nombre_deudor = $${paramIndex++}`);
      values.push(datos.nombreDeudor);
    }
    
    if (datos.cedula !== undefined) {
      updateFields.push(`cedula = $${paramIndex++}`);
      values.push(datos.cedula);
    }
    
    if (datos.telefono !== undefined) {
      updateFields.push(`telefono = $${paramIndex++}`);
      values.push(datos.telefono);
    }
    
    if (datos.direccion !== undefined) {
      updateFields.push(`direccion = $${paramIndex++}`);
      values.push(datos.direccion);
    }
    
    if (datos.monto !== undefined) {
      updateFields.push(`monto = $${paramIndex++}`);
      values.push(datos.monto.toString());
    }
    
    if (datos.plazoMeses !== undefined) {
      updateFields.push(`plazo_meses = $${paramIndex++}`);
      values.push(datos.plazoMeses.toString());
    }
    
    if (datos.tasaInteres !== undefined) {
      updateFields.push(`tasa_interes = $${paramIndex++}`);
      values.push(datos.tasaInteres.toString());
    }
    
    if (datos.fechaDesembolso !== undefined) {
      updateFields.push(`fecha_desembolso = $${paramIndex++}`);
      values.push(datos.fechaDesembolso);
    }
    
    if (datos.fechaVencimiento !== undefined) {
      updateFields.push(`fecha_vencimiento = $${paramIndex++}`);
      values.push(datos.fechaVencimiento);
    }
    
    if (datos.estado !== undefined) {
      updateFields.push(`estado = $${paramIndex++}`);
      values.push(datos.estado);
    }
    
    if (datos.garantia !== undefined) {
      updateFields.push(`garantia = $${paramIndex++}`);
      values.push(datos.garantia);
    }
    
    if (historialPagosJSON !== null) {
      updateFields.push(`historial_pagos = $${paramIndex++}`);
      values.push(historialPagosJSON);
    }
    
    // Si no hay campos para actualizar, retornar
    if (updateFields.length === 0) {
      return { id };
    }
    
    const query = `
      UPDATE prestamos
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await client.query(query, values);
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error(`Error al actualizar préstamo con ID ${id}:`, error);
    throw error;
  } finally {
    // Liberar el cliente
    client.release();
  }
}

/**
 * Elimina un préstamo de la base de datos
 * @param id ID del préstamo a eliminar
 * @returns Objeto con el ID del préstamo eliminado
 */
export async function eliminarPrestamo(id: string): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    // Iniciar transacción
    await client.query('BEGIN');
    
    const query = `
      DELETE FROM prestamos
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`No se encontró un préstamo con ID ${id}`);
    }
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error(`Error al eliminar préstamo con ID ${id}:`, error);
    throw error;
  } finally {
    // Liberar el cliente
    client.release();
  }
}