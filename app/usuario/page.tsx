"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UserSavings } from "@/app/usuario/UserSavings";
import { useLanguage } from "@/contexts/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, PiggyBank, CreditCard, Bell, Settings } from "lucide-react";

export default function UsuarioPage() {
  const { language } = useLanguage();
  
  const translations = {
    es: {
      welcome: "Bienvenido a tu Espacio Personal",
      subtitle: "Gestiona tus finanzas y consulta tus productos",
      overview: "Resumen",
      savings: "Ahorros",
      loans: "Préstamos",
      notifications: "Notificaciones",
      settings: "Configuración",
      lastLogin: "Último acceso:",
      today: "Hoy",
    },
    en: {
      welcome: "Welcome to your Personal Space",
      subtitle: "Manage your finances and check your products",
      overview: "Overview",
      savings: "Savings",
      loans: "Loans",
      notifications: "Notifications",
      settings: "Settings",
      lastLogin: "Last login:",
      today: "Today",
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Encabezado de bienvenida */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-lg p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t.welcome}</h1>
              <p className="text-emerald-100 mt-1">{t.subtitle}</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-sm">
                <span className="opacity-80">{t.lastLogin}</span> {t.today}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pestañas de navegación */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden md:inline">{t.overview}</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden md:inline">{t.savings}</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">{t.loans}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">{t.notifications}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">{t.settings}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UserSavings />

            </div>
          </TabsContent>
          
          <TabsContent value="savings">
            <UserSavings fullView={true} />
          </TabsContent>
          
          <TabsContent value="loans">

          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tienes notificaciones nuevas
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configuración de cuenta</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Esta sección estará disponible próximamente
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}