"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import HeroCarousel from "@/components/hero-carousel"
import TrustSection from "@/components/trust-section"
import DreamsSection from "@/components/dreams-section"
import BelieveSection from "@/components/believe-section"
import FaqSection from "@/components/faq-section"
import CardsBelieve from "@/components/cards-believe"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Cards Believe */}
      <CardsBelieve />

      {/* Believe Section */}
      <BelieveSection />

      {/* Trust Section */}
      <TrustSection />

      {/* Dreams Section */}
      <DreamsSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}

