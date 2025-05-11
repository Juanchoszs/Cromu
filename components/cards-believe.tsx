"use client"

import { useState } from 'react';
import { useLanguage } from "@/contexts/language-context";
import { Clock, Shield, TrendingUp, Percent } from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Memoize the Card component to prevent unnecessary re-renders
const Card = ({ title, description, icon }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardId = `card-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div 
      className={`bg-teal-100 rounded-lg p-6 flex flex-col items-center text-center transition-transform duration-300 ease-in-out ${
        isHovered ? 'scale-105' : ''
      }`}
      style={{
        boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-labelledby={cardId}
    >
      <div className="w-32 h-32 mb-4 flex items-center justify-center">
        <div className="bg-emerald-600 rounded-full p-4 flex items-center justify-center">
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      <h3 
        id={cardId} 
        className="text-xl font-bold mb-2 text-emerald-800"
      >
        {title}
      </h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

const CardsBelieve = () => {
  const { t } = useLanguage();

  const cards = [
    {
      title: t({ 
        en: "Save Time", 
        es: "Ahorra Tiempo" 
      }),
      description: t({ 
        en: "Fast and simple processes, saving your time", 
        es: "Procesos rápidos y sencillos, ahorrando tu tiempo" 
      }),
      icon: <Clock size={40} strokeWidth={1.5} />
    },
    {
      title: t({ 
        en: "Security", 
        es: "Seguridad" 
      }),
      description: t({ 
        en: "Your money is safely backed by years of experience in the financial market with no management fee.", 
        es: "Tu dinero estará respaldado de forma segura por años de experiencia en el mercado financiero sin cuota de manejo" 
      }),
      icon: <Shield size={40} strokeWidth={1.5} />
    },
    {
      title: t({ 
        en: "Good Profitability", 
        es: "Buena Rentabilidad" 
      }),
      description: t({ 
        en: "6% annual return and another 1% additional for compliance with your savings", 
        es: "Rentabilidad de 6% anual y otro 1% adicional por cumplimiento en  tus ahorros" 
      }),
      icon: <TrendingUp size={40} strokeWidth={1.5} />
    },
    {
      title: t({ 
        en: "Low Rates", 
        es: "Bajas Tasas" 
      }),
      description: t({ 
        en: "We provide a low monthly interest rate, being the lowest in the market.", 
        es: "Proporcionamos una baja tasa de interés mensual siendo las más bajas del mercado" 
      }),
      icon: <Percent size={40} strokeWidth={1.5} />
    }
  ];

  const benefitsHeading = t({
    en: "Our Benefits",
    es: "Nuestros Beneficios"
  });

  return (
    <section aria-labelledby="benefits-heading" className="py-12">
      <h2 id="benefits-heading" className="sr-only">{benefitsHeading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 p-4 md:p-6 max-w-7xl mx-auto">
        {cards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>
    </section>
  );
};

export default CardsBelieve;