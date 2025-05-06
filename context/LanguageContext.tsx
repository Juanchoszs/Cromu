"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "es" | "en"

type Translations = {
  [key: string]: {
    es: string
    en: string
  }
}

// Translations dictionary
export const translations: Translations = {
  // Header
  "nav.home": {
    es: "INICIO",
    en: "HOME",
  },
  "nav.services": {
    es: "SERVICIOS",
    en: "SERVICES",
  },
  "nav.contact": {
    es: "CONTÁCTANOS",
    en: "CONTACT US",
  },

  // Hero Carousel
  "hero.1.title": {
    es: "En CROMU, tu dinero crece con un 6% + 1% adicional",
    en: "At CROMU, your money grows with 6% + 1% additional",
  },
  "hero.1.description": {
    es: "Nuestro Fondo de Ahorros te ofrece una rentabilidad del 6% anual más un 1% adicional por cumplimiento.",
    en: "Our Savings Fund offers you a 6% annual return plus an additional 1% for compliance.",
  },
  "hero.1.button": {
    es: "Conocer más",
    en: "Learn more",
  },
  "hero.2.title": {
    es: "Préstamos Exprés al 2.5% mensual",
    en: "Express Loans at 2.5% monthly",
  },
  "hero.2.description": {
    es: "Financiamiento rápido para emergencias o necesidades inmediatas con aprobación en 24 horas.",
    en: "Fast financing for emergencies or immediate needs with approval within 24 hours.",
  },
  "hero.2.button": {
    es: "Solicitar ahora",
    en: "Apply now",
  },
  "hero.3.title": {
    es: "Unifica tus deudas con Compra de Cartera",
    en: "Consolidate your debts with Debt Consolidation",
  },
  "hero.3.description": {
    es: "Mejora tus condiciones de pago y reduce tus cuotas mensuales hasta en un 50%.",
    en: "Improve your payment conditions and reduce your monthly payments by up to 50%.",
  },
  "hero.3.button": {
    es: "Comenzar",
    en: "Start now",
  },

  // Reasons section
  "reasons.title": {
    es: "Razones para Elegirnos",
    en: "Reasons to Choose Us",
  },
  "reasons.card1.title": {
    es: "Atención Continua",
    en: "Continuous Support",
  },
  "reasons.card1.description": {
    es: "Proceso rápido y eficiente para todas tus necesidades financieras.",
    en: "Fast and efficient process for all your financial needs.",
  },
  "reasons.card2.title": {
    es: "Seguridad",
    en: "Security",
  },
  "reasons.card2.description": {
    es: "Protección para tus inversiones y datos personales.",
    en: "Protection for your investments and personal data.",
  },
  "reasons.card3.title": {
    es: "Planes competitivos",
    en: "Competitive Plans",
  },
  "reasons.card3.description": {
    es: "Inversiones con las mejores tasas del mercado.",
    en: "Investments with the best market rates.",
  },
  "reasons.card4.title": {
    es: "Mejor tasa de interés",
    en: "Best Interest Rate",
  },
  "reasons.card4.description": {
    es: "Obtén más por tu dinero con nuestras tasas competitivas.",
    en: "Get more for your money with our competitive rates.",
  },

  // Grow with us section
  "grow.badge": {
    es: "Únete a nosotros",
    en: "Join us",
  },
  "grow.title": {
    es: "Elige crecer con nosotros",
    en: "Choose to grow with us",
  },
  "grow.subtitle": {
    es: "Ahorra con rendimiento. Como intereses sobre tu dinero.",
    en: "Save with returns. Like interest on your money.",
  },
  "grow.feature1.title": {
    es: "Préstamos accesibles",
    en: "Accessible Loans",
  },
  "grow.feature1.description": {
    es: "Tasas bajas y plazos de pago flexibles.",
    en: "Low rates and flexible payment terms.",
  },
  "grow.feature2.title": {
    es: "Transparencia total",
    en: "Total Transparency",
  },
  "grow.feature2.description": {
    es: "Sin costos ocultos ni sorpresas.",
    en: "No hidden costs or surprises.",
  },
  "grow.feature3.title": {
    es: "Accesibilidad",
    en: "Accessibility",
  },
  "grow.feature3.description": {
    es: "Gestiona tus finanzas desde cualquier lugar.",
    en: "Manage your finances from anywhere.",
  },
  "grow.button": {
    es: "Conocer más",
    en: "Learn more",
  },

  // Trust section
  "trust.title": {
    es: "Personas que confían en nosotros",
    en: "People who trust us",
  },
  "trust.description": {
    es: "En CROMU, nos enorgullecemos de contar con una comunidad de clientes que han consolidado su confianza en nosotros a lo largo de los años. Somos una institución financiera sólida, ofreciendo servicios de ahorro y préstamos para personas con los estándares económicos más exigentes.",
    en: "At CROMU, we take pride in having a community of clients who have consolidated their trust in us over the years. We are a solid financial institution, offering savings and loan services for people with the most demanding economic standards.",
  },
  "trust.stats.years": {
    es: "Años de experiencia",
    en: "Years of experience",
  },
  "trust.stats.clients": {
    es: "Clientes satisfechos",
    en: "Satisfied clients",
  },
  "trust.stats.branches": {
    es: "Sucursales",
    en: "Branches",
  },
  "trust.stats.satisfaction": {
    es: "Índice de satisfacción",
    en: "Satisfaction rate",
  },

  // Dreams section
  "dreams.title": {
    es: "CROMU, haciendo realidad tus sueños",
    en: "CROMU, making your dreams come true",
  },
  "dreams.description": {
    es: "Ya sea que estés buscando comprar tu primera casa, planear tus próximas vacaciones, ahorrar para objetivos flexibles y préstamos accesibles, te ayudamos a construir el futuro que deseas con seguridad y confianza. ¡Haz realidad todos tus sueños financieros!",
    en: "Whether you're looking to buy your first home, plan your next vacation, save for flexible goals and accessible loans, we help you build the future you want with security and confidence. Make all your financial dreams come true!",
  },
  "dreams.button": {
    es: "Comienza hoy",
    en: "Start today",
  },

  // FAQ section
  "faq.title": {
    es: "Preguntas Frecuentes",
    en: "Frequently Asked Questions",
  },
  "faq.q1": {
    es: "¿Cómo puedo abrir una cuenta en CROMU?",
    en: "How can I open an account at CROMU?",
  },
  "faq.a1": {
    es: "Puedes abrir una cuenta visitando cualquiera de nuestras sucursales con tu identificación oficial, comprobante de domicilio y un depósito inicial. También ofrecemos apertura de cuentas en línea a través de nuestra aplicación móvil.",
    en: "You can open an account by visiting any of our branches with your official ID, proof of address, and an initial deposit. We also offer online account opening through our mobile app.",
  },
  "faq.q2": {
    es: "¿Cuál es la tasa de interés para ahorros?",
    en: "What is the interest rate for savings?",
  },
  "faq.a2": {
    es: "Nuestras tasas de interés para cuentas de ahorro varían entre 3.5% y 5.2% anual, dependiendo del tipo de cuenta y el plazo. Consulta con un asesor para obtener información personalizada.",
    en: "Our interest rates for savings accounts vary between 3.5% and 5.2% annually, depending on the type of account and term. Consult with an advisor for personalized information.",
  },
  "faq.q3": {
    es: "¿Cuánto tiempo toma procesar un préstamo?",
    en: "How long does it take to process a loan?",
  },
  "faq.a3": {
    es: "El tiempo de procesamiento para préstamos personales es de 24 a 72 horas una vez que toda la documentación ha sido recibida. Para préstamos hipotecarios, el proceso puede tomar entre 2 y 3 semanas.",
    en: "The processing time for personal loans is 24 to 72 hours once all documentation has been received. For mortgage loans, the process can take between 2 and 3 weeks.",
  },
  "faq.q4": {
    es: "¿Hay algún cargo por mantenimiento de cuenta?",
    en: "Is there any account maintenance fee?",
  },
  "faq.a4": {
    es: "Las cuentas básicas no tienen cargos de mantenimiento si mantienes un saldo mínimo de $500. Las cuentas premium tienen un cargo mensual de $15 que se puede eximir si mantienes un saldo promedio mensual de $2,500.",
    en: "Basic accounts have no maintenance fees if you maintain a minimum balance of $500. Premium accounts have a monthly fee of $15 that can be waived if you maintain a monthly average balance of $2,500.",
  },
  "faq.q5": {
    es: "¿Cuál es el monto mínimo para abrir una cuenta?",
    en: "What is the minimum amount to open an account?",
  },
  "faq.a5": {
    es: "El monto mínimo para abrir una cuenta de ahorro básica es de $100. Para cuentas de inversión, el monto mínimo es de $1,000. Consulta nuestros diferentes planes para más detalles.",
    en: "The minimum amount to open a basic savings account is $100. For investment accounts, the minimum amount is $1,000. Check our different plans for more details.",
  },

  // Footer
  "footer.address": {
    es: "Av. Principal #123\nCiudad Financiera\nTel: (123) 456-7890\nEmail: contacto@cromu.com",
    en: "Main Ave. #123\nFinancial City\nPhone: (123) 456-7890\nEmail: contact@cromu.com",
  },
  "footer.services": {
    es: "Servicios",
    en: "Services",
  },
  "footer.services.savings": {
    es: "Cuentas de Ahorro",
    en: "Savings Accounts",
  },
  "footer.services.loans": {
    es: "Préstamos",
    en: "Loans",
  },
  "footer.services.investments": {
    es: "Inversiones",
    en: "Investments",
  },
  "footer.services.insurance": {
    es: "Seguros",
    en: "Insurance",
  },
  "footer.information": {
    es: "Información",
    en: "Information",
  },
  "footer.information.about": {
    es: "Sobre Nosotros",
    en: "About Us",
  },
  "footer.information.terms": {
    es: "Términos y Condiciones",
    en: "Terms and Conditions",
  },
  "footer.information.privacy": {
    es: "Política de Privacidad",
    en: "Privacy Policy",
  },
  "footer.information.programs": {
    es: "Programas Financieros",
    en: "Financial Programs",
  },
  "footer.follow": {
    es: "Síguenos",
    en: "Follow Us",
  },
  "footer.newsletter": {
    es: "Suscríbete a nuestro boletín",
    en: "Subscribe to our newsletter",
  },
  "footer.newsletter.placeholder": {
    es: "Tu correo electrónico",
    en: "Your email",
  },
  "footer.newsletter.button": {
    es: "Enviar",
    en: "Send",
  },
  "footer.copyright": {
    es: "© 2025 CROMU. Todos los derechos reservados.",
    en: "© 2025 CROMU. All rights reserved.",
  },

  // Theme toggle
  "theme.light": {
    es: "Modo claro",
    en: "Light mode",
  },
  "theme.dark": {
    es: "Modo oscuro",
    en: "Dark mode",
  },

  // Language toggle
  "language.es": {
    es: "Español",
    en: "Spanish",
  },
  "language.en": {
    es: "Inglés",
    en: "English",
  },
  // Navigation
  "nav.savings": {
    es: "AHORRADOR",
    en: "SAVINGS",
  },
  "nav.loans": {
    es: "PRESTAMOS",
    en: "LOANS",
  },
  "nav.portfolio": {
    es: "COMPRA DE CARTERA",
    en: "PORTFOLIO PURCHASE",
  },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  // Load saved language preference from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    return translations[key][language]
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

