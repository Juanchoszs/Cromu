import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, 
  Trash2, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Printer,
  Calendar,
  Clock
} from "lucide-react";
import { Prestamo, EstadoPrestamo } from "./FromularioPrestamo";

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

interface PrestamoCardProps {
  prestamo: Prestamo;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onGenerateVoucher: (prestamo: Prestamo) => void;
  onUpdatePrestamo: (prestamo: Prestamo) => Promise<void>;
  isNotificationActive?: boolean;
}

function calcularCuotaFija(monto: number, plazoMeses: number, tasaInteres: number) {
  const i = tasaInteres / 100;
  const cuota = monto * (i * Math.pow(1 + i, plazoMeses)) / (Math.pow(1 + i, plazoMeses) - 1);
  return Math.round(cuota / 1000) * 1000;
}

// Componente para mostrar las cuotas con fechas
function CuotasPrestamo({
  prestamo,
  onUpdateCuota,
}: {
  prestamo: Prestamo;
  onUpdateCuota: (prestamo: Prestamo) => Promise<void>;
}) {
  
  const cambiarEstadoCuota = async (numeroCuota: string, nuevoEstado: EstadoCuota) => {
    const nuevoHistorial = { ...prestamo.historialPagos };
    const fechaActual = new Date().toISOString();
    
    if (numeroCuota.includes(".")) {
      // Es una subcuota
      const [num, sub] = numeroCuota.split(".");
      const subcuotas = nuevoHistorial[num].subcuotas.map(sq => {
        if (sq.numero === numeroCuota) {
          const subcuotaActualizada = { ...sq, estado: nuevoEstado };
          
          // Agregar fecha según el estado
          if (nuevoEstado === "pagado") {
            subcuotaActualizada.fecha_pago = fechaActual;
          } else if (nuevoEstado === "pendiente") {
            // Limpiar fechas si vuelve a pendiente
            delete subcuotaActualizada.fecha_pago;
          }
          
          return subcuotaActualizada;
        }
        return sq;
      });
      nuevoHistorial[num].subcuotas = subcuotas;
    } else {
      // Es una cuota principal
      if (nuevoEstado === "aplazado") {
        const subNumero = `${numeroCuota}.1`;
        nuevoHistorial[numeroCuota].estado = "aplazado";
        nuevoHistorial[numeroCuota].fecha_aplazamiento = fechaActual;
        
        // Crear subcuota si no existe
        const subcuotaExiste = nuevoHistorial[numeroCuota].subcuotas.find(
          sc => sc.numero === subNumero
        );
        
        if (!subcuotaExiste) {
          nuevoHistorial[numeroCuota].subcuotas.push({
            numero: subNumero,
            estado: "pendiente",
            monto: Math.round(nuevoHistorial[numeroCuota].monto / 2 / 1000) * 1000,
            fecha_creacion: fechaActual,
          });
        }
      } else {
        nuevoHistorial[numeroCuota].estado = nuevoEstado;
        
        // Agregar fecha según el estado
        if (nuevoEstado === "pagado") {
          nuevoHistorial[numeroCuota].fecha_pago = fechaActual;
        } else if (nuevoEstado === "pendiente") {
          // Limpiar fechas si vuelve a pendiente
          delete nuevoHistorial[numeroCuota].fecha_pago;
          delete nuevoHistorial[numeroCuota].fecha_aplazamiento;
        }
      }
    }
    
    const prestamoActualizado = {
      ...prestamo,
      historialPagos: nuevoHistorial,
    };
    
    await onUpdateCuota(prestamoActualizado);
  };

  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const obtenerTituloCuota = (num: string, cuota: CuotaPago) => {
    let titulo = `Cuota ${num}: ${cuota.estado}`;
    
    if (cuota.fecha_pago) {
      titulo += `\nPagado: ${formatearFecha(cuota.fecha_pago)}`;
    } else if (cuota.fecha_aplazamiento) {
      titulo += `\nAplazado: ${formatearFecha(cuota.fecha_aplazamiento)}`;
    }
    
    return titulo;
  };

  const obtenerTituloSubcuota = (sub: SubCuota) => {
    let titulo = `Subcuota ${sub.numero}: ${sub.estado}`;
    
    if (sub.fecha_pago) {
      titulo += `\nPagado: ${formatearFecha(sub.fecha_pago)}`;
    } else if (sub.fecha_creacion) {
      titulo += `\nCreado: ${formatearFecha(sub.fecha_creacion)}`;
    }
    
    return titulo;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(prestamo.historialPagos ?? {}).map(([num, cuota]) => (
        <div key={num} className="flex flex-col items-center">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 relative
              ${
                cuota.estado === "pagado"
                  ? "bg-blue-700 text-blue-100 border-blue-400"
                  : cuota.estado === "aplazado"
                  ? "bg-red-700 text-red-100 border-red-400"
                  : "bg-gray-800 text-gray-300 border-gray-600"
              }
            `}
            title={obtenerTituloCuota(num, cuota)}
            onClick={() => {
              const next =
                cuota.estado === "pendiente"
                  ? "pagado"
                  : cuota.estado === "pagado"
                  ? "aplazado"
                  : "pendiente";
              cambiarEstadoCuota(num, next);
            }}
          >
            {num}
            {/* Indicador de fecha */}
            {(cuota.fecha_pago || cuota.fecha_aplazamiento) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                <Calendar className="w-2 h-2 text-yellow-900" />
              </div>
            )}
          </button>
          
          {/* Subcuotas */}
          {cuota.subcuotas.map(sub => (
            <button
              key={sub.numero}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mt-1 relative
                ${
                  sub.estado === "pagado"
                    ? "bg-blue-700 text-blue-100 border-blue-400"
                    : sub.estado === "aplazado"
                    ? "bg-red-700 text-red-100 border-red-400"
                    : "bg-gray-800 text-gray-300 border-gray-600"
                }
              `}
              title={obtenerTituloSubcuota(sub)}
              onClick={() => {
                const next =
                  sub.estado === "pendiente"
                    ? "pagado"
                    : sub.estado === "pagado"
                    ? "aplazado"
                    : "pendiente";
                cambiarEstadoCuota(sub.numero, next);
              }}
            >
              {sub.numero}
              {/* Indicador de fecha */}
              {(sub.fecha_pago || sub.fecha_creacion) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-2 h-2 text-yellow-900" />
                </div>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// Componente para mostrar el historial de pagos detallado 
function HistorialPagosDetallado({ prestamo }: { prestamo: Prestamo }) {
  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Recopilar todos los pagos con fechas
  const pagosConFecha: Array<{
    numero: string;
    monto: number;
    fecha: string;
    tipo: 'cuota' | 'subcuota';
    estado: string;
  }> = [];

  Object.entries(prestamo.historialPagos ?? {}).forEach(([num, cuota]) => {
    if (cuota.fecha_pago) {
      pagosConFecha.push({
        numero: num,
        monto: cuota.monto,
        fecha: cuota.fecha_pago,
        tipo: 'cuota',
        estado: 'pagado'
      });
    }

    cuota.subcuotas.forEach(sub => {
      if (sub.fecha_pago) {
        pagosConFecha.push({
          numero: sub.numero,
          monto: sub.monto,
          fecha: sub.fecha_pago,
          tipo: 'subcuota',
          estado: 'pagado'
        });
      }
    });
  });

  // Ordenar por fecha más reciente primero
  pagosConFecha.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  if (pagosConFecha.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No hay pagos registrados
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h5 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Historial de Pagos
      </h5>
      <div className="bg-gray-700 rounded-md max-h-48 overflow-y-auto">
        {pagosConFecha.map((pago, index) => (
          <div
            key={`${pago.numero}-${pago.fecha}`}
            className={`p-3 flex justify-between items-center border-b border-gray-600 last:border-b-0 ${
              index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                pago.tipo === 'cuota' 
                  ? 'bg-blue-900 text-blue-200' 
                  : 'bg-purple-900 text-purple-200'
              }`}>
                {pago.tipo === 'cuota' ? 'Cuota' : 'Subcuota'} {pago.numero}
              </span>
              <span className="text-white font-medium">
                {formatearMoneda(pago.monto)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">
                {formatearFecha(pago.fecha)}
              </div>
              <span className="text-xs text-green-400 font-medium">
                Pagado
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrestamoCard({ 
  prestamo, 
  index, 
  onEdit, 
  onDelete, 
  onGenerateVoucher, 
  onUpdatePrestamo,
  isNotificationActive = false 
}: PrestamoCardProps) {
  const [detallesExpandidos, setDetallesExpandidos] = useState(false);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const cambiarEstadoPrestamo = async (nuevoEstado: EstadoPrestamo) => {
    const prestamoActualizado = {
      ...prestamo,
      estado: nuevoEstado
    };
    await onUpdatePrestamo(prestamoActualizado);
  };

  const actualizarCuota = async (prestamoActualizado: Prestamo) => {
    await onUpdatePrestamo(prestamoActualizado);
  };

  // Calcular estadísticas de pagos
const calcularEstadisticasPagos = () => {
    const historial = prestamo.historialPagos ?? {};
    let totalPagado = 0;
    let cuotasPagadas = 0;
    let ultimoPago: string | null = null;

    // Process main payments
    Object.entries(historial).forEach(([num, cuota]) => {
      if (cuota.estado === "pagado" && cuota.fecha_pago) {
        totalPagado += cuota.monto;
        cuotasPagadas++;
        
        const fechaPago = new Date(cuota.fecha_pago).getTime();
        const fechaUltima = ultimoPago ? new Date(ultimoPago).getTime() : 0;
        
        if (!ultimoPago || fechaPago > fechaUltima) {
          ultimoPago = cuota.fecha_pago;
        }
      }

      // Process sub-payments
      cuota.subcuotas.forEach(sub => {
        if (sub.estado === "pagado" && sub.fecha_pago) {
          totalPagado += sub.monto;
          
          const fechaPago = new Date(sub.fecha_pago).getTime();
          const fechaUltima = ultimoPago ? new Date(ultimoPago).getTime() : 0;
          
          if (!ultimoPago || fechaPago > fechaUltima) {
            ultimoPago = sub.fecha_pago;
          }
        }
      });
    });

    return { totalPagado, cuotasPagadas, ultimoPago };
};

  const { totalPagado, cuotasPagadas, ultimoPago } = calcularEstadisticasPagos();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg ${
        isNotificationActive ? "ring-2 ring-emerald-500" : ""
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
            {ultimoPago && (
              <p className="text-xs text-green-400 flex items-center mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                Último pago: {new Date(ultimoPago).toLocaleDateString("es-ES")}
              </p>
            )}
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
            onClick={() => onGenerateVoucher(prestamo)}
            className="p-1 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors"
            title="Generar Voucher"
          >
            <Printer className="h-4 w-4" />
          </button>

          <button
            onClick={() => onEdit(index)}
            className="p-1 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
            title="Editar Préstamo"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(index)}
            className="p-1 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
            title="Eliminar Préstamo"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setDetallesExpandidos(!detallesExpandidos)}
            className="p-1 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors ml-1"
            title="Ver Detalles"
          >
            {detallesExpandidos ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Resumen del préstamo */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800">
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

        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">Total Pagado</span>
          <span className="text-lg font-semibold text-green-400">
            {formatearMoneda(totalPagado)}
          </span>
          <span className="text-xs text-gray-400">
            {cuotasPagadas} cuotas pagadas
          </span>
        </div>
      </div>

      {/* Detalles expandibles */}
      <AnimatePresence>
        {detallesExpandidos && (
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
                    onUpdateCuota={actualizarCuota}
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

              {/* Historial de pagos detallado */}
              <HistorialPagosDetallado prestamo={prestamo} />

              {/* Acciones adicionales */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => cambiarEstadoPrestamo("Activo")}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    prestamo.estado === "Activo"
                      ? "bg-emerald-700 text-emerald-200"
                      : "bg-gray-700 text-gray-300 hover:bg-emerald-900 hover:text-emerald-200"
                  } transition-colors`}
                >
                  Marcar como Activo
                </button>
                <button
                  onClick={() => cambiarEstadoPrestamo("Pagado")}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    prestamo.estado === "Pagado"
                      ? "bg-blue-700 text-blue-200"
                      : "bg-gray-700 text-gray-300 hover:bg-blue-900 hover:text-blue-200"
                  } transition-colors`}
                >
                  Marcar como Pagado
                </button>
                <button
                  onClick={() => cambiarEstadoPrestamo("Vencido")}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    prestamo.estado === "Vencido"
                      ? "bg-red-700 text-red-200"
                      : "bg-gray-700 text-gray-300 hover:bg-red-900 hover:text-red-200"
                  } transition-colors`}
                >
                  Marcar como Vencido
                </button>
                <button
                  onClick={() => cambiarEstadoPrestamo("Refinanciado")}
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
  );
}