"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Globe, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import RaisedText from "@/components/ui/raised-text"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  
  const [mounted, setMounted] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false)

  // Estados para controlar la visibilidad del header al hacer scroll
  const [scrollY, setScrollY] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  
  // Determinar si estamos en la página de nosotros
  const isOnNosotrosPage = pathname === "/nosotros" || pathname === "/nosotros"

  // Efecto para manejar el hash en la URL cuando se carga la página
  useEffect(() => {
    if (isOnNosotrosPage && window.location.hash) {
      // Extraer el ID del elemento objetivo desde el hash
      const targetId = window.location.hash.substring(1)
      
      // Esperar a que la página se cargue completamente
      setTimeout(() => {
        const targetElement = document.getElementById(targetId)
        
        if (targetElement) {
          const headerOffset = 80
          const elementPosition = targetElement.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          })
        }
      }, 500)
    }
  }, [isOnNosotrosPage, pathname])

  // Efecto para detectar la dirección del scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Si estamos en la parte superior o scrolleando hacia arriba, mostrar el header
      setIsHeaderVisible(scrollY > currentScrollY || currentScrollY < 10)
      setScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollY])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Función mejorada para manejar el scroll suave
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    
    // Cerrar menús móviles si están abiertos
    setIsMobileMenuOpen(false)
    setIsMobileAboutOpen(false)
    setIsMobileServicesOpen(false)
    
    // Verificar si ya estamos en la página de nosotros
    if (isOnNosotrosPage) {
      // Si ya estamos en la página, hacemos scroll suave
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        const headerOffset = 80
        const elementPosition = targetElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        })
      }
    } else {
      // Si no estamos en la página, navegamos a ella con el hash
      const aboutPath = language === "es" ? "/nosotros" : "/nosotros"
      // Usamos router.push para navegación del lado del cliente
      router.push(`${aboutPath}#${targetId}`)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es")
  }

  const Home = {
    es: [
      {name: "INICIO", href: "/"} 
    ],
    en: [
      {name: "HOME", href: "/"} 
    ]
  }
  
  // Servicios con enlaces actualizados que dispararán la selección de pestaña correcta
  const services = {
    es: [
      { name: "Compra de cartera", href: "/servicios?tab=cartera" },
      { name: "Crédito libre inversión", href: "/servicios?tab=libreInversion" },
      { name: "Crédito express", href: "/servicios?tab=prestamos" },
      { name: "Ahorrador", href: "/servicios?tab=ahorros" },
      { name: "Adelanta tu prima", href: "/servicios?tab=adelantoPrima" },
    ],
    en: [
      { name: "Debt Purchase", href: "/servicios?tab=cartera" },
      { name: "Free Investment Credit", href: "/servicios?tab=libreInversion" },
      { name: "Express Credit", href: "/servicios?tab=prestamos" },
      { name: "Savings", href: "/servicios?tab=ahorros" },
      { name: "Advanced Your Bonus", href: "/servicios?tab=adelantoPrima" },
    ],
  }

  // Secciones de Nosotros con IDs para navegación con smooth scroll
  const aboutLinks = {
    es: [
      { name: "Conoce CROMU", href: "/nosotros", id: "conoce-cromu" },
      { name: "Misión y Visión", href: "/nosotros", id: "mision-vision" },
      { name: "Historia", href: "/nosotros", id: "historia" },
    ],
    en: [
      { name: "About CROMU", href: "/nosotros", id: "conoce-cromu" },
      { name: "Mission and Vision", href: "/nosotros", id: "mision-vision" },
      { name: "History", href: "/nosotros", id: "historia" },
    ],
  }

  // URLs principales para los botones de servicios y nosotros
  const mainUrls = {
    es: {
      services: "/servicios",
      about: "/nosotros"
    },
    en: {
      services: "/servicios",
      about: "/nosotros"
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <header
        className={`bg-[#50A58D] text-white fixed w-full top-0 z-50 transition-transform duration-300 shadow-md ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-110">
              <RaisedText text="CROMU" className="text-white text-2xl font-moul" />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href={Home[language][0].href} 
                className="relative text-white group transition-transform duration-300 hover:scale-105"
              >
                {Home[language][0].name}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-200 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <Link 
                  href={mainUrls[language].services}
                  className="flex items-center space-x-1 text-white group transition-transform duration-300 hover:scale-105"
                >
                  <span className="relative">
                    {language === "es" ? "SERVICIOS" : "SERVICES"}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-200 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Link>
                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${
                        theme === "dark"
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white ring-1 ring-black ring-opacity-5"
                      }`}
                    >
                      <div className="py-1">
                        {(language === "es" ? services.es : services.en).map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className={`block px-4 py-2 text-sm transition-all duration-300 rounded-md ${
                              theme === "dark"
                                ? "text-gray-200 hover:bg-gray-700 hover:text-emerald-400 hover:scale-105 hover:shadow-md"
                                : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-105 hover:shadow-md"
                            }`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div
                className="relative"
                onMouseEnter={() => setIsAboutOpen(true)}
                onMouseLeave={() => setIsAboutOpen(false)}
              >
                <Link 
                  href={mainUrls[language].about}
                  className="flex items-center space-x-1 text-white group transition-transform duration-300 hover:scale-105"
                >
                  <span className="relative">
                    {language === "es" ? "NOSOTROS" : "ABOUT US"}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-200 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Link>
                <AnimatePresence>
                  {isAboutOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${
                        theme === "dark"
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white ring-1 ring-black ring-opacity-5"
                      }`}
                    >
                      <div className="py-1">
                        {(language === "es" ? aboutLinks.es : aboutLinks.en).map((item, index) => (
                          <a
                            key={index}
                            href={`${item.href}#${item.id}`}
                            onClick={(e) => handleSmoothScroll(e, item.id)}
                            className={`block px-4 py-2 text-sm transition-all duration-300 rounded-md ${
                              theme === "dark"
                                ? "text-gray-200 hover:bg-gray-700 hover:text-emerald-400 hover:scale-105 hover:shadow-md"
                                : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-105 hover:shadow-md"
                            }`}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link 
                href="/contact" 
                className="relative text-white group transition-transform duration-300 hover:scale-105"
              >
                <span>{language === "es" ? "CONTÁCTENOS" : "CONTACT"}</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-200 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            
            </nav>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="text-white hover:bg-white/20"
                aria-label={language === "es" ? "Switch to English" : "Cambiar a Español"}
              >
                <Globe className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-white hover:bg-white/20"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4"
              >
                <nav className="flex flex-col space-y-4 pb-4">
                  <Link
                    href={Home[language][0].href}
                    className="text-white hover:bg-white/20 px-4 py-2 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {Home[language][0].name}
                  </Link>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between w-full px-4 py-2 text-white hover:bg-white/20 rounded-md">
                      <Link
                        href={mainUrls[language].services}
                        className="font-medium flex-grow"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {language === "es" ? "Servicios" : "Services"}
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsMobileServicesOpen(!isMobileServicesOpen);
                        }}
                        className="flex items-center justify-center"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isMobileServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          {(language === "es" ? services.es : services.en).map((item, index) => (
                            <Link
                              key={index}
                              href={item.href}
                              className="block px-8 py-2 text-white hover:bg-white/20 rounded-md"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileServicesOpen(false);
                              }}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between w-full px-4 py-2 text-white hover:bg-white/20 rounded-md">
                      <Link
                        href={mainUrls[language].about}
                        className="font-medium flex-grow"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {language === "es" ? "Nosotros" : "About Us"}
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsMobileAboutOpen(!isMobileAboutOpen);
                        }}
                        className="flex items-center justify-center"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMobileAboutOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isMobileAboutOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          {(language === "es" ? aboutLinks.es : aboutLinks.en).map((item, index) => (
                            <a
                              key={index}
                              href={`${item.href}#${item.id}`}
                              onClick={(e) => handleSmoothScroll(e, item.id)}
                              className="block px-8 py-2 text-white hover:bg-white/20 rounded-md"
                            >
                              {item.name}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    href="/contact"
                    className="text-white hover:bg-white/20 px-4 py-2 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {language === "es" ? "Contacto" : "Contact"}
                  </Link>

            

                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <div className="h-[72px]"></div>
    </>
  )
}