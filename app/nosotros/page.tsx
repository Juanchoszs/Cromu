import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ConoceCromu } from "@/components/about/know- cromu"
import {MisionVision} from "@/components/about/mission-vision"
import {TimelineHistory} from "@/components/about/history"

export const metadata: Metadata = {
  title: "Servicios Financieros | CROMU",
  description:
    "Descubre nuestra amplia gama de servicios financieros diseñados para ayudarte a alcanzar tus metas financieras.",
}

export default function aboutpage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      
      <Header />

      <ConoceCromu/>

      <MisionVision/>

      <TimelineHistory/>
      
      <Footer />

    </div>
  )
}

