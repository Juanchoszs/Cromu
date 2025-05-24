import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Interfaz para los datos del ahorrador
export interface AhorradorData {
  id?: string;
  nombre: string;
  cedula: string;
  fechaIngreso: string;
  telefono: string;
  direccion: string;
  email: string;
  ahorroTotal: number;
  pagosConsecutivos: number;
  historialPagos: Record<string, { pagado: boolean; monto: number }>;
  incentivoPorFidelidad: boolean;
  creado_en?: Date;
  actualizado_en?: Date;
}

/**
 * Agrega un nuevo ahorrador a la base de datos
 */
export async function agregarAhorrador(datos: AhorradorData): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const id = uuidv4();
    const historialPagos = JSON.stringify(datos.historialPagos || {});

    const query = `
      INSERT INTO ahorradores (
        id, nombre, cedula, fecha_ingreso, telefono, direccion, email,
        ahorro_total, pagos_consecutivos, historial_pagos, incentivo_por_fidelidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const values = [
      id,
      datos.nombre,
      datos.cedula,
      datos.fechaIngreso,
      datos.telefono,
      datos.direccion,
      datos.email,
      datos.ahorroTotal ?? 0,
      datos.pagosConsecutivos ?? 0,
      historialPagos,
      datos.incentivoPorFidelidad ?? true
    ];

    const result = await client.query(query, values);
    
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al agregar ahorrador:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtiene todos los ahorradores de la base de datos
 */
export async function obtenerAhorradores(): Promise<AhorradorData[]> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre, cedula, fecha_ingreso AS "fechaIngreso", telefono, direccion, email,
        ahorro_total AS "ahorroTotal", pagos_consecutivos AS "pagosConsecutivos", 
        historial_pagos AS "historialPagos", incentivo_por_fidelidad AS "incentivoPorFidelidad",
        creado_en AS "creado_en", actualizado_en AS "actualizado_en"
      FROM ahorradores
      ORDER BY creado_en DESC
    `;
    
    const result = await client.query(query);
    
    return result.rows.map(row => ({
      ...row,
      historialPagos: typeof row.historialPagos === 'string' 
        ? JSON.parse(row.historialPagos) 
        : row.historialPagos
    }));
  } catch (error) {
    console.error('Error al obtener ahorradores:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtiene un ahorrador por ID
 */
export async function obtenerAhorradorPorId(id: string): Promise<AhorradorData | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre, cedula, fecha_ingreso AS "fechaIngreso", telefono, direccion, email,
        ahorro_total AS "ahorroTotal", pagos_consecutivos AS "pagosConsecutivos", 
        historial_pagos AS "historialPagos", incentivo_por_fidelidad AS "incentivoPorFidelidad",
        creado_en AS "creado_en", actualizado_en AS "actualizado_en"
      FROM ahorradores
      WHERE id = $1
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      historialPagos: typeof row.historialPagos === 'string' 
        ? JSON.parse(row.historialPagos) 
        : row.historialPagos
    };
  } catch (error) {
    console.error('Error al obtener ahorrador por ID:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtiene un ahorrador por cédula
 */
export async function obtenerAhorradorPorCedula(cedula: string): Promise<AhorradorData | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre, cedula, fecha_ingreso AS "fechaIngreso", telefono, direccion, email,
        ahorro_total AS "ahorroTotal", pagos_consecutivos AS "pagosConsecutivos", 
        historial_pagos AS "historialPagos", incentivo_por_fidelidad AS "incentivoPorFidelidad",
        creado_en AS "creado_en", actualizado_en AS "actualizado_en"
      FROM ahorradores
      WHERE cedula = $1
    `;
    
    const result = await client.query(query, [cedula]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      historialPagos: typeof row.historialPagos === 'string' 
        ? JSON.parse(row.historialPagos) 
        : row.historialPagos
    };
  } catch (error) {
    console.error('Error al obtener ahorrador por cédula:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Actualiza un ahorrador existente
 */
export async function actualizarAhorrador(id: string, datos: Partial<AhorradorData>): Promise<AhorradorData> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const historialPagos = datos.historialPagos ? JSON.stringify(datos.historialPagos) : undefined;
    
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    if (datos.nombre !== undefined) {
      setClauses.push(`nombre = $${paramIndex++}`);
      values.push(datos.nombre);
    }
    if (datos.telefono !== undefined) {
      setClauses.push(`telefono = $${paramIndex++}`);
      values.push(datos.telefono);
    }
    if (datos.direccion !== undefined) {
      setClauses.push(`direccion = $${paramIndex++}`);
      values.push(datos.direccion);
    }
    if (datos.email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(datos.email);
    }
    if (datos.ahorroTotal !== undefined) {
      setClauses.push(`ahorro_total = $${paramIndex++}`);
      values.push(datos.ahorroTotal);
    }
    if (datos.pagosConsecutivos !== undefined) {
      setClauses.push(`pagos_consecutivos = $${paramIndex++}`);
      values.push(datos.pagosConsecutivos);
    }
    if (historialPagos !== undefined) {
      setClauses.push(`historial_pagos = $${paramIndex++}`);
      values.push(historialPagos);
    }
    if (datos.incentivoPorFidelidad !== undefined) {
      setClauses.push(`incentivo_por_fidelidad = $${paramIndex++}`);
      values.push(datos.incentivoPorFidelidad);
    }
    
    setClauses.push(`actualizado_en = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE ahorradores 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, nombre, cedula, fecha_ingreso AS "fechaIngreso", telefono, direccion, email,
        ahorro_total AS "ahorroTotal", pagos_consecutivos AS "pagosConsecutivos", 
        historial_pagos AS "historialPagos", incentivo_por_fidelidad AS "incentivoPorFidelidad",
        creado_en AS "creado_en", actualizado_en AS "actualizado_en"
    `;
    
    const result = await client.query(query, values);
    
    await client.query('COMMIT');
    
    const row = result.rows[0];
    return {
      ...row,
      historialPagos: typeof row.historialPagos === 'string' 
        ? JSON.parse(row.historialPagos) 
        : row.historialPagos
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar ahorrador:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Elimina un ahorrador de la base de datos
 */
export async function eliminarAhorrador(id: string): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const query = 'DELETE FROM ahorradores WHERE id = $1';
    await client.query(query, [id]);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar ahorrador:', error);
    throw error;
  } finally {
    client.release();
  }
}