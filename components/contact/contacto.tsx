"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, FileText, ArrowRight, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function ContactPageHeader() {
  const [mounted, setMounted] = useState(false);
  const { language, t } = useLanguage();

  const translations = {
    es: {
      watermark: "CONTACTENOS",
      title: "¿NECESITAS MÁS INFORMACIÓN?",
      subtitle: "COMUNÍQUESE CON CROMU",
      description:
        "Estamos comprometidos a ofrecer un servicio excepcional. Nuestro equipo de expertos está listo para atender sus consultas y solicitudes de manera profesional y eficiente.",
      contactTitle: "Información de Contacto",
      email: "Email",
      phone: "Teléfono",
      address: "Dirección",
      location: "Villa del Rìo",
      hours: "Horario de Atención",
      schedule: "Lunes a Viernes: 9:00 - 18:00",
      requestTitle: "Solicitudes y Consultas",
      request1:
        "CROMU ofrece diversos canales de comunicación para atender sus consultas y solicitudes de manera eficiente y profesional.",
      request2:
        "Disponemos de una Línea de Transparencia para recibir consultas y reportes sobre cualquier irregularidad que pueda afectar el cumplimiento normativo.",
      requestButton: "Solicitar Información",
      tagline: "Excelencia en servicio desde 2014",
    },
    en: {
      watermark: "CONTACT US",
      title: "NEED MORE INFORMATION?",
      subtitle: "CONTACT CROMU",
      description:
        "We are committed to providing exceptional service. Our team of experts is ready to address your queries and requests professionally and efficiently.",
      contactTitle: "Contact Information",
      email: "Email",
      phone: "Phone",
      address: "Address",
      location: "Villa del Rìo",
      hours: "Business Hours",
      schedule: "Monday to Friday: 9:00 - 18:00",
      requestTitle: "Requests and Inquiries",
      request1:
        "CROMU offers multiple communication channels to address your inquiries and requests efficiently and professionally.",
      request2:
        "We provide a Transparency Line to receive inquiries and reports about any irregularities affecting regulatory compliance.",
      requestButton: "Request Information",
      tagline: "Excellence in service since 2014",
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col">
      {/* Encabezado */}
      <section className="relative py-10 bg-gradient-to-r from-[#1a5c41] via-[#2a7d5a] to-[#1a5c41] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 overflow-hidden pointer-events-none">
          <motion.h1 className="text-white text-8xl md:text-9xl font-bold uppercase tracking-widest whitespace-nowrap">
            {t(translations).watermark}
          </motion.h1>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col items-center">
            <motion.div
              className="relative inline-block"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2 className="text-white text-3xl md:text-5xl font-bold tracking-[0.1em] text-center">
                {t(translations).title}
              </motion.h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección principal */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h3
              className="inline-block relative text-[#1a5c41] dark:text-emerald-400 text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {t(translations).subtitle}
              <motion.div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 bg-[#2a7d5a]"
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            </motion.h3>
            <motion.p
              className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {t(translations).description}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              className="lg:col-span-1 rounded-lg overflow-hidden shadow-lg h-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-full min-h-[300px]">
                <Image
                  src="/contacta-1.png"
                  alt="Equipo profesional de CROMU"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a5c41]/90 via-[#1a5c41]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                  <motion.div
                    className="mb-3 h-0.5 bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                  <h4 className="text-white text-xl font-medium mb-1">CROMU</h4>
                  <p className="text-white/90 text-sm">{t(translations).tagline}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#2a7d5a]/10 flex items-center justify-center mr-3">
                    <Mail className="w-4 h-4 text-[#2a7d5a]" />
                  </div>
                  <h5 className="text-[#1a5c41] dark:text-emerald-400 font-medium">
                    {t(translations).contactTitle}
                  </h5>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-3" />

                <div className="space-y-4 flex-grow text-gray-800 dark:text-gray-300">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-[#2a7d5a] mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t(translations).email}</p>
                      <p>atencionclientecromu@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-[#2a7d5a] mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t(translations).phone}</p>
                      <p>+57 314 2556085 | +57 310 2223491</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#2a7d5a] mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t(translations).address}</p>
                      <p>{t(translations).location}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-4" />

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-[#2a7d5a] mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t(translations).hours}</p>
                    <p className="text-gray-800 dark:text-gray-300">{t(translations).schedule}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#2a7d5a]/10 flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-[#2a7d5a]" />
                  </div>
                  <h5 className="text-[#1a5c41] dark:text-emerald-400 font-medium">
                    {t(translations).requestTitle}
                  </h5>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-3" />

                <div className="space-y-4 text-gray-700 dark:text-gray-300 flex-grow">
                  <p>{t(translations).request1}</p>
                  <p>{t(translations).request2}</p>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-4" />

                <div className="space-y-3">
                  <Button className="w-full bg-[#2a7d5a] hover:bg-[#1a5c41] text-white font-medium py-5 flex items-center justify-center">
                    <span>{t(translations).requestButton}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
