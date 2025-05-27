"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import RaisedText from "@/components/raised-text"

// Definir la interfaz para los enlaces del footer
interface FooterLink {
  name: string;
  href: string;
}

export function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    es: {
      company: {
        title: "Compañía",
        links: [
          { name: "Sobre nosotros", href: "/sobre-nosotros" },
          { name: "Nuestro equipo", href: "/equipo" },
          { name: "Carreras", href: "/carreras" },
          { name: "Contacto", href: "/contacto" },
        ],
      },
      services: {
        title: "Servicios",
        links: [
          { name: "Créditos", href: "/servicios#creditos" },
          { name: "Ahorros", href: "/servicios#ahorros" },
          { name: "Inversiones", href: "/servicios#inversiones" },
          { name: "Empresas", href: "/servicios#empresas" },
        ],
      },
      legal: {
        title: "Legal",
        links: [
          { name: "Términos y condiciones", href: "/terminos" },
          { name: "Política de privacidad", href: "/privacidad" },
          { name: "Cookies", href: "/cookies" },
          { name: "Seguridad", href: "/seguridad" },
        ],
      },
      contact: {
        title: "Contacto",
        address: "Calle Principal 123, Ciudad",
        phone: "+123 456 7890",
        email: "info@cromu.com",
      },
      copyright: " 2023 CROMU. Todos los derechos reservados.",
    },
    en: {
      company: {
        title: "Company",
        links: [
          { name: "About us", href: "/about-us" },
          { name: "Our team", href: "/team" },
          { name: "Careers", href: "/careers" },
          { name: "Contact", href: "/contact" },
        ],
      },
      services: {
        title: "Services",
        links: [
          { name: "Credits", href: "/services#credits" },
          { name: "Savings", href: "/services#savings" },
          { name: "Investments", href: "/services#investments" },
          { name: "Business", href: "/services#business" },
        ],
      },
      legal: {
        title: "Legal",
        links: [
          { name: "Terms and conditions", href: "/terms" },
          { name: "Privacy policy", href: "/privacy" },
          { name: "Cookies", href: "/cookies" },
          { name: "Security", href: "/security" },
        ],
      },
      contact: {
        title: "Contact",
        address: "Main Street 123, City",
        phone: "+123 456 7890",
        email: "info@cromu.com",
      },
      copyright: " 2023 CROMU. All rights reserved.",
    },
  }

  const socialLinks = [
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, href: "https://facebook.com" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "https://instagram.com" },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com" },
  ]

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
              <RaisedText text="CROMU" className="text-[#50A58D] text-3xl font-moul" />
            </Link>
            <p className="text-gray-400 mb-6">
              {t({
                es: "Soluciones financieras innovadoras para un futuro próspero.",
                en: "Innovative financial solutions for a prosperous future.",
              })}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#50A58D] transition-all"
                  whileHover={{
                    scale: 1.1,
                    transition: {
                      duration: 0.3,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    },
                  }}
                  aria-label={link.name}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{t(footerLinks, "company.title")}</h3>
            <ul className="space-y-4">
              {t(footerLinks, "company.links").map((link: FooterLink, index: number) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#50A58D] transition-all relative group">
                    <span className="relative">
                      {link.name}
                      <motion.span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#50A58D] group-hover:w-full"
                        initial={false}
                        transition={{ duration: 0.3 }}
                        animate={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{t(footerLinks, "services.title")}</h3>
            <ul className="space-y-4">
              {t(footerLinks, "services.links").map((link: FooterLink, index: number) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#50A58D] transition-all relative group">
                    <span className="relative">
                      {link.name}
                      <motion.span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#50A58D] group-hover:w-full"
                        initial={false}
                        transition={{ duration: 0.3 }}
                        animate={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{t(footerLinks, "contact.title")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#50A58D] mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">{t(footerLinks, "contact.address")}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-[#50A58D] mr-3 flex-shrink-0" />
                <span className="text-gray-400">{t(footerLinks, "contact.phone")}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-[#50A58D] mr-3 flex-shrink-0" />
                <span className="text-gray-400">{t(footerLinks, "contact.email")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              {(() => {
                const copyright = t(footerLinks, "copyright")
                if (typeof copyright !== "string" || !copyright.includes("CROMU")) {
                  return copyright
                }

                const parts = copyright.split("CROMU")
                return (
                  <>
                    {parts[0]}
                    <RaisedText text="CROMU" className="text-[#50A58D] font-medium" />
                    {parts[1] || ""}
                  </>
                )
              })()}
            </p>
            <div className="flex space-x-6">
              {t(footerLinks, "legal.links").map((link: FooterLink, index: number) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-500 hover:text-[#50A58D] text-sm transition-all relative group"
                >
                  <span className="relative">
                    {link.name}
                    <motion.span
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#50A58D] group-hover:w-full"
                      initial={false}
                      transition={{ duration: 0.3 }}
                      animate={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
