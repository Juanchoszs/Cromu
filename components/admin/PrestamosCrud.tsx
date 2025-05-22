import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign } from "lucide-react";
import FormularioPrestamo from "./FromularioPrestamo";
import GenerarVoucherPrestamos from "./GenerarVoucherPrestamos";
import PrestamoCard from "./PrestamoCard";
import SuccessNotification from "./SuccessNotification";
import { Prestamo as PrestamoBase } from "./FromularioPrestamo";

// Hacemos que 'id' sea obligatorio para que coincida con los props de los componentes
type Prestamo = Omit<PrestamoBase, "id"> & { id: string };

export default function PrestamosCrud() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarVoucher, setMostrarVoucher] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  
  // Estados para la notificación de éxito
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState("");
  const [prestamoConNotificacion, setPrestamoConNotificacion] = useState<string | null>(null);
  
  // Cargar datos de la API al iniciar
  const cargarPrestamos = async () => {
    try {
      const res = await fetch('/api/prestamos');
      if (!res.ok) throw new Error('Error al cargar préstamos');
      const data = await res.json();
      setPrestamos(data);
    } catch (error) {
      console.error("Error al cargar préstamos:", error);
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

  // Función para inicializar historial de pagos
  const inicializarHistorialPagos = (plazoMeses: number, cuotaFija: number) => {
    const historial: any = {};
    for (let i = 1; i <= plazoMeses; i++) {
      historial[i] = { estado: "pendiente", monto: cuotaFija, subcuotas: [] };
    }
    return historial;
  };

  // Calcular cuota fija
  const calcularCuotaFija = (monto: number, plazoMeses: number, tasaInteres: number) => {
    const i = tasaInteres / 100;
    const cuota = monto * (i * Math.pow(1 + i, plazoMeses)) / (Math.pow(1 + i, plazoMeses) - 1);
    return Math.round(cuota / 1000) * 1000;
  };
  
  // Actualizar préstamo existente (para cambios de estado y cuotas)
  const actualizarPrestamo = async (prestamoActualizado: Prestamo | PrestamoBase) => {
    try {
      // Asegurarse de que las fechas de pago se conserven correctamente
      if (prestamoActualizado.historialPagos) {
        Object.entries(prestamoActualizado.historialPagos).forEach(([num, cuota]) => {
          // Verificar si la cuota tiene fecha_pago y está en estado pagado
          if (cuota.estado === "pagado" && !cuota.fecha_pago) {
            cuota.fecha_pago = new Date().toISOString();
          }
          
          // Verificar subcuotas
          cuota.subcuotas.forEach(sub => {
            if (sub.estado === "pagado" && !sub.fecha_pago) {
              sub.fecha_pago = new Date().toISOString();
            }
          });
        });
      }

      const res = await fetch(`/api/prestamos?id=${prestamoActualizado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prestamoActualizado),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar el préstamo');
      }

      // Actualizar el estado local inmediatamente para mejor UX
      setPrestamos(prev => 
        prev.map(p => 
          p.id === prestamoActualizado.id ? prestamoActualizado as Prestamo : p
        )
      );

      // Opcional: recargar desde la API para asegurar sincronización
      // await cargarPrestamos();
      
    } catch (error: any) {
      console.error("Error al actualizar préstamo:", error);
      alert(`Error: ${error.message}`);
      // Recargar en caso de error para mantener consistencia
      await cargarPrestamos();
    }
  };

  // Guardar préstamo (crear o actualizar)
  const guardarPrestamo = async (prestamoCompleto: Prestamo) => {
    try {
      const isEdit = editandoIndex !== null;
      
      // Si es nuevo préstamo, inicializar historial de pagos si no existe
      if (!isEdit && !prestamoCompleto.historialPagos) {
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

      // Verificar y actualizar fechas de pago para préstamos existentes
      if (isEdit && prestamoCompleto.historialPagos) {
        Object.entries(prestamoCompleto.historialPagos).forEach(([num, cuota]) => {
          // Verificar si la cuota tiene fecha_pago y está en estado pagado
          if (cuota.estado === "pagado" && !cuota.fecha_pago) {
            cuota.fecha_pago = new Date().toISOString();
          }
          
          // Verificar subcuotas
          cuota.subcuotas.forEach(sub => {
            if (sub.estado === "pagado" && !sub.fecha_pago) {
              sub.fecha_pago = new Date().toISOString();
            }
          });
        });
      }

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit
        ? `/api/prestamos?id=${prestamoCompleto.id}`
        : '/api/prestamos';

      // Si es nuevo, elimina el id para que el backend lo genere
      const dataToSend: Omit<Prestamo, "id"> & { id?: string } = { ...prestamoCompleto };
      if (!isEdit) {
        delete dataToSend.id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar el préstamo');
      }

      // Recarga la lista desde la API para evitar duplicados
      await cargarPrestamos();

      setMensajeNotificacion(isEdit ? "Préstamo actualizado exitosamente" : "Préstamo agregado exitosamente");
      setPrestamoConNotificacion(isEdit ? prestamoCompleto.id ?? null : null);
      setMostrarNotificacion(true);

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

        const res = await fetch(`/api/prestamos?id=${prestamoId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al eliminar el préstamo');
        }

        // Recargar la lista desde la API
        await cargarPrestamos();

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

  // Filtrar préstamos según búsqueda
  const prestamosFiltrados = prestamos.filter(prestamo => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      prestamo.nombreDeudor.toLowerCase().includes(terminoBusqueda) ||
      prestamo.cedula.toLowerCase().includes(terminoBusqueda) ||
      prestamo.estado.toLowerCase().includes(terminoBusqueda)
    );
  });

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
            onGuardar={(prestamo: PrestamoBase) => guardarPrestamo(prestamo as Prestamo)}
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
            <p className="text-gray-400">
              {prestamos.length === 0 
                ? "No hay préstamos registrados" 
                : "No se encontraron préstamos que coincidan con la búsqueda"
              }
            </p>
          </div>
        ) : (
          prestamosFiltrados.map((prestamo, index) => (
            <PrestamoCard
              key={prestamo.id}
              prestamo={prestamo}
              index={index}
              onEdit={editarPrestamo}
              onDelete={eliminarPrestamo}
              onGenerateVoucher={(prestamo) => generarVoucher(prestamo as Prestamo)}
              onUpdatePrestamo={actualizarPrestamo}
              isNotificationActive={prestamoConNotificacion === prestamo.id}
            />
          ))
        )}
      </div>
    </div>
  );
}