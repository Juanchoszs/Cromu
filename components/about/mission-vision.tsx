"use client";

import { useRef, useEffect, useMemo } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "next-themes";
import { Target, Eye, Heart, Star, Shield, Users, BarChart } from "lucide-react";

export function MisionVision() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

  // Animaciones optimizadas
  const animations = useMemo(() => ({
    container: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.2,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier para una animación más fluida
        },
      },
    },
    float: {
      initial: { y: 0 },
      animate: { 
        y: [-5, 5, -5],
        transition: {
          duration: 6,
          repeat: Infinity,
          repeatType: "loop" as const,
          ease: "easeInOut"
        }
      }
    }
  }), []);

  // Contenido multilingüe mejorado
  const content = useMemo(() => ({
    es: {
      mision: {
        title: "MISIÓN",
        text: "Mantener una competitividad exclusiva con nuestros clientes, que por supuesto sean parte de esta familia que es Cromu Financiera. El crecimiento continuo es nuestro objetivo y por supuesto ofrecer mejores servicios cada vez que se adapten a las necesidades del cliente. La calidad y la eficiencia siempre será nuestro primer objetivo. Queremos crecer cada vez más junto con ustedes, nuestros clientes, nuestra familia."
      },
      vision: {
        title: "VISIÓN",
        text: "Llegar a hacer una compañía financiera sólida que siempre vele por los clientes y por supuesto mantener la fidelidad de ellos. Ayudar en el crecimiento familiar industrial y comercial cuando requieran de un impulso económico para así satisfacer las necesidades requeridas. El crecimiento continuo es nuestro objetivo para así en el mercado ser líderes."
      },
      aboutTitle: "EN CROMU...",
      aboutText: "Nos enorgullece compartir nuestra misión y visión, los pilares que guían nuestro compromiso con soluciones financieras accesibles, transparentes y confiables.",
      valuesTitle: "Nuestros Valores",
      values: [
        "Confianza", "Transparencia", "Integridad", "Compromiso", "Excelencia", 
        "Innovación", "Responsabilidad", "Sostenibilidad", "Respeto", "Colaboración"
      ]
    },
    en: {
      mision: {
        title: "MISSION",
        text: "Maintain exclusive competitiveness with our clients, who are of course part of the Cromu Financiera family. Continuous growth is our goal and of course offering better services each time that adapt to client needs. Quality and efficiency will always be our first objective. We want to grow more and more together with you, our clients, our family."
      },
      vision: {
        title: "VISION",
        text: "To become a solid financial company that always looks after clients and of course maintains their loyalty. Help in family, industrial and commercial growth when they require economic impulse to satisfy the required needs. Continuous growth is our objective to be leaders in the market."
      },
      aboutTitle: "AT CROMU...",
      aboutText: "We take pride in sharing our mission and vision, the pillars that guide our commitment to accessible, transparent, and reliable financial solutions.",
      valuesTitle: "Our Values",
      values: [
        "Trust", "Transparency", "Integrity", "Commitment", "Excellence", 
        "Innovation", "Responsibility", "Sustainability", "Respect", "Collaboration"
      ]
    }
  }), []);

  const currentContent = language === "es" ? content.es : content.en;

  // Disparar animación cuando el componente está en vista
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <section
      id="mision-vision"
      className="py-16 bg-gradient-to-b from-white to-emerald-50 dark:from-gray-900 dark:to-gray-800"
    >
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={animations.container}
        className="max-w-6xl mx-auto px-4 sm:px-6"
      >
        {/* About Section - Enhanced Header */}
        <motion.div
          variants={animations.item}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600 text-white p-8 rounded-xl lg:col-span-3 shadow-xl mb-12 transform transition hover:shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-x-8 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full opacity-10 -translate-x-10 translate-y-10"></div>
          
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.div 
              variants={animations.item}
              className="inline-block mb-4 p-3 bg-white/20 rounded-full shadow-lg"
            >
              <Star className="h-8 w-8 text-white" />
            </motion.div>
            <motion.h2
              variants={animations.item}
              className="text-4xl font-bold mb-4"
            >
              {currentContent.aboutTitle}
            </motion.h2>
            <motion.p
              variants={animations.item}
              className="text-lg font-light mb-6"
            >
              {currentContent.aboutText}
            </motion.p>
            <motion.div 
              variants={animations.item}
              className="h-1 w-20 bg-white/50 mx-auto rounded-full"
            ></motion.div>
          </div>
        </motion.div>

        {/* Mission Section - With image on right */}
        <motion.div 
          variants={animations.item}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <div className="bg-emerald-100 dark:bg-emerald-900 p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md">
                <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {currentContent.mision.title}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
              {currentContent.mision.text}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
            <motion.img 
              variants={animations.float}
              animate="animate"
              initial="initial"
              src="mision-1.jpg" 
              alt="Mission Image" 
              className="rounded-lg max-h-64 object-cover shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        </motion.div>

        {/* Vision Section - With image on left (intercalated) */}
        <motion.div 
          variants={animations.item}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {/* Image now on the left */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
            <motion.img 
              variants={animations.float}
              animate="animate"
              initial="initial"
              src="visio-1.jpg" 
              alt="Vision Image" 
              className="rounded-lg max-h-64 object-cover shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Vision text on the right */}
          <div className="bg-emerald-100 dark:bg-emerald-900 p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md">
                <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {currentContent.vision.title}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
              {currentContent.vision.text}
            </p>
          </div>
        </motion.div>

        {/* Values Section - Enhanced with more values in two rows */}
        <motion.div
          variants={animations.item}
          className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-xl overflow-hidden shadow-lg relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/30 dark:to-transparent"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-emerald-100 dark:bg-emerald-800 p-2 shadow-inner flex items-center justify-center">
                <img 
                  src="/logo-cromu.png" 
                  alt="CROMU Logo" 
                  className="h-24 w-24 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/logo-cromu.png";
                    target.alt = "CROMU Logo Placeholder";
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col justify-center">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {currentContent.valuesTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {currentContent.values.map((value, index) => (
                    <motion.span 
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors duration-300"
                    >
                      {value}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default MisionVision;