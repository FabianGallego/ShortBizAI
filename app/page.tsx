"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Idioma = "en" | "es";

const pilares = [
  {
    numero: "01",
    titulo: "Attraction",
    subtitulo: "Content that generates visibility",
    descripcion:
      "We turn your business's digital presence into a commercial tool. We create strategic Video Shorts that introduce your brand, spark interest, and bring new prospects to your business.",
    imagen: "/image/atraccion2.jpg",
  },
  {
    numero: "02",
    titulo: "Attention",
    subtitulo: "Intelligence that responds and organizes",
    descripcion:
      "We integrate Artificial Intelligence to handle inquiries, manage requests, and facilitate reservations quickly and efficiently, providing every customer with a fast and professional experience.",
    imagen: "/image/atencion.jpg",
  },
  {
    numero: "03",
    titulo: "Loyalty",
    subtitulo: "Relationships that generate repeat business",
    descripcion:
      "We turn every interaction into an opportunity to build a relationship. We use follow-up and automation to maintain contact, activate new opportunities, and increase the frequency with which customers return.",
    imagen: "/image/fidelizacion-nueva.jpg",
  },
  {
    numero: "04",
    titulo: "Intelligence",
    subtitulo: "Data to make better decisions",
    descripcion:
      "We turn your business activity into useful management information. Analyze customers, reservations, and results to identify opportunities and make better commercial decisions.",
    imagen: "/image/inteligencia-nueva.jpg",
  },
];

export default function Home() {
  const [idioma, setIdioma] = useState<Idioma>("en");

  const t =
    idioma === "en"
      ? {
          inicio: "Home",
          sistema: "The System",
          soluciones: "Solutions",
          diagnostico: "Assessment",
          evaluacion: "FREE BUSINESS ASSESSMENT",

          heroTag:
            "ATTRACT · SERVE · BUILD LOYALTY",

          heroTitle1: "The System to",
          heroTitle2: "Grow",
          heroTitle3: "Your Business Sales.",

          heroDescription1:
            "ShortBizAI integrates strategy, Artificial Intelligence, and automation to attract new people, turn them into customers, and build meaningful relationships that bring them back.",

          heroDescription2:
            "A system designed to increase repeat business, drive sales, and contribute to the sustainable growth of your company.",

          reservation:
            "MAKE A RESERVATION",

          delivery:
            "ORDER DELIVERY",

          systemLabel:
            "THE AAFI SYSTEM",

          systemTitle1:
            "Attract new customers.",

          systemTitle2:
            "Earn their trust.",

          systemTitle3:
            "Make them come back.",

          systemDescription:
            "We combine Video Shorts and Artificial Intelligence to attract people from social media, provide personalized attention, turn their interest into real customers, and build a relationship of trust that encourages them to become loyal and recurring customers. This is how we contribute to business growth.",

          attractionLabel:
            "01 · ATTRACTION",

          attractionTitle:
            "Turn attention into customers.",

          attractionDescription:
            "Through social media and our Video Shorts, people can discover your business and become loyal, recurring customers.",

          attentionLabel:
            "02 · ATTENTION",

          attentionTitle:
            "Intelligent",
          attentionTitle2:
            "attention.",

          attentionDescription1:
            "Through Artificial Intelligence, we make it easier to serve new customers and organize their requests or reservations quickly, clearly, and efficiently.",

          attentionDescription2:
            "Through our intelligent and automated system, every person receives close, fast, and effective attention.",

          loyaltyLabel:
            "03 · LOYALTY",

          loyaltyTitle1:
            "Make your customers",

          loyaltyTitle2:
            "come back.",

          loyaltyDescription1:
            "Every customer who arrives through the system represents an opportunity to build a long-term business relationship.",

          loyaltyDescription2:
            "We use email, phone, and automation to send promotions, discounts, news, and customer loyalty campaigns.",

          promotions:
            "Promotions",

          promotionsDescription:
            "Personalized offers.",

          followUp:
            "Follow-up",

          followUpDescription:
            "Stay connected.",

          return:
            "Return",

          returnDescription:
            "Recurring customers.",

          intelligenceLabel:
            "04 · BUSINESS INTELLIGENCE",

          intelligenceTitle1:
            "Know",

          intelligenceTitle2:
            "your",

          intelligenceTitle3:
            "results.",

          intelligenceDescription1:
            "We turn your business information into clear data so you can understand what is working and where new growth opportunities exist.",

          intelligenceDescription2:
            "Receive information about customers, sales, products, and results to make better decisions and grow your business.",

          assessmentLabel:
            "BUSINESS ASSESSMENT",

          assessmentTitle1:
            "How prepared is",

          assessmentTitle2:
            "your business?",

          assessmentDescription:
            "Take our free assessment and discover how your company is positioned in Artificial Intelligence, automation, and digital growth.",

          startAssessment:
            "START FREE ASSESSMENT",

          freeText:
            "Free · Less than 3 minutes · Personalized result",

          finalLabel:
            "SHORTBIZAI",

          finalTitle1:
            "Attract.",

          finalTitle2:
            "Serve.",

          finalTitle3:
            "Build Loyalty.",

          knowBusiness:
            "DISCOVER YOUR BUSINESS",

          rights:
            "All rights reserved.",

          english:
            "English",

          spanish:
            "Español",
        }
      : {
          inicio: "Inicio",
          sistema: "El sistema",
          soluciones: "Soluciones",
          diagnostico: "Diagnóstico",
          evaluacion: "EVALUACIÓN GRATUITA",

          heroTag:
            "ATRAEMOS · ATENDEMOS · FIDELIZAMOS",

          heroTitle1:
            "El Sistema para",

          heroTitle2:
            "Hacer crecer",

          heroTitle3:
            "Las ventas de tu negocio.",

          heroDescription1:
            "ShortBizAI integra estrategia, Inteligencia Artificial y automatización para atraer nuevas personas, convertirlas en clientes y construir relaciones cercanas que hagan que regresen.",

          heroDescription2:
            "Un sistema diseñado para aumentar la recurrencia, impulsar las ventas y contribuir al crecimiento sostenido de tu empresa.",

          reservation:
            "HACER UNA RESERVA",

          delivery:
            "PEDIR A DOMICILIO",

          systemLabel:
            "EL SISTEMA AAFI",

          systemTitle1:
            "Atrae nuevos clientes.",

          systemTitle2:
            "Conquista su confianza.",

          systemTitle3:
            "Hace que regresen.",

          systemDescription:
            "Combinamos Video Shorts e Inteligencia Artificial para atraer personas desde las redes sociales, brindarles una atención cercana y personalizada, convertir su interés en clientes reales y construir una relación de confianza que los motive a convertirse en clientes fieles y recurrentes. Así contribuimos al crecimiento de la empresa.",

          attractionLabel:
            "01 · ATRACCIÓN",

          attractionTitle:
            "Convierte la atención en clientes.",

          attractionDescription:
            "Desde las redes sociales y a través de nuestros Video Shorts, las personas pueden conocer tu negocio y convertirse en clientes fieles y recurrentes.",

          attentionLabel:
            "02 · ATENCIÓN",

          attentionTitle:
            "Atención",

          attentionTitle2:
            "inteligente.",

          attentionDescription1:
            "Mediante Inteligencia Artificial facilitamos la atención de nuevos clientes y organizamos sus solicitudes o reservas de forma rápida, clara y eficiente.",

          attentionDescription2:
            "A través de nuestro sistema inteligente y automatizado, cada persona recibe una atención cercana, rápida y efectiva.",

          loyaltyLabel:
            "03 · FIDELIZACIÓN",

          loyaltyTitle1:
            "Haz que tus clientes",

          loyaltyTitle2:
            "regresen.",

          loyaltyDescription1:
            "Cada cliente que llega a través del sistema representa una oportunidad para construir una relación comercial de largo plazo.",

          loyaltyDescription2:
            "Utilizamos correo electrónico, teléfono y automatización para enviar promociones, descuentos, novedades y campañas de fidelización.",

          promotions:
            "Promociones",

          promotionsDescription:
            "Ofertas personalizadas.",

          followUp:
            "Seguimiento",

          followUpDescription:
            "Mantén el contacto.",

          return:
            "Regreso",

          returnDescription:
            "Clientes recurrentes.",

          intelligenceLabel:
            "04 · INTELIGENCIA EMPRESARIAL",

          intelligenceTitle1:
            "Conoce",

          intelligenceTitle2:
            "tus",

          intelligenceTitle3:
            "resultados.",

          intelligenceDescription1:
            "Convertimos la información de tu negocio en datos claros para que puedas entender qué está funcionando y dónde existen nuevas oportunidades de crecimiento.",

          intelligenceDescription2:
            "Recibe información sobre clientes, ventas, productos y resultados para tomar mejores decisiones y hacer crecer tu negocio.",

          assessmentLabel:
            "DIAGNÓSTICO EMPRESARIAL",

          assessmentTitle1:
            "¿Qué tan preparado está",

          assessmentTitle2:
            "tu negocio?",

          assessmentDescription:
            "Realiza nuestro diagnóstico gratuito y descubre cómo se encuentra tu empresa frente a la Inteligencia Artificial, automatización y crecimiento digital.",

          startAssessment:
            "COMENZAR EVALUACIÓN",

          freeText:
            "Gratis · Menos de 3 minutos · Resultado personalizado",

          finalLabel:
            "SHORTBIZAI",

          finalTitle1:
            "Atraemos.",

          finalTitle2:
            "Atendemos.",

          finalTitle3:
            "Fidelizamos.",

          knowBusiness:
            "CONOCER MI NEGOCIO",

          rights:
            "Todos los derechos reservados.",

          english:
            "English",

          spanish:
            "Español",
        };

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="absolute top-0 left-0 right-0 z-50">

        <div className="bg-white/95 backdrop-blur-md shadow-sm">

          <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[82px] flex items-center justify-between">

            <Link
              href="/"
              className="flex items-center"
            >
              <Image
                src="/logo-foodshortai.png"
                alt="ShortBizAI"
                width={190}
                height={60}
                priority
                className="w-[180px] h-auto object-contain"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-10 text-[15px] font-semibold text-gray-700">

              <a
                href="#inicio"
                className="hover:text-red-600 transition"
              >
                {t.inicio}
              </a>

              <a
                href="#sistema"
                className="hover:text-red-600 transition"
              >
                {t.sistema}
              </a>

              <a
                href="#soluciones"
                className="hover:text-red-600 transition"
              >
                {t.soluciones}
              </a>

              <a
                href="#diagnostico"
                className="hover:text-red-600 transition"
              >
                {t.diagnostico}
              </a>

            </nav>

            <div className="flex items-center gap-3">

              {/* SELECTOR DE IDIOMA */}

              <div className="hidden sm:flex overflow-hidden rounded-lg border border-gray-300 bg-white">

                <button
                  type="button"
                  onClick={() =>
                    setIdioma("en")
                  }
                  className={`px-3 py-2 text-xs font-bold transition ${
                    idioma === "en"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  🇺🇸 English
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIdioma("es")
                  }
                  className={`px-3 py-2 text-xs font-bold transition ${
                    idioma === "es"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  🇪🇸 Español
                </button>

              </div>

              <Link
                href="/diagnostico"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition shadow-lg"
              >
                {t.evaluacion}
              </Link>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="inicio"
        className="relative min-h-[820px] flex items-center overflow-hidden"
      >

        <div className="absolute inset-0">

          <Image
            src="/image/atraccion-fondo.jpg"
            alt="ShortBizAI"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/35" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 pt-24">

          <div className="max-w-3xl">

            <div className="mb-8 text-center">

              <p className="text-red-600 text-lg md:text-xl lg:text-2xl font-black tracking-[0.18em]">
                {t.heroTag}
              </p>

            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[76px] leading-[0.98] font-black tracking-tight text-gray-950">

              {t.heroTitle1}

              <br />

              <span className="text-red-600">
                {t.heroTitle2}
              </span>

              <br />

              {t.heroTitle3}

            </h1>

            <p className="mt-7 max-w-2xl text-lg md:text-xl leading-7 text-gray-600">

              {t.heroDescription1}

              <br />
              <br />

              {t.heroDescription2}

            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">

              <Link
                href="/cliente/agente-aaf"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold shadow-xl transition"
              >
                {t.reservation}

                <span className="ml-4 text-xl">
                  →
                </span>
              </Link>

              <a
                href="https://TU-LINK-DE-GLIT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-4 rounded-lg font-bold shadow-lg transition"
              >
                {t.delivery}

                <span className="ml-4 text-xl">
                  →
                </span>
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SISTEMA AAFI
      ===================================================== */}

      <section
        id="sistema"
        className="py-24 bg-gray-100"
      >

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="rounded-3xl bg-gray-950 shadow-2xl">

            <div className="max-w-4xl mx-auto px-8 py-14 md:px-16 md:py-20 text-center">

              <p className="text-red-500 font-black tracking-[0.22em] text-sm md:text-base">
                {t.systemLabel}
              </p>

              <h2 className="mt-7 text-4xl md:text-6xl font-black leading-[1.05] text-white">

                {t.systemTitle1}

                <br />

                <span className="text-red-500">
                  {t.systemTitle2}
                </span>

                <br />

                {t.systemTitle3}

              </h2>

              <div className="w-16 h-[3px] bg-red-500 mx-auto mt-8 mb-7" />

              <p className="max-w-2xl mx-auto text-base md:text-lg leading-7 md:leading-8 text-gray-300">

                {t.systemDescription}

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          ATRACCIÓN
      ===================================================== */}

      <section className="py-28 bg-white">

        <div className="w-full overflow-hidden">

          <div className="block md:hidden relative w-full h-[600px] overflow-hidden">

            <Image
              src="/image/atraccion2.jpg"
              alt="Video Shorts"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />

          </div>

          <div className="hidden md:block relative w-full aspect-[16/9] overflow-hidden bg-black">

            <Image
              src="/image/atraccion2.jpg"
              alt="Video Shorts"
              fill
              priority
              sizes="100vw"
              className="object-contain object-top"
            />

          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-10">

          <p className="text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-red-600">
            {t.attractionLabel}
          </p>

          <h3 className="text-4xl md:text-5xl font-black mt-3 leading-tight text-gray-900">
            {t.attractionTitle}
          </h3>

          <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-600 leading-7">
            {t.attractionDescription}
          </p>

        </div>

      </section>

      {/* =====================================================
          ATENCIÓN
      ===================================================== */}

      <section className="py-28 bg-gray-100">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
            {t.attentionLabel}
          </p>

          <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">

            {t.attentionTitle}

            <br />

            {t.attentionTitle2}

          </h2>

        </div>

        <div className="max-w-7xl mx-auto mt-10 lg:mt-16">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="relative w-full h-[600px] overflow-hidden">

              <Image
                src="/image/atencion2.jpg"
                alt="Artificial Intelligence customer service"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

            </div>

            <div className="px-6 lg:px-0">

              <p className="text-lg leading-7 text-gray-600">
                {t.attentionDescription1}
              </p>

              <p className="mt-4 text-lg leading-7 text-gray-600">
                {t.attentionDescription2}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FIDELIZACIÓN
      ===================================================== */}

      <section className="py-28 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 mb-6">

          <p className="text-red-500 font-bold tracking-[0.25em] text-sm">
            {t.loyaltyLabel}
          </p>

        </div>

        <div className="relative w-full h-[600px] overflow-hidden">

          <Image
            src="/image/fidelizacion2.jpg"
            alt="Customer loyalty"
            fill
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 z-10 px-6 lg:px-10 pb-10">

            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <h2 className="text-5xl md:text-6xl font-black leading-tight text-white">

              {t.loyaltyTitle1}

              <br />

              {t.loyaltyTitle2}

            </h2>

          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-12">

          <p className="text-lg leading-8 text-gray-600">
            {t.loyaltyDescription1}
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            {t.loyaltyDescription2}
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">

            <div className="border border-gray-200 rounded-xl p-5 bg-white">

              <p className="font-black text-red-600">
                {t.promotions}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {t.promotionsDescription}
              </p>

            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-white">

              <p className="font-black text-red-600">
                {t.followUp}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {t.followUpDescription}
              </p>

            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-white">

              <p className="font-black text-red-600">
                {t.return}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {t.returnDescription}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          INTELIGENCIA EMPRESARIAL
      ===================================================== */}

      <section className="py-28 bg-gray-100">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>

              <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
                {t.intelligenceLabel}
              </p>

              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-tight text-gray-950">

                {t.intelligenceTitle1}

                <br />

                {t.intelligenceTitle2}

                <br />

                {t.intelligenceTitle3}

              </h2>

              <p className="mt-7 text-lg leading-8 text-gray-600">
                {t.intelligenceDescription1}
              </p>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                {t.intelligenceDescription2}
              </p>

            </div>

            <div className="relative w-full h-[600px] overflow-hidden">

              <Image
                src="/image/inteligencia.jpg"
                alt="Business intelligence"
                fill
                sizes="100vw"
                className="object-cover"
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DIAGNÓSTICO
      ===================================================== */}

      <section
        id="diagnostico"
        className="relative py-32 overflow-hidden"
      >

        <div className="absolute inset-0">

          <Image
            src="/image/inteligencia2.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />

        </div>

        <div className="absolute inset-0 bg-white/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

          <p className="text-red-600 font-bold tracking-[0.25em] text-sm">
            {t.assessmentLabel}
          </p>

          <h2 className="mt-5 text-5xl md:text-7xl font-black text-gray-950">

            {t.assessmentTitle1}

            <br />

            {t.assessmentTitle2}

          </h2>

          <p className="mt-7 text-xl leading-8 text-gray-600">
            {t.assessmentDescription}
          </p>

          <Link
            href="/diagnostico"
            className="inline-flex items-center gap-5 mt-10 bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-lg font-black shadow-xl transition"
          >

            {t.startAssessment}

            <span className="text-xl">
              →
            </span>

          </Link>

          <p className="mt-5 text-sm text-gray-500">
            {t.freeText}
          </p>

        </div>

      </section>

      {/* =====================================================
          CTA FINAL
      ===================================================== */}

      <section className="bg-red-600 py-20">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

            <div className="text-white">

              <p className="text-white/70 font-bold tracking-widest text-sm">
                {t.finalLabel}
              </p>

              <h2 className="text-4xl md:text-5xl font-black mt-3">

                {t.finalTitle1}

                <br className="md:hidden" />

                {t.finalTitle2}

                <br className="md:hidden" />

                {t.finalTitle3}

              </h2>

            </div>

            <Link
              href="/diagnostico"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-black transition shadow-xl"
            >
              {t.knowBusiness}
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-white border-t border-gray-200 py-10">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-5">

          <Image
            src="/logo-foodshortai.png"
            alt="ShortBizAI"
            width={160}
            height={50}
            className="w-[160px] h-auto"
          />

          <p className="text-sm text-gray-400">

            © {new Date().getFullYear()} ShortBizAI.
            {t.rights}

          </p>

        </div>

      </footer>

    </main>
  );
}