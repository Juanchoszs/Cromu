"use client"

import Image from "next/image"
import CountUpAnimation from "@/components/count-up-animation"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export default function TrustSection() {
  const { language } = useLanguage()

  const content = {
    es: {
      title: "Personas que confían en nosotros",
      description:
        "En <span class='text-[#50A58D]'>CROMU</span>, nos enorgullecemos de contar con una comunidad de clientes que han consolidado su confianza en nosotros a lo largo de los años. Somos una institución financiera sólida, ofreciendo servicios de ahorro y préstamos para personas con los estándares económicos más exigentes.",
      stats: {
        years: "Años de experiencia",
        clients: "Clientes satisfechos",
        branches: "Creditos",
        satisfaction: "Índice de satisfacción",
      },
    },
    en: {
      title: "People who trust us",
      description:
        "At <span class='text-[#50A58D]'>CROMU</span>, we take pride in having a community of clients who have consolidated their trust in us over the years. We are a solid financial institution, offering savings and loan services for people with the most demanding economic standards.",
      stats: {
        years: "Years of experience",
        clients: "Satisfied clients",
        branches: "Branches",
        satisfaction: "Satisfaction rate",
      },
    },
  }

  return (
    <section className="py-12 md:py-16 overflow-hidden border-t border-gray-100 dark:border-gray-800">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Texto y estadísticas - Centrado en móvil */}
          <motion.div
            className="space-y-6 text-center md:text-left"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              {language === "es" ? content.es.title : content.en.title}
            </h2>
            <p
              className="text-gray-600 dark:text-gray-300 text-sm sm:text-base"
              dangerouslySetInnerHTML={{
                __html: language === "es" ? content.es.description : content.en.description,
              }}
            />

            {/* Estadísticas en grid de 2x2 - Mejor espaciado en móvil */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto md:mx-0">
              <div className="bg-emerald-50 dark:bg-gray-800 p-3 md:p-4 rounded-lg">
                <div className="flex items-end justify-center md:justify-start gap-1 md:gap-2">
                  <CountUpAnimation end={10} duration={4} />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">+</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  {language === "es" ? content.es.stats.years : content.en.stats.years}
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-gray-800 p-3 md:p-4 rounded-lg">
                <div className="flex items-end justify-center md:justify-start gap-1 md:gap-2">
                  <CountUpAnimation end={300} duration={4} />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">+</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  {language === "es" ? content.es.stats.clients : content.en.stats.clients}
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-gray-800 p-3 md:p-4 rounded-lg">
                <div className="flex items-end justify-center md:justify-start gap-1 md:gap-2">
                  <CountUpAnimation end={200} duration={4} />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">+</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  {language === "es" ? content.es.stats.branches : content.en.stats.branches}
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-gray-800 p-3 md:p-4 rounded-lg">
                <div className="flex items-end justify-center md:justify-start gap-1 md:gap-2">
                  <CountUpAnimation end={98} duration={4} />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">%</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  {language === "es" ? content.es.stats.satisfaction : content.en.stats.satisfaction}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mapa - Mejorado para móvil */}
          <motion.div
            className="flex justify-center w-full"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-full">
              <Image
                src="/mapa-colombia.webp"
                alt="Mapa de Colombia"
                width={600}
                height={600}
                className="rounded-lg shadow-md mx-auto"
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}