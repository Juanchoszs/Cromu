"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function NavMenu() {
  const { language, t } = useLanguage();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Services menu items
  const services = {
    es: [
      { name: "Compra de cartera", href: "/servicios?tab=cartera" },
      { name: "Crédito libre inversión", href: "/servicios?tab=libreInversion" },
      { name: "Crédito express", href: "/servicios?tab=prestamos" },
      { name: "Ahorrador", href: "/servicios?tab=ahorros" },
    ],
    en: [
      { name: "Debt Purchase", href: "/servicios?tab=cartera" },
      { name: "Free Investment Credit", href: "/servicios?tab=libreInversion" },
      { name: "Express Credit", href: "/servicios?tab=prestamos" },
      { name: "Savings", href: "/servicios?tab=ahorros" },
    ],
  };

  // About menu items
  const aboutLinks = {
    es: [
      { name: "Conoce CROMU", href: "/nosotros/conoce-cromu" },
      { name: "Misión y Visión", href: "/nosotros/mision-vision" },
      { name: "Historia", href: "/nosotros/historia" },
    ],
    en: [
      { name: "About CROMU", href: "/nosotros/conoce-cromu" },
      { name: "Mission and Vision", href: "/nosotros/mision-vision" },
      { name: "History", href: "/nosotros/historia" },
    ],
  };

  const currentServices = language === "es" ? services.es : services.en;
  const currentAboutLinks = language === "es" ? aboutLinks.es : aboutLinks.en;

  return (
    <nav className="hidden md:flex items-center gap-6">
      {/* Home */}
      <Link href="/" className="text-sm font-medium text-white relative group transition-transform hover:scale-105">
        <span className="relative">
          {language === "es" ? "INICIO" : "HOME"}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
        </span>
      </Link>

      {/* Servicios con dropdown */}
      <div
        className="relative group"
        onMouseEnter={() => setIsServicesOpen(true)}
        onMouseLeave={() => setIsServicesOpen(false)}
      >
        <Link
          href="/servicios"
          className="text-sm font-medium text-white flex items-center gap-1 relative transition-transform hover:scale-105"
        >
          <span className="relative">
            {language === "es" ? "SERVICIOS" : "SERVICES"}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </span>
          <ChevronDown className="h-4 w-4" />
        </Link>

        <AnimatePresence>
          {isServicesOpen && (
            <motion.div
              className="absolute top-full left-0 mt-2 w-60 bg-white rounded-md shadow-lg py-2 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Show all services link */}
              <Link
                href="/servicios"
                className="block px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-all hover:pl-5"
              >
                {language === "es" ? "Ver todos los servicios" : "View all services"}
              </Link>

              <div className="my-1 border-t border-gray-100"></div>

              {/* Individual service links using data from services object */}
              {currentServices.map((service, index) => (
                <Link
                  key={index}
                  href={service.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all hover:pl-5"
                >
                  {service.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nosotros/About Us with dropdown */}
      <div
        className="relative group"
        onMouseEnter={() => setIsAboutOpen(true)}
        onMouseLeave={() => setIsAboutOpen(false)}
      >
        <Link
          href={language === "es" ? "/nosotros" : "/about-us"}
          className="text-sm font-medium text-white flex items-center gap-1 relative transition-transform hover:scale-105"
        >
          <span className="relative">
            {language === "es" ? "NOSOTROS" : "ABOUT US"}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </span>
          <ChevronDown className="h-4 w-4" />
        </Link>

        <AnimatePresence>
          {isAboutOpen && (
            <motion.div
              className="absolute top-full left-0 mt-2 w-60 bg-white rounded-md shadow-lg py-2 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Show main about page link */}
              <Link
                href={language === "es" ? "/nosotros" : "/about-us"}
                className="block px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-all hover:pl-5"
              >
                {language === "es" ? "Sobre nosotros" : "About us"}
              </Link>

              <div className="my-1 border-t border-gray-100"></div>

              {/* Individual about links using data from aboutLinks object */}
              {currentAboutLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all hover:pl-5"
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contacto */}
      <Link href="/contacto" className="text-sm font-medium text-white relative group transition-transform hover:scale-105">
        <span className="relative">
          {language === "es" ? "CONTÁCTENOS" : "CONTACT"}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
        </span>
      </Link>

    </nav>
  );
}