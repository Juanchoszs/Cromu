"use client";

import React, { useState } from "react";
import { Lock, User, ArrowRight, Wallet, HelpCircle, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";

export default function Login() {
  const { language, t } = useLanguage(); // Se mantiene el idioma desde el contexto
  const [formData, setFormData] = useState({
    cedula: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

  const translations = {
    es: {
      title: "Banca Digital Segura",
      subtitle: "Tu espacio para consultar tus ahorros y préstamos",
      description:
        "Acceda a su información financiera en línea con la máxima seguridad y confianza. Gestionamos su patrimonio con los más altos estándares de protección.",
      helpTitle: "¿Necesita ayuda?",
      helpText: "Contáctenos o visite nuestra sección de preguntas frecuentes.",
      welcome: "Bienvenido",
      credentials: "Ingrese sus credenciales para acceder a su espacio personal.",
      cedula: "Cédula",
      password: "Contraseña",
      forgotPassword: "¿Olvidó su contraseña?",
      login: "Iniciar sesión",
      loggingIn: "Iniciando sesión...",
      noAccount: "¿No tiene una cuenta?",
      register: "Registrarse",
      cedulaLabel: "Ingrese su cédula",
      passwordLabel: "Ingrese su contraseña",
      invalidCredentials: "Credenciales inválidas. Por favor, intente nuevamente.",
      loginError: "Error al iniciar sesión. Intente nuevamente.",
    },
    en: {
      title: "Secure Digital Banking",
      subtitle: "Your space to check your savings and loans",
      description:
        "Access your financial information online with maximum security and confidence. We manage your assets with the highest protection standards.",
      helpTitle: "Need help?",
      helpText: "Contact us or visit our FAQ section.",
      welcome: "Welcome",
      credentials: "Enter your credentials to access your personal space.",
      cedula: "ID",
      password: "Password",
      forgotPassword: "Forgot your password?",
      login: "Login",
      loggingIn: "Logging in...",
      noAccount: "Don't have an account?",
      register: "Register",
      cedulaLabel: "Enter your ID",
      passwordLabel: "Enter your password",
      invalidCredentials: "Invalid credentials. Please try again.",
      loginError: "Login error. Please try again.",
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t(translations).loginError);
      }

      // Save cedula to sessionStorage for regular users
      if (!data.isAdmin) {
        sessionStorage.setItem("cedulaAhorrador", formData.cedula);
      }

      // Redirigir según el tipo de usuario
      if (data.isAdmin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/usuario";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t(translations).loginError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
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
          <div className="hidden md:block">
            <div className="bg-emerald-900 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <HelpCircle className="w-5 h-5 mr-2 text-emerald-300" />
                <h3 className="font-medium">{t(translations).helpTitle}</h3>
              </div>
              <p className="text-sm text-emerald-100">{t(translations).helpText}</p>
            </div>
          </div>
        </div>

        {/* Sección de formulario */}
        <div className="w-full md:w-3/5 p-8 bg-white dark:bg-gray-800">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {t(translations).welcome}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
              {t(translations).credentials}
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cedula"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    required
                    placeholder={t(translations).cedulaLabel}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t(translations).password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder={t(translations).passwordLabel}
                    className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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

              <div className="text-right">
                <a
                  href="/recuperar-contraseña"
                  className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {t(translations).forgotPassword}
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-3 rounded-md transition-all duration-300 flex items-center justify-center ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? t(translations).loggingIn : t(translations).login}
                {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                {t(translations).noAccount}
              </p>
              <Link
                href="/registro"
                className="block w-full bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 border border-emerald-600 font-medium px-4 py-3 rounded-md text-center hover:bg-emerald-50 dark:hover:bg-gray-600 transition-all duration-300"
              >
                {t(translations).register}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}