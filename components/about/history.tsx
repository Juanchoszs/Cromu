"use client";

import { useRef, useEffect, useMemo } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "next-themes";
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Tv, 
  GraduationCap, 
  Car, 
  Home, 
  Clock, 
  ChevronRight,
  Star
} from "lucide-react";
import React from "react";

export function TimelineHistory() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -200px 0px" });

  // Animation configurations
  const animations = useMemo(() => ({
    container: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.3,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1.0],
        },
      },
    },
    line: {
      hidden: { pathLength: 0 },
      visible: {
        pathLength: 1,
        transition: { 
          duration: 1.5, 
          ease: "easeInOut",
          delay: 0.5
        },
      },
    },
    icon: {
      hidden: { scale: 0, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }
      }
    },
    title: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.5, delay: 0.1 }
      }
    },
    yearBadge: {
      hidden: { scale: 0 },
      visible: { 
        scale: 1,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: 0.3
        }
      }
    },
    milestone: {
      hidden: { opacity: 0, x: 30 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.5, delay: 0.4 }
      }
    },
    floatingStar: {
      initial: { y: 0, rotate: 0 },
      animate: { 
        y: [-5, 5, -5],
        rotate: [0, 10, -10, 0],
        transition: {
          duration: 6,
          repeat: Infinity,
          repeatType: "loop" as "loop",
          ease: "easeInOut"
        }
      }
    }
  }), []);

  // Timeline content
  const content = useMemo(() => ({
    es: {
      title: "NUESTRA HISTORIA",
      subtitle: "Crecimiento Continuo",
      description: "Reconocemos que en Colombia persiste una marcada desigualdad en el acceso a los recursos financieros ofrecidos por las instituciones bancarias, especialmente para la población trabajadora, afectada por factores como bajos ingresos, historial crediticio negativo o la falta de garantías. Por eso, desde nuestros inicios, nos hemos comprometido a impulsar los sueños financieros de nuestros clientes, trabajando constantemente para ampliar nuestros servicios y brindar oportunidades reales a quienes más lo necesitan.",
      timeline: [
        {
          year: "2018",
          title: "Los Inicios",
          description: "Comenzamos como una pequeña entidad generando créditos de consumo básico, ayudando a nuestros primeros clientes a cubrir sus necesidades inmediatas.",
          icon: <DollarSign />
        },
        {
          year: "2019",
          title: "Primera Expansión",
          description: "Ampliamos nuestro catálogo para ofrecer créditos de mayor valor, comenzando a financiar electrodomésticos y mejoras para el hogar.",
          icon: <Tv />
        },
        {
          year: "2020",
          title: "Financiando Sueños Educativos",
          description: "Incorporamos líneas de crédito especiales para educación, ayudando a financiar carreras universitarias y formación profesional.",
          icon: <GraduationCap />
        },
        {
          year: "2021",
          title: "Consolidación de Servicios",
          description: "Diversificamos nuestras opciones de financiamiento y mejoramos nuestros procesos para ofrecer una experiencia más ágil y confiable.",
          icon: <TrendingUp />
        },
        {
          year: "2022",
          title: "Financiación Automotriz",
          description: "Lanzamos nuestro programa de financiación para vehículos, permitiendo a nuestros clientes adquirir su medio de transporte soñado.",
          icon: <Car />
        },
        {
          year: "Ahora",
          title: "Sueños de Vivienda",
          description: "Expandimos nuestros horizontes para ofrecer créditos destinados a cuotas iniciales de vivienda, ayudando a nuestros clientes a dar el primer paso hacia su hogar propio.",
          icon: <Home />
        }
      ],
      futureTitle: "El Futuro de Cromu",
      futureText: "Seguimos comprometidos con la innovación y el crecimiento, siempre atentos a las necesidades cambiantes de nuestros clientes para ofrecerles las mejores soluciones financieras del mercado."
    },
    en: {
      title: "OUR HISTORY",
      subtitle: "Continuous Growth",
      description: "We recognize that Colombia still faces marked inequality in access to financial resources offered by banking institutions, especially for the working population, affected by factors such as low income, poor credit history, or lack of collateral. Therefore, since our inception, we have been committed to empowering our clients' financial dreams, constantly working to expand our services and provide real opportunities to those most in need.",
      timeline: [
        {
          year: "2018",
          title: "The Beginning",
          description: "We started as a small entity generating basic consumer loans, helping our first clients cover their immediate needs.",
          icon: <DollarSign />
        },
        {
          year: "2019",
          title: "First Expansion",
          description: "We expanded our catalog to offer higher-value credits, beginning to finance home appliances and home improvements.",
          icon: <Tv />
        },
        {
          year: "2020",
          title: "Financing Educational Dreams",
          description: "We incorporated special credit lines for education, helping to finance university degrees and professional training.",
          icon: <GraduationCap />
        },
        {
          year: "2021",
          title: "Service Consolidation",
          description: "We diversified our financing options and improved our processes to offer a more agile and reliable experience.",
          icon: <TrendingUp />
        },
        {
          year: "2022",
          title: "Automotive Financing",
          description: "We launched our vehicle financing program, allowing our clients to acquire their dream mode of transportation.",
          icon: <Car />
        },
        {
          year: "Now",
          title: "Housing Dreams",
          description: "We expanded our horizons to offer credits for housing down payments, helping our clients take the first step toward their own home.",
          icon: <Home />
        }
      ],
      futureTitle: "The Future of Cromu",
      futureText: "We remain committed to innovation and growth, always attentive to the changing needs of our clients to offer them the best financial solutions in the market."
    }
  }), []);

  const currentContent = language === "es" ? content.es : content.en;

  // Trigger animation when component is in view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <section
      id="historia"
      className="py-20 bg-gradient-to-b from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden"
    >
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={animations.container}
        className="max-w-6xl mx-auto px-4 sm:px-6"
      >
        {/* Header Section */}
        <motion.div
          variants={animations.item}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-block mb-3"
            variants={animations.icon}
          >
            <div className="p-4 bg-emerald-100 dark:bg-emerald-800 rounded-full shadow-md">
              <Clock className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </motion.div>
          <motion.h2
            variants={animations.title}
            className="text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-3"
          >
            {currentContent.title}
          </motion.h2>
          <motion.div 
            variants={animations.milestone}
            className="flex items-center justify-center mb-4"
          >
            <div className="h-1 w-10 bg-emerald-300 dark:bg-emerald-700 rounded-full mx-2"></div>
            <h3 className="text-2xl font-medium text-emerald-600 dark:text-emerald-400">
              {currentContent.subtitle}
            </h3>
            <div className="h-1 w-10 bg-emerald-300 dark:bg-emerald-700 rounded-full mx-2"></div>
          </motion.div>
          <motion.p 
            variants={animations.item}
            className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300"
          >
            {currentContent.description}
          </motion.p>
        </motion.div>

        {/* Timeline Section */}
        <div className="relative">
          {/* Vertical line for timeline */}
          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-emerald-200 dark:bg-emerald-900/50"></div>
          
          {/* Animated SVG line overlaid on static line */}
          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full">
            <svg 
              height="100%" 
              width="10" 
              viewBox="0 0 10 100" 
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              <motion.path
                d="M5 0 L5 100"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                variants={animations.line}
                className="dark:stroke-emerald-500"
              />
            </svg>
          </div>

          {/* Timeline Items */}
          {currentContent.timeline.map((item, index) => (
            <motion.div
              key={index}
              variants={animations.item}
              className={`relative flex flex-col md:flex-row ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } mb-16 z-10`}
            >
              {/* Year Badge */}
              <motion.div 
                variants={animations.yearBadge}
                className="absolute left-4 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-lg">
                  <span className="font-bold">{item.year}</span>
                </div>
              </motion.div>

              {/* Timeline Content Box */}
              <div 
                className={`w-full md:w-1/2 ${
                  index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                } ${
                  index % 2 === 0 ? "md:text-right" : "md:text-left"
                } pl-12 md:pl-0 mt-6 md:mt-0`}
              >
                <motion.div
                  variants={animations.milestone}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-emerald-500 ${
                    index % 2 === 0 ? "md:border-l-0 md:border-r-4" : "border-l-4"
                  }`}
                >
                  <div className={`flex items-center gap-3 mb-3 ${
                    index % 2 === 0 ? "md:justify-end" : "md:justify-start"
                  }`}>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                      {React.cloneElement(item.icon, { 
                        className: "h-5 w-5 text-emerald-600 dark:text-emerald-400" 
                      })}
                    </div>
                    <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Future Section */}
          <motion.div
            variants={animations.item}
            className="mt-20 mb-10 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-teal-800 rounded-xl p-8 text-white shadow-xl relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-x-8 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full opacity-10 -translate-x-10 translate-y-10"></div>
            
            {/* Floating stars */}
            <motion.div 
              variants={animations.floatingStar}
              animate="animate"
              initial="initial"
              className="absolute top-10 right-10"
            >
              <Star className="h-10 w-10 text-yellow-200 opacity-50" />
            </motion.div>
            <motion.div 
              variants={animations.floatingStar}
              animate="animate"
              initial="initial"
              className="absolute bottom-10 left-20"
              style={{ animationDelay: "1s" }}
            >
              <Star className="h-6 w-6 text-yellow-200 opacity-30" />
            </motion.div>
            
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <motion.h3
                variants={animations.title}
                className="text-3xl font-bold mb-4"
              >
                {currentContent.futureTitle}
              </motion.h3>
              <motion.p
                variants={animations.item}
                className="text-lg font-light"
              >
                {currentContent.futureText}
              </motion.p>

              <motion.div
                variants={animations.milestone}
                className="mt-8"
              >
                <a 
                  href="/contact" 
                  className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-full font-medium hover:bg-emerald-50 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  <span>Contáctanos</span>
                  <ChevronRight className="h-5 w-5" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default TimelineHistory;