import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import ServiceCarousel  from "@/components/services/service-carousel"
import ServicesMain from "@/components/services/services-main"
import Phrases from "@/components/services/phrases"
import { Suspense } from "react" // <-- AGREGA ESTO

export const metadata: Metadata = {
  title: "Servicios Financieros | CROMU",
  description:
    "Descubre nuestra amplia gama de servicios financieros diseñados para ayudarte a alcanzar tus metas financieras.",
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      
      <Header />

      <Suspense fallback={<div>Cargando servicios...</div>}>
        <ServiceCarousel/>
        <ServicesMain/>
        <Phrases />
      </Suspense>

      <Footer />

    </div>
  )
}
