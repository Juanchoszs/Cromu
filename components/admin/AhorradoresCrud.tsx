import React, { useState, useEffect } from "react";
import { Calendar, Edit3, Trash2, CheckCircle, XCircle, DollarSign, ChevronDown, ChevronUp, Clock, Award, User, RefreshCw, Printer } from "lucide-react";
import FormularioAhorrador from "./FormularioAhorrador";
import GenerarVoucher from "./GenerarVoucher";

// Definición de la interfaz Ahorrador (exportada para usarla en FormularioAhorrador)
export interface Ahorrador {
  id: string;
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
}

export default function AhorradoresCrud() {
  const [ahorradores, setAhorradores] = useState<Ahorrador[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [detallesExpandidos, setDetallesExpandidos] = useState<Record<string, boolean>>({});
  const [busqueda, setBusqueda] = useState("");
  const [mostrarInfoFidelidad, setMostrarInfoFidelidad] = useState(false);
  const [mostrarVoucher, setMostrarVoucher] = useState(false);
  const [ahorradorSeleccionado, setAhorradorSeleccionado] = useState<Ahorrador | null>(null);
  
  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('ahorradores');
    if (savedData) {
      try {
        setAhorradores(JSON.parse(savedData));
      } catch (e) {
        console.error("Error al cargar datos guardados:", e);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambian los ahorradores
  useEffect(() => {
    if (ahorradores.length > 0) {
      localStorage.setItem('ahorradores', JSON.stringify(ahorradores));
    }
  }, [ahorradores]);

  // Generar un ID único para cada ahorrador
  const generarId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Recalcular ahorro total basado en historial de pagos
  const recalcularAhorroTotal = (ahorrador: Ahorrador) => {
    let ahorroAcumulado = 0;
    const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
    for (const mes of mesesOrdenados) {
      const pago = ahorrador.historialPagos[mes];
      if (pago.pagado) {
        const montoMes = pago.monto || 0;
        ahorroAcumulado += montoMes;
      }
    }
    ahorrador.ahorroTotal = ahorroAcumulado;
  };

  // Verificar si todos los meses están pagados para mantener el incentivo
  const verificarFidelidad = (ahorrador: Ahorrador) => {
    // Verificar si hay algún mes no pagado
    const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
    const hayMesFallido = mesesOrdenados.some(mes => !ahorrador.historialPagos[mes].pagado);
    
    // Si no hay meses fallidos, mantener el incentivo activo
    return !hayMesFallido;
  };

  // Calcular pagos consecutivos y verificar incentivo por fidelidad
  const calcularPagosConsecutivos = (ahorrador: Ahorrador) => {
    let consecutivos = 0;
    const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
    
    // Contar pagos consecutivos desde el inicio
    for (const mes of mesesOrdenados) {
      if (ahorrador.historialPagos[mes].pagado) {
        consecutivos++;
      } else {
        break;
      }
    }
    
    ahorrador.pagosConsecutivos = consecutivos;
    
    // Verificar fidelidad (si ha fallado algún mes, pierde el incentivo temporalmente)
    ahorrador.incentivoPorFidelidad = verificarFidelidad(ahorrador);
  };

  // Alternar el estado de pago de un mes
  const alternarEstadoPago = (index: number, mes: string) => {
    const ahorradorActualizado = { ...ahorradores[index] };
    ahorradorActualizado.historialPagos[mes].pagado = !ahorradorActualizado.historialPagos[mes].pagado;
    
    // Si se marca como pagado, asignar el monto mensual
    if (ahorradorActualizado.historialPagos[mes].pagado && ahorradorActualizado.historialPagos[mes].monto === 0) {
      // Buscar el último monto pagado para sugerirlo
      const mesesOrdenados = Object.keys(ahorradorActualizado.historialPagos).sort();
      let ultimoMontoPagado = 0;
      
      for (const m of mesesOrdenados) {
        if (m !== mes && ahorradorActualizado.historialPagos[m].pagado) {
          ultimoMontoPagado = ahorradorActualizado.historialPagos[m].monto;
          break;
        }
      }
      
      ahorradorActualizado.historialPagos[mes].monto = ultimoMontoPagado;
    }
    
    // Recalcular pagos consecutivos e incentivo
    calcularPagosConsecutivos(ahorradorActualizado);
    
    // Recalcular ahorro total
    recalcularAhorroTotal(ahorradorActualizado);
    
    // Actualizar lista de ahorradores
    const nuevosAhorradores = [...ahorradores];
    nuevosAhorradores[index] = ahorradorActualizado;
    setAhorradores(nuevosAhorradores);
  };

  // Actualizar monto de un mes específico
  const actualizarMontoMes = (index: number, mes: string, monto: number) => {
    const ahorradorActualizado = { ...ahorradores[index] };
    ahorradorActualizado.historialPagos[mes].monto = monto;
    
    // Recalcular ahorro total
    recalcularAhorroTotal(ahorradorActualizado);
    
    // Actualizar lista de ahorradores
    const nuevosAhorradores = [...ahorradores];
    nuevosAhorradores[index] = ahorradorActualizado;
    setAhorradores(nuevosAhorradores);
  };

  // Restaurar manualmente el incentivo de fidelidad
  const restaurarIncentivo = (index: number) => {
    const ahorradorActualizado = { ...ahorradores[index] };
    ahorradorActualizado.incentivoPorFidelidad = true;
    
    // Actualizar lista de ahorradores
    const nuevosAhorradores = [...ahorradores];
    nuevosAhorradores[index] = ahorradorActualizado;
    setAhorradores(nuevosAhorradores);
  };

  // Guardar ahorrador (recibe el ahorrador del formulario)
  const guardarAhorrador = (ahorradorCompleto: Ahorrador) => {
    // Asegurar que tenga ID
    if (!ahorradorCompleto.id) {
      ahorradorCompleto.id = generarId();
      // Para nuevos ahorradores, activar incentivo por defecto
      ahorradorCompleto.incentivoPorFidelidad = true;
    }
    
    // Calcular pagos consecutivos y ahorro total antes de guardar
    calcularPagosConsecutivos(ahorradorCompleto);
    recalcularAhorroTotal(ahorradorCompleto);
    
    if (editandoIndex !== null) {
      // Editar existente
      const nuevosAhorradores = [...ahorradores];
      nuevosAhorradores[editandoIndex] = ahorradorCompleto;
      setAhorradores(nuevosAhorradores);
    } else {
      // Agregar nuevo
      setAhorradores([...ahorradores, ahorradorCompleto]);
    }
    
    setMostrarFormulario(false);
    setEditandoIndex(null);
  };

  // Editar ahorrador
  const editarAhorrador = (index: number) => {
    setEditandoIndex(index);
    setMostrarFormulario(true);
  };

  // Eliminar ahorrador
  const eliminarAhorrador = (index: number) => {
    if (confirm("¿Estás seguro de eliminar este ahorrador? Esta acción no se puede deshacer.")) {
      const nuevosAhorradores = ahorradores.filter((_, i) => i !== index);
      setAhorradores(nuevosAhorradores);
    }
  };

  // Alternar detalles expandidos
  const alternarDetalles = (id: string) => {
    setDetallesExpandidos({
      ...detallesExpandidos,
      [id]: !detallesExpandidos[id]
    });
  };

  // Formatear fecha para presentación
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  // Formatear moneda para presentación
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Filtrar ahorradores según búsqueda
  const ahorradoresFiltrados = ahorradores.filter(ahorrador => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      ahorrador.nombre.toLowerCase().includes(terminoBusqueda) ||
      ahorrador.cedula.toLowerCase().includes(terminoBusqueda) ||
      ahorrador.email.toLowerCase().includes(terminoBusqueda)
    );
  });

  // Calcular rentabilidad anual (6% base + 1% por fidelidad si aplica)
  const calcularRentabilidadAnual = (ahorrador: Ahorrador) => {
    const tasaBase = 6; // 6% anual base
    const tasaFidelidad = ahorrador.incentivoPorFidelidad ? 1 : 0; // 1% adicional por fidelidad
    return tasaBase + tasaFidelidad;
  };

  // Calcular interés anual (corregido para que sea el porcentaje completo del capital)
  const calcularInteresAnual = (ahorrador: Ahorrador) => {
    const tasaAnual = calcularRentabilidadAnual(ahorrador);
    // Aplicar la tasa directamente al capital total
    return ahorrador.ahorroTotal * (tasaAnual / 100);
  };

  // Calcular saldo total (capital + interés)
  const calcularSaldoTotal = (ahorrador: Ahorrador) => {
    const interesAnual = calcularInteresAnual(ahorrador);
    return ahorrador.ahorroTotal + interesAnual;
  };

  // Función para mostrar el voucher
  const mostrarGenerarVoucher = (ahorrador: Ahorrador) => {
    setAhorradorSeleccionado(ahorrador);
    setMostrarVoucher(true);
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">Gestión de Ahorradores</h2>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setEditandoIndex(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <User className="mr-2 h-5 w-5" />
          Nuevo Ahorrador
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Formulario de ahorrador */}
      {mostrarFormulario && (
        <FormularioAhorrador
          ahorrador={editandoIndex !== null ? ahorradores[editandoIndex] : undefined}
          onGuardar={guardarAhorrador}
          onCancelar={() => {
            setMostrarFormulario(false);
            setEditandoIndex(null);
          }}
        />
      )}

      {/* Información sobre el bono de fidelidad */}
      <div className="relative mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-start">
          <Award className="text-emerald-400 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-400 mb-1">Bono por Fidelidad (1% adicional)</h3>
            <p className="text-gray-300 text-sm">
              Los ahorradores reciben un 6% de rentabilidad anual base. Todos los ahorradores comienzan con un 1% adicional (7% total) que se mantiene mientras no fallen ningún pago.
            </p>
            <button
              onClick={() => setMostrarInfoFidelidad(!mostrarInfoFidelidad)}
              className="text-emerald-400 hover:text-emerald-300 text-sm mt-1 underline"
            >
              {mostrarInfoFidelidad ? "Ocultar detalles" : "Ver más detalles"}
            </button>
            
            {mostrarInfoFidelidad && (
              <div className="mt-2 text-sm text-gray-300">
                <p className="mb-1">• El bono del 1% se aplica automáticamente desde el primer aporte.</p>
                <p className="mb-1">• Si el ahorrador falla un mes, el bono se desactiva temporalmente.</p>
                <p className="mb-1">• Al corregir todos los meses fallidos, el bono se recupera automáticamente.</p>
                <p>• El sistema gestiona automáticamente el estado del bono para todos los ahorradores.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de ahorradores */}
      {ahorradoresFiltrados.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">
            {busqueda ? "No se encontraron ahorradores que coincidan con la búsqueda." : "No hay ahorradores registrados. Agrega uno nuevo para comenzar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ahorradoresFiltrados.map((ahorrador, index) => {
            const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
            const interesAnual = calcularInteresAnual(ahorrador);
            const saldoTotal = calcularSaldoTotal(ahorrador);
            const tasaInteres = calcularRentabilidadAnual(ahorrador);
            
            return (
              <div 
                key={ahorrador.id} 
                className={`bg-gray-800 border rounded-lg overflow-hidden shadow-lg ${
                  ahorrador.incentivoPorFidelidad ? 'border-emerald-600' : 'border-gray-700'
                }`}
              >
                <div className="p-4 bg-gray-900">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{ahorrador.nombre}</h3>
                      <div className="flex items-center mt-1 text-gray-400 text-sm">
                        <span className="mr-3">Cédula: {ahorrador.cedula}</span>
                        <span>Ingreso: {formatearFecha(ahorrador.fechaIngreso)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editarAhorrador(ahorradores.findIndex(a => a.id === ahorrador.id))}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        title="Editar ahorrador"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => eliminarAhorrador(ahorradores.findIndex(a => a.id === ahorrador.id))}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                        title="Eliminar ahorrador"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => mostrarGenerarVoucher(ahorrador)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                        title="Generar voucher"
                      >
                        <Printer size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Ahorro Total:</span>
                        <span className="text-xl font-semibold text-emerald-400">{formatearMoneda(ahorrador.ahorroTotal)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Interés Anual:</span>
                        <span className="text-xl font-semibold text-emerald-400">{formatearMoneda(interesAnual)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Saldo Total:</span>
                        <span className="text-xl font-semibold text-emerald-400">{formatearMoneda(saldoTotal)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="text-gray-400 mr-2 h-5 w-5" />
                        <span className="text-gray-400">Pagos Consecutivos:</span>
                      </div>
                      <span className="font-semibold">{ahorrador.pagosConsecutivos} {ahorrador.pagosConsecutivos === 1 ? 'mes' : 'meses'}</span>
                    </div>
                    
                    <div className={`bg-gray-900 p-3 rounded-lg flex items-center justify-between ${
                      ahorrador.incentivoPorFidelidad ? 'border border-emerald-600' : ''
                    }`}>
                      <div className="flex items-center">
                        <Award className={`mr-2 h-5 w-5 ${
                          ahorrador.incentivoPorFidelidad ? 'text-emerald-400' : 'text-gray-400'
                        }`} />
                        <span className="text-gray-400">Rentabilidad Anual:</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-semibold ${
                          ahorrador.incentivoPorFidelidad ? 'text-emerald-400' : 'text-white'
                        }`}>{tasaInteres}%</span>
                        {ahorrador.incentivoPorFidelidad && (
                          <span className="ml-2 text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full">
                            +1% Fidelidad
                          </span>
                        )}
                        {!ahorrador.incentivoPorFidelidad && (
                          <div className="flex flex-col items-end">
                            <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                              Sin bono
                            </span>
                            <button 
                              onClick={() => {
                                // Marcar todos los meses como pagados para recuperar el incentivo
                                const ahorradorActualizado = { ...ahorrador };
                                for (const mes of Object.keys(ahorradorActualizado.historialPagos)) {
                                  if (!ahorradorActualizado.historialPagos[mes].pagado) {
                                    ahorradorActualizado.historialPagos[mes].pagado = true;
                                    // Asignar un monto predeterminado si es 0
                                    if (ahorradorActualizado.historialPagos[mes].monto === 0) {
                                      // Buscar el último monto pagado
                                      const mesesOrdenados = Object.keys(ahorradorActualizado.historialPagos).sort();
                                      let ultimoMontoPagado = 100000; // Valor predeterminado
                                      
                                      for (const m of mesesOrdenados) {
                                        if (m !== mes && ahorradorActualizado.historialPagos[m].pagado) {
                                          ultimoMontoPagado = ahorradorActualizado.historialPagos[m].monto;
                                          break;
                                        }
                                      }
                                      
                                      ahorradorActualizado.historialPagos[mes].monto = ultimoMontoPagado;
                                    }
                                  }
                                }
                                
                                // Recalcular todo
                                calcularPagosConsecutivos(ahorradorActualizado);
                                recalcularAhorroTotal(ahorradorActualizado);
                                
                                // Actualizar lista de ahorradores
                                const nuevosAhorradores = [...ahorradores];
                                nuevosAhorradores[index] = ahorradorActualizado;
                                setAhorradores(nuevosAhorradores);
                              }}
                              className="mt-1 text-xs text-emerald-400 hover:text-emerald-300 underline"
                            >
                              Recuperar bono
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => alternarDetalles(ahorrador.id)}
                    className="w-full flex items-center justify-center p-2 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <span className="mr-2">
                      {detallesExpandidos[ahorrador.id] ? "Ocultar historial de pagos" : "Ver historial de pagos"}
                    </span>
                    {detallesExpandidos[ahorrador.id] ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  
                  {detallesExpandidos[ahorrador.id] && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {mesesOrdenados.map((mes) => (
                        <div 
                          key={mes} 
                          className={`p-3 rounded-lg border ${
                            ahorrador.historialPagos[mes].pagado ? 'bg-emerald-900/30 border-emerald-700' : 'bg-gray-900 border-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{formatearMes(mes)}</span>
                            <button
                              onClick={() => alternarEstadoPago(index, mes)}
                              className={`p-1 rounded-full ${
                                ahorrador.historialPagos[mes].pagado ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'
                              }`}
                            >
                              {ahorrador.historialPagos[mes].pagado ? (
                                <CheckCircle size={20} />
                              ) : (
                                <XCircle size={20} />
                              )}
                            </button>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign size={16} className="text-gray-500" />
                            </div>
                            <input
                              type="number"
                              value={ahorrador.historialPagos[mes].monto || 0}
                              onChange={(e) => actualizarMontoMes(index, mes, parseInt(e.target.value) || 0)}
                              className={`w-full p-2 pl-10 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                ahorrador.historialPagos[mes].pagado ? 'border-emerald-600' : 'border-gray-700 text-gray-400'
                              }`}
                              placeholder="0"
                              min="0"
                              disabled={!ahorrador.historialPagos[mes].pagado}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para mostrar el voucher */}
      {mostrarVoucher && ahorradorSeleccionado && (
        <GenerarVoucher 
          ahorrador={ahorradorSeleccionado} 
          onClose={() => setMostrarVoucher(false)} 
        />
      )}
    </div>
  );
}