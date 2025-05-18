"use client"

import { useState } from "react"
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MobileMenu() {
  const { language, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)

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
  }

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
  }

  // Main URLs
  const mainUrls = {
    es: {
      services: "/servicios",
      about: "/nosotros"
    },
    en: {
      services: "/servicios",
      about: "/about-us"
    }
  }

  const currentServices = language === "es" ? services.es : services.en
  const currentAboutLinks = language === "es" ? aboutLinks.es : aboutLinks.en

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:bg-white/20"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile menu content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 right-0 bg-emerald-600 shadow-lg z-50"
          >
            <div className="flex flex-col py-4">
              {/* Home link */}
              <Link
                href="/"
                className="text-white font-medium py-2 px-4 rounded-md hover:bg-emerald-700 transition-all transform hover:scale-105"
                onClick={() => setIsOpen(false)}
              >
                {language === "es" ? "INICIO" : "HOME"}
              </Link>

              {/* Services dropdown - Only toggle dropdown, no navigation */}
              <div className="relative">
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full flex items-center justify-between text-white font-medium py-2 px-4 rounded-md hover:bg-emerald-700 transition-all transform hover:scale-105"
                >
                  <span>{language === "es" ? "SERVICIOS" : "SERVICES"}</span>
                  {isServicesOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {/* Services submenu */}
                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-700 px-2"
                    >
                      {/* Main services link */}
                      <Link
                        href={mainUrls[language].services}
                        className="block text-white py-2 px-6 rounded-md hover:bg-emerald-800 transition-all transform hover:scale-105"
                        onClick={() => {
                          setIsOpen(false);
                          setIsServicesOpen(false);
                        }}
                      >
                        {language === "es" ? "Ver todos los servicios" : "View all services"}
                      </Link>
                      
                      {/* Individual service links */}
                      {currentServices.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="block text-white py-2 px-6 rounded-md hover:bg-emerald-800 transition-all transform hover:scale-105"
                          onClick={() => {
                            setIsOpen(false);
                            setIsServicesOpen(false);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* About Us dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAboutOpen(!isAboutOpen)}
                  className="w-full flex items-center justify-between text-white font-medium py-2 px-4 rounded-md hover:bg-emerald-700 transition-all transform hover:scale-105"
                >
                  <span>{language === "es" ? "NOSOTROS" : "ABOUT US"}</span>
                  {isAboutOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {/* About submenu */}
                <AnimatePresence>
                  {isAboutOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-700 px-2"
                    >
                      {/* Main about link */}
                      <Link
                        href={mainUrls[language].about}
                        className="block text-white py-2 px-6 rounded-md hover:bg-emerald-800 transition-all transform hover:scale-105"
                        onClick={() => {
                          setIsOpen(false);
                          setIsAboutOpen(false);
                        }}
                      >
                        {language === "es" ? "Sobre nosotros" : "About us"}
                      </Link>
                      
                      {/* Individual about links */}
                      {currentAboutLinks.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="block text-white py-2 px-6 rounded-md hover:bg-emerald-800 transition-all transform hover:scale-105"
                          onClick={() => {
                            setIsOpen(false);
                            setIsAboutOpen(false);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact link */}
              <Link
                href="/contacto"
                className="text-white font-medium py-2 px-4 rounded-md hover:bg-emerald-700 transition-all transform hover:scale-105"
                onClick={() => setIsOpen(false)}
              >
                {language === "es" ? "CONTÁCTENOS" : "CONTACT"}
              </Link>

              {/* Mi Espacio */}
              <Link
                href="/espacio"
                className="text-white font-medium py-2 px-4 rounded-md hover:bg-emerald-700 transition-all transform hover:scale-105"
                onClick={() => setIsOpen(false)}
              >
                {language === "es" ? "MI ESPACIO" : "MY SPACE"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}