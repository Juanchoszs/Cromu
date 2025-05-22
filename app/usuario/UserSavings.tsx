"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PiggyBank, TrendingUp, Calendar, ArrowUpRight, Plus, Download, AlertCircle, Printer } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/language-context";
import GenerarVoucher from "@/components/admin/GenerarVoucher";

interface UserSavingsProps {
  fullView?: boolean;
}

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

export function UserSavings({ fullView = false }: UserSavingsProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ahorrador, setAhorrador] = useState<Ahorrador | null>(null);
  const [mostrarVoucher, setMostrarVoucher] = useState(false);
  
  useEffect(() => {
    // Función para cargar los datos del ahorrador
    const cargarDatosAhorrador = async () => {
      try {
        setIsLoading(true);
        
        // Obtener la cédula del sessionStorage
        const cedulaUsuarioActual = sessionStorage.getItem('cedulaAhorrador');
        
        if (!cedulaUsuarioActual) {
          setError("No se ha iniciado sesión con una cédula válida");
          return;
        }
        
        // Consultar a la API por la cédula
        const response = await fetch(`/api/ahorradores/buscar?cedula=${cedulaUsuarioActual}`);
        
        if (!response.ok) {
          throw new Error("Error al obtener datos del ahorrador");
        }
        
        const data = await response.json();
        
        if (data) {
          setAhorrador(data);
        } else {
          setError("No se encontraron datos para este ahorrador");
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos de ahorro");
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarDatosAhorrador();
  }, []);
  
  const translations = {
    es: {
      title: "Tus Ahorros",
      balance: "Saldo actual",
      goal: "Meta de ahorro",
      interest: "Tasa de interés",
      nextPayment: "Próximo pago",
      progress: "Progreso",
      transactions: "Historial de pagos",
      date: "Fecha",
      amount: "Monto",
      description: "Descripción",
      newDeposit: "Nuevo depósito",
      downloadStatement: "Descargar estado",
      viewAll: "Ver todo",
      noSavings: "Aún no tienes ahorros registrados",
      startSaving: "Comienza a ahorrar hoy",
      annual: "anual",
      loading: "Cargando datos...",
      error: "Error al cargar datos",
      retry: "Reintentar",
      status: "Estado",
      paid: "Pagado",
      unpaid: "Pendiente",
      loyaltyBonus: "Bono de fidelidad",
      active: "Activo",
      inactive: "Inactivo",
      consecutivePayments: "Pagos consecutivos",
      generateVoucher: "Generar Voucher"
    },
    en: {
      title: "Your Savings",
      balance: "Current balance",
      goal: "Savings goal",
      interest: "Interest rate",
      nextPayment: "Next payment",
      progress: "Progress",
      transactions: "Payment history",
      date: "Date",
      amount: "Amount",
      description: "Description",
      newDeposit: "New deposit",
      downloadStatement: "Download statement",
      viewAll: "View all",
      noSavings: "You don't have any savings yet",
      startSaving: "Start saving today",
      annual: "annual",
      loading: "Loading data...",
      error: "Error loading data",
      retry: "Retry",
      status: "Status",
      paid: "Paid",
      unpaid: "Pending",
      loyaltyBonus: "Loyalty bonus",
      active: "Active",
      inactive: "Inactive",
      consecutivePayments: "Consecutive payments",
      generateVoucher: "Generate Voucher"
    }
  };

  const t = translations[language as keyof typeof translations];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'es' ? 'es-CO' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Si está cargando, mostrar indicador de carga
  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-emerald-600" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {t.loading}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Si hay un error, mostrar mensaje de error
  if (error || !ahorrador) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-emerald-600" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {error || t.noSavings}
          </p>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => window.location.reload()}
          >
            {t.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Calcular el progreso (asumimos una meta de ahorro de 10 millones como ejemplo)
  const metaAhorro = 10000000; // En una implementación real, esto podría venir del perfil del usuario
  const progressPercentage = Math.min(100, Math.round((ahorrador.ahorroTotal / metaAhorro) * 100));
  
  // Obtener los meses del historial de pagos ordenados
  const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
  
  // Vista completa con todas las transacciones
  if (fullView) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-emerald-600" />
                {t.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">{t.downloadStatement}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.balance}</p>
                <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(ahorrador.ahorroTotal)}</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.goal}</p>
                <h3 className="text-2xl font-bold">{formatCurrency(metaAhorro)}</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.interest}</p>
                <h3 className="text-xl font-bold">
                  {ahorrador.incentivoPorFidelidad ? "7%" : "6%"} 
                  <span className="text-sm font-normal"> {t.annual}</span>
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.loyaltyBonus}</p>
                <h3 className="text-xl font-bold flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${ahorrador.incentivoPorFidelidad ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {ahorrador.incentivoPorFidelidad ? t.active : t.inactive}
                </h3>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.progress}</p>
                <p className="text-sm font-medium">{progressPercentage}%</p>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-gray-200 dark:bg-gray-700" />
            </div>
            
            <div>
              <h3 className="font-medium mb-4">{t.transactions}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.date}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.status}</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesesOrdenados.map((mes) => (
                      <tr key={mes} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-sm">{mes}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ahorrador.historialPagos[mes].pagado 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {ahorrador.historialPagos[mes].pagado ? t.paid : t.unpaid}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-emerald-600">
                          {ahorrador.historialPagos[mes].pagado ? formatCurrency(ahorrador.historialPagos[mes].monto) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Botón para generar voucher */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setMostrarVoucher(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <Printer className="mr-2 h-5 w-5" />
                {t.generateVoucher}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Modal para mostrar el voucher */}
        {mostrarVoucher && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <GenerarVoucher 
                ahorrador={ahorrador} 
                onClose={() => setMostrarVoucher(false)} 
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  }
  
  // Vista resumida para el dashboard
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-emerald-600" />
          {t.title}
        </CardTitle>
        <CardDescription>
          {ahorrador.nombre}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{formatCurrency(ahorrador.ahorroTotal)}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.consecutivePayments}: {ahorrador.pagosConsecutivos}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-gray-200 dark:bg-gray-700" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.interest}</p>
              <p className="font-medium">
                {ahorrador.incentivoPorFidelidad ? "7%" : "6%"} 
                <span className="text-xs font-normal"> {t.annual}</span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.loyaltyBonus}</p>
              <p className="font-medium flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${ahorrador.incentivoPorFidelidad ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {ahorrador.incentivoPorFidelidad ? t.active : t.inactive}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">{t.transactions}</h4>
            <div className="space-y-2">
              {mesesOrdenados.slice(0, 3).map((mes) => (
                <div key={mes} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span>{mes}</span>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      ahorrador.historialPagos[mes].pagado ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="font-medium">
                      {ahorrador.historialPagos[mes].pagado 
                        ? formatCurrency(ahorrador.historialPagos[mes].monto) 
                        : t.unpaid}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center justify-center"
          onClick={() => document.querySelector('[value="savings"]')?.dispatchEvent(new MouseEvent('click'))}
        >
          {t.viewAll}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}