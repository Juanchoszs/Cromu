import pool from '../db'; 
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
  ahorroTotal?: number;
  pagosConsecutivos?: number;
  historialPagos?: Record<string, { pagado: boolean; monto: number }>;
  incentivoPorFidelidad?: boolean;
  creado_en?: Date;
  actualizado_en?: Date;
}

/**
 * Agrega un nuevo ahorrador a la base de datos
 * @param datos Datos del ahorrador a agregar
 * @returns Objeto con el ID del ahorrador creado
 */
export async function agregarAhorrador(datos: {
  nombre: string;
  cedula: string;
  fechaIngreso: string;
  telefono: string;
  direccion: string;
  email: string;
}): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    // Iniciar transacción
    await client.query('BEGIN');
    
    const id = uuidv4();
    const ahorroTotal = 0;
    const pagosConsecutivos = 0;
    const historialPagos = JSON.stringify({});
    const incentivoPorFidelidad = true;

    const query = `
      INSERT INTO ahorradores (
        id, nombre, cedula, fecha_ingreso, telefono, direccion,
        email, ahorro_total, pagos_consecutivos, historial_pagos, incentivo_por_fidelidad
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
      ahorroTotal,
      pagosConsecutivos,
      historialPagos,
      incentivoPorFidelidad,
    ];

    const result = await client.query(query, values);
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error('Error al agregar ahorrador:', error);
    throw error;
  } finally {
    // Liberar el cliente
    client.release();
  }
}

/**
 * Obtiene todos los ahorradores de la base de datos
 * @returns Array con todos los ahorradores
 */
export async function obtenerAhorradores(): Promise<AhorradorData[]> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre, cedula, fecha_ingreso AS "fechaIngreso", 
        telefono, direccion, email, ahorro_total AS "ahorroTotal", 
        pagos_consecutivos AS "pagosConsecutivos", 
        historial_pagos AS "historialPagos", 
        incentivo_por_fidelidad AS "incentivoPorFidelidad",
        creado_en AS "creado_en",
        actualizado_en AS "actualizado_en"
      FROM ahorradores
      ORDER BY nombre
    `;
    
    const result = await client.query(query);
    
    // Transformar los datos para que coincidan con la estructura esperada por el frontend
    return result.rows.map((row: any) => ({
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
 * Obtiene un ahorrador específico por su ID
 * @param id ID del ahorrador a buscar
 * @returns Datos del ahorrador o null si no existe
 */
export async function obtenerAhorradorPorId(id: string): Promise<AhorradorData | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre, cedula, fecha_ingreso AS "fechaIngreso", 
        telefono, direccion, email, ahorro_total AS "ahorroTotal", 
        pagos_consecutivos AS "pagosConsecutivos", 
        historial_pagos AS "historialPagos", 
        incentivo_por_fidelidad AS "incentivoPorFidelidad",
        creado_en AS "creado_en",
        actualizado_en AS "actualizado_en"
      FROM ahorradores
      WHERE id = $1
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const ahorrador = result.rows[0];
    
    // Convertir historialPagos de string JSON a objeto
    return {
      ...ahorrador,
      historialPagos: typeof ahorrador.historialPagos === 'string' 
        ? JSON.parse(ahorrador.historialPagos) 
        : ahorrador.historialPagos
    };
  } catch (error) {
    console.error(`Error al obtener ahorrador con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtiene un ahorrador por su número de cédula
 * @param cedula Cédula del ahorrador a buscar
 * @returns Datos del ahorrador o null si no existe
 */
export async function obtenerAhorradorPorCedula(cedula: string): Promise<AhorradorData | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id, nombre, cedula, fecha_ingreso AS "fechaIngreso", 
        telefono, direccion, email, ahorro_total AS "ahorroTotal", 
        pagos_consecutivos AS "pagosConsecutivos", 
        historial_pagos AS "historialPagos", 
        incentivo_por_fidelidad AS "incentivoPorFidelidad",
        creado_en AS "creado_en",
        actualizado_en AS "actualizado_en"
      FROM ahorradores
      WHERE cedula = $1
    `;
    
    const result = await client.query(query, [cedula]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const ahorrador = result.rows[0];
    
    // Convertir historialPagos de string JSON a objeto
    return {
      ...ahorrador,
      historialPagos: typeof ahorrador.historialPagos === 'string' 
        ? JSON.parse(ahorrador.historialPagos) 
        : ahorrador.historialPagos
    };
  } catch (error) {
    console.error(`Error al obtener ahorrador con cédula ${cedula}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Actualiza los datos de un ahorrador existente
 * @param id ID del ahorrador a actualizar
 * @param datos Datos actualizados del ahorrador
 * @returns Objeto con el ID del ahorrador actualizado
 */
export async function actualizarAhorrador(id: string, datos: Partial<AhorradorData>): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Construir dinámicamente la consulta de actualización
    let setClause = '';
    const values: any[] = [];
    let paramIndex = 1;
    
    // Mapeo de nombres de propiedades a nombres de columnas
    const columnMapping: Record<string, string> = {
      nombre: 'nombre',
      cedula: 'cedula',
      fechaIngreso: 'fecha_ingreso',
      telefono: 'telefono',
      direccion: 'direccion',
      email: 'email',
      ahorroTotal: 'ahorro_total',
      pagosConsecutivos: 'pagos_consecutivos',
      historialPagos: 'historial_pagos',
      incentivoPorFidelidad: 'incentivo_por_fidelidad'
    };
    
    // Construir la cláusula SET y los valores
    for (const [key, value] of Object.entries(datos)) {
      if (key in columnMapping && value !== undefined) {
        if (setClause) setClause += ', ';
        
        // Manejar el historialPagos como JSON
        if (key === 'historialPagos') {
          setClause += `${columnMapping[key]} = $${paramIndex}`;
          values.push(JSON.stringify(value));
        } else {
          setClause += `${columnMapping[key]} = $${paramIndex}`;
          values.push(value);
        }
        
        paramIndex++;
      }
    }
    
    // Agregar actualización de timestamp
    setClause += `, actualizado_en = NOW()`;
    
    // Agregar el ID como último parámetro
    values.push(id);
    
    const query = `
      UPDATE ahorradores
      SET ${setClause}
      WHERE id = $${paramIndex}
      RETURNING id
    `;
    
    const result = await client.query(query, values);
    
    if (result.rowCount === 0) {
      throw new Error(`No se encontró ahorrador con ID ${id}`);
    }
    
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al actualizar ahorrador con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Elimina un ahorrador de la base de datos
 * @param id ID del ahorrador a eliminar
 * @returns true si se eliminó correctamente, false si no se encontró
 */
export async function eliminarAhorrador(id: string): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const query = `
      DELETE FROM ahorradores
      WHERE id = $1
    `;
    
    const result = await client.query(query, [id]);
    
    await client.query('COMMIT');
    
    // Verificamos si result existe antes de acceder a rowCount
    return result && result.rowCount ? result.rowCount > 0 : false;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al eliminar ahorrador con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Actualiza el historial de pagos de un ahorrador
 * @param id ID del ahorrador
 * @param historialPagos Nuevo historial de pagos
 * @returns Objeto con el ID del ahorrador actualizado
 */
export async function actualizarHistorialPagos(
  id: string, 
  historialPagos: Record<string, { pagado: boolean; monto: number }>,
  ahorroTotal: number,
  pagosConsecutivos: number,
  incentivoPorFidelidad: boolean
): Promise<{ id: string }> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const query = `
      UPDATE ahorradores
      SET 
        historial_pagos = $1,
        ahorro_total = $2,
        pagos_consecutivos = $3,
        incentivo_por_fidelidad = $4,
        actualizado_en = NOW()
      WHERE id = $5
      RETURNING id
    `;
    
    const values = [
      JSON.stringify(historialPagos),
      ahorroTotal,
      pagosConsecutivos,
      incentivoPorFidelidad,
      id
    ];
    
    const result = await client.query(query, values);
    
    if (result.rowCount === 0) {
      throw new Error(`No se encontró ahorrador con ID ${id}`);
    }
    
    await client.query('COMMIT');
    
    return { id: result.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al actualizar historial de pagos del ahorrador con ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}