"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

// Predefine los elementos del carrusel fuera del componente
const carouselItems = [
  {
    id: 1,
    title: {
      es: "En <span class='text-emerald-600'>CROMU</span>, tu dinero crece sin riesgos",
      en: "At <span class='text-emerald-600'>CROMU</span>, your money grows without risks",
    },
    description: {
      es: "Protegemos tu inversión con los más altos estándares de seguridad del mercado financiero.",
      en: "We protect your investment with the highest security standards in the financial market.",
    },
    buttonText: {
      es: "Conocer más",
      en: "Learn more",
    },
    buttonLink: "/servicios",
    imageSrc: "carusel-1.webp",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAiEAABAwIGAwAAAAAAAAAAAAABAAIDBAUGERITFCExUdH/xAAUAQEAAAAAAAAAAAAAAAAAAAAE/8QAGREAAgMBAAAAAAAAAAAAAAAAAAECETED/9oADAMBAAIRAxEAPwCp1d5Wa52qwWaEPjMMshfJpGA5zjsOefH1ERSUcuzooor6epmfFDM9rXvcXOAcdgHJ9REVRNoqz/E//9k=",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    imageLeft: true,
  },
  {
    id: 2,
    title: {
      es: "Bienvenido al futuro de las finanzas con <span class='text-emerald-600'>CROMU</span>",
      en: "Welcome to the future of finance with <span class='text-emerald-600'>CROMU</span>",
    },
    description: {
      es: "Construye un futuro financiero sólido para ti y tu familia con nuestras soluciones personalizadas.",
      en: "Build a solid financial future for you and your family with our personalized solutions.",
    },
    buttonText: {
      es: "Comenzar ahora",
      en: "Start now",
    },
    buttonLink: "/servicios",
    imageSrc: "carusel-2.webp",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAeEAABBAEFAAAAAAAAAAAAAAABAAIDEQQFBhIhMf/EABQBAQAAAAAAAAAAAAAAAAAAAAX/xAAaEQACAgMAAAAAAAAAAAAAAAABAgAREiEx/9oADAMBAAIRAxEAPwCp5edhbTMeTJnDcx5a1znOrk9X74REUUrIzuqBsZP/2Q==",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
    imageLeft: false,
  },
  {
    id: 3,
    title: {
      es: "Bienvenido al futuro de las finanzas con <span class='text-emerald-600'>CROMU</span>",
      en: "Welcome to the future of finance with <span class='text-emerald-600'>CROMU</span>",
    },
    description: {
      es: "Haz realidad el sueño de tu casa propia con nuestras soluciones financieras flexibles.",
      en: "Make your dream home a reality with our flexible financial solutions.",
    },
    buttonText: {
      es: "Descubrir opciones",
      en: "Discover options",
    },
    buttonLink: "/servicios",
    imageSrc: "carusel-3.webp",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAABAwIHAQAAAAAAAAAAAAABAAIDBQQGERITFCExQf/EABQBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEQA/AKnV3lZbnabBZoQ+IwyyF8mkYDnOOw559fEREpRy7Oiiiv56mZ8UMz2te9xc4Bx2Acn1ERVE2irP8T//2Q==",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    imageLeft: true,
  },
]

// Constantes para clases CSS
const BUTTON_CLASS = "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
const NAV_BUTTON_CLASS = "rounded-full bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 w-10 h-10 md:w-12 md:h-12 shadow-md"
const INDICATOR_BASE_CLASS = "h-3 md:h-2.5 rounded-full transition-all duration-300"
const INDICATOR_ACTIVE_CLASS = "bg-emerald-600 w-8 md:w-8 dark:bg-emerald-500"
const INDICATOR_INACTIVE_CLASS = "bg-gray-400/70 dark:bg-gray-400/70 w-3 md:w-2.5"

// Componente para el elemento del carrusel (optimizado)
interface CarouselItemProps {
  item: {
    id: number;
    title: { es: string; en: string };
    description: { es: string; en: string };
    buttonText: { es: string; en: string };
    buttonLink: string;
    imageSrc: string;
    blurDataURL: string;
    bgColor: string;
    imageLeft: boolean;
  };
  language: string;
  isVisible: boolean;
}

const CarouselItem = memo(({ item, language, isVisible }: CarouselItemProps) => {
  const title = language === "es" ? item.title.es : item.title.en
  const description = language === "es" ? item.description.es : item.description.en
  const buttonText = language === "es" ? item.buttonText.es : item.buttonText.en
  
  // Reducir trabajo innecesario - no renderizar cuando no es visible
  if (!isVisible) return null

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`absolute inset-0 ${item.bgColor} w-full`}
    >
      {/* Diseño móvil - Imagen de fondo con texto superpuesto */}
      <div className="md:hidden relative h-full">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image
              src={`/${item.imageSrc}`}
              alt={title.replace(/<[^>]*>/g, '')}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={item.id === 1}
              placeholder="blur"
              blurDataURL={item.blurDataURL}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end px-4 pb-16">
          <div className="text-white space-y-4">
            <h1
              className="text-2xl sm:text-3xl font-bold leading-tight"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <p className="text-sm sm:text-base text-gray-200 max-w-md">
              {description}
            </p>
            <div>
              <Link href={item.buttonLink}>
                <Button className={BUTTON_CLASS}>
                  {buttonText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Diseño de escritorio - Diseño de ancho completo */}
      <div className="hidden md:block w-full h-full">
        <div className="flex h-full items-center max-w-7xl mx-auto px-4">
          {item.imageLeft ? (
            <>
              <div className="w-1/2 h-full relative order-1">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={`/${item.imageSrc}`}
                      alt={title.replace(/<[^>]*>/g, '')}
                      fill
                      className="object-contain absolute"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={item.id === 1}
                      placeholder="blur"
                      blurDataURL={item.blurDataURL}
                    />
                  </div>
                </div>
              </div>
              <div className="w-1/2 space-y-6 z-10 order-2 px-6">
                <h1
                  className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  {description}
                </p>
                <div>
                  <Link href={item.buttonLink}>
                    <Button className={BUTTON_CLASS}>
                      {buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-1/2 space-y-6 z-10 px-6">
                <h1
                  className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  {description}
                </p>
                <div>
                  <Link href={item.buttonLink}>
                    <Button className={BUTTON_CLASS}>
                      {buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-1/2 h-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={`/${item.imageSrc}`}
                      alt={title.replace(/<[^>]*>/g, '')}
                      fill
                      className="object-contain absolute"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={item.id === 1}
                      placeholder="blur"
                      blurDataURL={item.blurDataURL}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
})

CarouselItem.displayName = 'CarouselItem'

// Componente de botón de navegación para reducir la repetición
interface NavButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

const NavButton = memo(({ icon, onClick, label }: NavButtonProps) => (
  <Button
    variant="outline"
    size="icon"
    className={NAV_BUTTON_CLASS}
    onClick={onClick}
    aria-label={label}
  >
    {icon}
  </Button>
))

NavButton.displayName = 'NavButton'

// Componente estático para la primera carga (mejora el LCP)
interface StaticFirstSlideProps {
  item: {
    id: number;
    title: { es: string; en: string };
    description: { es: string; en: string };
    buttonText: { es: string; en: string };
    buttonLink: string;
    imageSrc: string;
    blurDataURL: string;
    bgColor: string;
    imageLeft: boolean;
  };
  language: string;
}

const StaticFirstSlide = memo(({ item, language }: StaticFirstSlideProps) => {
  const title = language === "es" ? item.title.es : item.title.en
  
  return (
    <div className={`inset-0 ${item.bgColor} w-full h-full relative`}>
      {/* Diseño móvil optimizado */}
      <div className="md:hidden relative h-full">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image
              src={`/${item.imageSrc}`}
              alt={title.replace(/<[^>]*>/g, '')}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={true} 
              fetchPriority="high"
              loading="eager"
              placeholder="blur"
              blurDataURL={item.blurDataURL}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-end px-4 pb-16">
          <div className="text-white space-y-4">
            <h1
              className="text-2xl sm:text-3xl font-bold leading-tight"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>
        </div>
      </div>
      
      {/* Diseño de escritorio optimizado */}
      <div className="hidden md:block w-full h-full">
        <div className="flex h-full items-center max-w-7xl mx-auto px-4">
          {item.imageLeft ? (
            <>
              <div className="w-1/2 h-full relative order-1">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={`/${item.imageSrc}`}
                      alt={title.replace(/<[^>]*>/g, '')}
                      fill
                      className="object-contain absolute"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={true}
                      fetchPriority="high"
                      loading="eager"
                      placeholder="blur"
                      blurDataURL={item.blurDataURL}
                    />
                  </div>
                </div>
              </div>
              <div className="w-1/2 space-y-6 z-10 order-2 px-6">
                <h1
                  className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-1/2 space-y-6 z-10 px-6">
                <h1
                  className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              </div>
              <div className="w-1/2 h-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={`/${item.imageSrc}`}
                      alt={title.replace(/<[^>]*>/g, '')}
                      fill
                      className="object-contain absolute"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={true}
                      fetchPriority="high"
                      loading="eager"
                      placeholder="blur"
                      blurDataURL={item.blurDataURL}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

StaticFirstSlide.displayName = 'StaticFirstSlide'

// Componente principal del carrusel optimizado
export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const { language } = useLanguage()
  
  // Renderizado progresivo - solo activar el cliente después del montaje
  useEffect(() => {
    // Usar una bandera para no ejecutar esto en SSR
    let mounted = true;
    
    // Cargar previamente las imágenes del carrusel para optimizar el rendimiento
    carouselItems.forEach((item) => {
      const img = new window.Image();
      img.src = `/${item.imageSrc}`;
    });
    
    // Establecer un breve retraso antes de activar la vista del cliente
    const timer = setTimeout(() => {
      if (mounted) {
        setIsClient(true);
      }
    }, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((current) => (current === carouselItems.length - 1 ? 0 : current + 1));
  }, []);
  
  const prevSlide = useCallback(() => {
    setCurrent((current) => (current === 0 ? carouselItems.length - 1 : current - 1));
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [autoplay, nextSlide]);

  const firstItem = carouselItems[0];

  return (
    <div
      className="relative w-full overflow-hidden max-w-full h-[450px] md:h-[500px] flex items-center justify-center"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      {/* Slide estático para SSR y primera carga - mejora significativa del LCP */}
      {!isClient && (
        <StaticFirstSlide item={firstItem} language={language} />
      )}

      {/* Controles de navegación - siempre visibles */}
      <div className="absolute top-1/2 left-2 md:left-4 z-20 transform -translate-y-1/2">
        <NavButton 
          icon={<ChevronLeft className="h-5 w-5 text-black dark:text-white" />}
          onClick={prevSlide}
          label="Diapositiva anterior"
        />
      </div>

      <div className="absolute top-1/2 right-2 md:right-4 z-20 transform -translate-y-1/2">
        <NavButton 
          icon={<ChevronRight className="h-5 w-5 text-black dark:text-white" />}
          onClick={nextSlide}
          label="Siguiente diapositiva"
        />
      </div>

      {/* Indicadores de diapositivas */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`${INDICATOR_BASE_CLASS} ${
              index === current ? INDICATOR_ACTIVE_CLASS : INDICATOR_INACTIVE_CLASS
            }`}
            onClick={() => setCurrent(index)}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>

      {/* Contenido del carrusel - solo renderizar del lado del cliente */}
      {isClient && (
        <div className="relative h-full w-full">
          <AnimatePresence mode="wait">
            {carouselItems.map((item, index) => (
              <CarouselItem 
                key={item.id} 
                item={item} 
                language={language} 
                isVisible={current === index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}