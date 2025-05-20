import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Edit3, Trash2, CheckCircle, XCircle, DollarSign, ChevronDown, ChevronUp, Clock, Award, User, RefreshCw, Printer } from "lucide-react";
import FormularioPrestamo from "./FromularioPrestamo";
import GenerarVoucherPrestamos from "./GenerarVoucherPrestamos";
import { Prestamo, EstadoPrestamo } from "./FromularioPrestamo";
import SuccessNotification from "./SuccessNotification";

type EstadoCuota = "pendiente" | "pagado" | "aplazado";

interface SubCuota {
  numero: string; // Ejemplo: "3.1"
  estado: EstadoCuota;
  monto: number;
}

interface CuotaPago {
  estado: EstadoCuota;
  monto: number;
  subcuotas: SubCuota[];
}

interface HistorialPagos {
  [numero: string]: CuotaPago;
}

function calcularCuotaFija(monto: number, plazoMeses: number, tasaInteres: number) {
  // Fórmula de cuota fija (sistema francés)
  const i = tasaInteres / 100;
  const cuota = monto * (i * Math.pow(1 + i, plazoMeses)) / (Math.pow(1 + i, plazoMeses) - 1);
  // Aproximar a miles
  return Math.round(cuota / 1000) * 1000;
}

// NUEVO: Manejo de historial de pagos y cuotas
function inicializarHistorialPagos(plazoMeses: number, cuotaFija: number): HistorialPagos {
  const historial: HistorialPagos = {};
  for (let i = 1; i <= plazoMeses; i++) {
    historial[i] = { estado: "pendiente", monto: cuotaFija, subcuotas: [] };
  }
  return historial;
}

// Cambiar estado de una cuota
function cambiarEstadoCuota(
  prestamo: Prestamo,
  numeroCuota: string,
  nuevoEstado: EstadoCuota,
  setPrestamos: React.Dispatch<React.SetStateAction<Prestamo[]>>,
  indexPrestamo: number
) {
  const nuevoHistorial = { ...prestamo.historialPagos };
  // Si es subcuota
  if (numeroCuota.includes(".")) {
    const [num, sub] = numeroCuota.split(".");
    const subcuotas = nuevoHistorial[num].subcuotas.map(sq =>
      sq.numero === numeroCuota ? { ...sq, estado: nuevoEstado } : sq
    );
    nuevoHistorial[num].subcuotas = subcuotas;
  } else {
    // Si aplaza, crear subcuota
    if (nuevoEstado === "aplazado") {
      const subNumero = `${numeroCuota}.1`;
      nuevoHistorial[numeroCuota].estado = "aplazado";
      nuevoHistorial[numeroCuota].subcuotas.push({
        numero: subNumero,
        estado: "pendiente",
        monto: Math.round(nuevoHistorial[numeroCuota].monto / 2 / 1000) * 1000,
      });
    } else {
      nuevoHistorial[numeroCuota].estado = nuevoEstado;
    }
  }
  // Actualizar préstamo en el array
  setPrestamos(prev => {
    const nuevos = [...prev];
    nuevos[indexPrestamo] = {
      ...nuevos[indexPrestamo],
      historialPagos: nuevoHistorial,
    };
    // Opcional: persistir en backend aquí
    return nuevos;
  });
}

// Renderizar cuotas y subcuotas
function CuotasPrestamo({
  prestamo,
  indexPrestamo,
  setPrestamos,
}: {
  prestamo: Prestamo;
  indexPrestamo: number;
  setPrestamos: React.Dispatch<React.SetStateAction<Prestamo[]>>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(prestamo.historialPagos ?? {}).map(([num, cuota]) => (
        <div key={num} className="flex flex-col items-center">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2
              ${
                cuota.estado === "pagado"
                  ? "bg-blue-700 text-blue-100 border-blue-400"
                  : cuota.estado === "aplazado"
                  ? "bg-red-700 text-red-100 border-red-400"
                  : "bg-gray-800 text-gray-300 border-gray-600"
              }
            `}
            title={`Cuota ${num}: ${cuota.estado}`}
            onClick={() => {
              // Ciclo de estados: pendiente -> pagado -> aplazado -> pendiente
              const next =
                cuota.estado === "pendiente"
                  ? "pagado"
                  : cuota.estado === "pagado"
                  ? "aplazado"
                  : "pendiente";
              cambiarEstadoCuota(prestamo, num, next, setPrestamos, indexPrestamo);
            }}
          >
            {num}
          </button>
          {/* Subcuotas */}
          {cuota.subcuotas.map(sub => (
            <button
              key={sub.numero}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mt-1
                ${
                  sub.estado === "pagado"
                    ? "bg-blue-700 text-blue-100 border-blue-400"
                    : sub.estado === "aplazado"
                    ? "bg-red-700 text-red-100 border-red-400"
                    : "bg-gray-800 text-gray-300 border-gray-600"
                }
              `}
              title={`Subcuota ${sub.numero}: ${sub.estado}`}
              onClick={() => {
                // Ciclo de estados para subcuotas
                const next =
                  sub.estado === "pendiente"
                    ? "pagado"
                    : sub.estado === "pagado"
                    ? "aplazado"
                    : "pendiente";
                cambiarEstadoCuota(prestamo, sub.numero, next, setPrestamos, indexPrestamo);
              }}
            >
              {sub.numero}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

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
      // Verificar el estado de la cuota para este mes
      const cuota = prestamo.historialPagos?.[i];
      const pagada = cuota ? cuota.estado === "pagado" : false;

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

  // Cerrar notificación después de un tiempo
  useEffect(() => {
    if (mostrarNotificacion) {
      const timer = setTimeout(() => {
        setMostrarNotificacion(false);
        setPrestamoConNotificacion(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mostrarNotificacion]);

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
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
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

      {/* Voucher de préstamo */}
      <AnimatePresence>
        {mostrarVoucher && prestamoSeleccionado && (
          <GenerarVoucherPrestamos
            prestamo={prestamoSeleccionado}
            onClose={() => {
              setMostrarVoucher(false);
              setPrestamoSeleccionado(null);
            }}
          />
        )}
      </AnimatePresence>

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

      {/* Lista de préstamos */}
      <div className="space-y-4">
        {prestamosFiltrados.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">No hay préstamos registrados</p>
          </div>
        ) :
          (
          prestamosFiltrados.map((prestamo, index) => (
            <motion.div
              key={prestamo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg ${
                prestamoConNotificacion === prestamo.id
                  ? "ring-2 ring-emerald-500"
                  : ""
              }`}
            >
              {/* Cabecera del préstamo */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between bg-gray-700">
                <div className="flex items-center mb-2 md:mb-0">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      prestamo.estado === "Activo"
                        ? "bg-emerald-100 text-emerald-700"
                        : prestamo.estado === "Pagado"
                        ? "bg-blue-100 text-blue-700"
                        : prestamo.estado === "Vencido"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {prestamo.nombreDeudor}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Cédula: {prestamo.cedula}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      prestamo.estado === "Activo"
                        ? "bg-emerald-900 text-emerald-300"
                        : prestamo.estado === "Pagado"
                        ? "bg-blue-900 text-blue-300"
                        : prestamo.estado === "Vencido"
                        ? "bg-red-900 text-red-300"
                        : "bg-yellow-900 text-yellow-300"
                    }`}
                  >
                    {prestamo.estado}
                  </span>

                  <button
                    onClick={() => generarVoucher(prestamo)}
                    className="p-1 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors"
                    title="Generar Voucher"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => editarPrestamo(index)}
                    className="p-1 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                    title="Editar Préstamo"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => eliminarPrestamo(index)}
                    className="p-1 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
                    title="Eliminar Préstamo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => alternarDetalles(prestamo.id)}
                    className="p-1 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors ml-1"
                    title="Ver Detalles"
                  >
                    {detallesExpandidos[prestamo.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Resumen del préstamo */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Monto</span>
                  <span className="text-lg font-semibold text-white">
                    {formatearMoneda(prestamo.monto)}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Plazo</span>
                  <span className="text-lg font-semibold text-white">
                    {prestamo.plazoMeses} meses
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Tasa de Interés</span>
                  <span className="text-lg font-semibold text-white">
                    {prestamo.tasaInteres}% mensual
                  </span>
                </div>
              </div>

              {/* Detalles expandibles */}
              <AnimatePresence>
                {detallesExpandidos[prestamo.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-gray-700 bg-gray-800">
                      <h4 className="text-md font-semibold text-white mb-3">
                        Información Detallada
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-2">
                            Información del Deudor
                          </h5>
                          <div className="bg-gray-700 p-3 rounded-md">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex justify-between">
                                <span className="text-gray-300">Nombre:</span>
                                <span className="text-white font-medium">
                                  {prestamo.nombreDeudor}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Cédula:</span>
                                <span className="text-white font-medium">
                                  {prestamo.cedula}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Teléfono:</span>
                                <span className="text-white font-medium">
                                  {prestamo.telefono}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Dirección:</span>
                                <span className="text-white font-medium">
                                  {prestamo.direccion}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-2">
                            Información del Préstamo
                          </h5>
                          <div className="bg-gray-700 p-3 rounded-md">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex justify-between">
                                <span className="text-gray-300">
                                  Fecha de Desembolso:
                                </span>
                                <span className="text-white font-medium">
                                  {new Date(
                                    prestamo.fechaDesembolso
                                  ).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">
                                  Fecha de Vencimiento:
                                </span>
                                <span className="text-white font-medium">
                                  {prestamo.fechaVencimiento
                                    ? new Date(
                                        prestamo.fechaVencimiento
                                      ).toLocaleDateString("es-ES")
                                    : "No definida"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Garantía:</span>
                                <span className="text-white font-medium">
                                  {prestamo.garantia || "No especificada"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Estado:</span>
                                <span
                                  className={`font-medium ${
                                    prestamo.estado === "Activo"
                                      ? "text-emerald-400"
                                      : prestamo.estado === "Pagado"
                                      ? "text-blue-400"
                                      : prestamo.estado === "Vencido"
                                      ? "text-red-400"
                                      : "text-yellow-400"
                                  }`}
                                >
                                  {prestamo.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estado de cuotas */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-400 mb-2">
                          Estado de Cuotas
                        </h5>
                        <div className="bg-gray-700 p-3 rounded-md">
                          <CuotasPrestamo
                            prestamo={prestamo}
                            indexPrestamo={index}
                            setPrestamos={setPrestamos}
                          />
                          {/* Mostrar valor de cuota fija */}
                          <div className="mt-2 text-xs text-gray-300">
                            Valor cuota fija:{" "}
                            <span className="font-bold text-emerald-300">
                              {formatearMoneda(
                                calcularCuotaFija(
                                  prestamo.monto,
                                  prestamo.plazoMeses,
                                  prestamo.tasaInteres
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones adicionales */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => cambiarEstadoPrestamo(index, "Activo")}
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            prestamo.estado === "Activo"
                              ? "bg-emerald-700 text-emerald-200"
                              : "bg-gray-700 text-gray-300 hover:bg-emerald-900 hover:text-emerald-200"
                          } transition-colors`}
                        >
                          Marcar como Activo
                        </button>
                        <button
                          onClick={() => cambiarEstadoPrestamo(index, "Pagado")}
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            prestamo.estado === "Pagado"
                              ? "bg-blue-700 text-blue-200"
                              : "bg-gray-700 text-gray-300 hover:bg-blue-900 hover:text-blue-200"
                          } transition-colors`}
                        >
                          Marcar como Pagado
                        </button>
                        <button
                          onClick={() => cambiarEstadoPrestamo(index, "Vencido")}
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            prestamo.estado === "Vencido"
                              ? "bg-red-700 text-red-200"
                              : "bg-gray-700 text-gray-300 hover:bg-red-900 hover:text-red-200"
                          } transition-colors`}
                        >
                          Marcar como Vencido
                        </button>
                        <button
                          onClick={() =>
                            cambiarEstadoPrestamo(index, "Refinanciado")
                          }
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            prestamo.estado === "Refinanciado"
                              ? "bg-yellow-700 text-yellow-200"
                              : "bg-gray-700 text-gray-300 hover:bg-yellow-900 hover:text-yellow-200"
                          } transition-colors`}
                        >
                          Marcar como Refinanciado
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}