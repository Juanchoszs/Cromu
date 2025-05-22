import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, DollarSign, User, Calendar, Percent } from "lucide-react";

export type EstadoPrestamo = "Activo" | "Pagado" | "Vencido" | "Refinanciado";

type EstadoCuota = "pendiente" | "pagado" | "aplazado";

interface SubCuota {
  numero: string;
  estado: EstadoCuota;
  monto: number;
  fecha_pago?: string;
  fecha_creacion?: string;
}

interface CuotaPago {
  estado: EstadoCuota;
  monto: number;
  fecha_pago?: string;
  fecha_aplazamiento?: string;
  subcuotas: SubCuota[];
}

interface HistorialPagos {
  [numero: string]: CuotaPago;
}

export interface Prestamo {
  id?: string;
  nombreDeudor: string;
  cedula: string;
  telefono: string;
  direccion: string;
  monto: number;
  tasaInteres: number;
  plazoMeses: number;
  fechaDesembolso: string;
  fechaVencimiento?: string;
  garantia?: string;
  estado: EstadoPrestamo;
  historialPagos?: HistorialPagos;
}

interface FormularioPrestamoProps {
  prestamo?: Prestamo;
  onGuardar: (prestamo: Prestamo) => void;
  onCancelar: () => void;
}

export default function FormularioPrestamo({
  prestamo,
  onGuardar,
  onCancelar,
}: FormularioPrestamoProps) {
  const [formData, setFormData] = useState<Prestamo>({
    id: prestamo?.id || "",
    nombreDeudor: prestamo?.nombreDeudor || "",
    cedula: prestamo?.cedula || "",
    telefono: prestamo?.telefono || "",
    direccion: prestamo?.direccion || "",
    monto: prestamo?.monto || 0,
    tasaInteres: prestamo?.tasaInteres || 0,
    plazoMeses: prestamo?.plazoMeses || 0,
    fechaDesembolso: prestamo?.fechaDesembolso || new Date().toISOString().split('T')[0],
    fechaVencimiento: prestamo?.fechaVencimiento || "",
    garantia: prestamo?.garantia || "",
    estado: prestamo?.estado || "Activo",
    historialPagos: prestamo?.historialPagos || {},
  });

  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  // Calcular fecha de vencimiento automáticamente
  useEffect(() => {
    if (formData.fechaDesembolso && formData.plazoMeses > 0) {
      const fechaInicio = new Date(formData.fechaDesembolso);
      fechaInicio.setMonth(fechaInicio.getMonth() + formData.plazoMeses);
      setFormData(prev => ({
        ...prev,
        fechaVencimiento: fechaInicio.toISOString().split('T')[0]
      }));
    }
  }, [formData.fechaDesembolso, formData.plazoMeses]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!formData.nombreDeudor.trim()) {
      nuevosErrores.nombreDeudor = "El nombre del deudor es requerido";
    }

    if (!formData.cedula.trim()) {
      nuevosErrores.cedula = "La cédula es requerida";
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es requerido";
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es requerida";
    }

    if (formData.monto <= 0) {
      nuevosErrores.monto = "El monto debe ser mayor a 0";
    }

    if (formData.tasaInteres <= 0) {
      nuevosErrores.tasaInteres = "La tasa de interés debe ser mayor a 0";
    }

    if (formData.plazoMeses <= 0) {
      nuevosErrores.plazoMeses = "El plazo debe ser mayor a 0";
    }

    if (!formData.fechaDesembolso) {
      nuevosErrores.fechaDesembolso = "La fecha de desembolso es requerida";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const calcularCuotaFija = (monto: number, plazoMeses: number, tasaInteres: number) => {
    const i = tasaInteres / 100;
    const cuota = monto * (i * Math.pow(1 + i, plazoMeses)) / (Math.pow(1 + i, plazoMeses) - 1);
    return Math.round(cuota / 1000) * 1000;
  };

  const inicializarHistorialPagos = (plazoMeses: number, cuotaFija: number): HistorialPagos => {
    const historial: HistorialPagos = {};
    for (let i = 1; i <= plazoMeses; i++) {
      historial[i] = { 
        estado: "pendiente", 
        monto: cuotaFija, 
        subcuotas: [] 
      };
    }
    return historial;
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Si es un préstamo nuevo y no tiene historial de pagos, inicializarlo
    let prestamoCompleto = { ...formData };
    
    if (!prestamo && (!prestamoCompleto.historialPagos || Object.keys(prestamoCompleto.historialPagos).length === 0)) {
      const cuotaFija = calcularCuotaFija(
        prestamoCompleto.monto,
        prestamoCompleto.plazoMeses,
        prestamoCompleto.tasaInteres
      );
      prestamoCompleto.historialPagos = inicializarHistorialPagos(
        prestamoCompleto.plazoMeses,
        cuotaFija
      );
    }

    onGuardar(prestamoCompleto);
  };

  const manejarCambio = (campo: keyof Prestamo, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: "" }));
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Calcular cuota estimada
  const cuotaEstimada = formData.monto > 0 && formData.plazoMeses > 0 && formData.tasaInteres > 0
    ? calcularCuotaFija(formData.monto, formData.plazoMeses, formData.tasaInteres)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <DollarSign className="mr-2 h-6 w-6" />
              {prestamo ? "Editar Préstamo" : "Nuevo Préstamo"}
            </h3>
            <button
              onClick={onCancelar}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-6">
            {/* Información del Deudor */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Información del Deudor
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreDeudor}
                    onChange={(e) => manejarCambio("nombreDeudor", e.target.value)}
                    className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                      errores.nombreDeudor
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-500"
                    }`}
                    placeholder="Ingrese el nombre completo"
                  />
                  {errores.nombreDeudor && (
                    <p className="text-red-400 text-sm mt-1">{errores.nombreDeudor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cédula *
                  </label>
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => manejarCambio("cedula", e.target.value)}
                    className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                      errores.cedula
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-500"
                    }`}
                    placeholder="Número de cédula"
                  />
                  {errores.cedula && (
                    <p className="text-red-400 text-sm mt-1">{errores.cedula}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => manejarCambio("telefono", e.target.value)}
                    className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                      errores.telefono
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-500"
                    }`}
                    placeholder="Número de teléfono"
                  />
                  {errores.telefono && (
                    <p className="text-red-400 text-sm mt-1">{errores.telefono}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => manejarCambio("direccion", e.target.value)}
                    className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                      errores.direccion
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-500"
                    }`}
                    placeholder="Dirección completa"
                  />
                  {errores.direccion && (
                    <p className="text-red-400 text-sm mt-1">{errores.direccion}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información del Préstamo */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Información del Préstamo
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto del Préstamo *
                  </label>
                  <input
                    type="number"
                    value={formData.monto || ""}
                    onChange={(e) => manejarCambio("monto", Number(e.target.value))}
                    className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                      errores.monto
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-500"
                    }`}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                  {errores.monto && (
                    <p className="text-red-400 text-sm mt-1">{errores.monto}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tasa de Interés (% mensual) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.tasaInteres || ""}
                      onChange={(e) => manejarCambio("tasaInteres", Number(e.target.value))}
                      className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                        errores.tasaInteres
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-600 focus:ring-emerald-500"
                      }`}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errores.tasaInteres && (
                    <p className="text-red-400 text-sm mt-1">{errores.tasaInteres}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plazo (meses) *
                  </label>
                  <input
                    type="number"
                    value={formData.plazoMeses || ""}
                    onChange={(e) => manejarCambio("plazoMeses", Number(e.target.value))}
                    className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                      errores.plazoMeses
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-emerald-500"
                    }`}
                    placeholder="0"
                    min="1"
                    max="120"
                  />
                  {errores.plazoMeses && (
                    <p className="text-red-400 text-sm mt-1">{errores.plazoMeses}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Desembolso *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.fechaDesembolso}
                      onChange={(e) => manejarCambio("fechaDesembolso", e.target.value)}
                      className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 focus:outline-none text-white ${
                        errores.fechaDesembolso
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-600 focus:ring-emerald-500"
                      }`}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errores.fechaDesembolso && (
                    <p className="text-red-400 text-sm mt-1">{errores.fechaDesembolso}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.fechaVencimiento}
                      onChange={(e) => manejarCambio("fechaVencimiento", e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
                      readOnly
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Se calcula automáticamente</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado del Préstamo
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => manejarCambio("estado", e.target.value as EstadoPrestamo)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Refinanciado">Refinanciado</option>
                  </select>
                </div>
              </div>

              {/* Mostrar cuota estimada */}
              {cuotaEstimada > 0 && (
                <div className="mt-4 p-3 bg-emerald-900 bg-opacity-20 border border-emerald-700 rounded-md">
                  <p className="text-emerald-300 text-sm">
                    <strong>Cuota mensual estimada:</strong> {formatearMoneda(cuotaEstimada)}
                  </p>
                </div>
              )}
            </div>

            {/* Información Adicional */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">
                Información Adicional
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Garantía
                </label>
                <textarea
                  value={formData.garantia}
                  onChange={(e) => manejarCambio("garantia", e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
                  placeholder="Descripción de la garantía (opcional)"
                  rows={3}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onCancelar}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center justify-center"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center justify-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {prestamo ? "Actualizar" : "Guardar"} Préstamo
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}