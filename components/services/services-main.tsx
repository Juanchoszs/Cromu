"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PiggyBank, CreditCard, TrendingUp, Briefcase, Clock } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ServicesMain() {
  const { t, language } = useLanguage()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<string>("")
  const servicesSectionRef = useRef<HTMLElement>(null)

  const availableTabs = ["ahorros", "prestamos", "cartera", "libreInversion", "adelantoPrima"]

  useEffect(() => {
    const tabParam = searchParams.get("tab")

    if (tabParam && availableTabs.includes(tabParam)) {
      setActiveTab(tabParam)
      if (servicesSectionRef.current) {
        setTimeout(() => {
          servicesSectionRef.current?.scrollIntoView({ 
            behavior: "smooth",
            block: "start"
          })
        }, 100)
      }
    } else {
      setActiveTab(availableTabs[0])
    }
  }, [searchParams])

  const services = {
    es: [
      {
        id: "ahorros",
        title: "Fondo de Ahorros",
        description: "Haz crecer tu dinero ",
        icon: <PiggyBank aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 1,
            title: "Ahorros Premium",
            description: "Maximiza tus ahorros con nuestra opción premium que ofrece excelentes tasas de rentabilidad para tu futuro financiero.",
            paragraph2: "Disfruta de un servicio sin cuota de manejo y con retiros programados cuando lo necesites.",
            features: [
              "Rentabilidad base del 6% anual",
              "Bono adicional del 1% al completar 12 meses",
              "Total 7% de rentabilidad anual",
              "Sin cuota de manejo",
              "Retiros programados sin penalización",
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "prestamos",
        title: "Préstamos Exprés",
        description: "Financiamiento rápido.",
        icon: <CreditCard aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 4,
            title: "Préstamo Exprés Personal",
            description: "Financiamiento rápido y accesible para emergencias o gastos imprevistos sin complicaciones ni largas esperas.",
            paragraph2: "Con montos adaptados a necesidades cotidianas y aprobación ágil para cuando más lo necesitas.",
            features: [
              "Montos desde $100.000 hasta $1.000.000",
              "Tasa de interés mensual del 2.5%",
              "Aprobación en 24 horas",
              "Plazos de 1 a 24 meses",
              "Sin penalización por pago anticipado",
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "cartera",
        title: "Compra de Cartera",
        description: "Unifica tus deudas",
        icon: <TrendingUp aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 7,
            title: "Compra de Cartera Personal",
            description: "Simplifica tu vida financiera unificando todas tus deudas en un solo préstamo con mejores condiciones y cuotas reducidas.",
            paragraph2: "Nuestros asesores te guiarán en todo el proceso hacia una situación financiera más saludable.",
            features: [
              "Nos acomodamos a la tasa de interés de tu préstamo",
              "Reduce tus cuotas mensuales hasta en un 50%",
              "Plazos flexibles de 12 a 60 meses",
              "Asesoría financiera personalizada incluida",
              "Consolidación de múltiples préstamos en una sola cuota"
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "libreInversion",
        title: "Crédito Libre Inversión",
        description: "Financiamiento para tus proyectos",
        icon: <Briefcase aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 10,
            title: "Crédito Libre Inversión Premium",
            description: "Impulsa tus sueños y proyectos con un financiamiento adaptable a tus necesidades, con montos significativos y tasas preferenciales.",
            paragraph2: "Aprobación rápida y sencilla para hacer realidad tus planes sin preocupaciones financieras.",
            features: [
              "Tasa preferencial del 2.5% mensual",
              "Montos desde $1.000.000 hasta $10.000.000",
              "Plazos flexibles a tu comodidad de pago",
              "Aprobación en 48 horas",
              "Sin codeudor para clientes con historial",
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "adelantoPrima",
        title: "Adelanta tu Prima",
        description: "Recibe el valor de tu prima.",
        icon: <Clock aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 13,
            title: "Adelanto de Prima Salarial",
            description: "Accede de forma inmediata al valor de tu prima salarial cuando más lo necesites, sin esperar meses para contar con ese ingreso extra.",
            paragraph2: "Proceso 100% digital con aprobación rápida y condiciones de pago convenientes.",
            features: [
              "Desembolso casi inmediato",
              "Plazo no mayor a 5 meses",
              "Tasas de interés preferenciales",
              "Proceso 100% digital",
              "Aprobación rápida con relleno automático de datos",
            ],
            highlight: true,
          }
        ],
      },
    ],
    en: [
      {
        id: "ahorros",
        title: "Savings Fund",
        description: "make your money grow.",
        icon: <PiggyBank aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 1,
            title: "Premium Savings ",
            description: "Maximize your savings with our premium option offering excellent return rates and additional benefits for your financial future.",
            paragraph2: "No management fees and flexible scheduled withdrawals for your economic peace of mind.",
            features: [
              "Base annual return of 6%",
              "Additional 1% bonus when completing 12 months",
              "Total 7% annual return",
              "No management fee",
              "Scheduled withdrawals without penalty",
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "prestamos",
        title: "Express Loans",
        description: "Quick financing.",
        icon: <CreditCard aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 4,
            title: "Personal Express Loan",
            description: "Financing for your projects",
            paragraph2: "Amounts adapted to everyday needs with quick approval when you need it most.",
            features: [
              "Amounts from $100,000 to $1,000,000",
              "Monthly interest rate of 2.5%",
              "Approval within 24 hours",
              "Terms from 1 to 24 months",
              "No penalty for early payment",
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "cartera",
        title: "Debt Consolidation",
        description: "Unify your debts.",
        icon: <TrendingUp aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 7,
            title: "Personal Debt Consolidation",
            description: "Simplify your financial life by unifying all your debts into a single loan with better conditions and reduced installments.",
            paragraph2: "Our advisors guide you through the entire process toward a healthier financial situation.",
            features: [
              "We adapt to your current loan interest rate",
              "Reduce your monthly payments by up to 50%",
              "Flexible terms from 12 to 60 months",
              "Personalized financial advice included",
              "Consolidation of multiple loans into a single payment"
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "libreInversion",
        title: "Personal Loan",
        description: "Financing for your personal projects.",
        icon: <Briefcase aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 10,
            title: "Premium Personal Loan",
            description: "Boost your dreams and projects with financing designed to adapt to your needs, with significant amounts and preferential rates.",
            paragraph2: "Quick approval process so you can focus on making your plans come true without financial worries.",
            features: [
              "Preferential rate of 2.5% monthly",
              "Amounts from $1,000,000 to $10,000,000",
              "Flexible terms tailored to your payment comfort",
              "Approval within 48 hours",
              "No co-signer required for clients with credit history",
            ],
            highlight: true,
          }
        ],
      },
      {
        id: "adelantoPrima",
        title: "Advance Your Bonus",
        description: "Receive the value of your premium.",
        icon: <Clock aria-hidden="true" className="h-6 w-6" />,
        content: [
          {
            id: 13,
            title: "Salary Bonus Advance",
            description: "Access your salary bonus immediately when you need it most, without waiting months for that extra income you've earned.",
            paragraph2: "Fully digital process with quick approval and convenient payment terms.",
            features: [
              "Almost immediate disbursement",
              "Term no longer than 5 months",
              "Preferential interest rates",
              "100% digital process",
              "Quick approval with automatic data filling",
            ],
            highlight: true,
          }
        ],
      },
    ],
  }

  const currentServices = language === "es" ? services.es : services.en

  const sectionTitles = {
    es: {
      title: "Nuestros servicios financieros",
      subtitle: "Explora nuestra amplia gama de servicios financieros diseñados para satisfacer todas tus necesidades.",
    },
    en: {
      title: "Our financial services",
      subtitle: "Explore our wide range of financial services designed to meet all your needs.",
    },
  }

  return (
    <section 
      ref={servicesSectionRef} 
      className="py-10 lg:py-20 bg-gray-50 dark:bg-gray-900" 
      id="servicios"
      aria-labelledby="services-heading"
    >
      <div className="container px-4 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            id="services-heading"
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3"
          >
            {t(sectionTitles, "title")}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t(sectionTitles, "subtitle")}</p>
        </motion.div>

        <Tabs 
          value={activeTab || currentServices[0].id} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Service tabs - Mobile & Tablet View */}
          <div className="block md:hidden mb-8">
            <select 
              value={activeTab || currentServices[0].id}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              aria-label="Seleccionar servicio financiero"
            >
              {currentServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          {/* Service tabs - Desktop View */}
          <TabsList 
            className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 bg-transparent h-auto mb-8 lg:mb-12"
            aria-label="Servicios financieros disponibles"
          >
            {currentServices.map((service) => (
              <TabsTrigger
                key={service.id}
                value={service.id}
                aria-label={service.title}
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700 h-auto py-3 md:py-4 lg:py-5 px-2 md:px-3 lg:px-5 flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-700 transition-all text-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  {React.cloneElement(service.icon, { className: "h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" })}
                </div>
                <span className="font-medium text-sm md:text-base lg:text-lg">{service.title}</span>
                <p className="text-xs text-black dark:text-gray-400 font-normal hidden md:block">{service.description}</p>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Service content */}
          {currentServices.map((service) => (
            <TabsContent key={service.id} value={service.id} className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                {service.content.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="mx-auto w-full"
                  >
                    <Card
                      className={`h-full overflow-hidden transition-all duration-300 ${
                        item.highlight
                          ? "border-emerald-500 dark:border-emerald-700 shadow-md"
                          : "hover:border-emerald-300 dark:hover:border-emerald-800"
                      } ${hoveredCard === item.id ? "transform -translate-y-1 md:-translate-y-2" : ""}`}
                    >
                      <CardContent className="p-0">
                        {item.highlight && (
                          <div 
                            className="bg-emerald-600 text-white text-center py-1.5 md:py-2 text-xs md:text-sm font-medium"
                            aria-label="Recomendado"
                          >
                            {t({
                              es: "Recomendado",
                              en: "Recommended",
                            })}
                          </div>
                        )}
                        <div className="p-4 md:p-6 lg:p-8">
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <div className="mb-4 md:mb-6">
                            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-1 md:mb-2">
                              {item.description}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                              {item.paragraph2}
                            </p>
                          </div>
                          <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                            {item.features.map((feature, i) => (
                              <motion.li
                                key={i}
                                className="flex items-start"
                                initial={{ opacity: 0, x: -10 }}
                                animate={hoveredCard === item.id ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                              >
                                <div className="mr-2 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true">
                                  <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <span className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">{feature}</span>
                              </motion.li>
                            ))}
                          </ul>
                          <Link href="/contact" passHref>
                            <Button
                              className={`w-full text-sm md:text-base py-2.5 md:py-3 lg:py-4 font-medium ${
                                item.highlight
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-white hover:bg-gray-100 text-emerald-600 border border-emerald-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-emerald-400 dark:border-emerald-700"
                              }`}
                              aria-label={`${t({
                                es: "Solicitar ",
                                en: "Apply for ",
                              })} ${item.title}`}
                            >
                              {t({
                                es: "Solicitar ahora",
                                en: "Apply now",
                              })}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}