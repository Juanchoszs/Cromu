"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Globe, Moon, Sun, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

// Translations object moved outside the component for cleaner code
const translations = {
  es: {
    needInfo: "¿NECESITAS MÁS INFORMACIÓN?",
    contactUs: "CONTÁCTANOS",
    description: "CROMU ofrece a sus clientes y partes interesadas diversos canales de comunicación para atender sus consultas y solicitudes.",
    transparency: "Además, dispone de una Línea de Transparencia para recibir consultas y reportes sobre cualquier irregularidad que pueda afectar el cumplimiento de las normativas y los principios de Buen Gobierno.",
    language: "Español",
  },
  en: {
    needInfo: "NEED MORE INFORMATION?",
    contactUs: "CONTACT US",
    description: "CROMU offers its clients and stakeholders various communication channels to address their inquiries and requests.",
    transparency: "Additionally, we have a Transparency Line to receive inquiries and reports about any irregularity that may affect compliance with regulations and Good Governance principles.",
    language: "English",
  }
}

// Animation variants for consistent animations
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const slideIn = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 }
}

export function ContactPageHeader() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Ensure consistent rendering between server and client
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es")
    setIsLangMenuOpen(false)
  }
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }
  
  if (!mounted) {
    return null
  }

  return (
    <motion.div 
      className="flex flex-col"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#a3e4d7] to-[#7dccbd] dark:from-[#1a5c41] dark:to-[#0d3825] py-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <motion.div 
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
        </div>

        {/* Large Watermark Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1 
            className="text-[#7dccbd]/40 dark:text-[#3a8c6a]/20 text-8xl md:text-9xl font-bold uppercase select-none tracking-widest"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={language}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {t(translations, "contactUs")}
              </motion.span>
            </AnimatePresence>
          </motion.h1>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto text-center px-4">
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.h2 
                key={language}
                className="text-white text-4xl md:text-5xl font-bold drop-shadow-lg tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {t(translations, "needInfo")}
              </motion.h2>
            </AnimatePresence>
          </motion.div>
          
          {/* Language and Theme Controls */}
          
        </div>
        
        {/* Bottom Decorative Bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-[#2a7d5a] via-[#1a5c41] to-[#2a7d5a] dark:from-[#1a5c41] dark:via-[#0d3825] dark:to-[#1a5c41]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        />
      </section>

      {/* Content Section - Image and Text */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Left - Image */}
        <motion.div 
          className="h-[450px] md:h-[600px] relative overflow-hidden"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image
            src="/contacta-1.png"
            alt="Contact image"
            fill
            className="object-cover"
          />
          
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          />
          
          <motion.div 
            className="absolute inset-0 bg-[#2a7d5a]/30 mix-blend-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
        </motion.div>
        
        {/* Right - Text Content */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-10 md:p-16 flex flex-col justify-center"
          variants={slideIn}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <AnimatePresence mode="wait">
            <motion.h2 
              key={`title-${language}`}
              className="text-[#2a7d5a] dark:text-[#a3e4d7] text-4xl md:text-5xl font-bold mb-8 relative inline-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {t(translations, "contactUs")}
              <motion.span 
                className="absolute -bottom-2 left-0 w-full h-1 bg-[#2a7d5a] dark:bg-[#a3e4d7]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
              />
            </motion.h2>
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${language}`}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.p 
                className="text-gray-700 dark:text-gray-200 text-xl leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {t(translations, "description")}
              </motion.p>
              
              <motion.p 
                className="text-gray-700 dark:text-gray-200 text-xl leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                {t(translations, "transparency")}
              </motion.p>
              
              <motion.div 
                className="pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >              
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>
    </motion.div>
  )
}