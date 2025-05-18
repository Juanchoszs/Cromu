import React, { useState, useEffect } from "react";
import { Calendar, Edit3, Trash2, CheckCircle, XCircle, DollarSign, ChevronDown, ChevronUp, Clock, Award, User, RefreshCw, Printer } from "lucide-react";
import FormularioAhorrador from "./FormularioAhorrador";
import GenerarVoucher from "./GenerarVoucher";
import SuccessNotification from "./SuccessNotification";
import { motion, AnimatePresence } from "framer-motion";

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

// Variantes de animación
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AhorradoresCrud() {
  const [ahorradores, setAhorradores] = useState<Ahorrador[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [detallesExpandidos, setDetallesExpandidos] = useState<Record<string, boolean>>({});
  const [busqueda, setBusqueda] = useState("");
  const [mostrarInfoFidelidad, setMostrarInfoFidelidad] = useState(false);
  const [mostrarVoucher, setMostrarVoucher] = useState(false);
  const [ahorradorSeleccionado, setAhorradorSeleccionado] = useState<Ahorrador | null>(null);
  
  // Estados para la notificación de éxito
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState("");
  const [ahorradorConNotificacion, setAhorradorConNotificacion] = useState<string | null>(null);
  
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
      
      // Mostrar notificación de éxito para edición
      setMensajeNotificacion("Ahorrador actualizado exitosamente");
      setAhorradorConNotificacion(ahorradorCompleto.id);
      setMostrarNotificacion(true);
    } else {
      // Agregar nuevo
      setAhorradores([...ahorradores, ahorradorCompleto]);
      
      // Mostrar notificación de éxito para nuevo ahorrador
      setMensajeNotificacion("Ahorrador agregado exitosamente");
      setAhorradorConNotificacion(ahorradorCompleto.id);
      setMostrarNotificacion(true);
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

  // Calcular rentabilidad anual
  const calcularRentabilidadAnual = (ahorrador: Ahorrador) => {
    const tasaBase = 6; // 6% anual base
    const tasaFidelidad = ahorrador.incentivoPorFidelidad ? 1 : 0; // 1% adicional por fidelidad
    return tasaBase + tasaFidelidad;
  };

  // Calcular interés y saldo acumulado
  const calcularInteresYSaldo = (ahorrador: Ahorrador) => {
    const rentabilidadAnual = calcularRentabilidadAnual(ahorrador);
    const interes = ahorrador.ahorroTotal * (rentabilidadAnual / 100);
    const saldoTotal = ahorrador.ahorroTotal + interes;
    return { interes, saldoTotal };
  };

  // Mostrar formulario para generar voucher
  const mostrarGenerarVoucher = (ahorrador: Ahorrador) => {
    setAhorradorSeleccionado(ahorrador);
    setMostrarVoucher(true);
  };

  // Filtrar ahorradores según búsqueda
  const ahorradoresToShow = ahorradores.filter(ahorrador => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      ahorrador.nombre.toLowerCase().includes(terminoBusqueda) ||
      ahorrador.cedula.toLowerCase().includes(terminoBusqueda) ||
      ahorrador.email.toLowerCase().includes(terminoBusqueda)
    );
  });

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-6 bg-gray-900 rounded-lg shadow-lg"
    >
      <motion.div 
        variants={slideUp}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-2xl font-bold text-white">Gestión de Ahorradores</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setMostrarFormulario(true);
            setEditandoIndex(null);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center"
        >
          <User className="mr-2 h-5 w-5" />
          Nuevo Ahorrador
        </motion.button>
      </motion.div>

      <motion.div 
        variants={slideUp}
        className="mb-6"
      >
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
      </motion.div>

      <AnimatePresence>
        {mostrarFormulario && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormularioAhorrador
              ahorrador={editandoIndex !== null ? ahorradores[editandoIndex] : undefined}
              onGuardar={guardarAhorrador}
              onCancelar={() => {
                setMostrarFormulario(false);
                setEditandoIndex(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 gap-6"
      >
        {ahorradoresToShow.length === 0 ? (
          <motion.div 
            variants={slideUp}
            className="bg-gray-800 rounded-lg p-6 text-center text-gray-400"
          >
            {busqueda ? "No se encontraron ahorradores que coincidan con la búsqueda." : "No hay ahorradores registrados. Agrega uno nuevo para comenzar."}
          </motion.div>
        ) : (
          ahorradoresToShow.map((ahorrador, index) => {
            const { interes, saldoTotal } = calcularInteresYSaldo(ahorrador);
            const expandido = detallesExpandidos[ahorrador.id] || false;
            
            return (
              <motion.div
                key={ahorrador.id}
                variants={slideUp}
                layout
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg relative"
              >
                {/* Notificación de éxito dentro de la tarjeta */}
                {ahorradorConNotificacion === ahorrador.id && (
                  <SuccessNotification
                    message={mensajeNotificacion}
                    visible={mostrarNotificacion}
                    onClose={() => {
                      setMostrarNotificacion(false);
                      setAhorradorConNotificacion(null);
                    }}
                    position="card"
                    variant="default"
                  />
                )}
                
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h2 className="text-xl font-semibold text-white">{ahorrador.nombre}</h2>
                      {ahorrador.incentivoPorFidelidad && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="ml-2 bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full text-xs flex items-center"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          Fidelidad
                        </motion.div>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm mb-2">Cédula: {ahorrador.cedula}</div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-emerald-400">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{formatearMoneda(ahorrador.ahorroTotal)}</span>
                      </div>
                      <div className="flex items-center text-blue-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Ingreso: {formatearFecha(ahorrador.fechaIngreso)}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{ahorrador.pagosConsecutivos} pagos consecutivos</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex mt-4 md:mt-0 space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => editarAhorrador(index)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => eliminarAhorrador(index)}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => mostrarGenerarVoucher(ahorrador)}
                      className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                    >
                      <Printer className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => alternarDetalles(ahorrador.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {expandido ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </motion.button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandido && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-700"
                    >
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-white mb-2">Información de Contacto</h3>
                            <div className="space-y-2 text-gray-300">
                              <p><span className="text-gray-500">Email:</span> {ahorrador.email}</p>
                              <p><span className="text-gray-500">Teléfono:</span> {ahorrador.telefono}</p>
                              <p><span className="text-gray-500">Dirección:</span> {ahorrador.direccion}</p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-white mb-2">Resumen Financiero</h3>
                            <div className="space-y-2">
                              <p className="text-gray-300">
                                <span className="text-gray-500">Ahorro Total:</span> {formatearMoneda(ahorrador.ahorroTotal)}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-500">Rentabilidad Anual:</span> {calcularRentabilidadAnual(ahorrador)}%
                                {!ahorrador.incentivoPorFidelidad && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => restaurarIncentivo(index)}
                                    className="ml-2 text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Restaurar
                                  </motion.button>
                                )}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-500">Interés Generado:</span> {formatearMoneda(interes)}
                              </p>
                              <p className="text-emerald-400 font-medium">
                                <span className="text-gray-500">Saldo Total:</span> {formatearMoneda(saldoTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-3">Historial de Pagos</h3>
                          <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                          >
                            {Object.keys(ahorrador.historialPagos)
                              .sort()
                              .map((mes) => (
                                <motion.div
                                  key={mes}
                                  variants={slideRight}
                                  className={`p-3 rounded-lg border ${
                                    ahorrador.historialPagos[mes].pagado
                                      ? 'bg-emerald-900/30 border-emerald-700'
                                      : 'bg-gray-800 border-gray-700'
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-300">{formatearMes(mes)}</span>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => alternarEstadoPago(index, mes)}
                                      className={`p-1 rounded-full ${
                                        ahorrador.historialPagos[mes].pagado
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-gray-700 text-gray-400'
                                      }`}
                                    >
                                      {ahorrador.historialPagos[mes].pagado ? (
                                        <CheckCircle className="h-5 w-5" />
                                      ) : (
                                        <XCircle className="h-5 w-5" />
                                      )}
                                    </motion.button>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <DollarSign className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <input
                                      type="number"
                                      value={ahorrador.historialPagos[mes].monto || 0}
                                      onChange={(e) => actualizarMontoMes(index, mes, parseInt(e.target.value) || 0)}
                                      className={`w-full p-2 pl-10 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        ahorrador.historialPagos[mes].pagado
                                          ? 'border-emerald-600 text-white'
                                          : 'border-gray-700 text-gray-400'
                                      }`}
                                      placeholder="0"
                                      min="0"
                                      disabled={!ahorrador.historialPagos[mes].pagado}
                                    />
                                  </div>
                                </motion.div>
                              ))}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>

      <AnimatePresence>
        {mostrarVoucher && ahorradorSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
            >
              <GenerarVoucher
                ahorrador={ahorradorSeleccionado}
                onClose={() => setMostrarVoucher(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}