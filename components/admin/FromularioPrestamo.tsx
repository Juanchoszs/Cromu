import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Percent, Clock, User, CreditCard, Phone, MapPin, FileText } from "lucide-react";

// Definición de tipos
export type EstadoPrestamo = "Activo" | "Pagado" | "Vencido" | "Refinanciado";

export interface Prestamo {
  id: string;
  nombreDeudor: string;
  cedula: string;
  telefono: string;
  direccion: string;
  monto: number;
  plazoMeses: number | null; // Puede ser indefinido (null)
  tasaInteres: number;
  fechaDesembolso: string;
  fechaVencimiento?: string;
  estado: EstadoPrestamo;
  observaciones?: string;
  garantia?: string;
  codeudor?: {
    nombre: string;
    cedula: string;
    telefono: string;
  };
  historialPagos?: {
    [key: string]: {
      fecha: string;
      monto: number;
      tipo: "Capital" | "Interés" | "Mixto";
      comprobante?: string;
    }[];
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
  plazoMeses: null,
  tasaInteres: 2.5, // Valor predeterminado de 2.5%
  fechaDesembolso: new Date().toISOString().split("T")[0],
  estado: "Activo",
  observaciones: "",
  garantia: "",
  codeudor: {
    nombre: "",
    cedula: "",
    telefono: ""
  },
  historialPagos: {}
};

const FormularioPrestamo: React.FC<FormularioPrestamoProps> = ({
  prestamo,
  onGuardar,
  onCancelar
}) => {
  const [form, setForm] = useState<Prestamo>(prestamoInicial);
  const [errores, setErrores] = useState<Partial<Record<keyof Prestamo, string>>>({});
  const [mostrarCamposCodeudor, setMostrarCamposCodeudor] = useState(false);
  const [plazoIndefinido, setPlazoIndefinido] = useState(false);

  // Cargar datos del préstamo si se está editando
  useEffect(() => {
    if (prestamo) {
      setForm(prestamo);
      setPlazoIndefinido(prestamo.plazoMeses === null);
      setMostrarCamposCodeudor(!!prestamo.codeudor?.nombre);
    }
  }, [prestamo]);

  // Calcular fecha de vencimiento basada en la fecha de desembolso y el plazo
  useEffect(() => {
    if (form.fechaDesembolso && form.plazoMeses !== null) {
      const fechaDesembolso = new Date(form.fechaDesembolso);
      const fechaVencimiento = new Date(fechaDesembolso);
      fechaVencimiento.setMonth(fechaDesembolso.getMonth() + form.plazoMeses);
      setForm(prev => ({
        ...prev,
        fechaVencimiento: fechaVencimiento.toISOString().split("T")[0]
      }));
    } else if (plazoIndefinido) {
      setForm(prev => ({
        ...prev,
        fechaVencimiento: undefined,
        plazoMeses: null
      }));
    }
  }, [form.fechaDesembolso, form.plazoMeses, plazoIndefinido]);

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
    
    if (!plazoIndefinido && (!form.plazoMeses || form.plazoMeses <= 0)) {
      nuevosErrores.plazoMeses = "El plazo debe ser mayor a 0";
    }
    
    if (form.tasaInteres < 0) {
      nuevosErrores.tasaInteres = "La tasa de interés no puede ser negativa";
    }
    
    if (!form.fechaDesembolso) {
      nuevosErrores.fechaDesembolso = "La fecha de desembolso es obligatoria";
    }
    
    if (mostrarCamposCodeudor) {
      if (!form.codeudor?.nombre.trim()) {
        nuevosErrores.codeudor = "El nombre del codeudor es obligatorio";
      }
      if (!form.codeudor?.cedula.trim()) {
        nuevosErrores.codeudor = nuevosErrores.codeudor || "La cédula del codeudor es obligatoria";
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      // Si no hay codeudor, eliminar el objeto
      const prestamoFinal = { ...form };
      if (!mostrarCamposCodeudor) {
        delete prestamoFinal.codeudor;
      }
      
      // Asignar un ID si es un nuevo préstamo
      if (!prestamoFinal.id) {
        prestamoFinal.id = Date.now().toString();
      }
      
      onGuardar(prestamoFinal);
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

  // Manejar cambios en los campos del codeudor
  const handleCambiosCodeudor = (campo: keyof typeof form.codeudor, valor: string) => {
    setForm(prev => ({
      ...prev,
      codeudor: {
        ...prev.codeudor!,
        [campo]: valor
      }
    }));
  };

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
                  placeholder="Monto en pesos"
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
            
            <div className="flex flex-col">
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Plazo en Meses
              </label>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={plazoIndefinido}
                  onChange={(e) => setPlazoIndefinido(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                />
                <span className="text-sm text-gray-300">Plazo indefinido</span>
              </div>
              {!plazoIndefinido && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={form.plazoMeses || ""}
                    onChange={(e) => handleChange("plazoMeses", Number(e.target.value) || null)}
                    className={`w-full p-2 pl-10 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                      errores.plazoMeses ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Duración en meses"
                    disabled={plazoIndefinido}
                  />
                  {errores.plazoMeses && (
                    <p className="text-red-500 text-xs mt-1">{errores.plazoMeses}</p>
                  )}
                </div>
              )}
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
                placeholder={plazoIndefinido ? "Indefinido" : "Calculado automáticamente"}
              />
              {plazoIndefinido && (
                <p className="text-xs text-gray-400 mt-1">El plazo es indefinido</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Estado del Préstamo
              </label>
              <select
                value={form.estado}
                onChange={(e) => handleChange("estado", e.target.value as EstadoPrestamo)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              >
                <option value="Activo">Activo</option>
                <option value="Pagado">Pagado</option>
                <option value="Vencido">Vencido</option>
                <option value="Refinanciado">Refinanciado</option>
              </select>
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
        
        {/* Codeudor */}
        <div className="md:col-span-2 bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <User className="mr-2 h-5 w-5 text-purple-400" />
              Codeudor
            </h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={mostrarCamposCodeudor}
                onChange={(e) => setMostrarCamposCodeudor(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
              />
              <span className="text-sm text-gray-300">Incluir codeudor</span>
            </div>
          </div>
          
          {mostrarCamposCodeudor && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Nombre del Codeudor*
                </label>
                <input
                  type="text"
                  value={form.codeudor?.nombre || ""}
                  onChange={(e) => handleCambiosCodeudor("nombre" as keyof typeof form.codeudor, e.target.value)}
                  className={`w-full p-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.codeudor ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Cédula del Codeudor*
                </label>
                <input
                  type="text"
                  value={form.codeudor?.cedula || ""}
                  onChange={(e) => handleCambiosCodeudor("cedula" as keyof typeof form.codeudor, e.target.value)}
                  className={`w-full p-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white ${
                    errores.codeudor ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Número de cédula"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Teléfono del Codeudor
                </label>
                <input
                  type="text"
                  value={form.codeudor?.telefono || ""}
                  onChange={(e) => handleCambiosCodeudor("telefono" as keyof typeof form.codeudor, e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  placeholder="Número de contacto"
                />
              </div>
              
              {errores.codeudor && (
                <p className="text-red-500 text-xs mt-1 md:col-span-3">{errores.codeudor}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Observaciones */}
        <div className="md:col-span-2 bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex items-center mb-2">
            <FileText className="mr-2 h-5 w-5 text-gray-400" />
            <label className="block text-gray-300 text-sm font-medium">
              Observaciones
            </label>
          </div>
          <textarea
            value={form.observaciones || ""}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white h-24"
            placeholder="Información adicional, condiciones especiales, etc."
          />
        </div>
        
        {/* Botones de acción */}
        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Cancelar
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
          >
            {prestamo ? "Actualizar Préstamo" : "Guardar Préstamo"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default FormularioPrestamo;