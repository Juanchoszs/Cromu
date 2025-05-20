import React, { useState, useEffect } from "react";
import { Calendar, Edit3, Trash2, CheckCircle, XCircle, DollarSign, ChevronDown, ChevronUp, Clock, Award, User, RefreshCw, Printer } from "lucide-react";
import FormularioPrestamo from "./FromularioPrestamo";
import SuccessNotification from "./SuccessNotification";
import { motion, AnimatePresence } from "framer-motion";
import { Prestamo, EstadoPrestamo } from "./FromularioPrestamo";

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

export default function PrestamosCrud() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [detallesExpandidos, setDetallesExpandidos] = useState<Record<string, boolean>>({});
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para la notificación de éxito
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState("");
  const [prestamoConNotificacion, setPrestamoConNotificacion] = useState<string | null>(null);
  
  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('prestamos');
    if (savedData) {
      try {
        setPrestamos(JSON.parse(savedData));
      } catch (e) {
        console.error("Error al cargar datos guardados:", e);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambian los prestamos
  useEffect(() => {
    if (prestamos.length > 0) {
      localStorage.setItem('prestamos', JSON.stringify(prestamos));
    }
  }, [prestamos]);

  // Generar un ID único para cada préstamo
  const generarId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Calcular fecha de vencimiento
  const calcularFechaVencimiento = (fechaDesembolso: string, plazoMeses: number | null): string | undefined => {
    if (!fechaDesembolso || plazoMeses === null) return undefined;
    
    const fecha = new Date(fechaDesembolso);
    fecha.setMonth(fecha.getMonth() + plazoMeses);
    return fecha.toISOString().split('T')[0];
  };

  // Guardar préstamo (recibe el préstamo del formulario)
  const guardarPrestamo = (prestamoCompleto: Prestamo) => {
    // Asegurar que tenga ID
    if (!prestamoCompleto.id) {
      prestamoCompleto.id = generarId();
    }
    
    // Calcular fecha de vencimiento si no está definida
    if (!prestamoCompleto.fechaVencimiento && prestamoCompleto.plazoMeses !== null) {
      prestamoCompleto.fechaVencimiento = calcularFechaVencimiento(
        prestamoCompleto.fechaDesembolso, 
        prestamoCompleto.plazoMeses
      );
    }
    
    if (editandoIndex !== null) {
      // Editar existente
      const nuevosPrestamos = [...prestamos];
      nuevosPrestamos[editandoIndex] = prestamoCompleto;
      setPrestamos(nuevosPrestamos);
      
      // Mostrar notificación de éxito para edición
      setMensajeNotificacion("Préstamo actualizado exitosamente");
      setPrestamoConNotificacion(prestamoCompleto.id);
      setMostrarNotificacion(true);
    } else {
      // Agregar nuevo
      setPrestamos([...prestamos, prestamoCompleto]);
      
      // Mostrar notificación de éxito para nuevo préstamo
      setMensajeNotificacion("Préstamo agregado exitosamente");
      setPrestamoConNotificacion(prestamoCompleto.id);
      setMostrarNotificacion(true);
    }
    
    setMostrarFormulario(false);
    setEditandoIndex(null);
  };

  // Editar préstamo
  const editarPrestamo = (index: number) => {
    setEditandoIndex(index);
    setMostrarFormulario(true);
  };

  // Eliminar préstamo
  const eliminarPrestamo = (index: number) => {
    if (confirm("¿Estás seguro de eliminar este préstamo? Esta acción no se puede deshacer.")) {
      const nuevosPrestamos = prestamos.filter((_, i) => i !== index);
      setPrestamos(nuevosPrestamos);
    }
  };

  // Alternar detalles expandidos
  const alternarDetalles = (id: string) => {
    setDetallesExpandidos({
      ...detallesExpandidos,
      [id]: !detallesExpandidos[id]
    });
  };

  // Formatear moneda
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Filtrar préstamos según búsqueda
  const prestamosFiltrados = prestamos.filter(prestamo => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      prestamo.nombreDeudor.toLowerCase().includes(terminoBusqueda) ||
      prestamo.cedula.toLowerCase().includes(terminoBusqueda) ||
      prestamo.estado.toLowerCase().includes(terminoBusqueda)
    );
  });

  // Cambiar estado del préstamo
  const cambiarEstadoPrestamo = (index: number, nuevoEstado: EstadoPrestamo) => {
    const nuevosPrestamos = [...prestamos];
    nuevosPrestamos[index].estado = nuevoEstado;
    setPrestamos(nuevosPrestamos);
  };

  // Genera el arreglo de cuotas y subcuotas para mostrar el estado de pago
  function generarCuotas(prestamo: Prestamo) {
    const cuotas: {
      numero: number;
      pagada: boolean;
      subcuotas: { numero: string; pagada: boolean }[];
    }[] = [];

    if (!prestamo.plazoMeses) return cuotas;

    for (let i = 1; i <= prestamo.plazoMeses; i++) {
      // Busca si hay pagos para esta cuota
      const pagos = prestamo.historialPagos?.[i] || [];
      const pagada = pagos.some(p => p.tipo === "Capital" || p.tipo === "Mixto");

      // Si no está pagada, busca subcuotas (por ejemplo, 1.1, 1.2, etc.)
      let subcuotas: { numero: string; pagada: boolean }[] = [];
      if (!pagada) {
        // Busca subpagos en historialPagos con clave `${i}.1`, `${i}.2`, etc.
        let subIndex = 1;
        while (prestamo.historialPagos?.[`${i}.${subIndex}`]) {
          const subPagos = prestamo.historialPagos?.[`${i}.${subIndex}`] || [];
          const subPagada = subPagos.some(p => p.tipo === "Capital" || p.tipo === "Mixto");
          subcuotas.push({ numero: `${i}.${subIndex}`, pagada: subPagada });
          subIndex++;
        }
      }

      cuotas.push({ numero: i, pagada, subcuotas });
    }
    return cuotas;
  }

  // Agrega esta función dentro del componente PrestamosCrud
  const togglePagoCuota = (prestamoId: string, cuotaKey: string) => {
    setPrestamos(prevPrestamos =>
      prevPrestamos.map(p => {
        if (p.id !== prestamoId) return p;
        const historial = { ...(p.historialPagos || {}) };
        const pagos = historial[cuotaKey] || [];
        const yaPagada = pagos.some(pg => pg.tipo === "Capital" || pg.tipo === "Mixto");

        if (yaPagada) {
          // Quitar el pago principal o subcuota
          historial[cuotaKey] = pagos.filter(pg => !(pg.tipo === "Capital" || pg.tipo === "Mixto"));

          // Si es cuota principal (ej: "1"), al desmarcar, crear solo la subcuota .1 si no existe
          if (!cuotaKey.includes(".")) {
            const subKey = `${cuotaKey}.1`;
            if (!historial[subKey]) {
              historial[subKey] = [];
            }
          }
        } else {
          // Marcar como pagada (sea cuota o subcuota)
          historial[cuotaKey] = [...pagos, { tipo: "Capital", fecha: new Date().toISOString() }];
        }
        return { ...p, historialPagos: historial };
      })
    );
  };

  function calcularEstadoPorCuotas(prestamo: Prestamo) {
    if (prestamo.estado === "Refinanciado") return "Refinanciado";
    const cuotas = generarCuotas(prestamo);
    if (cuotas.length === 0) return "Activo";
    const todasPagadas = cuotas.every(c => c.pagada || c.subcuotas.some(s => s.pagada));
    if (todasPagadas) return "Pagado";
    const algunaSubPendiente = cuotas.some(c => !c.pagada && c.subcuotas.some(s => !s.pagada));
    if (algunaSubPendiente) return "Vencido";
    return "Activo";
  }

  // Actualizar el estado automáticamente según las cuotas
  useEffect(() => {
    setPrestamos(prevPrestamos =>
      prevPrestamos.map(p => {
        const nuevoEstado = calcularEstadoPorCuotas(p);
        // Solo actualiza si el estado calculado es diferente y no es "Refinanciado"
        if (p.estado !== "Refinanciado" && p.estado !== nuevoEstado) {
          return { ...p, estado: nuevoEstado };
        }
        return p;
      })
    );
  }, [prestamos.map(p => p.historialPagos)]);

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence>
        {mostrarNotificacion && (
          <SuccessNotification
            visible={mostrarNotificacion}
            message={mensajeNotificacion}
            onClose={() => setMostrarNotificacion(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 md:mb-0 flex items-center">
            <DollarSign className="mr-2 h-6 w-6 text-emerald-400" />
            Gestión de Préstamos
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar préstamos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
            <button
              onClick={() => {
                setEditandoIndex(null);
                setMostrarFormulario(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Préstamo
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mostrarFormulario && (
            <FormularioPrestamo
              prestamo={editandoIndex !== null ? prestamos[editandoIndex] : undefined}
              onGuardar={guardarPrestamo}
              onCancelar={() => {
                setMostrarFormulario(false);
                setEditandoIndex(null);
              }}
            />
          )}
        </AnimatePresence>

        {prestamosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-700 rounded-lg p-8 text-center"
          >
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-300">No hay préstamos registrados</h3>
              <p className="text-gray-400 mt-2">
                {busqueda ? "No se encontraron préstamos que coincidan con tu búsqueda." : "Comienza agregando un nuevo préstamo con el botón 'Nuevo Préstamo'."}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {prestamosFiltrados.map((prestamo, index) => (
              <motion.div
                key={prestamo.id}
                variants={slideUp}
                className={`bg-gray-700 rounded-lg shadow-md overflow-hidden border ${
                  prestamoConNotificacion === prestamo.id
                    ? "border-emerald-500"
                    : "border-gray-600"
                } transition-all duration-300`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {prestamo.nombreDeudor}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        prestamo.estado === "Activo"
                          ? "bg-blue-100 text-blue-800"
                          : prestamo.estado === "Pagado"
                          ? "bg-emerald-100 text-emerald-800"
                          : prestamo.estado === "Vencido"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {prestamo.estado}
                    </span>
                  </div>

                  <div className="text-gray-300 text-sm mb-3">
                    <div className="flex items-center mb-1">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span>CC: {prestamo.cedula}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <DollarSign className="h-4 w-4 mr-2 text-emerald-400" />
                      <span>{formatearMoneda(prestamo.monto)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{new Date(prestamo.fechaDesembolso).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => alternarDetalles(prestamo.id)}
                      className="text-sm text-gray-300 hover:text-white flex items-center"
                    >
                      {detallesExpandidos[prestamo.id] ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Ocultar detalles
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Ver detalles
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {detallesExpandidos[prestamo.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-600 pt-3 mt-2 text-sm text-gray-300">
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-gray-400 mb-1">Teléfono:</p>
                              <p>{prestamo.telefono}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Dirección:</p>
                              <p>{prestamo.direccion}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Plazo:</p>
                              <p>{prestamo.plazoMeses !== null ? `${prestamo.plazoMeses} meses` : "Indefinido"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Tasa:</p>
                              <p>{prestamo.tasaInteres}% mensual</p>
                            </div>
                            {prestamo.fechaVencimiento && (
                              <div className="col-span-2">
                                <p className="text-gray-400 mb-1">Vencimiento:</p>
                                <p>{new Date(prestamo.fechaVencimiento).toLocaleDateString('es-ES')}</p>
                              </div>
                            )}
                            {prestamo.observaciones && (
                              <div className="col-span-2">
                                <p className="text-gray-400 mb-1">Observaciones:</p>
                                <p className="italic">{prestamo.observaciones}</p>
                              </div>
                            )}
                          </div>

                          {/* Cuotas y subcuotas */}
                          {prestamo.plazoMeses && (
                            <div className="mb-3">
                              <p className="text-gray-400 mb-2 font-semibold">Estado de cuotas:</p>
                              <div className="flex flex-wrap gap-2">
                                {generarCuotas(prestamo).map(cuota => (
                                  <div key={cuota.numero} className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => togglePagoCuota(prestamo.id, `${cuota.numero}`)}
                                      className="focus:outline-none"
                                      title={`Cuota ${cuota.numero} ${cuota.pagada ? "Pagada" : "No pagada"}`}
                                    >
                                      <span
                                        className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-1
                                          ${cuota.pagada ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}
                                        `}
                                      >
                                        {cuota.pagada ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                      </span>
                                    </button>
                                    <span className="mr-2">{cuota.numero}</span>
                                    {/* Subcuotas */}
                                    {!cuota.pagada && cuota.subcuotas.map(sub => (
                                      <span key={sub.numero} className="flex items-center ml-1">
                                        <button
                                          type="button"
                                          onClick={() => togglePagoCuota(prestamo.id, sub.numero)}
                                          className="focus:outline-none"
                                          title={`Subcuota ${sub.numero} ${sub.pagada ? "Pagada" : "Pendiente"}`}
                                        >
                                          <span
                                            className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-1
                                              ${sub.pagada ? "bg-emerald-400 text-white" : "bg-yellow-500 text-white"}
                                            `}
                                          >
                                            {sub.pagada ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                          </span>
                                        </button>
                                        <span className="mr-2">{sub.numero}</span>
                                      </span>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                <CheckCircle className="inline w-4 h-4 text-emerald-400" /> Pagada &nbsp;
                                <XCircle className="inline w-4 h-4 text-red-400" /> No pagada &nbsp;
                                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full align-middle"></span> Subcuota pendiente
                              </p>
                            </div>
                          )}

                          {/* Opciones de estado */}
                          <div className="mb-3">
                            <p className="text-gray-400 mb-2">Cambiar estado:</p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => cambiarEstadoPrestamo(index, "Activo")}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  prestamo.estado === "Activo"
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                }`}
                              >
                                Activo
                              </button>
                              <button
                                onClick={() => cambiarEstadoPrestamo(index, "Pagado")}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  prestamo.estado === "Pagado"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                }`}
                              >
                                Pagado
                              </button>
                              <button
                                onClick={() => cambiarEstadoPrestamo(index, "Vencido")}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  prestamo.estado === "Vencido"
                                    ? "bg-red-600 text-white"
                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                }`}
                              >
                                Vencido
                              </button>
                              <button
                                onClick={() => cambiarEstadoPrestamo(index, "Refinanciado")}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  prestamo.estado === "Refinanciado"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                }`}
                              >
                                Refinanciado
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-gray-800 px-4 py-3 flex justify-between">
                  <button
                    onClick={() => editarPrestamo(index)}
                    className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarPrestamo(index)}
                    className="text-red-400 hover:text-red-300 flex items-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}