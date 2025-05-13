"use client";

import React from "react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Panel Administrativo</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Bienvenido al panel administrativo. Aquí puedes gestionar usuarios, ahorros y préstamos.
        </p>

        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
            Gestionar Usuarios
          </button>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md">
            Gestionar Ahorros
          </button>
          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md">
            Gestionar Préstamos
          </button>
        </div>
      </div>
    </div>
  );
}