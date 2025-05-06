"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const ServiceCarousel = () => {
  const { language } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const carouselRef = useRef(null)

  const services = {
    es: [
      {
        id: "compra-cartera",
        title: "Compra de Cartera",
        description: "Unifica tus deudas en una sola, obteniendo mejores tasas y plazos.",
        image: "/imagen2-servicios.jpg",
      },
      {
        id: "libre-inversion",
        title: "Crédito de Libre Inversión",
        description: "Haz lo que siempre soñaste, tus proyectos personales pueden hacerse realidad.",
        image: "/imagen3-servicios.jpg",
      },
      {
        id: "credito-express",
        title: "Crédito Express",
        description: "Dinero rápido y fácil, sin complicaciones ni largos procesos. Todo tu dinero, a la mano.",
        image: "/imagen4-servicios.jpg",
      },
      {
        id: "ahorrador",
        title: "Beneficios para Ahorradores",
        description: "Haz crecer tu dinero con nuestros planes de ahorro programado.",
        image: "/imagen5-servicios.jpg",
      }
    ],
    en: [
      {
        id: "debt-purchase",
        title: "Debt Purchase",
        description: "Unify your debts into one, getting better rates and terms.",
        image: "/imagen2-servicios.jpg",
      },
      {
        id: "free-investment",
        title: "Free Investment Credit",
        description: "Do what you've always dreamed of, your personal projects can come true.",
        image: "/imagen3-servicios.jpg",
      },
      {
        id: "express-credit",
        title: "Express Credit",
        description: "Quick and easy money, without complications or long processes.",
        image: "/imagen4-servicios.jpg",
      },
      {
        id: "savings",
        title: "Benefits for savers",
        description: "Grow your money with our programmed savings plans.",
        image: "/imagen5-servicios.jpg",
      }
    ]
  }

  const currentServices = language === "es" ? services.es : services.en
  
  const nextSlide = useCallback(() => {
    setActiveIndex((prevIndex) => 
      prevIndex === currentServices.length - 1 ? 0 : prevIndex + 1
    )
  }, [currentServices.length])
  
  const prevSlide = useCallback(() => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? currentServices.length - 1 : prevIndex - 1
    )
  }, [currentServices.length])

  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Rotate every 4 seconds
    
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  // Handlers for pausing auto-rotation
  const handleMouseEnter = () => {
    setIsPaused(true);
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsPaused(false);
    setIsHovered(false);
  };
  
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => {
    setTimeout(() => setIsPaused(false), 1000);
  };

  return (
    <section className="py-6 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        {/* Hero Image at the top */}
        <div className="relative w-full h-48 md:h-64 mb-8 rounded-lg overflow-hidden">
          <Image
            src="/imagen1-servicios.jpg"
            alt="CROMU Servicios Financieros"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-4 md:p-6">
              <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-md">
                {language === "es" ? "Impulsa tus Finanzas con CROMU" : "Boost your Finances with CROMU"}
              </h1>
            </div>
          </div>
        </div>

        {/* Título mejorado con diseño más atractivo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-transparent dark:from-emerald-900/20 dark:to-transparent rounded-lg z-0"></div>
          <div className="relative z-10 py-4 px-6">
            <div className="flex items-center justify-center md:justify-start">
              <Sparkles className="h-6 w-6 text-emerald-500 mr-2" />
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 relative">
                {language === "es" ? "Explora Nuestros Servicios" : "Explore Our Services"}
                <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-emerald-500 rounded-full"></span>
              </h2>
            </div>
            <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm md:text-base pl-8">
              {language === "es" 
                ? "Soluciones financieras diseñadas para impulsar tu futuro económico" 
                : "Financial solutions designed to boost your economic future"}
            </p>
          </div>
        </div>

        {/* Layout de dos columnas con carrusel vertical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Columna izquierda: Información (2/3 del ancho en desktop) */}
          <div className="md:col-span-2 space-y-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg h-[400px] pb-8">
          <p className="text-black dark:text-gray-300 text-lg md:text-xl">
            {language === "es" 
             ? "Si estás aquí, es porque buscas una solución financiera a tu medida. En CROMU, te ofrecemos opciones como compra de cartera, crédito de libre inversión, crédito express y beneficios para ahorradores, todo con tasas preferenciales y procesos ágiles.."
              : "If you're here, it's because you're looking for a financial solution tailored to your needs. At CROMU we offer financial products such as debt purchase, free investment credit, express credit, and benefits for savers, all without long preferences and with agile processes."}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg">
            {language === "es"
              ? "Descubre y obtén en 3 pasos y experiencia nuestros servicios profesionales sin complicaciones para hacer realidad tus sueños y evitar problemas."
              : "Discover and get in 3 steps and experience our professional services without complications to make your dreams come true and avoid problems."}
          </p>
            {/* Call to action section - integrado en la columna */}
            <div className="relative top-6 bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-lg flex flex-col md:flex-row items-center justify-between">
              <div className="mb-3 md:mb-0 text-center md:text-left">
          <h3 className="mt-2 text-lg md:text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {language === "es" ? "¿Listo para impulsar tus finanzas?" : "Ready to boost your finances?"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === "es" ? "Contáctanos hoy mismo y descubre cómo podemos ayudarte." : "Contact us today and discover how we can help you."}
          </p>
              </div>
              <Link href="/contact">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
            {language === "es" ? "Contáctanos" : "Contact Us"}
          </Button>
              </Link>
            </div>
          </div>

          {/* Columna derecha: Carrusel vertical (1/3 del ancho en desktop) */}
          <div 
            ref={carouselRef}
            className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
            style={{ height: "440px" }} // Más alto pero más angosto
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Auto-rotation indicator */}
            <div className="absolute top-2 right-2 z-20">
              <span className={`inline-flex h-2 w-2 rounded-full ${isPaused ? 'bg-gray-300' : 'bg-emerald-500 animate-pulse'}`}></span>
            </div>
            
            {/* Navigation Arrows - arriba y abajo para carrusel vertical */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1 z-20">
              <Button 
                onClick={() => {
                  prevSlide();
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 5000);
                }} 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-1 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-md"
              >
                <ChevronUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </Button>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 bottom-1 z-20">
              <Button 
                onClick={() => {
                  nextSlide();
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 5000);
                }} 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-1 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-md"
              >
                <ChevronDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </Button>
            </div>

            {/* Service Cards with improved transition */}
            <div className="h-full relative">
              <AnimatePresence mode="wait">
                {currentServices.map((service, index) => (
                  activeIndex === index && (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0 overflow-hidden"
                    >
                      {/* Full-size background image - Ya no es clickeable */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        {/* Overlay base */}
                        <div className="absolute inset-0 bg-black/10"></div>
                        
                        {/* Sombra de abajo hacia arriba siempre visible */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      </div>
                      
                      {/* Contenido con animación de respiración */}
                      <motion.div 
                        className="relative z-10 h-full flex flex-col justify-end px-4 pb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.7, 
                          delay: 0.2,
                          ease: "easeOut"
                        }}
                      >
                        <motion.div 
                          className="w-full"
                          animate={{ 
                            y: [0, -3, 0], 
                            transition: { 
                              repeat: Infinity, 
                              duration: 3,
                              ease: "easeInOut" 
                            }
                          }}
                        >
                          <h3 className="text-lg font-bold mb-2 text-white drop-shadow-md">
                            {service.title}
                          </h3>
                          <p className="text-sm text-white/90 drop-shadow-md">
                            {service.description}
                          </p>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>

            {/* Indicator dots - verticales ahora */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-1 z-20">
              {currentServices.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsPaused(true);
                    setTimeout(() => setIsPaused(false), 5000);
                  }}
                  className={`w-1.5 rounded-full transition-all ${
                    index === activeIndex ? "h-4 bg-emerald-600" : "h-1.5 bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Timer progress indicator - vertical */}
            {!isPaused && (
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden z-20">
                <motion.div 
                  className="w-full bg-emerald-500"
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceCarousel