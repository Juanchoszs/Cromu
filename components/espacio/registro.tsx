"use client";

import React, { useState } from "react";
import { Lock, User, ArrowRight, Wallet, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function Registro() {
  const { language, t } = useLanguage(); // Se mantiene el idioma desde el contexto
  const [formData, setFormData] = useState({
    cedula: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const translations = {
    es: {
      title: "Regístrate",
      subtitle: "Crea tu cuenta para acceder a tu espacio personal.",
      description: "Completa los campos para registrarte de forma segura.",
      cedula: "Cédula",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      register: "Registrarse",
      registering: "Registrando...",
      passwordsDontMatch: "Las contraseñas no coinciden.",
    },
    en: {
      title: "Register",
      subtitle: "Create your account to access your personal space.",
      description: "Fill in the fields to register securely.",
      cedula: "ID Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      register: "Register",
      registering: "Registering...",
      passwordsDontMatch: "Passwords do not match.",
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validación para la cédula: máximo 11 números
    if (name === "cedula" && value.length > 11) {
      return; // No permitir más de 11 caracteres
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t(translations).passwordsDontMatch);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: formData.cedula,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al registrarse. Intente nuevamente.");
      }

      // Mostrar animación de éxito
      setIsSuccess(true);

      // Redirigir después de un tiempo
      setTimeout(() => {
        window.location.href = "/espacio";
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al registrarse. Intente nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {isSuccess ? (
          <div className="w-full p-8 flex flex-col items-center justify-center bg-emerald-100 dark:bg-emerald-900">
            <div className="text-emerald-600 dark:text-emerald-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m0 0a9 9 0 11-4-4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
              ¡Registro exitoso!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Serás redirigido a la página de inicio en breve.
            </p>
          </div>
        ) : (
          <>
            {/* Sección de imagen/branding */}
            <div className="bg-emerald-800 text-white w-full md:w-2/5 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-6">
                  <Wallet className="w-8 h-8 mr-2" />
                  <h1 className="text-2xl font-bold">CROMU</h1>
                </div>
                <h2 className="text-3xl font-bold mb-4">{t(translations).title}</h2>
                <h3 className="text-xl font-medium mb-3 text-emerald-200">
                  {t(translations).subtitle}
                </h3>
                <p className="text-emerald-100 mb-6">{t(translations).description}</p>
              </div>
            </div>

            {/* Sección de formulario */}
            <div className="w-full md:w-3/5 p-8 bg-white dark:bg-gray-800">
              <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {t(translations).title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
                  {t(translations).description}
                </p>

                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="cedula"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t(translations).cedula}
                    </label>
                    <input
                      type="text"
                      id="cedula"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleInputChange}
                      required
                      placeholder={t(translations).cedula}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t(translations).password}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder={t(translations).password}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t(translations).confirmPassword}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder={t(translations).confirmPassword}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-3 rounded-md transition-all duration-300 flex items-center justify-center ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? t(translations).registering : t(translations).register}
                    {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}