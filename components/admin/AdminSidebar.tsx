import { Home, PiggyBank, HandCoins, Calculator, Menu, LogOut } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSidebar({
  section,
  setSection,
}: {
  section: string;
  setSection: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Aquí podrías agregar lógica adicional de cierre de sesión si es necesario
    // Por ejemplo, limpiar tokens, cookies, etc.
    router.push('/');
  };

  const menu = (
    <nav className="flex flex-col py-8 px-4 h-full">
      <button
        className={`flex items-center gap-3 mb-6 p-2 rounded ${section === "home" ? "bg-emerald-900" : ""}`}
        onClick={() => {
          setSection("home");
          setOpen(false);
        }}
      >
        <Home className="w-6 h-6" /> Home
      </button>
      <button
        className={`flex items-center gap-3 mb-6 p-2 rounded ${section === "ahorradores" ? "bg-emerald-900" : ""}`}
        onClick={() => {
          setSection("ahorradores");
          setOpen(false);
        }}
      >
        <PiggyBank className="w-6 h-6" /> Ahorradores
      </button>
      <button
        className={`flex items-center gap-3 mb-6 p-2 rounded ${section === "prestamos" ? "bg-emerald-900" : ""}`}
        onClick={() => {
          setSection("prestamos");
          setOpen(false);
        }}
      >
        <HandCoins className="w-6 h-6" /> Préstamos
      </button>
      <button
        className={`flex items-center gap-3 mb-6 p-2 rounded ${section === "simulador" ? "bg-emerald-900" : ""}`}
        onClick={() => {
          setSection("simulador");
          setOpen(false);
        }}
      >
        <Calculator className="w-6 h-6" /> Simulador
      </button>
      
      {/* Botón de cierre de sesión */}
      <div className="mt-auto">
        <button
          className="flex items-center gap-3 p-2 rounded text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-6 h-6" /> Cerrar Sesión
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Botón hamburguesa solo en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-gray-800 p-2 rounded shadow"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="w-7 h-7" />
      </button>
      {/* Sidebar en desktop */}
      <aside className="hidden md:flex w-64 bg-gray-800 shadow-lg h-screen">
        {menu}
      </aside>
      {/* Sidebar hamburguesa en móvil */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-gray-800 shadow-lg h-full">
            {menu}
          </div>
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}