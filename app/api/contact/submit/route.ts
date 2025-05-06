import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { sendContactNotification, sendClientConfirmation } from './email-utils';

// Configura la conexión a Neon Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para conexiones SSL de Neon
  }
});

export async function POST(request: Request) {
  let client = null;
  let insertedData = null;
  
  try {
    // Obtener datos del formulario
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      service, 
      documentType, 
      documentNumber, 
      message, 
      contactMethod, 
      contactTime 
    } = body;
    
    // Validaciones básicas
    if (!fullName || !email || !phone || !service || !documentType || !documentNumber || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' }, 
        { status: 400 }
      );
    }
    
    // Validación de email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del correo electrónico es inválido' }, 
        { status: 400 }
      );
    }

    // Obtener IP y User-Agent para seguridad
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Consulta SQL para insertar en la base de datos
    const query = `
      INSERT INTO contact_submissions (
        full_name, 
        email, 
        phone, 
        service, 
        document_type, 
        document_number, 
        message, 
        contact_method, 
        contact_time,
        ip_address,
        user_agent
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, created_at;
    `;
    
    const values = [
      fullName,
      email,
      phone,
      service,
      documentType,
      documentNumber,
      message,
      contactMethod,
      contactTime,
      ip,
      userAgent
    ];

    // Ejecutar la consulta
    client = await pool.connect();
    const result = await client.query(query, values);
    insertedData = result.rows[0];
    
    // Preparar datos para el envío de correo
    const formData = {  
      id: insertedData.id,
      fullName,
      email,
      phone,
      service,
      documentType,
      documentNumber,
      message,
      contactMethod,
      contactTime,
      created_at: insertedData.created_at
    };

    // Intentar enviar los correos
    try {
      // Enviar notificación al administrador
      await sendContactNotification(formData);
      
      // Opcional: Enviar confirmación al cliente
      await sendClientConfirmation(email, fullName);

      return NextResponse.json({ 
        success: true, 
        message: 'Formulario enviado correctamente',
        id: insertedData.id
      }, { status: 201 });
    } catch (emailError) {
      console.error('Error al enviar el correo:', emailError);
      // Si hay error al enviar el correo, pero los datos se guardaron en la BD,
      // devolvemos éxito pero con una advertencia
      return NextResponse.json({ 
        success: true, 
        message: 'Formulario guardado correctamente, pero hubo un problema al enviar la notificación por correo',
        id: insertedData.id,
        warning: 'Error de correo electrónico'
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  } finally {
    // Asegurarnos de liberar el cliente de la conexión
    if (client) client.release();
  }
}