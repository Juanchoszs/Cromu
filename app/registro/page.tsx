"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Registro from "@/components/espacio/registro";

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <Header />

      {/* Registro */}
      <Registro />

      {/* Footer */}
      <Footer />
    </div>
  );
}