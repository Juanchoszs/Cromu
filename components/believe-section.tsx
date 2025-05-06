"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Shield, Clock, Smartphone } from "lucide-react"

// Memoized feature component
interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  index: number
}

const Feature = memo(({ icon, title, description, index }: FeatureProps) => (
  <motion.div
    className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-2 md:space-y-0 md:space-x-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </motion.div>
))

Feature.displayName = 'Feature'

export default function BelieveSection() {
  const { language } = useLanguage()

  const content = {
    es: {
      title: "Elige CRECER con nosotros",
      subtitle: "La mejor opción para tu futuro financiero",
      description:
        "Únete a miles de personas que ya confían en CROMU para hacer crecer su dinero de manera segura y rentable.",
      features: [
        {
          icon: <Shield className="h-6 w-6" />,
          title: "Seguridad garantizada",
          description: "Tu dinero siempre protegido con los más altos estándares de seguridad.",
        },
        {
          icon: <Clock className="h-6 w-6" />,
          title: "Atención 24/7",
          description: "Estamos aquí para ayudarte en cualquier momento que nos necesites.",
        },
        {
          icon: <Smartphone className="h-6 w-6" />,
          title: "100% digital",
          description: "Gestiona tus finanzas desde cualquier lugar con nuestra app móvil.",
        },
      ],
      button: "Únete ahora",
    },
    en: {
      title: "Choose to believe in us",
      subtitle: "The best choice for your financial future",
      description: "Join thousands of people who already trust CROMU to grow their money safely and profitably.",
      features: [
        {
          icon: <Shield className="h-6 w-6" />,
          title: "Guaranteed security",
          description: "Your money is always protected with the highest security standards.",
        },
        {
          icon: <Clock className="h-6 w-6" />,
          title: "24/7 Support",
          description: "We're here to help you whenever you need us.",
        },
        {
          icon: <Smartphone className="h-6 w-6" />,
          title: "100% digital",
          description: "Manage your finances from anywhere with our mobile app.",
        },
      ],
      button: "Join now",
    },
  }

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image - optimized and with local path */}
            <motion.div
            className="relative mx-auto lg:mx-0 max-w-[240px] lg:max-w-none order-1 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            >
            <Image
              src="/creer-nosotros.webp"
              alt={language === "es" ? "Elige creer con nosotros" : "Choose to believe in us"}
              width={480}
              height={480}
              className="rounded-lg shadow-md w-full h-auto"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent rounded-lg" />
            </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-6 md:space-y-8 order-2 lg:order-2 text-center lg:text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
                {language === "es" ? content.es.title : content.en.title}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
                {language === "es" ? content.es.subtitle : content.en.subtitle}
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-300">
              {language === "es" ? content.es.description : content.en.description}
            </p>

            <div className="space-y-4 md:space-y-6">
              {(language === "es" ? content.es.features : content.en.features).map((feature, index) => (
                <Feature
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>

            <div className="pt-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 h-12 text-base">
                {language === "es" ? content.es.button : content.en.button}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}