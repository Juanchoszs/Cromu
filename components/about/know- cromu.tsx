"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

// Componente Conoce CROMU con ID para navegación
export function ConoceCromu() {
  const { language, setLanguage } = useLanguage();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "#2E735F",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const content = {
    es: {
      title: "Conoce CROMU",
      description: "Cromu finance services facilita el acceso a créditos y servicios de ahorro para nuestros asociados, con más de 10 años de experiencia en el sector financiero.",
      benefits: ["Tasas preferenciales", "Atención personalizada", "Soluciones a tu medida"],
      button1: "Nuestros Servicios",
      button2: "Contáctenos",
      imageCreditText: "Familia CROMU",
      routes: {
        services: "/servicios",
        contact: "/contact"
      }
    },
    en: {
      title: "About CROMU",
      description: "Cromu Finance Services facilitates access to credit and savings services for our members, with more than 10 years of experience in the financial sector.",
      benefits: ["Preferential rates", "Personalized attention", "Tailored solutions"],
      button1: "Our Services",
      button2: "Contact Us",
      imageCreditText: "CROMU Family",
      routes: {
        services: "/servicios",
        contact: "/contact"
      }
    },
  };

  const currentContent = language === "es" ? content.es : content.en;
  
  const themeColors = {
    primary: "from-emerald-700 to-emerald-600",
    secondary: "from-teal-700 to-teal-600",
    hover: "hover:bg-emerald-800",
    buttonText: "text-emerald-700",
    buttonHover: "hover:text-emerald-800",
  };

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  return (
    <motion.div
      id="conoce-cromu" // ID para navegación desde header
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={`bg-gradient-to-r ${themeColors.primary} rounded-lg overflow-hidden shadow-xl max-w-6xl mx-auto my-8`}
    >
      <div className="absolute top-4 right-4 z-10">
        <motion.button
          onClick={toggleLanguage}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Globe size={14} />
          <span>{language === "es" ? "EN" : "ES"}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="flex flex-col justify-center space-y-6 p-4">
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <Users className="text-white/90" size={24} />
            <AnimatePresence mode="wait">
              <motion.h2 
                key={language}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={textVariants}
                transition={{ duration: 0.4 }}
                className="text-3xl md:text-4xl font-bold text-white"
              >
                {currentContent.title}
              </motion.h2>
            </AnimatePresence>
          </motion.div>
          
          <motion.h3 
            variants={itemVariants}
            className="text-white/90 text-xl font-medium -mt-4"
          >
          </motion.h3>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={language}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={textVariants}
              transition={{ duration: 0.4 }}
              className="text-white/90 text-lg"
            >
              {currentContent.description}
            </motion.p>
          </AnimatePresence>
          
          <motion.ul variants={itemVariants} className="space-y-2">
            {currentContent.benefits.map((benefit, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="flex items-center gap-2 text-white/90"
              >
                <span className="h-1.5 w-1.5 bg-white/90 rounded-full"></span>
                {benefit}
              </motion.li>
            ))}
          </motion.ul>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <Link href={currentContent.routes.services}>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button 
                  className={`bg-white ${themeColors.buttonText} ${themeColors.buttonHover} font-medium px-6 py-2 rounded-md w-full sm:w-auto flex items-center gap-2 shadow-md transition-all duration-300`}
                >
                  {currentContent.button1}
                  <ArrowRight size={16} />
                </Button>
              </motion.div>
            </Link>
            
            <Link href={currentContent.routes.contact}>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button 
                  variant="outline" 
                  className="border-white text-white bg-transparent hover:bg-white/20 font-medium px-6 py-2 rounded-md w-full sm:w-auto flex items-center gap-2 transition-all duration-300"
                >
                  {currentContent.button2}
                  <ArrowRight size={16} />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
        
        <motion.div
          variants={itemVariants}
          className="relative h-64 md:h-full min-h-[300px] rounded-lg overflow-hidden"
        >
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { duration: 0.8, delay: 0.2 } 
            }}
            className="absolute inset-0"
          >
            <Image
              src="nosotros-1.jpg" // Cambia la ruta de la imagen según tu estructura de carpetas
              alt={currentContent.imageCreditText}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg shadow-inner transition-opacity duration-500"
              priority
            />
            <div className="absolute inset-0 bg-emerald-900/10 hover:bg-emerald-900/5 transition-all duration-300 rounded-lg" />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 text-sm"
            >
              {currentContent.imageCreditText}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Componente de Misión y Visión con ID para navegación
export function MisionVision() {
  const { language } = useLanguage();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const content = {
    es: {
      mision: {
        title: "Misión",
        text: "Proporcionar soluciones financieras accesibles y personalizadas que mejoren la calidad de vida de nuestros asociados, fomentando el desarrollo económico y social de las comunidades donde operamos."
      },
      vision: {
        title: "Visión",
        text: "Ser reconocidos como la cooperativa financiera líder en innovación y servicio al cliente, expandiendo nuestra presencia mientras mantenemos nuestro compromiso con los valores cooperativos y la inclusión financiera."
      }
    },
    en: {
      mision: {
        title: "Mission",
        text: "To provide accessible and personalized financial solutions that improve the quality of life of our associates, promoting the economic and social development of the communities where we operate."
      },
      vision: {
        title: "Vision",
        text: "To be recognized as the leading financial cooperative in innovation and customer service, expanding our presence while maintaining our commitment to cooperative values and financial inclusion."
      }
    }
  };

  const currentContent = language === "es" ? content.es : content.en;

  return (
    <motion.div
      id="mision-vision" // ID para navegación desde header
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl mx-auto my-16 p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Misión */}
        <motion.div 
          variants={itemVariants}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              {currentContent.mision.title}
            </h2>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {currentContent.mision.text}
          </p>
        </motion.div>

        {/* Visión */}
        <motion.div 
          variants={itemVariants}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-400">
              {currentContent.vision.title}
            </h2>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {currentContent.vision.text}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
