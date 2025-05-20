import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Percent, Clock, User, CreditCard, Phone, MapPin } from "lucide-react";

// Definición de tipos
export type EstadoPrestamo = "Activo" | "Pagado" | "Vencido" | "Refinanciado";

export interface Prestamo {
  id: string;
  nombreDeudor: string;
  cedula: string;
  telefono: string;
  direccion: string;
  monto: number;
  plazoMeses: number;
  tasaInteres: number;
  fechaDesembolso: string;
  fechaVencimiento?: string;
  estado: EstadoPrestamo;
  garantia?: string;
  historialPagos?: {
    [key: string]: {
      estado: "pendiente" | "pagado" | "aplazado";
      monto: number;
      subcuotas: {
        numero: string;
        estado: "pendiente" | "pagado" | "aplazado";
        monto: number;
      }[];
    };
  };
}

interface FormularioPrestamoProps {
  prestamo?: Prestamo;
  onGuardar: (prestamo: Prestamo) => void;
  onCancelar: () => void;
}

const prestamoInicial: Prestamo = {
  id: "",
  nombreDeudor: "",
  cedula: "",
  telefono: "",
  direccion: "",
  monto: 0,
  plazoMeses: 12, // Valor predeterminado de 12 meses
  tasaInteres: 2.5, // Valor predeterminado de 2.5%
  fechaDesembolso: new Date().toISOString().split("T")[0],
  estado: "Activo",
  garantia: "",
  historialPagos: {}
};

const FormularioPrestamo: React.FC<FormularioPrestamoProps> = ({
  prestamo,
  onGuardar,
  onCancelar
}) => {
  const [form, setForm] = useState<Prestamo>(prestamoInicial);
  const [errores, setErrores] = useState<Partial<Record<keyof Prestamo, string>>>({});

  // Cargar datos del préstamo si se está editando
  useEffect(() => {
    if (prestamo) {
      setForm(prestamo);
    }
  }, [prestamo]);

  // Calcular fecha de vencimiento basada en la fecha de desembolso y el plazo
  useEffect(() => {
    if (form.fechaDesembolso && form.plazoMeses) {
      const fechaDesembolso = new Date(form.fechaDesembolso);
      const fechaVencimiento = new Date(fechaDesembolso);
      fechaVencimiento.setMonth(fechaDesembolso.getMonth() + form.plazoMeses);
      setForm(prev => ({
        ...prev,
        fechaVencimiento: fechaVencimiento.toISOString().split("T")[0]
      }));
    }
  }, [form.fechaDesembolso, form.plazoMeses]);

  // Validar el formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: Partial<Record<keyof Prestamo, string>> = {};
    
    if (!form.nombreDeudor.trim()) {
      nuevosErrores.nombreDeudor = "El nombre del deudor es obligatorio";
    }
    
    if (!form.cedula.trim()) {
      nuevosErrores.cedula = "La cédula es obligatoria";
    }
    
    if (form.monto <= 0) {
      nuevosErrores.monto = "El monto debe ser mayor a 0";
    }
    
    if (!form.plazoMeses || form.plazoMeses <= 0) {
      nuevosErrores.plazoMeses = "El plazo debe ser mayor a 0";
    }
    
    if (form.tasaInteres < 0) {
      nuevosErrores.tasaInteres = "La tasa de interés no puede ser negativa";
    }
    
    if (!form.fechaDesembolso) {
      nuevosErrores.fechaDesembolso = "La fecha de desembolso es obligatoria";
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      try {
        // Preparar datos para enviar a la API
        const datosParaEnviar = {
          nombreDeudor: form.nombreDeudor,
          cedula: form.cedula,
          telefono: form.telefono,
          direccion: form.direccion,
          monto: form.monto,
          plazoMeses: form.plazoMeses,
          tasaInteres: form.tasaInteres,
          fechaDesembolso: form.fechaDesembolso,
          fechaVencimiento: form.fechaVencimiento,
          estado: form.estado,
          garantia: form.garantia,
          historialPagos: form.historialPagos
        };
        
        // Solo si es un préstamo nuevo
        if (!form.id) {
          form.historialPagos = inicializarHistorialPagos(form.plazoMeses, form.monto, form.tasaInteres);
        }
        
        let res;
        
        if (form.id) {
          // Actualizar préstamo existente
          res = await fetch(`/api/prestamos?id=${form.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaEnviar),
          });
        } else {
          // Crear nuevo préstamo
          res = await fetch('/api/prestamos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaEnviar),
          });
        }
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Error al guardar el préstamo');
        }
        
        // Si todo salió bien, guardar el préstamo con el ID asignado
        onGuardar({ ...form, id: data.id });
        
      } catch (error: any) {
        console.error('Error en handleSubmit:', error);
        alert(`Error al guardar el préstamo: ${error.message}`);
      }
    }
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (campo: keyof Prestamo, valor: any) => {
    setForm(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: undefined
      }));
    }
  };

  // Inicializar historial de pagos
  function inicializarHistorialPagos(plazoMeses: number, monto: number, tasaInteres: number) {
    // Calcula la cuota fija aproximada a miles
    const i = tasaInteres / 100;
    const cuota = monto * (i * Math.pow(1 + i, plazoMeses)) / (Math.pow(1 + i, plazoMeses) - 1);
    const cuotaFija = Math.round(cuota / 1000) * 1000;

    const historial: {
      [key: string]: {
        estado: "pendiente";
        monto: number;
        subcuotas: [];
      };
    } = {};
    for (let i = 1; i <= plazoMeses; i++) {
      historial[i] = { estado: "pendiente", monto: cuotaFija, subcuotas: [] };
    }
    return historial;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">
        {prestamo ? "Editar Préstamo" : "Nuevo Préstamo"}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información del deudor */}
        <div className="md:col-span-2 bg-gray-700 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-400" />
            Información del Deudor
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Nombre Completo*
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.nombreDeudor}
                  onChange={(e) => handleChange("nombreDeudor", e.target.value)}
                  className={`w-full p-2 pl-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.nombreDeudor ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Nombre completo del deudor"
                />
                {errores.nombreDeudor && (
                  <p className="text-red-500 text-xs mt-1">{errores.nombreDeudor}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Cédula*
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.cedula}
                  onChange={(e) => handleChange("cedula", e.target.value)}
                  className={`w-full p-2 pl-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.cedula ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Número de cédula"
                />
                {errores.cedula && (
                  <p className="text-red-500 text-xs mt-1">{errores.cedula}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  className="w-full p-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  placeholder="Número de contacto"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Dirección
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  className="w-full p-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  placeholder="Dirección de residencia"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Información del préstamo */}
        <div className="md:col-span-2 bg-gray-700 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-emerald-400" />
            Detalles del Préstamo
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Monto del Préstamo*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.monto}
                  onChange={(e) => handleChange("monto", Number(e.target.value))}
                  className={`w-full p-2 pl-10 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.monto ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Monto in pesos"
                />
                {errores.monto && (
                  <p className="text-red-500 text-xs mt-1">{errores.monto}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Tasa de Interés Mensual (%)*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Percent className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.tasaInteres}
                  onChange={(e) => handleChange("tasaInteres", Number(e.target.value))}
                  className={`w-full p-2 pl-10 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.tasaInteres ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Tasa mensual"
                />
                {errores.tasaInteres && (
                  <p className="text-red-500 text-xs mt-1">{errores.tasaInteres}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Fecha de Desembolso*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="date"
                  value={form.fechaDesembolso}
                  onChange={(e) => handleChange("fechaDesembolso", e.target.value)}
                  className={`w-full p-2 pl-10 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.fechaDesembolso ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errores.fechaDesembolso && (
                  <p className="text-red-500 text-xs mt-1">{errores.fechaDesembolso}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Plazo en Meses*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  min="1"
                  value={form.plazoMeses || ""}
                  onChange={(e) => handleChange("plazoMeses", Number(e.target.value))}
                  className={`w-full p-2 pl-10 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.plazoMeses ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Duración en meses"
                />
                {errores.plazoMeses && (
                  <p className="text-red-500 text-xs mt-1">{errores.plazoMeses}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={form.fechaVencimiento || ""}
                readOnly
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white opacity-70 cursor-not-allowed"
                placeholder="Calculado automáticamente"
              />
            </div>
          </div>
        </div>
        
        {/* Garantía */}
        <div className="md:col-span-2 bg-gray-700 p-4 rounded-lg mb-4">
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Garantía (opcional)
          </label>
          <textarea
            value={form.garantia || ""}
            onChange={(e) => handleChange("garantia", e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white h-20"
            placeholder="Descripción de la garantía (bienes, propiedades, etc.)"
          />
        </div>
        
        {/* Botones de acción */}
        <div className="md:col-span-2 flex justify-end space-x-4 mt-2">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
          >
            Guardar Préstamo
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default FormularioPrestamo;