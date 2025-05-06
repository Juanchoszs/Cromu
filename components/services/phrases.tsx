"use client"

import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { useInView } from "react-intersection-observer"
import Link from "next/link"  // Importamos Link de Next.js

export default function Phrases() {
  const { t, language } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const content = {
    es: {
      mainTitle: "Tus buenas decisiones merecen recompensas.",
      subTitle: "En CROMU, te ofrecemos un espacio seguro y flexible para hacer",
      highlightedText: "CRECER TUS AHORROS,",
      subText: "gestionarlos con libertad y avanzar con confianza hacia el cumplimiento de tus metas.",
      ctaButton: "Comienza ahora",
      features: [
        "Rentabilidad garantizada",
        "Sin comisiones ocultas",
        "Retiros flexibles",
        "Asesoría personalizada",
      ],
    },
    en: {
      mainTitle: "Your good decisions deserve rewards.",
      subTitle: "At CROHU, we offer you a safe and flexible space to",
      highlightedText: "grow your savings,",
      subText: "manage them with freedom and move forward with confidence towards meeting your goals.",
      ctaButton: "Start now",
      features: [
        "Guaranteed returns",
        "No hidden fees",
        "Flexible withdrawals",
        "Personalized advice",
      ],
    },
  }

  const currentContent = language === "es" ? content.es : content.en

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-900 dark:to-teal-800">
      <div className="container mx-auto">
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Text Column */}
          <motion.div className="text-white space-y-6 px-4 lg:px-8">
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              variants={itemVariants}
            >
              {currentContent.mainTitle}
            </motion.h2>
            
            <motion.div className="space-y-3 text-lg" variants={itemVariants}>
              <p>{currentContent.subTitle}</p>
              <p className="font-semibold text-teal-200 text-3xl">{currentContent.highlightedText}</p>
              <p>{currentContent.subText}</p>
            </motion.div>
            
            <motion.div 
              className="pt-4"
              variants={itemVariants}
            >
              <ul className="grid grid-cols-2 gap-3">
                {currentContent.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2 flex-shrink-0">
                      <svg className="h-5 w-5 text-teal-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-sm md:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="pt-2"
            >
              {/* Reemplazamos el botón con un componente Link */}
              <Link href="/contact">
                <button 
                  className="px-6 py-3 bg-white text-emerald-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-300 shadow-lg transform hover:scale-105 hover:shadow-xl"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {currentContent.ctaButton}
                  <span className="ml-2 inline-block transition-transform duration-300 transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Image Column */}
          <motion.div 
            className="relative h-[300px] md:h-[400px] lg:h-[500px] flex justify-center lg:justify-end"
            variants={itemVariants}
          >
            {/* Placeholder for your image - replace src with your actual image path */}
            <div className="relative w-full max-w-md h-full">
              <img 
              src="servicios-0.webp" 
              alt="Descripción de la imagen" 
              className="absolute inset-0 w-full h-full object-cover rounded-xl border-2 border-white/20"
              />
            </div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-300 rounded-full opacity-30 dark:opacity-20"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0],
                  opacity: [0.3, 0.4, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-8 -left-8 w-16 h-16 bg-teal-300 rounded-full opacity-40 dark:opacity-20"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, -5, 0],
                  opacity: [0.4, 0.5, 0.4]
                }}
                transition={{ duration: 7, repeat: Infinity, delay: 1 }}
              />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}