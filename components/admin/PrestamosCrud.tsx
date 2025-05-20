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
  
  // Cargar datos de la API al iniciar
  useEffect(() => {
    const cargarPrestamos = async () => {
      try {
        const res = await fetch('/api/prestamos');
        if (!res.ok) {
          throw new Error('Error al cargar préstamos');
        }
        const data = await res.json();
        setPrestamos(data);
      } catch (error) {
        console.error("Error al cargar préstamos:", error);
        // Intentar cargar desde localStorage como respaldo
        const savedData = localStorage.getItem('prestamos');
        if (savedData) {
          try {
            setPrestamos(JSON.parse(savedData));
          } catch (e) {
            console.error("Error al cargar datos guardados:", e);
          }
        }
      }
    };
    
    cargarPrestamos();
  }, []);
  
  // Guardar préstamo (recibe el préstamo del formulario)
  const guardarPrestamo = async (prestamoCompleto: Prestamo) => {
    try {
      // Asegurar que tenga ID
      if (!prestamoCompleto.id) {
        prestamoCompleto.id = crypto.randomUUID();
      }
      
      // Calcular fecha de vencimiento si no está definida
      if (!prestamoCompleto.fechaVencimiento && prestamoCompleto.plazoMeses !== null) {
        const fechaDesembolso = new Date(prestamoCompleto.fechaDesembolso);
        fechaDesembolso.setMonth(fechaDesembolso.getMonth() + prestamoCompleto.plazoMeses);
        prestamoCompleto.fechaVencimiento = fechaDesembolso.toISOString().split('T')[0];
      }
      
      // Guardar en la API
      const method = editandoIndex !== null ? 'PUT' : 'POST';
      const url = editandoIndex !== null 
        ? `/api/prestamos?id=${prestamoCompleto.id}` 
        : '/api/prestamos';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prestamoCompleto),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar el préstamo');
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
      
      // Actualizar localStorage como respaldo
      localStorage.setItem('prestamos', JSON.stringify([...prestamos, prestamoCompleto]));
      
      setMostrarFormulario(false);
      setEditandoIndex(null);
    } catch (error: any) {
      console.error("Error al guardar préstamo:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Eliminar préstamo
  const eliminarPrestamo = async (index: number) => {
    if (confirm("¿Estás seguro de eliminar este préstamo? Esta acción no se puede deshacer.")) {
      try {
        const prestamoId = prestamos[index].id;
        
        // Eliminar de la API
        const res = await fetch(`/api/prestamos?id=${prestamoId}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al eliminar el préstamo');
        }
        
        // Actualizar estado local
        const nuevosPrestamos = prestamos.filter((_, i) => i !== index);
        setPrestamos(nuevosPrestamos);
        
        // Actualizar localStorage como respaldo
        localStorage.setItem('prestamos', JSON.stringify(nuevosPrestamos));
        
      } catch (error: any) {
        console.error("Error al eliminar préstamo:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Editar préstamo
  const editarPrestamo = (index: number) => {
    setEditandoIndex(index);
    setMostrarFormulario(true);
  };

  // Eliminar préstamo
  const handleEliminarPrestamo = (index: number) => {
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

    // Crear cuotas basadas en el plazo
    for (let i = 1; i <= prestamo.plazoMeses; i++) {
      // Verificar si hay pagos registrados para este mes
      const pagos = prestamo.historialPagos?.[i] || [];
      const pagada = pagos.length > 0;

      cuotas.push({
        numero: i,
        pagada,
        subcuotas: []
      });
    }

    return cuotas;
  }

  // Generar voucher para un préstamo
  const generarVoucher = (prestamo: Prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setMostrarVoucher(true);
  };

  // Cerrar el generador de voucher
  const cerrarVoucher = () => {
    setMostrarVoucher(false);
    setPrestamoSeleccionado(null);
  };

  // Obtener color según estado del préstamo
  const obtenerColorEstado = (estado: EstadoPrestamo) => {
    switch (estado) {
      case "Activo":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "Pagado":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Vencido":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Refinanciado":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestión de Préstamos</h2>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setEditandoIndex(null);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center"
        >
          <DollarSign className="mr-2 h-5 w-5" />
          Nuevo Préstamo
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista de préstamos */}
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

      {/* Mostrar voucher si está activo */}
      {mostrarVoucher && prestamoSeleccionado && (
        <GenerarVoucherPrestamos
          prestamo={prestamoSeleccionado}
          onClose={cerrarVoucher}
        />
      )}

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

      {/* Tabla de préstamos */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Deudor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Plazo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {prestamosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    No se encontraron préstamos
                  </td>
                </tr>
              ) : (
                prestamosFiltrados.map((prestamo, index) => (
                  <React.Fragment key={prestamo.id}>
                    <tr className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-emerald-700 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{prestamo.nombreDeudor}</div>
                            <div className="text-sm text-gray-400">CC: {prestamo.cedula}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{formatearMoneda(prestamo.monto)}</div>
                        <div className="text-sm text-gray-400">{prestamo.tasaInteres}% mensual</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{prestamo.plazoMeses} meses</div>
                        <div className="text-sm text-gray-400">
                          Desembolso: {new Date(prestamo.fechaDesembolso).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${obtenerColorEstado(prestamo.estado)}`}>
                          {prestamo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => editarPrestamo(index)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Editar préstamo"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => eliminarPrestamo(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Eliminar préstamo"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => alternarDetalles(prestamo.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Ver detalles"
                          >
                            {detallesExpandidos[prestamo.id] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => generarVoucher(prestamo)}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Generar voucher"
                          >
                            <Printer className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {detallesExpandidos[prestamo.id] && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-750">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-700 p-3 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                  <User className="h-4 w-4 mr-1 text-blue-400" />
                                  Información de Contacto
                                </h4>
                                <div className="text-sm">
                                  <p className="text-gray-300">
                                    <span className="text-gray-400">Teléfono:</span> {prestamo.telefono}
                                  </p>
                                  <p className="text-gray-300">
                                    <span className="text-gray-400">Dirección:</span> {prestamo.direccion}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-gray-700 p-3 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-emerald-400" />
                                  Fechas Importantes
                                </h4>
                                <div className="text-sm">
                                  <p className="text-gray-300">
                                    <span className="text-gray-400">Desembolso:</span>{" "}
                                    {new Date(prestamo.fechaDesembolso).toLocaleDateString()}
                                  </p>
                                  <p className="text-gray-300">
                                    <span className="text-gray-400">Vencimiento:</span>{" "}
                                    {prestamo.fechaVencimiento
                                      ? new Date(prestamo.fechaVencimiento).toLocaleDateString()
                                      : "No definido"}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-gray-700 p-3 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 text-yellow-400" />
                                  Detalles Financieros
                                </h4>
                                <div className="text-sm">
                                  <p className="text-gray-300">
                                    <span className="text-gray-400">Monto:</span> {formatearMoneda(prestamo.monto)}
                                  </p>
                                  <p className="text-gray-300">
                                    <span className="text-gray-400">Tasa:</span> {prestamo.tasaInteres}% mensual
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Garantía */}
                            {prestamo.garantia && (
                              <div className="bg-gray-700 p-3 rounded-lg mb-4">
                                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                  <Award className="h-4 w-4 mr-1 text-purple-400" />
                                  Garantía
                                </h4>
                                <p className="text-sm text-gray-300">{prestamo.garantia}</p>
                              </div>
                            )}

                            {/* Estado de cuotas */}
                            <div className="bg-gray-700 p-3 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-blue-400" />
                                Estado de Cuotas
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {generarCuotas(prestamo).map((cuota) => (
                                  <div
                                    key={`cuota-${cuota.numero}`}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                      cuota.pagada
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-600 text-gray-300"
                                    }`}
                                    title={`Cuota ${cuota.numero} - ${cuota.pagada ? "Pagada" : "Pendiente"}`}
                                  >
                                    {cuota.numero}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Acciones adicionales */}
                            <div className="mt-4 flex justify-end space-x-2">
                              <button
                                onClick={() => cambiarEstadoPrestamo(index, "Pagado")}
                                className={`px-3 py-1 rounded-md text-xs font-medium ${
                                  prestamo.estado === "Pagado"
                                    ? "bg-blue-700 text-blue-200 cursor-default"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                                disabled={prestamo.estado === "Pagado"}
                              >
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                Marcar como Pagado
                              </button>
                              <button
                                onClick={() => cambiarEstadoPrestamo(index, "Vencido")}
                                className={`px-3 py-1 rounded-md text-xs font-medium ${
                                  prestamo.estado === "Vencido"
                                    ? "bg-red-700 text-red-200 cursor-default"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                                disabled={prestamo.estado === "Vencido"}
                              >
                                <XCircle className="h-3 w-3 inline mr-1" />
                                Marcar como Vencido
                              </button>
                              <button
                                onClick={() => cambiarEstadoPrestamo(index, "Refinanciado")}
                                className={`px-3 py-1 rounded-md text-xs font-medium ${
                                  prestamo.estado === "Refinanciado"
                                    ? "bg-purple-700 text-purple-200 cursor-default"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                                disabled={prestamo.estado === "Refinanciado"}
                              >
                                <RefreshCw className="h-3 w-3 inline mr-1" />
                                Refinanciar
                              </button>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}