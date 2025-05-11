"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export default function DreamsSection() {
  const { language } = useLanguage()

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Imagen de fondo - Mejor posicionamiento para móvil */}
      <div className="absolute inset-0">
        <Image
          src="image24.webp"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />{" "}
        {/* Overlay mejorado para legibilidad */}
      </div>

      {/* Contenido superpuesto - Mejor centrado y espaciado para móvil */}
      <div className="relative z-10 container h-full flex items-center justify-end px-4 md:px-6">
        <motion.div
          className="max-w-xl ml-auto md:mx-0 text-white md:text-left"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            dangerouslySetInnerHTML={{
              __html:
                language === "es"
                  ? "<span class='text-[#50A58D]'>CROMU</span>, haciendo realidad tus sueños"
                  : "<span class='text-[#50A58D]'>CROMU</span>, making your dreams come true",
            }}
          />
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {language === "es"
              ? "Ya sea que estés buscando viajar, ahorrar o invertir, te ayudamos a construir el futuro que deseas con seguridad y confianza."
              : "Whether you're looking to travel, save or invest, we help you build the future you want with security and confidence."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button
              className="bg-[#50A58D] hover:bg-[#408c77] text-white px-8 py-2 h-12 text-base"
              onClick={() => window.location.href = "/servicios"}
            >
              {language === "es" ? "Comienza hoy" : "Start today"}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

