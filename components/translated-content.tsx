import { createContext, useContext, useState } from "react"
import en from "@/components/locales/en"
import es from "@/components/locales/es"

const translations = { es, en }

type Language = "es" | "en"

const LanguageContext = createContext({
  language: "es" as Language,
  setLanguage: (_: Language) => {},
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language]
    for (const k of keys) {
      value = value?.[k]
    }
    return typeof value === "string" ? value : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
