import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ContactPageHeader } from "@/components/contact/contacto"
import {ContactFormComponent} from "@/components/contact/form"



export const metadata: Metadata = {
  title: "Servicios Financieros | CROMU",
  description:
    "Descubre nuestra amplia gama de servicios financieros diseñados para ayudarte a alcanzar tus metas financieras.",
}

export default function contacpage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      
      <Header />

      <ContactPageHeader />

      <ContactFormComponent/>

      <Footer />  

    </div>
  )
}

