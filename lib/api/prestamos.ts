import pool from './db';
import { v4 as uuidv4 } from 'uuid';

// Interfaz para los datos del préstamo
export interface PrestamoData {
  id?: string;
  nombreDeudor: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  monto: number;
  plazoMeses: number;
  tasaInteres: number;
  fechaDesembolso: string;
  fechaVencimiento?: string;
  estado: string;
  garantia?: string;
  historialPagos?: Record<string, any[]>;
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
    
    // Insertar el préstamo
    const query = `
      INSERT INTO prestamos (
        nombre_deudor, cedula, telefono, direccion, monto, 
        plazo_meses, tasa_interes, fecha_desembolso, fecha_vencimiento, 
        estado, garantia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const values = [
      datos.nombreDeudor,
      datos.cedula,
      datos.telefono || '',
      datos.direccion || '',
      datos.monto,
      datos.plazoMeses,
      datos.tasaInteres,
      datos.fechaDesembolso,
      datos.fechaVencimiento || null,
      datos.estado || 'Activo',
      datos.garantia || '',
    ];

    const result = await client.query(query, values);
    const prestamoId = result.rows[0].id;
    
    // Insertar historial de pagos si existe
    if (datos.historialPagos && Object.keys(datos.historialPagos).length > 0) {
      for (const [numeroCuota, pagos] of Object.entries(datos.historialPagos)) {
        for (const pago of pagos) {
          await client.query(
            `INSERT INTO pagos_prestamos (
              prestamo_id, numero_cuota, fecha, monto, tipo, comprobante
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              prestamoId, numeroCuota, pago.fecha, pago.monto, 
              pago.tipo, pago.comprobante || null
            ]
          );
        }
      }
    }
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    return { id: prestamoId };
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
      SELECT p.*, 
        json_agg(
          json_build_object(
            'numero_cuota', pp.numero_cuota,
            'fecha', pp.fecha,
            'monto', pp.monto,
            'tipo', pp.tipo,
            'comprobante', pp.comprobante
          )
        ) FILTER (WHERE pp.id IS NOT NULL) as historial_pagos
      FROM prestamos p
      LEFT JOIN pagos_prestamos pp ON p.id = pp.prestamo_id
      GROUP BY p.id
      ORDER BY p.fecha_desembolso DESC
    `;
    
    const result = await client.query(query);
    
    // Formatear los datos para que coincidan con la estructura esperada por el frontend
    return result.rows.map(row => {
      // Convertir historial_pagos de array a objeto agrupado por número de cuota
      const historialPagos: Record<string, any[]> = {};
      
      if (row.historial_pagos) {
        row.historial_pagos.forEach((pago: any) => {
          if (!historialPagos[pago.numero_cuota]) {
            historialPagos[pago.numero_cuota] = [];
          }
          historialPagos[pago.numero_cuota].push({
            fecha: pago.fecha,
            monto: pago.monto,
            tipo: pago.tipo,
            comprobante: pago.comprobante
          });
        });
      }
      
      return {
        id: row.id.toString(),
        nombreDeudor: row.nombre_deudor,
        cedula: row.cedula,
        telefono: row.telefono || "",
        direccion: row.direccion || "",
        monto: parseFloat(row.monto),
        plazoMeses: row.plazo_meses,
        tasaInteres: parseFloat(row.tasa_interes),
        fechaDesembolso: row.fecha_desembolso.toISOString().split('T')[0],
        fechaVencimiento: row.fecha_vencimiento ? row.fecha_vencimiento.toISOString().split('T')[0] : undefined,
        estado: row.estado,
        garantia: row.garantia || "",
        historialPagos: historialPagos
      };
    });
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
      SELECT p.*, 
        json_agg(
          json_build_object(
            'numero_cuota', pp.numero_cuota,
            'fecha', pp.fecha,
            'monto', pp.monto,
            'tipo', pp.tipo,
            'comprobante', pp.comprobante
          )
        ) FILTER (WHERE pp.id IS NOT NULL) as historial_pagos
      FROM prestamos p
      LEFT JOIN pagos_prestamos pp ON p.id = pp.prestamo_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    // Convertir historial_pagos de array a objeto agrupado por número de cuota
    const historialPagos: Record<string, any[]> = {};
    
    if (row.historial_pagos) {
      row.historial_pagos.forEach((pago: any) => {
        if (!historialPagos[pago.numero_cuota]) {
          historialPagos[pago.numero_cuota] = [];
        }
        historialPagos[pago.numero_cuota].push({
          fecha: pago.fecha,
          monto: pago.monto,
          tipo: pago.tipo,
          comprobante: pago.comprobante
        });
      });
    }
    
    return {
      id: row.id.toString(),
      nombreDeudor: row.nombre_deudor,
      cedula: row.cedula,
      telefono: row.telefono || "",
      direccion: row.direccion || "",
      monto: parseFloat(row.monto),
      plazoMeses: row.plazo_meses,
      tasaInteres: parseFloat(row.tasa_interes),
      fechaDesembolso: row.fecha_desembolso.toISOString().split('T')[0],
      fechaVencimiento: row.fecha_vencimiento ? row.fecha_vencimiento.toISOString().split('T')[0] : undefined,
      estado: row.estado,
      garantia: row.garantia || "",
      historialPagos: historialPagos
    };
  } catch (error) {
    console.error(`Error al obtener préstamo con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Actualiza un préstamo existente
 * @param id ID del préstamo a actualizar
 * @param datos Nuevos datos del préstamo
 * @returns Objeto con el ID del préstamo actualizado
 */
export async function actualizarPrestamo(id: string, datos: Partial<PrestamoData>): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verificar que el préstamo existe
    const checkQuery = 'SELECT id FROM prestamos WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new Error(`No se encontró préstamo con ID ${id}`);
    }
    
    // Construir la consulta de actualización dinámicamente
    let updateFields = [];
    let values = [];
    let paramIndex = 1;
    
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
      values.push(datos.monto);
    }
    
    if (datos.plazoMeses !== undefined) {
      updateFields.push(`plazo_meses = $${paramIndex++}`);
      values.push(datos.plazoMeses);
    }
    
    if (datos.tasaInteres !== undefined) {
      updateFields.push(`tasa_interes = $${paramIndex++}`);
      values.push(datos.tasaInteres);
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
    
    // Siempre actualizar la fecha de actualización
    updateFields.push(`actualizado_en = NOW()`);
    
    // Si no hay campos para actualizar, retornar
    if (updateFields.length === 0) {
      await client.query('ROLLBACK');
      return { id };
    }
    
    // Construir y ejecutar la consulta de actualización
    const updateQuery = `
      UPDATE prestamos
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id
    `;
    
    values.push(id);
    const result = await client.query(updateQuery, values);
    
    // Actualizar historial de pagos si se proporciona
    if (datos.historialPagos && Object.keys(datos.historialPagos).length > 0) {
      // Primero eliminar los pagos existentes
      await client.query('DELETE FROM pagos_prestamos WHERE prestamo_id = $1', [id]);
      
      // Luego insertar los nuevos pagos
      for (const [numeroCuota, pagos] of Object.entries(datos.historialPagos)) {
        for (const pago of pagos) {
          await client.query(
            `INSERT INTO pagos_prestamos (
              prestamo_id, numero_cuota, fecha, monto, tipo, comprobante
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id, numeroCuota, pago.fecha, pago.monto, 
              pago.tipo, pago.comprobante || null
            ]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al actualizar préstamo con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Elimina un préstamo de la base de datos
 * @param id ID del préstamo a eliminar
 * @returns true si se eliminó correctamente, false si no se encontró
 */
export async function eliminarPrestamo(id: string): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Primero eliminar los pagos asociados
    await client.query('DELETE FROM pagos_prestamos WHERE prestamo_id = $1', [id]);
    
    // Luego eliminar el préstamo
    const result = await client.query('DELETE FROM prestamos WHERE id = $1 RETURNING id', [id]);
    
    await client.query('COMMIT');
    
    return result.rowCount ? result.rowCount > 0 : false;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al eliminar préstamo con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}