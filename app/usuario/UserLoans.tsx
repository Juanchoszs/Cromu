"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import GenerarVoucherPrestamos from "@/components/admin/GenerarVoucherPrestamos";

interface PagoCuota {
  fecha: string;
  monto: number;
  tipo: 'Capital' | 'Interés' | 'Mixto';
  comprobante?: string;
  pagado?: boolean; // Si tu backend lo maneja
  estado?: string;  // Si tu backend lo maneja
}

// Import the Prestamo and EstadoPrestamo types from FromularioPrestamo
import type { Prestamo as PrestamoFromFormulario, EstadoPrestamo } from "@/components/admin/FromularioPrestamo";

interface Prestamo extends Omit<PrestamoFromFormulario, "estado"> {
  estado: EstadoPrestamo;
}

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function UserLoans({ fullView = false }: { fullView?: boolean }) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarVoucher, setMostrarVoucher] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);

  useEffect(() => {
    const cargarPrestamos = async () => {
      try {
        setIsLoading(true);
        const cedula = sessionStorage.getItem("cedulaAhorrador");
        if (!cedula) {
          setError("No se ha iniciado sesión con una cédula válida");
          return;
        }
        const response = await fetch(`/api/prestamos?cedula=${cedula}`);
        if (!response.ok) throw new Error("Error al obtener préstamos");
        const data = await response.json();
        setPrestamos(data);
      } catch (err) {
        setError("Error al cargar los préstamos");
      } finally {
        setIsLoading(false);
      }
    };
    cargarPrestamos();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Préstamos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Cargando préstamos...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || prestamos.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Préstamos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {error || "No tienes préstamos registrados."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mostramos todos los préstamos del usuario, cada uno en su card
  return (
    <>
      {prestamos.map((prestamo) => (
        <Card className="w-full h-full mb-6" key={prestamo.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Préstamo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Nombre:</span>
                <span>{prestamo.nombreDeudor}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cédula:</span>
                <span>{prestamo.cedula}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Monto:</span>
                <span>{formatearMoneda(prestamo.monto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Plazo:</span>
                <span>{prestamo.plazoMeses} meses</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tasa de interés:</span>
                <span>{prestamo.tasaInteres}% mensual</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estado:</span>
                <span>{prestamo.estado}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fecha desembolso:</span>
                <span>{formatearFecha(prestamo.fechaDesembolso)}</span>
              </div>
              {prestamo.fechaVencimiento && (
                <div className="flex justify-between">
                  <span className="font-medium">Fecha vencimiento:</span>
                  <span>{formatearFecha(prestamo.fechaVencimiento)}</span>
                </div>
              )}
            </div>
            {/* Historial de pagos si existe */}
            {prestamo.historialPagos && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Historial de cuotas</h3>
                <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 max-h-64 overflow-y-auto">
                  {Object.keys(prestamo.historialPagos).length === 0 ? (
                    <div className="text-gray-400 text-center">No hay cuotas registradas.</div>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left py-1 px-2">Mes</th>
                          <th className="text-left py-1 px-2">Monto</th>
                          <th className="text-left py-1 px-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(prestamo.historialPagos)
                          .sort(([a,], [b,]) => Number(a) - Number(b))
                          .flatMap(([mes, pagos]) => {
                            const pagosArray = Array.isArray(pagos) ? pagos : pagos ? [pagos] : [];
                            return pagosArray.map((pago, idx) => (
                              <tr key={mes + idx} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-1 px-2">{mes}</td>
                                <td className="py-1 px-2">{pago.monto !== undefined ? formatearMoneda(pago.monto) : "-"}</td>
                                <td className="py-1 px-2">
                                  {pago.estado === "aplazado" || pago.estado === "Aplazado" ? (
                                    <span className="text-orange-600 dark:text-orange-400 font-medium">Aplazado</span>
                                  ) : pago.estado === "pagado" || pago.pagado === true ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium">Pagado</span>
                                  ) : pago.estado === "pendiente" || pago.pagado === false ? (
                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Pendiente</span>
                                  ) : (
                                    pago.estado || "-"
                                  )}
                                </td>
                              </tr>
                            ));
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setPrestamoSeleccionado(prestamo);
                setMostrarVoucher(true);
              }}
            >
              <Download className="h-4 w-4" />
              Descargar voucher de préstamo
            </Button>
          </CardFooter>
        </Card>
      ))}
      {mostrarVoucher && prestamoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setMostrarVoucher(false)}
            >
              ×
            </button>
            <GenerarVoucherPrestamos prestamo={prestamoSeleccionado} onClose={() => setMostrarVoucher(false)} />
          </div>
        </div>
      )}
    </>
  );
}