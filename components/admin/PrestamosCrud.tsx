import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Edit3, Trash2, CheckCircle, XCircle, DollarSign, ChevronDown, ChevronUp, Clock, Award, User, RefreshCw, Printer } from "lucide-react";
import FormularioPrestamo from "./FromularioPrestamo";
import GenerarVoucherPrestamos from "./GenerarVoucherPrestamos";
import { Prestamo, EstadoPrestamo } from "./FromularioPrestamo";
import SuccessNotification from "./SuccessNotification";

export default function PrestamosCrud() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [detallesExpandidos, setDetallesExpandidos] = useState<Record<string, boolean>>({});
  const [busqueda, setBusqueda] = useState("");
  const [mostrarVoucher, setMostrarVoucher] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  
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

  // Función para alternar el estado de pago de una cuota
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
          historial[cuotaKey] = [...pagos, { tipo: "Capital", fecha: new Date().toISOString(), monto: p.monto }];
        }
        return { ...p, historialPagos: historial };
      })
    );
  };

  // Calcular estado del préstamo basado en las cuotas pagadas
  function calcularEstadoPorCuotas(prestamo: Prestamo) {
    if (prestamo.estado === "Refinanciado") return "Refinanciado";
    const cuotas = generarCuotas(prestamo);
    
    // Si todas las cuotas están pagadas, el préstamo está pagado
    if (cuotas.every(c => c.pagada)) return "Pagado";
    
    // Verificar si hay cuotas vencidas
    const fechaActual = new Date();
    const fechaDesembolso = new Date(prestamo.fechaDesembolso);
    const mesesTranscurridos = Math.floor(
      (fechaActual.getTime() - fechaDesembolso.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    
    // Si hay cuotas no pagadas que ya deberían estar pagadas, el préstamo está vencido
    if (cuotas.some((c, i) => i < mesesTranscurridos && !c.pagada)) return "Vencido";
    
    // En cualquier otro caso, el préstamo está activo
    return "Activo";
  }

  // Calcular cuota fija aproximada (redondeada a miles)
  const calcularCuotaFijaAproximada = (prestamo: Prestamo) => {
    const monto = prestamo.monto;
    const tasaMensual = prestamo.tasaInteres / 100;
    const plazo = prestamo.plazoMeses;
    
    // Fórmula de cuota fija: P = (monto * tasa) / (1 - (1 + tasa)^-plazo)
    const cuotaExacta = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
    
    // Aproximar a miles superiores
    return Math.ceil(cuotaExacta / 1000) * 1000;
  };

  // Cerrar el voucher
  const cerrarVoucher = () => {
    setMostrarVoucher(false);
    setPrestamoSeleccionado(null);
  };

  // Mostrar el voucher para un préstamo específico
  const mostrarVoucherPrestamo = (prestamo: Prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setMostrarVoucher(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Préstamos</h2>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setEditandoIndex(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <DollarSign className="mr-1 h-5 w-5" />
          Nuevo Préstamo
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Formulario de préstamo */}
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

      {/* Lista de préstamos */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Préstamos Registrados</h3>
        </div>

        {prestamosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            {busqueda ? "No se encontraron préstamos que coincidan con la búsqueda." : "No hay préstamos registrados."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Deudor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cuota Fija</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plazo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {prestamosFiltrados.map((prestamo, index) => {
                  const estadoActual = calcularEstadoPorCuotas(prestamo);
                  const cuotaFijaAproximada = calcularCuotaFijaAproximada(prestamo);
                  
                  return (
                    <React.Fragment key={prestamo.id}>
                      <tr className="hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-300" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{prestamo.nombreDeudor}</div>
                              <div className="text-sm text-gray-400">CC: {prestamo.cedula}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white">{formatearMoneda(prestamo.monto)}</div>
                          <div className="text-xs text-gray-400">{prestamo.tasaInteres}% mensual</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white">{formatearMoneda(cuotaFijaAproximada)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white">{prestamo.plazoMeses} meses</div>
                          <div className="text-xs text-gray-400">
                            {new Date(prestamo.fechaDesembolso).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            estadoActual === "Activo" ? "bg-blue-100 text-blue-800" :
                            estadoActual === "Pagado" ? "bg-green-100 text-green-800" :
                            estadoActual === "Vencido" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {estadoActual}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editarPrestamo(prestamosFiltrados.indexOf(prestamo))}
                              className="text-blue-400 hover:text-blue-300"
                              title="Editar préstamo"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => eliminarPrestamo(prestamosFiltrados.indexOf(prestamo))}
                              className="text-red-400 hover:text-red-300"
                              title="Eliminar préstamo"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => mostrarVoucherPrestamo(prestamo)}
                              className="text-amber-400 hover:text-amber-300"
                              title="Generar voucher"
                            >
                              <Printer className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => alternarDetalles(prestamo.id)}
                              className="text-gray-400 hover:text-gray-300"
                              title="Ver detalles"
                            >
                              {detallesExpandidos[prestamo.id] ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Detalles expandibles */}
                      {detallesExpandidos[prestamo.id] && (
                        <tr className="bg-gray-750">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="bg-gray-700 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-1">Información de Contacto</h4>
                                  <p className="text-sm text-white">{prestamo.telefono || "No registrado"}</p>
                                  <p className="text-sm text-white">{prestamo.direccion || "No registrada"}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-1">Fechas</h4>
                                  <p className="text-sm text-white">
                                    <span className="text-gray-400">Desembolso:</span> {new Date(prestamo.fechaDesembolso).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-white">
                                    <span className="text-gray-400">Vencimiento:</span> {prestamo.fechaVencimiento ? new Date(prestamo.fechaVencimiento).toLocaleDateString() : "No definida"}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-1">Garantía</h4>
                                  <p className="text-sm text-white">{prestamo.garantia || "Sin garantía registrada"}</p>
                                </div>
                              </div>
                              
                              {/* Estado de pagos */}
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Estado de Pagos</h4>
                                <div className="flex flex-wrap gap-2">
                                  {generarCuotas(prestamo).map((cuota) => (
                                    <div key={cuota.numero} className="flex flex-col">
                                      <button
                                        onClick={() => togglePagoCuota(prestamo.id, cuota.numero.toString())}
                                        className={`w-10 h-10 rounded-md flex items-center justify-center ${
                                          cuota.pagada
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-gray-600 hover:bg-gray-500"
                                        }`}
                                        title={`Cuota ${cuota.numero} - ${cuota.pagada ? "Pagada" : "Pendiente"}`}
                                      >
                                        {cuota.pagada ? (
                                          <CheckCircle className="h-5 w-5 text-white" />
                                        ) : (
                                          <span className="text-white">{cuota.numero}</span>
                                        )}
                                      </button>
                                      
                                      {/* Subcuotas */}
                                      {cuota.subcuotas.length > 0 && (
                                        <div className="flex mt-1 space-x-1">
                                          {cuota.subcuotas.map((subcuota) => (
                                            <button
                                              key={subcuota.numero}
                                              onClick={() => togglePagoCuota(prestamo.id, subcuota.numero)}
                                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                                                subcuota.pagada
                                                  ? "bg-green-600 hover:bg-green-700"
                                                  : "bg-gray-600 hover:bg-gray-500"
                                              }`}
                                              title={`Subcuota ${subcuota.numero} - ${subcuota.pagada ? "Pagada" : "Pendiente"}`}
                                            >
                                              {subcuota.pagada ? "✓" : subcuota.numero.split(".")[1]}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Cambiar estado manualmente */}
                              <div className="mt-4 flex space-x-2">
                                <button
                                  onClick={() => cambiarEstadoPrestamo(prestamosFiltrados.indexOf(prestamo), "Activo")}
                                  className={`px-3 py-1 rounded-md text-xs ${
                                    prestamo.estado === "Activo"
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-600 text-gray-200 hover:bg-blue-600"
                                  }`}
                                >
                                  Activo
                                </button>
                                <button
                                  onClick={() => cambiarEstadoPrestamo(prestamosFiltrados.indexOf(prestamo), "Pagado")}
                                  className={`px-3 py-1 rounded-md text-xs ${
                                    prestamo.estado === "Pagado"
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-600 text-gray-200 hover:bg-green-600"
                                  }`}
                                >
                                  Pagado
                                </button>
                                <button
                                  onClick={() => cambiarEstadoPrestamo(prestamosFiltrados.indexOf(prestamo), "Vencido")}
                                  className={`px-3 py-1 rounded-md text-xs ${
                                    prestamo.estado === "Vencido"
                                      ? "bg-red-600 text-white"
                                      : "bg-gray-600 text-gray-200 hover:bg-red-600"
                                  }`}
                                >
                                  Vencido
                                </button>
                                <button
                                  onClick={() => cambiarEstadoPrestamo(prestamosFiltrados.indexOf(prestamo), "Refinanciado")}
                                  className={`px-3 py-1 rounded-md text-xs ${
                                    prestamo.estado === "Refinanciado"
                                      ? "bg-yellow-600 text-white"
                                      : "bg-gray-600 text-gray-200 hover:bg-yellow-600"
                                  }`}
                                >
                                  Refinanciado
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notificación de éxito */}
      <AnimatePresence>
        {mostrarNotificacion && (
          <SuccessNotification
            visible={mostrarNotificacion}
            message={mensajeNotificacion}
            onClose={() => setMostrarNotificacion(false)}
          />
        )}
      </AnimatePresence>

      {/* Voucher de préstamo */}
      <AnimatePresence>
        {mostrarVoucher && prestamoSeleccionado && (
          <GenerarVoucherPrestamos
            prestamo={prestamoSeleccionado}
            onClose={cerrarVoucher}
            
          />
        )}
      </AnimatePresence>
    </div>
  );
}