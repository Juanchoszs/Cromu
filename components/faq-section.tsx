"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export default function FaqSection() {
  const { language } = useLanguage()

  const content = {
    es: {
      title: "Preguntas Frecuentes",
      faqs: [
        {
          question: "¿Cómo puedo abrir una cuenta en CROMU?",
          answer:
            "Puedes entrar al formulario en contactenos para tener un mejor asesoramiento por via whatsapp o gmail facilitando el proceso de apertura de cuenta. ",
        },
        {
          question: "¿Cuál es la tasa de interés para ahorros?",
          answer:
            "La tasa de interes para ahorradores varia entre el 6% de rendimiento anual y se agrega un 1% adicional por cumplimiento de ahorro en todos los meses del año.",
        },
        {
          question: "¿Cuánto tiempo toma procesar un préstamo?",
          answer:
            "El tiempo de procesamiento para préstamos personales es de 12 a 24 horas una vez que toda la documentación ha sido recibida. Para creditos de libre inversion , el proceso puede tomar entre 24 horas y 48 horas.",
        },
        {
          question: "¿Hay algún cargo por mantenimiento de cuenta?",
          answer:
            "Las cuentas de ahorros no tienen ningun coste ni manejo de cuenta para que tu puedas mejorar en tus finanzas.",
        },
        {
          question: "¿Cuál es el monto mínimo para abrir una cuenta?",
          answer:
            "El monto minimo para abrir una cuenta de ahorros es de 50.000 pesos colombianos todo esto para que puedas empezar en tu ahorro de forma anual. ",
        },
      ],
    },
    en: {
      title: "Frequently Asked Questions",
      faqs: [
        {
          question: "How can I open an account at CROMU?",
          answer:
            "You can use the contact form to receive further assistance via WhatsApp or Gmail, making the account opening process easier.",
        },
        {
          question: "What is the interest rate for savings?",
          answer:
            "The interest rate for savers ranges from 6% annual return to an additional 1% for savings completion throughout the year.",
        },
        {
          question: "How long does it take to process a loan?",
          answer:
            "The processing time for personal loans is 12 to 24 hours once all documentation has been received. For open-end loans, the process can take between 24 and 48 hours.",
        },
        {
          question: "Is there any account maintenance fee?",
          answer:
            "Savings accounts have no cost or account management so you can improve your finances.",
        },
        {
          question: "What is the minimum amount to open an account?",
          answer:
            "The minimum amount to open a savings account is 50,000 Colombian pesos, so you can start saving annually.",
        },
      ],
    },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-12 md:py-16 bg-emerald-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-800 dark:text-white relative"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative inline-block">
            {language === "es" ? content.es.title : content.en.title}
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 h-1 bg-emerald-500 rounded-full"></span>
          </span>
        </motion.h2>

        <motion.div
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            {(language === "es" ? content.es.faqs : content.en.faqs).map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline text-gray-800 dark:text-white text-sm sm:text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 md:px-6 pb-3 md:pb-4 text-gray-600 dark:text-gray-300 text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

