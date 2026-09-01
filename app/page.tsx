"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const solutions = [
  {
    number: "01",
    title: "Attract",
    esTitle: "Atraer",
    eyebrow: "SHORT-FORM VIDEO",
    esEyebrow: "VIDEO CORTO",
    description:
      "We create high-impact short-form videos designed to stop the scroll, showcase your business, and put your brand in front of new customers.",
    esDescription:
      "Creamos videos cortos de alto impacto diseñados para detener el scroll, mostrar tu negocio y poner tu marca frente a nuevos clientes.",
    image: "/image/atraccion2.jpg",
  },
  {
    number: "02",
    title: "Convert",
    esTitle: "Convertir",
    eyebrow: "AI & CUSTOMER EXPERIENCE",
    esEyebrow: "IA Y EXPERIENCIA DEL CLIENTE",
    description:
      "We turn attention into action with intelligent experiences that help customers ask questions, request information, make reservations, and take the next step.",
    esDescription:
      "Convertimos la atención en acción mediante experiencias inteligentes que ayudan a los clientes a consultar, solicitar información, reservar y dar el siguiente paso.",
    image: "/image/atencion2.jpg",
  },
  {
    number: "03",
    title: "Retain",
    esTitle: "Fidelizar",
    eyebrow: "RELATIONSHIPS & FOLLOW-UP",
    esEyebrow: "RELACIONES Y SEGUIMIENTO",
    description:
      "The relationship does not end after the first visit. We use follow-up and automation to create opportunities for customers to return.",
    esDescription:
      "La relación no termina después de la primera visita. Utilizamos seguimiento y automatización para crear nuevas oportunidades de regreso.",
    image: "/image/fidelizacion2.jpg",
  },
  {
    number: "04",
    title: "Optimize",
    esTitle: "Optimizar",
    eyebrow: "DATA & INTELLIGENCE",
    esEyebrow: "DATOS E INTELIGENCIA",
    description:
      "We turn business activity into useful information so you can understand what is working, identify opportunities, and make better decisions.",
    esDescription:
      "Convertimos la actividad de tu negocio en información útil para entender qué funciona, identificar oportunidades y tomar mejores decisiones.",
    image: "/image/inteligencia.jpg",
  },
];

const industries = [
  "Restaurants",
  "Hospitality",
  "Beauty",
  "Health",
  "Fitness",
  "Professional Services",
  "Retail",
  "Home Services",
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "es">("en");

  const isEnglish = language === "en";

  function cambiarIdioma(idioma: "en" | "es") {
    setLanguage(idioma);
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-white text-gray-950">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100">

          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 min-h-[82px] flex items-center justify-between gap-5">

            <Link
              href="/"
              className="flex items-center shrink-0"
              onClick={() => setMenuOpen(false)}
            >
              <Image
                src="/logo-foodshortai.png"
                alt="ShortBizAI"
                width={190}
                height={60}
                priority
                className="w-[145px] sm:w-[175px] h-auto object-contain"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-[14px] font-bold text-gray-600">

              <a href="#inicio" className="hover:text-red-600 transition">
                {isEnglish ? "Home" : "Inicio"}
              </a>

              <a href="#sistema" className="hover:text-red-600 transition">
                {isEnglish ? "The System" : "El Sistema"}
              </a>

              <a href="#servicios" className="hover:text-red-600 transition">
                {isEnglish ? "Services" : "Servicios"}
              </a>

              <a href="#industrias" className="hover:text-red-600 transition">
                {isEnglish ? "Industries" : "Industrias"}
              </a>

              <a href="#diagnostico" className="hover:text-red-600 transition">
                {isEnglish ? "Assessment" : "Diagnóstico"}
              </a>

            </nav>

            <div className="hidden md:flex items-center rounded-lg border border-gray-200 overflow-hidden">

              <button
                onClick={() => cambiarIdioma("en")}
                className={`px-3 py-2 text-xs font-black transition ${
                  isEnglish
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                EN
              </button>

              <button
                onClick={() => cambiarIdioma("es")}
                className={`px-3 py-2 text-xs font-black transition ${
                  !isEnglish
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                ES
              </button>

            </div>

            <Link
              href="/cliente/agente-aaf"
              className="hidden sm:inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-5 lg:px-6 py-3 rounded-lg font-black text-xs lg:text-sm transition shadow-lg whitespace-nowrap"
            >
              {isEnglish ? "BOOK A SESSION" : "RESERVAR UNA SESIÓN"}
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-gray-300 bg-white text-gray-900 shadow-sm"
            >
              {menuOpen ? (
                <span className="text-3xl leading-none">×</span>
              ) : (
                <span className="text-2xl leading-none">☰</span>
              )}
            </button>

          </div>

          {menuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white shadow-xl">

              <div className="px-5 py-5 space-y-2">

                <a
                  href="#inicio"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 font-bold hover:bg-gray-100"
                >
                  {isEnglish ? "Home" : "Inicio"}
                </a>

                <a
                  href="#sistema"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 font-bold hover:bg-gray-100"
                >
                  {isEnglish ? "The System" : "El Sistema"}
                </a>

                <a
                  href="#servicios"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 font-bold hover:bg-gray-100"
                >
                  {isEnglish ? "Services" : "Servicios"}
                </a>

                <a
                  href="#industrias"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 font-bold hover:bg-gray-100"
                >
                  {isEnglish ? "Industries" : "Industrias"}
                </a>

                <a
                  href="#diagnostico"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 font-bold hover:bg-gray-100"
                >
                  {isEnglish ? "Assessment" : "Diagnóstico"}
                </a>

                <div className="pt-4 mt-3 border-t border-gray-200">

                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                    {isEnglish ? "Language" : "Idioma"}
                  </p>

                  <div className="grid grid-cols-2 gap-2">

                    <button
                      onClick={() => cambiarIdioma("en")}
                      className={`rounded-lg px-4 py-3 text-sm font-bold border ${
                        isEnglish
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      🇺🇸 English
                    </button>

                    <button
                      onClick={() => cambiarIdioma("es")}
                      className={`rounded-lg px-4 py-3 text-sm font-bold border ${
                        !isEnglish
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      🇪🇸 Español
                    </button>

                  </div>

                </div>

                <Link
                  href="/cliente/agente-aaf"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 flex items-center justify-center rounded-lg bg-red-600 px-5 py-4 text-sm font-black text-white shadow-lg"
                >
                  {isEnglish ? "BOOK A SESSION" : "RESERVAR UNA SESIÓN"}
                </Link>

              </div>
            </div>
          )}

        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="inicio"
        className="relative min-h-[850px] lg:min-h-[900px] flex items-center overflow-hidden pt-24"
      >

        <div className="absolute inset-0">

          <Image
            src="/image/atraccion-fondo.jpg"
            alt="ShortBizAI short-form video production"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/25" />

        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10">

          <div className="max-w-4xl">

            <div className="flex items-center gap-3 mb-7">

              <span className="h-[2px] w-12 bg-red-600" />

              <p className="text-red-600 text-sm md:text-base font-black tracking-[0.22em] uppercase">
                {isEnglish
                  ? "SHORT-FORM VIDEO · AI · GROWTH"
                  : "VIDEO CORTO · IA · CRECIMIENTO"}
              </p>

            </div>

            <h1 className="text-[48px] sm:text-6xl md:text-7xl lg:text-[82px] leading-[0.94] font-black tracking-[-0.045em] text-gray-950">

              {isEnglish ? (
                <>
                  Your next
                  <br />
                  customer
                  <br />
                  <span className="text-red-600">
                    is already
                  </span>
                  <br />
                  watching.
                </>
              ) : (
                <>
                  Tu próximo
                  <br />
                  cliente
                  <br />
                  <span className="text-red-600">
                    ya está
                  </span>
                  <br />
                  mirando.
                </>
              )}

            </h1>

            <p className="mt-8 max-w-2xl text-lg md:text-xl lg:text-[21px] leading-8 text-gray-700 font-medium">

              {isEnglish
                ? "We create short-form video content that makes businesses visible, desirable, and easier to choose — then connect that attention to AI, automation, and customer growth."
                : "Creamos videos cortos que hacen que los negocios sean visibles, atractivos y fáciles de elegir, y conectamos esa atención con IA, automatización y crecimiento de clientes."}

            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">

              <Link
                href="/cliente/agente-aaf"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-black shadow-xl transition"
              >
                {isEnglish ? "BOOK A STRATEGY SESSION" : "RESERVAR SESIÓN ESTRATÉGICA"}
                <span className="ml-4 text-xl">→</span>
              </Link>

              <a
                href="#sistema"
                className="inline-flex items-center justify-center bg-white/90 hover:bg-white text-gray-950 border border-gray-300 px-8 py-4 rounded-lg font-black shadow-lg transition"
              >
                {isEnglish ? "SEE HOW IT WORKS" : "VER CÓMO FUNCIONA"}
                <span className="ml-4 text-xl">↓</span>
              </a>

            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs md:text-sm font-black uppercase tracking-widest text-gray-500">

              <span>Reels</span>
              <span>·</span>
              <span>TikTok</span>
              <span>·</span>
              <span>YouTube Shorts</span>
              <span>·</span>
              <span>AI</span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MANIFESTO
      ===================================================== */}

      <section className="bg-gray-950 py-24 md:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-24 items-end">

            <div>

              <p className="text-red-500 font-black tracking-[0.25em] text-sm">
                {isEnglish ? "THE IDEA" : "LA IDEA"}
              </p>

              <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-black leading-[1] tracking-tight text-white">

                {isEnglish ? (
                  <>
                    Attention is
                    <br />
                    the new
                    <br />
                    <span className="text-red-500">currency.</span>
                  </>
                ) : (
                  <>
                    La atención es
                    <br />
                    la nueva
                    <br />
                    <span className="text-red-500">moneda.</span>
                  </>
                )}

              </h2>

            </div>

            <div>

              <p className="text-lg md:text-xl leading-8 text-gray-300">

                {isEnglish
                  ? "People discover businesses differently today. They scroll, watch, compare, and decide in seconds. ShortBizAI is built to help your business compete in that environment."
                  : "Hoy las personas descubren los negocios de una manera diferente. Deslizan, miran, comparan y deciden en segundos. ShortBizAI está diseñado para ayudar a tu empresa a competir en ese entorno."}

              </p>

              <div className="mt-8 h-px bg-white/20" />

              <p className="mt-7 text-sm font-black tracking-[0.18em] uppercase text-white">

                {isEnglish
                  ? "Content with a commercial purpose."
                  : "Contenido con propósito comercial."}

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SYSTEM
      ===================================================== */}

      <section id="sistema" className="py-28 md:py-36 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="max-w-3xl">

            <p className="text-red-600 font-black tracking-[0.25em] text-sm">
              {isEnglish ? "THE SHORTBIZAI SYSTEM" : "EL SISTEMA SHORTBIZAI"}
            </p>

            <h2 className="mt-5 text-5xl md:text-7xl font-black tracking-tight leading-[0.98]">

              {isEnglish ? (
                <>
                  From
                  <span className="text-red-600"> attention </span>
                  <br />
                  to action.
                </>
              ) : (
                <>
                  De la
                  <span className="text-red-600"> atención </span>
                  <br />
                  a la acción.
                </>
              )}

            </h2>

            <p className="mt-7 text-lg md:text-xl leading-8 text-gray-600 max-w-2xl">

              {isEnglish
                ? "ShortBizAI connects the entire customer journey — from the first video view to the next visit."
                : "ShortBizAI conecta todo el recorrido del cliente: desde la primera visualización de un video hasta la próxima visita."}

            </p>

          </div>


          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">

            {solutions.map((item) => (

              <div
                key={item.number}
                className="bg-white p-7 md:p-8 min-h-[300px] flex flex-col"
              >

                <div className="flex items-center justify-between">

                  <span className="text-red-600 font-black text-sm tracking-widest">
                    {item.number}
                  </span>

                  <span className="text-gray-300 font-black">
                    ↗
                  </span>

                </div>

                <h3 className="mt-12 text-3xl font-black">
                  {isEnglish ? item.title : item.esTitle}
                </h3>

                <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-red-600">
                  {isEnglish ? item.eyebrow : item.esEyebrow}
                </p>

                <p className="mt-5 text-gray-600 leading-7">
                  {isEnglish ? item.description : item.esDescription}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          VIDEO / ATTRACTION
      ===================================================== */}

      <section id="servicios" className="bg-gray-100 py-28 md:py-36">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            <div className="relative min-h-[520px] lg:min-h-[650px] overflow-hidden bg-gray-900">

              <Image
                src="/image/atraccion2.jpg"
                alt="ShortBizAI short-form video content"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-7 right-7">

                <p className="text-white text-xs font-black uppercase tracking-[0.2em]">
                  ShortBizAI Studio
                </p>

                <p className="mt-2 text-2xl md:text-3xl font-black text-white">
                  {isEnglish
                    ? "One production. Multiple pieces of content."
                    : "Una producción. Múltiples piezas de contenido."}
                </p>

              </div>

            </div>


            <div>

              <p className="text-red-600 font-black tracking-[0.25em] text-sm">
                01 · {isEnglish ? "ATTRACT" : "ATRAER"}
              </p>

              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-[0.98]">

                {isEnglish ? (
                  <>
                    Stop the
                    <br />
                    scroll.
                  </>
                ) : (
                  <>
                    Detén el
                    <br />
                    scroll.
                  </>
                )}

              </h2>

              <p className="mt-7 text-lg md:text-xl text-gray-600 leading-8">

                {isEnglish
                  ? "Your customers are already consuming short-form video every day. We turn your products, people, services, and experiences into content designed to earn attention."
                  : "Tus clientes ya consumen videos cortos todos los días. Convertimos tus productos, personas, servicios y experiencias en contenido diseñado para ganar atención."}

              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-4">

                {[
                  isEnglish ? "Instagram Reels" : "Instagram Reels",
                  isEnglish ? "TikTok" : "TikTok",
                  isEnglish ? "YouTube Shorts" : "YouTube Shorts",
                  isEnglish ? "Social Content" : "Contenido Social",
                ].map((item) => (

                  <div
                    key={item}
                    className="border border-gray-200 bg-white p-5"
                  >
                    <p className="font-black">{item}</p>
                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONVERSION
      ===================================================== */}

      <section className="py-28 md:py-36 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            <div className="order-2 lg:order-1">

              <p className="text-red-600 font-black tracking-[0.25em] text-sm">
                02 · {isEnglish ? "CONVERT" : "CONVERTIR"}
              </p>

              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-[0.98]">

                {isEnglish ? (
                  <>
                    Turn
                    <br />
                    attention
                    <br />
                    into action.
                  </>
                ) : (
                  <>
                    Convierte
                    <br />
                    la atención
                    <br />
                    en acción.
                  </>
                )}

              </h2>

              <p className="mt-7 text-lg md:text-xl text-gray-600 leading-8">

                {isEnglish
                  ? "A view is valuable. A reservation, appointment, inquiry, or purchase is better. We connect content with intelligent customer experiences."
                  : "Una visualización tiene valor. Una reserva, una cita, una consulta o una compra tiene mucho más. Conectamos el contenido con experiencias inteligentes para el cliente."}

              </p>

              <div className="mt-9 flex flex-wrap gap-3">

                {(isEnglish
                  ? ["AI", "Reservations", "Automation", "Customer Experience"]
                  : ["IA", "Reservas", "Automatización", "Experiencia del cliente"]
                ).map((item) => (

                  <span
                    key={item}
                    className="px-4 py-2 bg-gray-950 text-white text-xs font-black uppercase tracking-wider"
                  >
                    {item}
                  </span>

                ))}

              </div>

            </div>


            <div className="order-1 lg:order-2 relative h-[540px] md:h-[620px] overflow-hidden">

              <Image
                src="/image/atencion2.jpg"
                alt="ShortBizAI AI customer experience"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RESTAURANTS / INDUSTRIES
      ===================================================== */}

      <section id="industrias" className="bg-gray-950 py-28 md:py-36">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-[1fr_0.8fr] gap-14 lg:gap-24">

            <div>

              <p className="text-red-500 font-black tracking-[0.25em] text-sm">
                {isEnglish ? "BUILT FOR BUSINESSES" : "DISEÑADO PARA NEGOCIOS"}
              </p>

              <h2 className="mt-6 text-5xl md:text-7xl font-black text-white leading-[0.96]">

                {isEnglish ? (
                  <>
                    Especially
                    <br />
                    powerful for
                    <br />
                    <span className="text-red-500">restaurants.</span>
                  </>
                ) : (
                  <>
                    Especialmente
                    <br />
                    potente para
                    <br />
                    <span className="text-red-500">restaurantes.</span>
                  </>
                )}

              </h2>

              <p className="mt-8 max-w-2xl text-lg md:text-xl text-gray-300 leading-8">

                {isEnglish
                  ? "Restaurants live on attention, experience, and people showing up. Short-form video gives your brand a way to compete for that attention every day."
                  : "Los restaurantes viven de la atención, la experiencia y de que las personas decidan visitarlos. El video corto le da a tu marca una forma de competir por esa atención todos los días."}

              </p>

              <p className="mt-5 max-w-2xl text-gray-400 leading-7">

                {isEnglish
                  ? "But restaurants are only one part of the opportunity. Our system can be adapted to businesses and services that depend on attracting and converting customers."
                  : "Pero los restaurantes son solamente una parte de la oportunidad. Nuestro sistema puede adaptarse a negocios y servicios que dependen de atraer y convertir clientes."}

              </p>

            </div>


            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 h-fit">

              {industries.map((industry, index) => (

                <div
                  key={industry}
                  className="bg-gray-950 p-5 md:p-7 min-h-[110px] flex flex-col justify-between"
                >

                  <span className="text-red-500 text-xs font-black">
                    0{index + 1}
                  </span>

                  <p className="mt-5 text-white font-black text-sm md:text-base">
                    {isEnglish
                      ? industry
                      : [
                          "Restaurantes",
                          "Hotelería",
                          "Belleza",
                          "Salud",
                          "Fitness",
                          "Servicios profesionales",
                          "Retail",
                          "Servicios para el hogar",
                        ][index]}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RETENTION
      ===================================================== */}

      <section className="py-28 md:py-36 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            <div className="relative h-[520px] md:h-[620px] overflow-hidden">

              <Image
                src="/image/fidelizacion2.jpg"
                alt="ShortBizAI customer loyalty"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

            </div>


            <div>

              <p className="text-red-600 font-black tracking-[0.25em] text-sm">
                03 · {isEnglish ? "RETAIN" : "FIDELIZAR"}
              </p>

              <h2 className="mt-5 text-5xl md:text-6xl font-black leading-[0.98]">

                {isEnglish ? (
                  <>
                    The first
                    <br />
                    visit is
                    <br />
                    not the goal.
                  </>
                ) : (
                  <>
                    La primera
                    <br />
                    visita
                    <br />
                    no es el objetivo.
                  </>
                )}

              </h2>

              <p className="mt-7 text-lg md:text-xl text-gray-600 leading-8">

                {isEnglish
                  ? "Growth becomes stronger when customers have a reason to return. Follow-up, promotions, communication, and loyalty strategies help create that relationship."
                  : "El crecimiento se vuelve más fuerte cuando los clientes tienen una razón para regresar. Seguimiento, promociones, comunicación y estrategias de fidelización ayudan a construir esa relación."}

              </p>

              <div className="mt-9 space-y-4">

                {(isEnglish
                  ? [
                      ["01", "Follow-up", "Stay connected after the first interaction."],
                      ["02", "Promotions", "Create reasons to come back."],
                      ["03", "Loyalty", "Turn customers into recurring business."],
                    ]
                  : [
                      ["01", "Seguimiento", "Mantén el contacto después de la primera interacción."],
                      ["02", "Promociones", "Crea razones para regresar."],
                      ["03", "Fidelización", "Convierte clientes en negocio recurrente."],
                    ]
                ).map(([number, title, text]) => (

                  <div
                    key={number}
                    className="flex gap-5 border-b border-gray-200 pb-4"
                  >

                    <span className="text-red-600 font-black text-sm">
                      {number}
                    </span>

                    <div>
                      <p className="font-black">{title}</p>
                      <p className="mt-1 text-sm text-gray-500">{text}</p>
                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTELLIGENCE
      ===================================================== */}

      <section className="bg-gray-100 py-28 md:py-36">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            <div>

              <p className="text-red-600 font-black tracking-[0.25em] text-sm">
                04 · {isEnglish ? "OPTIMIZE" : "OPTIMIZAR"}
              </p>

              <h2 className="mt-5 text-5xl md:text-7xl font-black leading-[0.96]">

                {isEnglish ? (
                  <>
                    Know what
                    <br />
                    moves the
                    <br />
                    business.
                  </>
                ) : (
                  <>
                    Entiende qué
                    <br />
                    mueve tu
                    <br />
                    negocio.
                  </>
                )}

              </h2>

              <p className="mt-7 text-lg md:text-xl text-gray-600 leading-8">

                {isEnglish
                  ? "Content generates attention. Customer interactions generate information. We bring those signals together so you can make smarter decisions."
                  : "El contenido genera atención. Las interacciones con los clientes generan información. Integramos esas señales para ayudarte a tomar mejores decisiones."}

              </p>

              <div className="mt-9 grid grid-cols-2 gap-4">

                {(isEnglish
                  ? ["Content", "Customers", "Reservations", "Performance"]
                  : ["Contenido", "Clientes", "Reservas", "Rendimiento"]
                ).map((item) => (

                  <div
                    key={item}
                    className="bg-white border border-gray-200 p-5"
                  >
                    <p className="font-black">{item}</p>
                  </div>

                ))}

              </div>

            </div>


            <div className="relative h-[520px] md:h-[620px] overflow-hidden">

              <Image
                src="/image/inteligencia.jpg"
                alt="ShortBizAI business intelligence"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DIFFERENTIATOR
      ===================================================== */}

      <section className="py-28 md:py-36 bg-white">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <p className="text-red-600 font-black tracking-[0.25em] text-sm">
            {isEnglish ? "OUR APPROACH" : "NUESTRO ENFOQUE"}
          </p>

          <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-black leading-[1]">

            {isEnglish ? (
              <>
                We don't create content
                <br />
                just to post it.
              </>
            ) : (
              <>
                No creamos contenido
                <br />
                simplemente para publicarlo.
              </>
            )}

          </h2>

          <p className="mt-7 text-xl md:text-2xl text-red-600 font-black">

            {isEnglish
              ? "Every piece has a job to do."
              : "Cada pieza tiene un trabajo que hacer."}

          </p>

          <p className="mt-8 max-w-2xl mx-auto text-lg text-gray-600 leading-8">

            {isEnglish
              ? "Build attention. Create interest. Generate action. Start a relationship."
              : "Generar atención. Crear interés. Provocar acción. Iniciar una relación."}

          </p>

        </div>

      </section>


      {/* =====================================================
          DIAGNOSTIC
      ===================================================== */}

      <section
        id="diagnostico"
        className="relative py-28 md:py-36 overflow-hidden"
      >

        <div className="absolute inset-0">

          <Image
            src="/image/inteligencia-nueva.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />

        </div>

        <div className="absolute inset-0 bg-white/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

          <p className="text-red-600 font-black tracking-[0.25em] text-sm">
            {isEnglish ? "FREE BUSINESS ASSESSMENT" : "DIAGNÓSTICO EMPRESARIAL"}
          </p>

          <h2 className="mt-6 text-5xl md:text-7xl font-black leading-[0.96]">

            {isEnglish ? (
              <>
                Is your business
                <br />
                ready to grow?
              </>
            ) : (
              <>
                ¿Está tu negocio
                <br />
                preparado para crecer?
              </>
            )}

          </h2>

          <p className="mt-7 text-lg md:text-xl leading-8 text-gray-600">

            {isEnglish
              ? "Discover opportunities across content, customer experience, automation, and AI."
              : "Descubre oportunidades en contenido, experiencia del cliente, automatización e Inteligencia Artificial."}

          </p>

          <Link
            href="/diagnostico"
            className="inline-flex items-center gap-5 mt-10 bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-lg font-black shadow-xl transition"
          >
            {isEnglish ? "START FREE ASSESSMENT" : "COMENZAR EVALUACIÓN"}
            <span className="text-xl">→</span>
          </Link>

          <p className="mt-5 text-sm text-gray-500">
            {isEnglish
              ? "Free · Less than 3 minutes · Personalized result"
              : "Gratis · Menos de 3 minutos · Resultado personalizado"}
          </p>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-red-600 py-24 md:py-28">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-end">

            <div className="text-white">

              <p className="text-white/70 font-black tracking-[0.25em] text-sm">
                SHORTBIZAI
              </p>

              <h2 className="mt-5 text-5xl md:text-7xl font-black leading-[0.95]">

                {isEnglish ? (
                  <>
                    Give people
                    <br />
                    a reason to
                    <br />
                    choose you.
                  </>
                ) : (
                  <>
                    Dale a las
                    <br />
                    personas una razón
                    <br />
                    para elegirte.
                  </>
                )}

              </h2>

            </div>

            <div>

              <p className="max-w-md text-white/80 text-lg leading-7 mb-7">

                {isEnglish
                  ? "Let's identify where ShortBizAI can create the greatest opportunity for your business."
                  : "Identifiquemos dónde ShortBizAI puede crear la mayor oportunidad para tu negocio."}

              </p>

              <Link
                href="/cliente/agente-aaf"
                className="inline-flex items-center justify-center bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-black transition shadow-xl"
              >
                {isEnglish ? "BOOK A STRATEGY SESSION" : "RESERVAR SESIÓN ESTRATÉGICA"}
                <span className="ml-4">→</span>
              </Link>

            </div>

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


          <p className="text-sm text-gray-400 text-center leading-6">
  © {new Date().getFullYear()} ShortBizAI.{" "}
  {isEnglish ? (
    <>
      All rights reserved.{" "}
      <span className="text-gray-500">
        A Fagavisión Media company · Faga Hernandez
      </span>
    </>
  ) : (
    <>
      Todos los derechos reservados.{" "}
      <span className="text-gray-500">
        Una empresa de Fagavisión Media · Faga Hernandez
      </span>
    </>
  )}
</p>

        </div>

      </footer>

    </main>
  );
}