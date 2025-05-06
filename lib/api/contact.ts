import axios from 'axios';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  documentType: string;
  documentNumber: string;
  subject: string;
  message: string;
  contactMethod: string;
  contactTime: string;
}

export async function submitContactForm(data: ContactFormData) {
  try {
    const response = await axios.post('/api/contact', data);
    return response.data;
  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    return { success: false, error: 'Error al procesar el formulario' };
  }
} 