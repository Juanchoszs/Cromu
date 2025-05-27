import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, Award, Info, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Ahorrador } from "./AhorradoresCrud";

interface FormularioAhorradorProps {
  ahorrador?: Ahorrador;
  onGuardar: (ahorrador: Ahorrador) => void;
  onCancelar: () => void;
}

interface Consignacion {
  fecha: string;
  monto: number;
  descripcion?: string;
}

export default function FormularioAhorrador({ ahorrador, onGuardar, onCancelar }: FormularioAhorradorProps) {
  const [mesesEstado, setMesesEstado] = useState<string[]>([]);
  const [mostrarInfoFidelidad, setMostrarInfoFidelidad] = useState(false);
  const [mesesExpandidos, setMesesExpandidos] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<Ahorrador>({
    id: "",
    nombre: "",
    cedula: "",
    fechaIngreso: "",
    telefono: "",
    direccion: "",
    email: "",
    ahorroTotal: 0,
    pagosConsecutivos: 0,
    historialPagos: {},
    incentivoPorFidelidad: true // Inicialmente activo como incentivo
  });

  // Cargar datos del ahorrador si estamos editando
  useEffect(() => {
    if (ahorrador) {
      setForm(ahorrador);
      const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
      setMesesEstado(mesesOrdenados);
    }
  }, [ahorrador]);

  // Generar meses desde la fecha de inicio hasta hoy + ciclo anual completo
  const generarMesesDesdeInicio = (fechaInicio: string): string[] => {
    const meses = [];
    const fechaInicioObj = new Date(fechaInicio);
    const hoy = new Date();
    
    // Asegurar que siempre tengamos 12 meses (ciclo anual completo)
    const fechaFinal = new Date(hoy);
    fechaFinal.setMonth(fechaFinal.getMonth() + 12);
    
    let fechaActual = new Date(fechaInicioObj);
    
    while (fechaActual <= fechaFinal) {
      const año = fechaActual.getFullYear();
      const mes = fechaActual.getMonth();
      const mesFormateado = `${año}-${(mes + 1).toString().padStart(2, '0')}`;
      meses.push(mesFormateado);
      
      // Avanzar al siguiente mes
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
    
    // Retornamos solo los primeros 12 meses para el ciclo anual
    return meses.slice(0, 12);
  };

  // Manejar cambio de fecha de ingreso
  const handleFechaIngresoChange = (fecha: string) => {
    const mesesGenerados = generarMesesDesdeInicio(fecha);
    setMesesEstado(mesesGenerados);
    
    // Inicializar el historial de pagos con los meses generados
    const historialInicial: Record<string, { pagado: boolean; monto: number; consignaciones: Consignacion[] }> = {};
    
    mesesGenerados.forEach(mes => {
      historialInicial[mes] = { pagado: false, monto: 0, consignaciones: [] };
    });
    
    setForm({
      ...form,
      fechaIngreso: fecha,
      historialPagos: historialInicial
    });
  };

  // Alternar estado de pago en el formulario
  const alternarEstadoPagoFormulario = (mes: string) => {
    const historialActualizado = { ...form.historialPagos };
    historialActualizado[mes].pagado = !historialActualizado[mes].pagado;
    
    setForm({
      ...form,
      historialPagos: historialActualizado
    });
  };

  // Actualizar monto de un mes específico
  const actualizarMontoMes = (mes: string, monto: string) => {
    const montoNumerico = monto ? parseInt(monto) : 0;
    const historialActualizado = { ...form.historialPagos };
    
    historialActualizado[mes].monto = montoNumerico;
    
    setForm({
      ...form,
      historialPagos: historialActualizado
    });
  };

  // Formatear mes para presentación
  const formatearMes = (mesStr: string) => {
    const [año, mes] = mesStr.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[parseInt(mes) - 1]} ${año}`;
  };

  const agregarConsignacion = (mes: string) => {
    const historialActualizado = { ...form.historialPagos };
    const nuevaConsignacion: Consignacion = {
      fecha: '',
      monto: 0,
      descripcion: ''
    };
    historialActualizado[mes].consignaciones.push(nuevaConsignacion);
    
    setForm({
      ...form,
      historialPagos: historialActualizado
    });
  };

  const actualizarConsignacion = (mes: string, idx: number, campo: keyof Consignacion, valor: string | number) => {
    const historialActualizado = { ...form.historialPagos };
    const consignacionActualizada = { ...historialActualizado[mes].consignaciones[idx] };
    
    // Asignar el valor según el tipo de campo
    if (campo === 'fecha' && typeof valor === 'string') {
      consignacionActualizada.fecha = valor;
    } else if (campo === 'monto' && typeof valor === 'number') {
      consignacionActualizada.monto = valor;
    } else if (campo === 'descripcion' && typeof valor === 'string') {
      consignacionActualizada.descripcion = valor;
    }
    
    historialActualizado[mes].consignaciones[idx] = consignacionActualizada;
    
    // Actualizar el monto total del mes
    historialActualizado[mes].monto = historialActualizado[mes].consignaciones.reduce(
      (total, consignacion) => total + consignacion.monto, 0
    );
    
    setForm({
      ...form,
      historialPagos: historialActualizado
    });
  };

  const eliminarConsignacion = (mes: string, idx: number) => {
    const historialActualizado = { ...form.historialPagos };
    historialActualizado[mes].consignaciones.splice(idx, 1);
    
    setForm({
      ...form,
      historialPagos: historialActualizado
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Calcular el ahorro total sumando todos los montos de pagos
      let ahorroTotal = 0;
      let pagosConsecutivos = 0;
      
      // Ordenar los meses cronológicamente
      const mesesOrdenados = Object.keys(form.historialPagos).sort();
      
      // Contar pagos consecutivos y calcular ahorro total
      for (const mes of mesesOrdenados) {
        if (form.historialPagos[mes].pagado) {
          ahorroTotal += form.historialPagos[mes].monto;
          pagosConsecutivos++;
        } else {
          // Si hay un mes no pagado, se rompe la consecutividad
          pagosConsecutivos = 0;
        }
      }
      
      // Crear objeto con datos actualizados
      const datosActualizados = {
        ...form,
        ahorroTotal,
        pagosConsecutivos
      };
      
      if (ahorrador) {
        // Editando ahorrador existente
        onGuardar(datosActualizados);
      } else {
        // Creando nuevo ahorrador
        const datosParaEnviar = {
          nombre: form.nombre,
          cedula: form.cedula,
          fechaIngreso: form.fechaIngreso,
          telefono: form.telefono,
          direccion: form.direccion,
          email: form.email,
          ahorroTotal,
          pagosConsecutivos,
          historialPagos: form.historialPagos,
          incentivoPorFidelidad: true
        };

        const res = await fetch('/api/ahorradores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosParaEnviar),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error al guardar el ahorrador');
        }

        onGuardar({ ...datosActualizados, id: data.id });
      }
    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      alert(`Error al guardar el ahorrador: ${error.message}`);
    }
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-emerald-400">
          {ahorrador ? "Editar Ahorrador" : "Registrar Nuevo Ahorrador"}
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMostrarInfoFidelidad(!mostrarInfoFidelidad)}
            className="text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <Info size={20} />
          </button>
          {mostrarInfoFidelidad && (
            <div className="absolute right-0 mt-2 w-72 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 z-10 text-sm">
              <h3 className="font-semibold text-emerald-400 mb-2 flex items-center">
                <Award size={16} className="mr-2" />
                Bono por Fidelidad (1%)
              </h3>
              <p className="mb-2">El bono del 1% se aplica desde el inicio como incentivo.</p>
              <p className="mb-2">Se mantiene activo mientras el ahorrador no falle ningún mes.</p>
              <p>Si falla un solo mes, el bono se desactiva automáticamente y deberá comenzar de cero.</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Cédula</label>
            <input
              type="text"
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Ingreso</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-500" />
              </div>
              <input
                type="date"
                value={form.fechaIngreso}
                onChange={(e) => handleFechaIngresoChange(e.target.value)}
                className="w-full p-2 pl-10 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
        </div>

        {mesesEstado.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-emerald-400 mb-3">Historial de Pagos Mensuales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mesesEstado.map((mes) => (
                <div 
                  key={mes} 
                  className={`p-3 rounded-lg border ${
                    form.historialPagos[mes]?.pagado ? 'bg-emerald-900/30 border-emerald-700' : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{formatearMes(mes)}</span>
                    <button
                      type="button"
                      onClick={() => alternarEstadoPagoFormulario(mes)}
                      className={`p-1 rounded-full ${
                        form.historialPagos[mes]?.pagado ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {form.historialPagos[mes]?.pagado ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {form.historialPagos[mes]?.pagado && (
                    <>
                      <div className="mb-3">
                        <p className="text-sm text-gray-400 mb-1">Monto Total: <span className="font-semibold text-emerald-400">{formatearMoneda(form.historialPagos[mes]?.monto || 0)}</span></p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-emerald-400">Consignaciones</h4>
                          <button
                            type="button"
                            onClick={() => agregarConsignacion(mes)}
                            className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-1 rounded flex items-center"
                          >
                            <Plus size={12} className="mr-1" /> Agregar
                          </button>
                        </div>
                        
                        {(form.historialPagos[mes]?.consignaciones || []).length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No hay consignaciones registradas</p>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {(form.historialPagos[mes]?.consignaciones || []).map((consignacion, idx) => (
                              <div key={idx} className="bg-gray-800 p-2 rounded border border-gray-700 flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                  <input
                                    type="date"
                                    value={consignacion.fecha}
                                    onChange={(e) => actualizarConsignacion(mes, idx, 'fecha', e.target.value)}
                                    className="bg-gray-900 border border-gray-700 rounded p-1 text-sm text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => eliminarConsignacion(mes, idx)}
                                    className="text-red-500 hover:text-red-400"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div className="relative mb-2">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign size={14} className="text-gray-500" />
                                  </div>
                                  <input
                                    type="number"
                                    value={consignacion.monto}
                                    onChange={(e) => actualizarConsignacion(mes, idx, 'monto', parseInt(e.target.value) || 0)}
                                    className="w-full p-1 pl-8 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                                    placeholder="Monto"
                                    min="0"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={consignacion.descripcion || ''}
                                  onChange={(e) => actualizarConsignacion(mes, idx, 'descripcion', e.target.value)}
                                  className="w-full p-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                                  placeholder="Descripción (opcional)"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}