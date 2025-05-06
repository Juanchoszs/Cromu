import React, { createContext, useContext, useState, ReactNode } from "react";
import en from "@/components/locales/en"
import es from "@/components/locales/es"

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<string>("en"); // El idioma predeterminado es "en"
  const languageLabel = language === "es" ? "Español" : "English";
  const t = (key: string): string => {
    const keys = key.split(".");
    let translation: any = language === "es" ? es : en; // Selecciona el idioma

    for (let i = 0; i < keys.length; i++) {
      translation = translation[keys[i]]; // Navega por las claves
      if (!translation) {
        return key; // Si no se encuentra la traducción, devuelve la clave original
      }
    }

    return translation; 
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
