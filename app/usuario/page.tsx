"use client";

import React from "react";

export default function UsuarioPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Bienvenido a tu espacio personal</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Aquí podrás visualizar y gestionar tus ahorros y préstamos.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <h2 className="text-lg font-medium">Tus ahorros</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Actualmente no tienes ahorros registrados.
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <h2 className="text-lg font-medium">Tus préstamos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Actualmente no tienes préstamos registrados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}