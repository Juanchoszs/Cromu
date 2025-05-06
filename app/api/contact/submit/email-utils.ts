import nodemailer from 'nodemailer';

// Interfaces simplificadas
interface ContactFormData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  documentType: string;
  documentNumber: string;
  message: string;
  contactMethod: string;
  contactTime: string;
  created_at: string;
}

/**
 * Envía una notificación por correo con los datos del formulario de contacto
 */
export async function sendContactNotification(formData: ContactFormData) {
  try {
    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Crear el HTML para el correo con tabla
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #333366; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .message-box { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1>Nuevo formulario de contacto recibido</h1>
        <p>Se ha recibido un nuevo formulario de contacto con la siguiente información:</p>
        
        <table>
          <tr>
            <th>ID</th>
            <td>${formData.id}</td>
          </tr>
          <tr>
            <th>Nombre completo</th>
            <td>${formData.fullName}</td>
          </tr>
          <tr>
            <th>Correo electrónico</th>
            <td>${formData.email}</td>
          </tr>
          <tr>
            <th>Teléfono</th>
            <td>${formData.phone}</td>
          </tr>
          <tr>
            <th>Servicio solicitado</th>
            <td>${formData.service}</td>
          </tr>
          <tr>
            <th>Tipo de documento</th>
            <td>${formData.documentType}</td>
          </tr>
          <tr>
            <th>Número de documento</th>
            <td>${formData.documentNumber}</td>
          </tr>
          <tr>
            <th>Método de contacto preferido</th>
            <td>${formData.contactMethod}</td>
          </tr>
          <tr>
            <th>Horario de contacto</th>
            <td>${formData.contactTime}</td>
          </tr>
          <tr>
            <th>Fecha de envío</th>
            <td>${new Date(formData.created_at).toLocaleString()}</td>
          </tr>
        </table>
        
        <div class="message-box">
          <h3>Mensaje del cliente:</h3>
          <p>${formData.message}</p>
        </div>
        
        <div class="footer">
          <p>Este correo fue generado automáticamente. Por favor no responda a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Configurar el correo
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.DESTINATION_EMAIL,
      subject: `Nuevo formulario de contacto - ${formData.fullName}`,
      html: emailHtml
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
}

/**
 * Envía un correo de confirmación al cliente
 */
export async function sendClientConfirmation(clientEmail: string, clientName: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const confirmationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #333366; }
        p { margin-bottom: 15px; }
        .footer { margin-top: 30px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1>Gracias por contactarnos</h1>
        <p>Estimado/a ${clientName},</p>
        <p>Hemos recibido su formulario de contacto y le agradecemos por comunicarse con nosotros.</p>
        <p>Nos pondremos en contacto con usted lo antes posible a través del método que ha seleccionado.</p>
        <p>Si tiene alguna pregunta adicional, no dude en contactarnos.</p>
        <p>Saludos cordiales,</p>
        <p>El equipo de soporte</p>
        
        <div class="footer">
          <p>Este es un mensaje automático. Por favor no responda a este correo.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: clientEmail,
      subject: `Hemos recibido su mensaje`,
      html: confirmationHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmación enviada:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar confirmación:', error);
    throw error;
  }
}