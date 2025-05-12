"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Send, HelpCircle, ArrowRight, Check, MousePointer } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

// Translations object
const translations = {
  es: {
    formTitle: "Compartiremos tus datos y nos comunicaremos contigo.",
    fullName: "Nombre Completo *",
    namePlaceholder: "Ingrese su nombre completo",
    email: "Correo Electrónico *",
    emailPlaceholder: "ejemplo@correo.com",
    phone: "Teléfono *",
    phonePlaceholder: "Ingrese su número de teléfono",
    service: "Servicio *",
    selectService: "Seleccione un Servicio",
    documentType: "Tipo de Documento *",
    selectDocumentType: "Seleccione el Tipo de Documento",
    documentNumber: "Número de Documento *",
    documentPlaceholder: "Ingrese su número de documento",
    message: "Mensaje *",
    messagePlaceholder: "Escribe tu mensaje aquí...",
    contactMethod: "Método de Contacto Preferido *",
    selectContactMethod: "Correo Electrónico",
    contactTime: "Horario de Contacto *",
    selectContactTime: "Cualquier hora - Lunes a Viernes",
    send: "ENVIAR",
    privacyPolicy: "He leído y acepto la política de privacidad y el tratamiento de mis datos personales.",
    rightColumnTitle: "Conoce nuestro Canal de Atención al Cliente",
    rightColumnDescription: "Nuestro Canal de Atención al Cliente está diseñado para brindarte una experiencia personalizada y resolver cualquier solicitud relacionada con nuestros servicios. A través de este canal, buscamos ofrecer respuestas especializadas a tus necesidades de manera ágil y efectiva.",
    rightColumnInfo: "Puedes contactarnos para recibir información sobre nuestros productos, resolver dudas técnicas o gestionar sugerencias que nos ayuden a mejorar continuamente.",
    rightColumnConfidentiality: "Tus consultas serán atendidas con total confidencialidad y transparencia, el respeto a tu privacidad es un valor esencial de la entidad.",
    phone1: "+57 314 2556085",
    phone2: "+57 310 2223491",
    contactEmail: "atencionclientecromu@gmail.com",
    faqTitle: "Preguntas Frecuentes",
    faq1: "¿Cuál es el tiempo de respuesta?",
    faq1Answer: "Nos comprometemos a responder todas las consultas en un plazo máximo de 48 horas hábiles. Para casos urgentes, recomendamos utilizar nuestro número telefónico de atención inmediata.",
    faq2: "¿Cómo programo una asesoría?",
    faq2Answer: "Para programar una asesoría personalizada, puedes seleccionar esta opción en el formulario de contacto o llamar directamente a nuestro número de atención. Nuestro equipo agendará una cita según tu disponibilidad.",
    faq3: "¿Cómo puedo comunicarme con un asesor?",
    faq3Answer: "Puedes comunicarte con un asesor especializado a través de nuestro número telefónico, por correo electrónico o completando este formulario. También ofrecemos asesoría a través de nuestro chat en línea disponible en horario laboral.",
    rightInfoBox: "Todo lo que necesites, siempre a tu disposición con Cromu.",
    saving: "Ahorro",
    investmentCredit: "Crédito inversión",
    expressCredit: "Crédito express",
    portfolioPurchase: "Compra de cartera",
    idCard: "Tarjeta de identidad",
    citizenId: "Cédula",
    passport: "Pasaporte",
    foreignId: "Cédula de extranjería"
  },
  en: {
    formTitle: "We will share your data and communicate with you.",
    fullName: "Full Name *",
    namePlaceholder: "Enter your full name",
    email: "Email Address *",
    emailPlaceholder: "example@email.com",
    phone: "Phone *",
    phonePlaceholder: "Enter your phone number",
    service: "Service *",
    selectService: "Select a Service",
    documentType: "Document Type *",
    selectDocumentType: "Select Document Type",
    documentNumber: "Document Number *",
    documentPlaceholder: "Enter your document number",
    message: "Message *",
    messagePlaceholder: "Write your message here...",
    contactMethod: "Preferred Contact Method *",
    selectContactMethod: "Email",
    contactTime: "Contact Schedule *",
    selectContactTime: "Anytime - Monday to Friday",
    send: "SEND",
    privacyPolicy: "I have read and accept the privacy policy and the processing of my personal data.",
    rightColumnTitle: "Discover our Customer Service Channel",
    rightColumnDescription: "Our Customer Service Channel is designed to provide you with a personalized experience and resolve any request related to our services. Through this channel, we seek to offer specialized responses to your needs in an agile and effective manner.",
    rightColumnInfo: "You can contact us to receive information about our products, resolve technical questions, or manage suggestions that help us improve continuously.",
    rightColumnConfidentiality: "Your inquiries will be handled with complete confidentiality and transparency, respect for your privacy is an essential value of our entity.",
    phone1: "+57 314 2556085",
    phone2: "+57 310 2223491",
    contactEmail: "customerservice@cromu.com",
    faqTitle: "Frequently Asked Questions",
    faq1: "What is the response time?",
    faq1Answer: "We commit to responding to all inquiries within a maximum of 48 business hours. For urgent cases, we recommend using our immediate attention phone number.",
    faq2: "How do I schedule a consultation?",
    faq2Answer: "To schedule a personalized consultation, you can select this option on the contact form or call our service number directly. Our team will schedule an appointment according to your availability.",
    faq3: "How can I communicate with an advisor?",
    faq3Answer: "You can communicate with a specialized advisor through our phone number, by email, or by completing this form. We also offer advice through our online chat available during business hours.",
    rightInfoBox: "If you need personalized advice, indicate your specific need and we will assist you.",
    saving: "Savings",
    investmentCredit: "Investment Credit",
    expressCredit: "Express Credit",
    portfolioPurchase: "Portfolio Purchase",
    idCard: "ID Card",
    citizenId: "Citizen ID",
    passport: "Passport",
    foreignId: "Foreign ID"
  }
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function ContactFormComponent() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    service: "",
    document_type: "",
    document_number: "",
    message: "",
    contact_method: "email",
    contact_time: "anytime",
    privacyAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (faqNumber: number) => {
    setActiveFaq((prev) => (prev === faqNumber ? null : faqNumber));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const checked = type === "checkbox" && (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Asegúrate de que esta URL apunte a tu servidor
      const response = await fetch('/api/contact/submit', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          documentType: formData.document_type,
          documentNumber: formData.document_number,
          message: formData.message,
          contactMethod: formData.contact_method,
          contactTime: formData.contact_time,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            full_name: "",
            email: "",
            phone: "",
            service: "",
            document_type: "",
            document_number: "",
            message: "",
            contact_method: "email",
            contact_time: "anytime",
            privacyAccepted: false,
          });
        }, 3000);
      } else {
        console.error("Error al enviar el formulario:", result.error);
        alert(result.error);
      }
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      alert("Error interno del servidor. Intente nuevamente más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      className="w-full bg-[#e6f7f1] dark:bg-gray-800 font-sans"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 py-6">
          <motion.div
            className="lg:col-span-3 bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden"
            variants={slideUp}
          >
            <motion.div
              className="p-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h2
                className="text-xl font-semibold text-[#2a7d5a] dark:text-[#a3e4d7] mb-6"
                variants={slideUp}
              >
                {t(translations, "formTitle")}
              </motion.h2>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="rounded-full bg-[#2a7d5a]/10 p-4 mb-4">
                      <Check size={48} className="text-[#2a7d5a]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {language === "es" ? "Mensaje enviado" : "Message sent"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                      {language === "es"
                        ? "Gracias por contactarnos. Responderemos a la brevedad."
                        : "Thank you for contacting us. We will respond shortly."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    variants={staggerContainer}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "fullName")}
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          required
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder={t(translations, "namePlaceholder")}
                          className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white transition-all duration-200"
                        />
                      </motion.div>

                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "email")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t(translations, "emailPlaceholder")}
                          className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white transition-all duration-200"
                        />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "phone")}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={t(translations, "phonePlaceholder")}
                          className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white transition-all duration-200"
                        />
                      </motion.div>

                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "documentType")}
                        </label>
                        <div className="relative">
                          <select
                            name="document_type"
                            required
                            value={formData.document_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white appearance-none transition-all duration-200"
                          >
                            <option value="">{t(translations, "selectDocumentType")}</option>
                            <option value="citizenId">{t(translations, "citizenId")}</option>
                            <option value="idCard">{t(translations, "idCard")}</option>
                            <option value="passport">{t(translations, "passport")}</option>
                            <option value="foreignId">{t(translations, "foreignId")}</option>
                          </select>
                          <ChevronDown
                            size={18}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                          />
                        </div>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "documentNumber")}
                        </label>
                        <input
                          type="text"
                          name="document_number"
                          required
                          value={formData.document_number}
                          onChange={handleInputChange}
                          placeholder={t(translations, "documentPlaceholder")}
                          className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white transition-all duration-200"
                        />
                      </motion.div>

                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "service")}
                        </label>
                        <div className="relative">
                          <select
                            name="service"
                            required
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white appearance-none transition-all duration-200"
                          >
                            <option value="">{t(translations, "selectService")}</option>
                            <option value="saving">{t(translations, "saving")}</option>
                            <option value="investmentCredit">{t(translations, "investmentCredit")}</option>
                            <option value="expressCredit">{t(translations, "expressCredit")}</option>
                            <option value="portfolioPurchase">{t(translations, "portfolioPurchase")}</option>
                          </select>
                          <ChevronDown
                            size={18}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div variants={slideUp}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t(translations, "message")}
                      </label>
                      <textarea
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t(translations, "messagePlaceholder")}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white transition-all duration-200"
                      />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "contactMethod")}
                        </label>
                        <div className="relative">
                          <select
                            name="contact_method"
                            required
                            value={formData.contact_method}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white appearance-none transition-all duration-200"
                          >
                            <option value="email">{t(translations, "selectContactMethod")}</option>
                            <option value="phone">Teléfono</option>
                          </select>
                          <ChevronDown
                            size={18}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={slideUp}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(translations, "contactTime")}
                        </label>
                        <div className="relative">
                          <select
                            name="contact_time"
                            required
                            value={formData.contact_time}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2a7d5a] bg-white text-black dark:bg-gray-800 dark:text-white appearance-none transition-all duration-200"
                          >
                            <option value="anytime">{t(translations, "selectContactTime")}</option>
                            <option value="morning">9:00 - 12:00</option>
                            <option value="afternoon">13:00 - 17:00</option>
                          </select>
                          <ChevronDown
                            size={18}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div variants={slideUp} className="flex items-start mt-4">
                      <input
                        type="checkbox"
                        id="privacy"
                        name="privacyAccepted"
                        required
                        checked={formData.privacyAccepted}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-[#2a7d5a] border-gray-300 rounded focus:ring-[#2a7d5a]"
                      />
                      <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        {t(translations, "privacyPolicy")}
                      </label>
                    </motion.div>

                    <motion.div variants={slideUp} className="flex justify-start mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-[#2a7d5a] hover:bg-[#1a5c41] text-white font-medium px-8 py-2.5 rounded-md transition-all duration-300 flex items-center justify-center min-w-[120px] ${
                          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmitting ? (
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <Send size={16} className="mr-2" />
                        )}
                        {t(translations, "send")}
                      </button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-[#a3e4d7]/40 dark:bg-[#2a7d5a]/30 rounded-xl p-6 mb-6 relative overflow-hidden"
              variants={slideUp}
            >
              <div className="absolute right-0 top-0 opacity-10">
                <MousePointer size={120} className="text-[#2a7d5a] transform -rotate-45" />
              </div>
              <p className="text-[#2a7d5a] dark:text-[#a3e4d7] text-sm md:text-base font-medium">
                {t(translations, "rightInfoBox")}
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden"
              variants={slideUp}
            >
              <div className="bg-[#2a7d5a] p-6">
                <h2 className="text-xl font-semibold text-white">
                  {t(translations, "rightColumnTitle")}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <motion.p className="text-gray-700 dark:text-gray-300" variants={slideUp}>
                  {t(translations, "rightColumnDescription")}
                </motion.p>

                <motion.p className="text-gray-700 dark:text-gray-300" variants={slideUp}>
                  {t(translations, "rightColumnInfo")}
                </motion.p>

                <motion.p className="text-gray-700 dark:text-gray-300" variants={slideUp}>
                  {t(translations, "rightColumnConfidentiality")}
                </motion.p>

                <motion.div className="mt-6 space-y-3" variants={slideUp}>
                  <div className="flex items-center text-[#2a7d5a] dark:text-[#a3e4d7] font-medium">
                    {t(translations, "phone1") + " | " + t(translations, "phone2")}
                  </div>

                  <div className="flex items-center text-[#2a7d5a] dark:text-[#a3e4d7] font-medium">
                    {t(translations, "contactEmail")}
                  </div>
                </motion.div>

                <motion.div className="mt-8 space-y-2" variants={slideUp}>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    {t(translations, "faqTitle")}
                  </h3>

                  <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                    <button
                      className="flex justify-between items-center w-full py-2 text-left focus:outline-none"
                      onClick={() => toggleFaq(1)}
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {t(translations, "faq1")}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-[#2a7d5a] dark:text-[#a3e4d7] transition-transform ${
                          activeFaq === 1 ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeFaq === 1 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-600 dark:text-gray-400 text-sm py-2">
                            {t(translations, "faq1Answer")}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                    <button
                      className="flex justify-between items-center w-full py-2 text-left focus:outline-none"
                      onClick={() => toggleFaq(2)}
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {t(translations, "faq2")}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-[#2a7d5a] dark:text-[#a3e4d7] transition-transform ${
                          activeFaq === 2 ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeFaq === 2 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-600 dark:text-gray-400 text-sm py-2">
                            {t(translations, "faq2Answer")}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                    <button
                      className="flex justify-between items-center w-full py-2 text-left focus:outline-none"
                      onClick={() => toggleFaq(3)}
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {t(translations, "faq3")}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-[#2a7d5a] dark:text-[#a3e4d7] transition-transform ${
                          activeFaq === 3 ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeFaq === 3 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-600 dark:text-gray-400 text-sm py-2">
                            {t(translations, "faq3Answer")}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}