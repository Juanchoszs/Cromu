"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserSavings } from "./UserSavings";
import { UserLoans } from "./UserLoans";
import { PiggyBank, CreditCard, User, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  ahorros: any | null;
  prestamos: any[];
  totalAhorrado: number;
  totalPrestado: number;
  prestamosActivos: number;
}

export function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    ahorros: null,
    prestamos: [],
    totalAhorrado: 0,
    totalPrestado: 0,
    prestamosActivos: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cedula, setCedula] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const cedulaUsuario = sessionStorage.getItem("cedulaAhorrador");
        if (!cedulaUsuario) {
          setError("No se ha iniciado sesión con una cédula válida");
          return;
        }
        setCedula(cedulaUsuario);

        // Cargar ahorros y préstamos en paralelo
        const [ahorrosResponse, prestamosResponse] = await Promise.all([
          fetch(`/api/ahorradores/buscar?cedula=${cedulaUsuario}`).catch(() => null),
          fetch(`/api/prestamos?cedula=${cedulaUsuario}`).catch(() => null)
        ]);

        let ahorros = null;
        let prestamos = [];

        if (ahorrosResponse && ahorrosResponse.ok) {
          ahorros = await ahorrosResponse.json();
        }

        if (prestamosResponse && prestamosResponse.ok) {
          prestamos = await prestamosResponse.json();
        }

        // Calcular estadísticas
        const totalAhorrado = ahorros ? ahorros.ahorroTotal : 0;
        const totalPrestado = prestamos.reduce((sum: number, p: any) => sum + p.monto, 0);
        const prestamosActivos = prestamos.filter((p: any) => p.estado.toLowerCase() === 'activo').length;

        setDashboardData({
          ahorros,
          prestamos,
          totalAhorrado,
          totalPrestado,
          prestamosActivos
        });
      } catch (err) {
        setError("Error al cargar los datos del usuario");
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <User className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error de acceso</h2>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mi Panel Financiero
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cédula: {cedula}
          </p>
        </div>

        {/* Resumen estadístico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Ahorrado
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatearMoneda(dashboardData.totalAhorrado)}
                  </p>
                </div>
                <PiggyBank className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Prestado
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatearMoneda(dashboardData.totalPrestado)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Préstamos Activos
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardData.prestamosActivos}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <UserSavings fullView={true} />
          </div>
          <div className="space-y-6">
            <UserLoans />
          </div>
        </div>
      </div>
    </div>
  );
}